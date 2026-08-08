# CCSA Zora production deployment runbook

This runbook is the owner handoff for the production stack. Complete the steps
in order. The intended production topology is:

| Surface            | Provider         | Purpose                                                         |
| ------------------ | ---------------- | --------------------------------------------------------------- |
| `apps/web`         | Vercel           | Next.js command centre and trusted API boundary                 |
| `apps/kgml-api`    | Vercel           | Private FastAPI KGML/advisory service                           |
| PostgreSQL/PostGIS | Neon             | Authoritative application, GIS, IoT, sync, audit, and dMRV data |
| Authentication     | Supabase Auth    | Password sessions, JWT validation, and TOTP MFA                 |
| Evidence objects   | Supabase Storage | Private, hash-verified scouting and MRV images                  |
| `apps/mobile`      | Expo EAS         | Signed Android/iOS field application and production environment |

Supabase is **not** the application database. Its database is used only to
configure Supabase Storage. Neon is the sole source of truth for Zora records.

## 1. Accounts and local prerequisites

Create or obtain access to these accounts before starting:

1. A GitHub repository containing this monorepo.
2. A Vercel team with permission to create two projects and configure domains.
3. A Neon account and production project.
4. A Supabase project for Auth and private Storage.
5. An Expo account plus Apple Developer and Google Play Console accounts for
   store releases.
6. Control of the production DNS zone.

Install Node.js 22.13 or newer, pnpm 10.11.1, Python 3.12, `uv`, Git, and the
Vercel and EAS CLIs. From the repository root, run:

```powershell
corepack enable
corepack prepare pnpm@10.11.1 --activate
pnpm install --frozen-lockfile
uv --directory apps/kgml-api sync --dev --frozen
pnpm validate:structure
pnpm typecheck
pnpm test:api
pnpm audit --prod --audit-level moderate
```

Generate three independent secrets and store them in a password manager. Use
one for the Neon `zora_app` password, one for `KGML_SERVICE_KEY`, and one for
`IOT_INGEST_SECRET`. Never reuse them.

```powershell
node -e "console.log(require('node:crypto').randomBytes(48).toString('base64url'))"
```

Run the command three times. Do not commit any generated value or production
`.env` file.

### Environment-file placement

For local development, keep each framework's file in its own application root:

```powershell
Copy-Item apps/web/.env.example apps/web/.env.local
Copy-Item apps/mobile/.env.example apps/mobile/.env.local
```

Next.js is executed with `apps/web` as its project root, so a monorepo-root
`.env.local` is not the reliable automatic-loading location for the web app.
The root `.env.example` is an administrator reference, not a file to copy into
the web project: it includes setup-only values such as
`DATABASE_URL_UNPOOLED` and `SUPABASE_DATABASE_URL` that must stay out of the
Next.js runtime.

On Vercel, do not commit or upload an environment file. Add values to the
`ccsa-zora-web` project's **Settings > Environment Variables** for Production,
Preview, or Development. Vercel injects them into the selected project
regardless of where the monorepo's example files live. To pull Development
values locally, link the web project from `apps/web` and write them there:

```powershell
Set-Location apps/web
vercel link
vercel env pull .env.local
Set-Location ../..
```

Only `NEXT_PUBLIC_*` and `EXPO_PUBLIC_*` values are intentionally exposed to
browser/mobile bundles. Database passwords, service-role keys, KGML secrets,
and IoT secrets must never use a public prefix.

## 2. Provision Neon PostgreSQL/PostGIS

### 2.1 Create the project

1. In Neon, create a project named `ccsa-zora-production`.
2. Select AWS Frankfurt (`eu-central-1`). The checked-in Vercel configuration
   uses Vercel region `fra1` to keep the application close to the database.
3. Use a database named `neondb` or create one named `zora`.
4. Enable an appropriate paid retention/PITR window and set a compute size and
   autoscaling range for the expected load.
5. Keep the generated owner role for schema administration only.

### 2.2 Create the restricted runtime role

Open Neon **SQL Editor** as the database owner. Replace the placeholder with
the generated database password and run:

```sql
create role zora_app
  login
  password 'REPLACE_WITH_DATABASE_RUNTIME_PASSWORD'
  nosuperuser
  nocreatedb
  nocreaterole
  noinherit;
```

Do not grant `BYPASSRLS`, ownership, or broad `public` write permissions to
this role. The repository security migration grants its exact privileges.

