# Zora release handover — 18 October 2026

The farmer/agent assistant implementation is validated locally. It is not deployed or signed off for field use yet. Production FIMS records have not been modified.

## Implemented

- Dedicated Neon runtime: restricted database login, hashed opaque sessions, private conversation history, single-use FIMS assertion exchange and persistent abuse limits.
- Server-side OpenAI text/photo assistance, transcription and speech, with Hausa, Yorùbá, Igbo, Nigerian Pidgin and English selection. No fabricated offline diagnoses or claims of KGML grounding.
- Phone sign-in through Termii (or Twilio Verify fallback), with expiry, retry limits, phone binding and single-use challenge consumption. Shared phone identities fail closed.
- FIMS administrator controls on farmer and agent tables, current administrator authorization, an independent grant table and audit log. Revocation is checked on every authenticated Zora request.
- CCSA Mobile uses its existing Firebase session to obtain a short-lived signed FIMS assertion. No changes to farmer capture or existing Firebase authentication.
- Standalone Zora mobile uses SecureStore sessions, real recording/transcription, photo questions, cloud speech and sign-out. Web includes private history.

Sponsored accounts have no subscription or daily usage quota. Short-window request/OTP limits protect availability and prevent abuse.

## Database state

Only the supplied, initially empty Zora Neon database was provisioned. Migrations `010_runtime.sql`, `011_evidence.sql` and `012_phone_verification.sql` were applied there. The runtime role is `zora_runtime_app`; owner access is reserved for migrations. Synthetic test accounts were removed by their exact test identifiers.

FIMS migration `fims-v2/sql/zora-access.sql` has **not** been applied. It creates two independent tables and does not modify farmers or users. Do not run Prisma reset, schema push or historical Zora SQL scripts against FIMS.

## Required server configuration

Zora: `DATABASE_URL` (restricted Neon runtime), `OPENAI_API_KEY`, `FIMS_API_URL` (HTTPS FIMS origin), `ZORA_FIMS_SHARED_SECRET` (same random secret in both servers), and `ZORA_PUBLIC_URL=https://zora.cosmopolitan.edu.ng`.

Termii: `TERMII_API_KEY`, `TERMII_SENDER_ID`, optional `TERMII_BASE_URL` and `TERMII_CHANNEL`. Alternatively configure all of `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_VERIFY_SERVICE_SID` without a Termii key. Default OTP global limit is 100 attempts/hour, configurable with `ZORA_OTP_HOURLY_LIMIT` according to the pilot's provider capacity.

Defaults: `OPENAI_MODEL=gpt-5.4`, `OPENAI_TTS_MODEL=gpt-4o-mini-tts`; transcription uses gpt-4o-transcribe. Secrets belong only in the server environment. Never put them in EXPO_PUBLIC/NEXT_PUBLIC variables. The local ignored web `.env.local` contains the supplied credentials; it must never be committed or uploaded as a public artifact.

FIMS: `ZORA_FIMS_SHARED_SECRET` and `ZORA_INTEGRATION_ENABLED=false` during deployment. The default when unset is disabled.

Mobile public configuration: `EXPO_PUBLIC_ZORA_API_URL=https://zora.cosmopolitan.edu.ng` for CCSA Mobile; `EXPO_PUBLIC_API_BASE_URL` or `EXPO_PUBLIC_ZORA_API_URL` for standalone Zora. Neither app contains server secrets.

## Evidence and limits

- Web: 33 unit tests and production build passed.
- FIMS: 16 mocked authorization/phone-identity tests and TypeScript check passed.
- Standalone mobile: TypeScript and Android/iOS JavaScript/Hermes exports passed.
- CCSA Mobile: Android/iOS JavaScript/Hermes exports passed.
- Integration: 28 checks passed with real OpenAI and the dedicated Zora Neon database, using a local signed FIMS stub and synthetic identities. Includes each requested language's text/speech, Hausa transcription, replay rejection, revocation, and cross-account isolation.
- Browser: login contrast corrected; invalid number blocked before submission.

See `audit-tools/zora-evaluation/integration-results.json` and language audio/answer samples. These checks do not establish native-speaker quality, actual SMS delivery, APK/IPA correctness or live FIMS connectivity.

## Deployment sequence

1. Identify the authorized hosting team/project. The currently connected Vercel account has no CCSA project, so no deployment or DNS change has been attempted.
2. Obtain a verified FIMS backup and rehearse the additive grant migration on a staging copy. Apply that reviewed migration through the existing production release process; retain all farmer/user records.
3. Deploy FIMS with the integration flag disabled. Configure matching server secrets. Deploy Zora from this monorepo with root directory `apps/web`, pnpm install from the workspace lockfile, and `pnpm --filter @ccsa-zora/web build` (adjust the hosting build working directory accordingly).
4. Configure the authorized Zora domain and HTTPS. Enable the FIMS integration flag only after migration and API deployment. `/api/ready` must return 200; it checks configuration, Neon, signed FIMS reachability and phone-provider configuration. It does not send an SMS or prove provider delivery.
5. Enable one consenting pilot farmer and one agent through the FIMS tables. Check actual OTP delivery, conversation, revocation, photo handling and CCSA Firebase exchange. Do not bulk-enable all farmers as part of deployment.
6. Build signed native binaries under the correct Expo/EAS project; project ownership and signing are not yet configured for standalone Zora. Test recording/playback on physical Android/iOS devices, background interruptions, poor connectivity and account switching. Publish CCSA through its existing release channel only after regression checks on capture/survey/offline upload.
7. Have native speakers review the five languages using real field audio, including accents, noisy surroundings and agricultural terminology. The API samples alone cannot certify a native conversational experience.

## Scope and rollback

Legacy institutional workspaces, institutional MFA, paid subscriptions, API-key sales and prototype analytics are not part of this farmer release. They are closed or redirected rather than displaying fabricated data. Existing Supabase institutional data has not been imported or deleted. Assisted first-time phone sign-in is needed for farmers who cannot enter an OTP; the voice interaction thereafter does not require typing.

Rollback by disabling `ZORA_INTEGRATION_ENABLED` and restoring the previous app release. Keep the additive grant/audit tables and Neon conversation data; do not reset either database. Rotate the chat-supplied secrets in the provider dashboards before a public launch and update the server secret store.
