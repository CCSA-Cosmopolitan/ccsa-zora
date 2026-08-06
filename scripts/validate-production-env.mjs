const errors = [];

function value(name) {
  return process.env[name]?.trim() ?? "";
}

function requireValue(name, minimumLength = 1) {
  const current = value(name);
  if (current.length < minimumLength) {
    errors.push(`${name} is required${minimumLength > 1 ? ` and must contain at least ${minimumLength} characters` : ""}.`);
  }
  if (/replace-me|replace-with|example|password/i.test(current)) {
    errors.push(`${name} still contains a placeholder value.`);
  }
  return current;
}

function requireUrl(name, { https = true } = {}) {
  const current = requireValue(name);
  if (!current) return null;
  try {
    const parsed = new URL(current);
    if (https && parsed.protocol !== "https:") errors.push(`${name} must use HTTPS.`);
    if (["localhost", "127.0.0.1", "0.0.0.0"].includes(parsed.hostname)) {
      errors.push(`${name} cannot point to a local host in production.`);
    }
    return parsed;
  } catch {
    errors.push(`${name} must be a valid URL.`);
    return null;
  }
}

if (value("ZORA_ENV") !== "production") errors.push("ZORA_ENV must be production.");
if (value("ZORA_DEMO_MODE") !== "false") errors.push("ZORA_DEMO_MODE must be false.");
if (value("NEXT_PUBLIC_ZORA_DEMO_MODE") !== "false") {
  errors.push("NEXT_PUBLIC_ZORA_DEMO_MODE must be false.");
}

const pooled = requireUrl("DATABASE_URL", { https: false });
const direct = requireUrl("DATABASE_URL_UNPOOLED", { https: false });
for (const [name, parsed] of [["DATABASE_URL", pooled], ["DATABASE_URL_UNPOOLED", direct]]) {
  if (!parsed) continue;
  if (!["postgres:", "postgresql:"].includes(parsed.protocol)) {
    errors.push(`${name} must use the PostgreSQL protocol.`);
  }
  if (!parsed.hostname.endsWith(".neon.tech")) errors.push(`${name} must target Neon.`);
  if (parsed.searchParams.get("sslmode") !== "require") errors.push(`${name} must include sslmode=require.`);
}
if (pooled && !pooled.hostname.includes("-pooler.")) {
  errors.push("DATABASE_URL must be Neon's pooled runtime connection string.");
}
if (direct && direct.hostname.includes("-pooler.")) {
  errors.push("DATABASE_URL_UNPOOLED must be Neon's direct migration connection string.");
}
if (pooled && decodeURIComponent(pooled.username) !== "zora_app") {
  errors.push("DATABASE_URL must use the restricted zora_app role.");
}
if (direct && decodeURIComponent(direct.username) === "zora_app") {
  errors.push("DATABASE_URL_UNPOOLED must use the migration owner role, not zora_app.");
}
if (
  pooled &&
  direct &&
  (pooled.hostname.replace("-pooler.", ".") !== direct.hostname || pooled.pathname !== direct.pathname)
) {
  errors.push("DATABASE_URL and DATABASE_URL_UNPOOLED must target the same Neon branch and database.");
}

requireUrl("NEXT_PUBLIC_SUPABASE_URL");
requireValue("NEXT_PUBLIC_SUPABASE_ANON_KEY", 40);
requireValue("SUPABASE_SERVICE_ROLE_KEY", 40);
requireValue("SUPABASE_EVIDENCE_BUCKET", 3);
requireUrl("KGML_API_URL");
requireValue("KGML_SERVICE_KEY", 32);
requireValue("IOT_INGEST_SECRET", 32);
requireValue("ACCESS_REQUEST_HASH_SALT", 32);
const organizationId = requireValue("NEXT_PUBLIC_ZORA_ORGANIZATION_ID", 36);
if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(organizationId)) {
  errors.push("NEXT_PUBLIC_ZORA_ORGANIZATION_ID must be a valid UUID.");
}
requireUrl("NEXT_PUBLIC_MAP_STYLE_URL");

if (pooled && direct && decodeURIComponent(pooled.username) === decodeURIComponent(direct.username)) {
  errors.push("DATABASE_URL and DATABASE_URL_UNPOOLED must use different runtime and migration roles.");
}

const poolMax = Number(value("DATABASE_POOL_MAX") || "3");
if (!Number.isInteger(poolMax) || poolMax < 1 || poolMax > 10) {
  errors.push("DATABASE_POOL_MAX must be an integer between 1 and 10.");
}

if (errors.length) {
  console.error("CCSA Zora production environment validation failed:\n");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("CCSA Zora production environment validation passed.");