### 2.3 Copy two different connection strings

In the Neon **Connect** dialog:

1. Select the owner role and disable connection pooling. Copy this direct URL
   as `DATABASE_URL_UNPOOLED`.
2. Select `zora_app` and enable connection pooling. Copy this pooled URL as
   `DATABASE_URL`.
3. Confirm both contain `sslmode=require`.
4. Confirm only the runtime hostname contains `-pooler`.

The direct owner URL is for local/CI migrations only. It must never be added to
the web Vercel project, mobile build, browser code, or source control.

### 2.4 Apply and verify the schema

In a trusted local PowerShell session, set the two URLs for the current process:

```powershell
$env:DATABASE_URL_UNPOOLED = 'postgresql://OWNER:...@HOST/neondb?sslmode=require'
$env:DATABASE_URL = 'postgresql://zora_app:...@HOST-pooler/neondb?sslmode=require'
pnpm db:deploy
```

`db:deploy` enables PostGIS/pgcrypto, applies Drizzle migrations, installs
append-only audit guards, configures Neon RLS, installs trusted transaction
functions, and verifies the production role and schema. A successful run ends
with `Neon production verification passed`.

Never run `pnpm db:seed:demo` against production. Never run the legacy
`pnpm db:rls:supabase` command against Neon.

## 3. Configure Supabase Auth and private evidence storage

### 3.1 Authentication

1. Create a Supabase project in a region close to users and Vercel.
2. In **Authentication > Providers > Email**, keep email/password enabled.
3. For an institutional launch, disable public sign-up and create users through
   **Authentication > Users** or a controlled invitation workflow.
4. In **Authentication > Multi-Factor**, allow TOTP enrollment, challenge, and
   verification.
5. In **Authentication > URL Configuration**, set the Site URL to the final
   web domain. Add the Vercel production URL and approved preview/staging URLs
   to Redirect URLs.
6. Copy the project URL, publishable/anonymous key, and server-only service-role
   key. Treat the service-role key as a production secret.

At first successful password login, the Zora web and mobile apps guide the user
through TOTP enrollment. A verified authenticator is required for protected
KGML/model actions.

### 3.1.1 Access-request review

Public self-signup remains disabled. The landing page sends prospective users
to `/request-access`; production submissions are validated, deduplicated, and
rate-limited before being stored in Neon's `access_requests` table. Add an
independent 32+ character `ACCESS_REQUEST_HASH_SALT` to the web project so the
application stores only a salted network fingerprint, never a raw IP address.

Review pending requests in the Neon SQL Editor:

```sql
select id, full_name, email, organization_name, requested_role, country,
       use_case, created_at
from public.access_requests
where status = 'pending'
order by created_at;
```

Approval is intentionally an administrator action:

1. Confirm the requester and the organization outside Zora.
2. Create or invite the user under **Supabase > Authentication > Users** and
   copy the Supabase user UUID.
3. Add that UUID to the correct Neon `organization_members` row with the
   least-privileged role required.
4. Mark the request reviewed in Neon:

```sql
update public.access_requests
set status = 'approved', reviewed_at = now(), reviewed_by = 'SUPABASE_ADMIN_UUID',
    updated_at = now()
where id = 'ACCESS_REQUEST_UUID' and status = 'pending';
```

5. Send the requester the Supabase invitation or password-setup link. Do not
   send a shared password. The user completes TOTP enrollment on first login.

### 3.2 Private Storage bucket

Use one of these methods.

**Dashboard method**

1. Go to **Storage** and create `mrv-evidence`.
2. Keep the bucket private.
3. Set the maximum object size to 4 MB.
4. Allow `image/jpeg`, `image/png`, `image/heic`, and `image/webp`.

**Repository method**

Copy the Supabase direct database connection string from **Project Settings >
Database**, then run it only from a trusted local terminal:

```powershell
$env:SUPABASE_DATABASE_URL = 'postgresql://postgres:...@db.PROJECT.supabase.co:5432/postgres'
pnpm db:storage:supabase
Remove-Item Env:SUPABASE_DATABASE_URL
```

Uploads are proxied through the authenticated Zora API and use the Supabase
service role. Do not create public object policies and do not expose the
service-role key to a browser or mobile build.

## 4. Create the first organization and owner

1. In **Supabase > Authentication > Users**, create the first user and copy
   the user's UUID.
