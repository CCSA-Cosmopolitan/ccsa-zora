# CCSA Zora operations guide

The full owner setup and release procedure is in
[`PRODUCTION_DEPLOYMENT.md`](PRODUCTION_DEPLOYMENT.md). This page summarizes the
steady-state operating contract.

## Runtime topology

1. `apps/web` is the public command centre and authenticated API boundary.
2. `apps/mobile` holds assigned field packs and an atomic Expo SQLite outbox.
3. `apps/kgml-api` is a private service called only by the web server.
4. Neon PostgreSQL/PostGIS is the authoritative application database.
5. Supabase provides authentication and private evidence object storage only.

The Vercel runtime uses Neon's pooled connection string with the restricted
`zora_app` role. Schema work uses a different, direct owner connection outside
Vercel. Tenant context is transaction-local and RLS-protected.

## Health and readiness

- `GET /api/health` is web liveness and never probes dependencies.
- `GET /api/ready` checks production configuration, Neon/PostGIS, trusted sync
  functions, and KGML reachability.
- `GET /health` is KGML liveness.
- `GET /ready` confirms the KGML service key is configured.

Use `pnpm smoke:production` after every production deployment. Alert on repeated
readiness failures, but do not use dependency-heavy readiness as liveness.

## Database change procedure

Create and review a Drizzle migration in a non-production Neon branch. Use
backward-compatible expand/migrate/contract changes when possible. The owner
applies production changes with:

```powershell
pnpm db:deploy
```

Do not run `db:seed:demo` or the legacy Supabase RLS migration in production.
Carbon certificate facts/events, MRV evidence, sensor readings, sync receipts,
and audit events are append-only. Corrections are new events.

## Offline synchronization contract

Observation and outbox rows commit in one SQLite transaction. Each operation
has a stable idempotency key and retry schedule. The server creates an immutable
sync receipt. Pull collisions with pending local changes are copied to
`sync_conflicts`; neither side is silently discarded. Media hashes are checked
on the device and server before storage metadata and audit events commit.

## Incident and rollback policy

Application rollback uses Vercel's previous deployment. Database state is not
automatically rolled back. For a data incident, stop writes, preserve evidence,
restore Neon to a new branch, validate the branch, and switch the pooled runtime
URL deliberately. Rotate any suspected Supabase, Neon, KGML, or IoT secret and
redeploy affected services.

The included advisory and soil-carbon engines remain reference models until
validated and approved for each crop, geography, language, and carbon method.
