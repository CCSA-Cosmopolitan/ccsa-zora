# CCSA Zora database

Neon PostgreSQL/PostGIS is the application source of truth. The Drizzle schema
is in `src/schema`; spatial columns use SRID 4326 and are converted at the API
boundary with PostGIS.

Production uses two credentials:

- `DATABASE_URL` is the pooled Neon URL for the restricted `zora_app` runtime role.
- `DATABASE_URL_UNPOOLED` is the direct owner URL used only for migration work.

After creating `zora_app`, apply a release in this order with `pnpm db:deploy`:

1. enable PostGIS and pgcrypto;
2. apply committed Drizzle migrations;
3. add immutable/append-only guards;
4. install Neon row-level security and exact runtime grants;
5. install trusted atomic API functions;
6. verify tables, PostGIS, policies, functions, and runtime role safety.

`db:rls:supabase` is retained only for legacy deployments and must not be run
against Neon. `db:storage:supabase` configures the separate private Supabase
Storage bucket using `SUPABASE_DATABASE_URL`.

Never edit or delete carbon certificates, carbon events, MRV evidence, sensor
readings, sync receipts, or audit events. Corrections are new signed events;
mutable read models must be rebuildable from the event streams.