2. In the Neon SQL Editor, replace the name, slug, country code, and user UUID,
   then run:

```sql
with new_organization as (
  insert into public.organizations (
    id, name, slug, country_code, metadata, created_by
  ) values (
    gen_random_uuid(),
    'Centre for Climate-Smart Agriculture',
    'ccsa',
    'NG',
    '{}'::jsonb,
    'REPLACE_WITH_SUPABASE_USER_UUID'::uuid
  )
  returning id
)
insert into public.organization_members (organization_id, user_id, role)
select id, 'REPLACE_WITH_SUPABASE_USER_UUID'::uuid, 'owner'::organization_role
from new_organization
returning organization_id;
```

3. Copy the returned `organization_id`. It becomes
   `NEXT_PUBLIC_ZORA_ORGANIZATION_ID` in Vercel and
   `EXPO_PUBLIC_ZORA_ORGANIZATION_ID` in Expo.
4. Sign in once and finish authenticator enrollment.

Each additional user needs both a Supabase Auth user and a matching
`organization_members` row in Neon. Do not authorize a user only in one system.

## 5. Deploy the FastAPI intelligence service to Vercel

Deploy this service first because the web readiness check depends on it.

1. In Vercel, choose **Add New > Project** and import the repository.
2. Name the project `ccsa-zora-intelligence`.
3. Set **Root Directory** to `apps/kgml-api`.
4. Leave framework detection, build, and output settings at their defaults.
   `apps/kgml-api/vercel.json` configures the function and `fra1` region.
5. Add these **Production** environment variables:

| Variable           | Value                                      |
| ------------------ | ------------------------------------------ |
| `ZORA_ENV`         | `production`                               |
| `KGML_SERVICE_KEY` | The generated 32+ character service secret |

6. Deploy and copy the HTTPS deployment URL.
7. Open `/health`; expect HTTP 200 with service
   `ccsa-zora-intelligence-api`.
8. Open `/ready`; expect HTTP 200 and `service_key_configured: true`.

The service API docs are intentionally disabled in production. Its protected
endpoints accept only the matching `x-zora-service-key` sent by the web server.

## 6. Deploy the Next.js application to Vercel

1. Create a second Vercel project from the same repository.
2. Name it `ccsa-zora-web`.
3. Set **Root Directory** to `apps/web`.
4. Enable **Include source files outside of the Root Directory** so workspace
   packages and the root lockfile are available.
5. Keep Framework Preset as Next.js. The checked-in `vercel.json` supplies the
   monorepo install/build commands, the `fra1` region, and function duration.
6. Add the following **Production** environment variables exactly:

