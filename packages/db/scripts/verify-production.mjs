import postgres from "postgres";

const runtimeUrl = process.env.DATABASE_URL;
const migrationUrl = process.env.DATABASE_URL_UNPOOLED;

if (!runtimeUrl || !migrationUrl) {
  throw new Error("DATABASE_URL and DATABASE_URL_UNPOOLED are required.");
}

const runtime = postgres(runtimeUrl, { max: 1, prepare: false, connect_timeout: 15 });
const admin = postgres(migrationUrl, { max: 1, prepare: false, connect_timeout: 15 });

const requiredTables = [
  "organizations",
  "organization_members",
  "farmer_profiles",
  "fields",
  "advisory_sessions",
  "advisory_messages",
  "climate_alerts",
  "sensor_nodes",
  "sensor_readings",
  "field_indices",
  "observations",
  "observation_media",
  "carbon_certificates",
  "carbon_certificate_events",
  "mrv_evidence",
  "model_runs",
  "sync_receipts",
  "audit_events",
];

try {
  const [postgis] = await admin`
    select extversion from pg_extension where extname = 'postgis'
  `;
  if (!postgis) throw new Error("PostGIS is not installed.");

  const tables = await admin`
    select table_name
      from information_schema.tables
     where table_schema = 'public'
       and table_name = any(${requiredTables})
  `;
  const present = new Set(tables.map((row) => row.table_name));
  const missing = requiredTables.filter((table) => !present.has(table));
  if (missing.length) throw new Error(`Missing database tables: ${missing.join(", ")}`);

  const [role] = await runtime`
    select
      roles.rolname as name,
      roles.rolsuper,
      roles.rolbypassrls,
      exists (
        select 1 from pg_database where datname = current_database() and datdba = roles.oid
      ) as owns_database,
      (
        select count(*)::integer
          from pg_class
          join pg_namespace on pg_namespace.oid = pg_class.relnamespace
         where pg_namespace.nspname = 'public'
           and pg_class.relowner = roles.oid
      ) as owned_relations
      from pg_roles as roles
     where roles.rolname = current_user
  `;
  if (!role) throw new Error("Could not inspect the Neon runtime role.");
  if (
    role.rolsuper ||
    role.rolbypassrls ||
    role.owns_database ||
    Number(role.owned_relations) > 0 ||
    role.name === "neondb_owner"
  ) {
    throw new Error(`Runtime role ${role.name} can bypass row-level security.`);
  }

  const [viewPrivilege] = await runtime`
    select has_table_privilege(
      current_user,
      'public.current_carbon_certificate_state',
      'select'
    ) as allowed
  `;
  if (!viewPrivilege?.allowed) {
    throw new Error("Runtime role cannot read the carbon certificate state view.");
  }

  const [policies] = await admin`
    select count(*)::integer as count
      from pg_policies
     where schemaname = 'public'
       and roles @> array[${role.name}]::name[]
  `;
  if (Number(policies?.count ?? 0) < requiredTables.length) {
    throw new Error("Neon row-level security policies are incomplete.");
  }

  const functions = await admin`
    select proname
      from pg_proc
      join pg_namespace on pg_namespace.oid = pg_proc.pronamespace
     where pg_namespace.nspname = 'public'
       and proname in ('accept_mobile_observation', 'accept_observation_media')
  `;
  if (functions.length !== 2) throw new Error("Trusted sync functions are missing.");

  console.log(`Neon production verification passed (PostGIS ${postgis.extversion}, runtime role ${role.name}).`);
} finally {
  await Promise.all([runtime.end({ timeout: 5 }), admin.end({ timeout: 5 })]);
}