| Variable                           | Production value                                  |
| ---------------------------------- | ------------------------------------------------- |
| `ZORA_ENV`                         | `production`                                      |
| `ZORA_DEMO_MODE`                   | `false`                                           |
| `NEXT_PUBLIC_ZORA_DEMO_MODE`       | `false`                                           |
| `DATABASE_URL`                     | Neon pooled URL using `zora_app`                  |
| `DATABASE_POOL_MAX`                | `3` initially                                     |
| `NEXT_PUBLIC_ZORA_ORGANIZATION_ID` | First organization UUID                           |
| `NEXT_PUBLIC_SUPABASE_URL`         | Supabase project URL                              |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`    | Supabase anonymous/publishable key                |
| `SUPABASE_SERVICE_ROLE_KEY`        | Supabase service-role key                         |
| `SUPABASE_EVIDENCE_BUCKET`         | `mrv-evidence`                                    |
| `KGML_API_URL`                     | HTTPS URL from step 5                             |
| `KGML_SERVICE_KEY`                 | Same value used by the FastAPI project            |
| `IOT_INGEST_SECRET`                | Independent 32+ character HMAC secret             |
| `ACCESS_REQUEST_HASH_SALT`         | Independent 32+ character server-only random salt |
| `NEXT_PUBLIC_MAP_STYLE_URL`        | Licensed production MapLibre style URL            |

Do **not** add `DATABASE_URL_UNPOOLED`, `SUPABASE_DATABASE_URL`, demo user IDs,
or any `EXPO_PUBLIC_*` variable to the web Vercel project.

For each organization's gateway, derive a separate secret locally from the
server-only IoT master secret. Provision only the derived value to that
organization's gateway; never provision the master value:

```powershell
$env:IOT_INGEST_SECRET = 'YOUR_SERVER_MASTER_SECRET'
$env:ZORA_IOT_ORGANIZATION_ID = 'YOUR_ORGANIZATION_UUID'
pnpm iot:derive-secret
Remove-Item Env:IOT_INGEST_SECRET
Remove-Item Env:ZORA_IOT_ORGANIZATION_ID
```

The gateway calculates lowercase hexadecimal HMAC-SHA256 over
`<x-zora-timestamp>.<raw-body>` using the derived secret. It sends that digest
as `x-zora-signature` plus the organization UUID as `x-zora-organization`.

7. Deploy. A production deployment is not ready until both endpoints return
   HTTP 200:

```text
https://YOUR_WEB_DOMAIN/api/health
https://YOUR_WEB_DOMAIN/api/ready
```

`/api/health` proves that the function is alive. `/api/ready` additionally
checks production configuration, Neon/PostGIS access, the trusted database
function, and KGML reachability.

## 7. Validate environment values before release

Use a local, uncommitted environment file or set the required values in a
trusted PowerShell process. `validate:production-env` requires both the pooled
runtime URL and the direct migration URL so it can detect role/URL mistakes:

```powershell
$env:ZORA_ENV = 'production'
$env:ZORA_DEMO_MODE = 'false'
$env:NEXT_PUBLIC_ZORA_DEMO_MODE = 'false'
# Set the remaining values from .env.example in this terminal.
pnpm validate:production-env
pnpm db:verify
```

The validator rejects local URLs, placeholders, non-TLS service URLs, a pooled
owner credential, a pooled migration URL, or identical runtime/migration roles.

## 8. Configure the production domain

1. In the web Vercel project, open **Settings > Domains** and add the intended
   host, for example `zora.ccsa.cua.edu.ng`.
2. Add the DNS record Vercel shows and wait for certificate issuance.
3. Update the Supabase Auth Site URL and Redirect URL allow-list to the final
   HTTPS domain.
4. Keep the generated Vercel hostname as an approved operational fallback.
5. If the FastAPI service gets a custom domain, update `KGML_API_URL` and
   redeploy the web project.
6. Update `EXPO_PUBLIC_API_URL` for the mobile production build.

## 9. Configure and release the Expo mobile application

From `apps/mobile`, initialize/link the EAS project if this repository has not
yet been linked:

```powershell
pnpm exec eas login
pnpm exec eas init
```

Create these client-visible production variables in Expo. They are intentionally
`EXPO_PUBLIC_*`; users can inspect values embedded in an app, so never place a
service-role, database, IoT, or KGML secret here.

```powershell
pnpm exec eas env:create --name EXPO_PUBLIC_API_URL --value https://YOUR_WEB_DOMAIN --environment production --visibility plaintext
pnpm exec eas env:create --name EXPO_PUBLIC_ZORA_DEMO_MODE --value false --environment production --visibility plaintext
pnpm exec eas env:create --name EXPO_PUBLIC_ZORA_ORGANIZATION_ID --value YOUR_ORGANIZATION_UUID --environment production --visibility plaintext
pnpm exec eas env:create --name EXPO_PUBLIC_SUPABASE_URL --value https://PROJECT.supabase.co --environment production --visibility plaintext
pnpm exec eas env:create --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value YOUR_ANON_KEY --environment production --visibility sensitive
pnpm exec eas env:list --environment production
```

The checked-in production EAS profile selects the `production` environment.
Build signed binaries and submit them after completing Apple/Google signing and
store-listing prompts:

```powershell
pnpm exec eas build --platform android --profile production
pnpm exec eas build --platform ios --profile production
pnpm exec eas submit --platform android --profile production
pnpm exec eas submit --platform ios --profile production
```

Test offline capture, process termination/restart, reconnection, image upload,
conflict display, location permission denial, and MFA on real low/mid-range
devices before store rollout.

## 10. Production smoke test

After both Vercel projects are deployed, run the checked-in HTTPS smoke test:

```powershell
$env:ZORA_WEB_URL = 'https://YOUR_WEB_DOMAIN'
$env:ZORA_KGML_URL = 'https://YOUR_KGML_DOMAIN'
pnpm smoke:production
```

Then complete these authenticated checks manually:

1. Sign in as the first owner and finish TOTP enrollment.
2. Confirm the dashboard loads only the selected organization's data.
3. Create an advisory and verify the resulting model/advisory audit record.
4. Capture an observation on mobile while offline, reconnect, and verify one
   observation, one sync receipt, and no duplicate after retry.
5. Upload a photo smaller than 4 MB and confirm the object is not publicly
   accessible without a signed server request.
6. Send a correctly signed IoT test payload, then repeat the same timestamp and
   payload to confirm replay/idempotency behavior.
7. Verify that a user with no Neon membership receives no tenant data.

## 11. Staging and preview isolation

Never connect Vercel Preview deployments to production data.

1. Create a long-lived Neon `staging` branch and a separate restricted runtime
   role/password on that branch.
2. Use a separate Supabase project for staging Auth and Storage.
3. Put staging credentials in Vercel's **Preview** environment only.
4. Add preview URLs to the staging Supabase redirect allow-list, not production.
5. Use separate `KGML_SERVICE_KEY` and `IOT_INGEST_SECRET` values per environment.
6. Protect preview deployments with Vercel Deployment Protection.

## 12. Go-live controls and operating cadence

Before admitting real users:

1. Configure Vercel WAF rate limits for `/api/advisory`,
   `/api/kgml/inferences`, `/api/sync/*`, `/api/media`, and `/api/iot/readings`.
   Start in log/count mode, observe normal traffic, then enforce.
2. Configure Vercel spend notifications and Neon compute/storage alerts.
3. Confirm Neon restore retention and perform a test point-in-time restore into
   a branch. Record the measured RPO and RTO.
4. Send Vercel and Neon logs/alerts to an owned on-call channel. If Sentry is
   adopted, finish SDK initialization and source-map upload before setting its
   optional environment variables; environment variables alone do not install
   monitoring.
5. Rotate service/database/HMAC credentials on a schedule and immediately after
   suspected exposure. Redeploy both Vercel projects when rotating the shared
   KGML key.
6. Review Supabase Auth users and Neon organization memberships together.
7. Have qualified agronomists validate crops, geographies, languages, thresholds,
   and escalation wording. The checked-in KGML engines are transparent reference
   models, not production-validated diagnosis or a carbon-credit methodology.
8. Obtain privacy, consent, retention, data-processing, and carbon-methodology
   approval for the actual jurisdictions and programmes before handling real
   farmer or certificate data.

Vercel can roll application deployments back, but that does not roll back a
database migration. Prefer backward-compatible, additive migrations and a
forward fix. For a data incident, stop writes, preserve audit evidence, restore
to a new Neon branch, verify it, and deliberately switch the runtime URL.

## 13. Owner acceptance checklist

- [ ] CI is green on the exact commit being deployed.
- [ ] Neon direct owner URL exists only in the migration environment/password manager.
- [ ] Vercel runtime uses pooled `zora_app`, never the owner.
- [ ] `pnpm db:deploy` and `pnpm db:verify` pass.
- [ ] Supabase public sign-up policy matches the institutional launch model.
- [ ] Evidence bucket is private and limited to 4 MB images.
- [ ] FastAPI and web readiness endpoints return HTTP 200.
- [ ] Production and preview databases/auth projects are isolated.
- [ ] Custom domain, TLS, DNS, and Supabase URL allow-list are correct.
- [ ] First owner can enroll MFA and access protected model actions.
- [ ] Real-device offline sync and duplicate/replay tests pass.
- [ ] WAF, spend alerts, restore test, on-call ownership, and key rotation are documented.
- [ ] Agronomic, privacy, security, and dMRV methodology approvals are signed off.

Useful primary documentation:

- [Neon pooled and direct connection strings](https://neon.com/docs/connect/connection-pooling)
- [Neon serverless driver and RLS guidance](https://neon.com/docs/serverless/serverless-driver)
- [Vercel Turborepo deployment](https://vercel.com/docs/monorepos/turborepo)
- [Vercel environment variables](https://vercel.com/docs/environment-variables)
- [Vercel FastAPI deployment](https://vercel.com/docs/frameworks/backend/fastapi)
- [Vercel WAF rate limiting](https://vercel.com/docs/vercel-firewall/vercel-waf/rate-limiting)
- [Supabase TOTP MFA](https://supabase.com/docs/guides/auth/auth-mfa/totp)
- [Supabase private buckets](https://supabase.com/docs/guides/storage/buckets/fundamentals)
- [Expo EAS environment variables](https://docs.expo.dev/eas/environment-variables/)
