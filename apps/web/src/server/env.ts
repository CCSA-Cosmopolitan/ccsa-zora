function configured(name: string, minimumLength = 1) {
  const current = process.env[name]?.trim() ?? "";
  return (
    current.length >= minimumLength && !/replace-me|replace-with|example|password/i.test(current)
  );
}

export function productionConfigurationIssues() {
  const issues: string[] = [];
  const isProduction =
    process.env.VERCEL_ENV === "production" || process.env.ZORA_ENV === "production";
  if (!isProduction) return issues;

  if (process.env.ZORA_DEMO_MODE !== "false") issues.push("demo_mode_enabled");
  if (process.env.NEXT_PUBLIC_ZORA_DEMO_MODE !== "false") issues.push("public_demo_mode_enabled");
  for (const [name, minimum] of [
    ["DATABASE_URL", 20],
    ["NEXT_PUBLIC_SUPABASE_URL", 12],
    ["NEXT_PUBLIC_SUPABASE_ANON_KEY", 40],
    ["SUPABASE_SERVICE_ROLE_KEY", 40],
    ["SUPABASE_EVIDENCE_BUCKET", 3],
    ["KGML_API_URL", 12],
    ["KGML_SERVICE_KEY", 32],
    ["IOT_INGEST_SECRET", 32],
    ["NEXT_PUBLIC_ZORA_ORGANIZATION_ID", 36],
    ["NEXT_PUBLIC_MAP_STYLE_URL", 12],
  ] as const) {
    if (!configured(name, minimum)) issues.push(`missing_${name.toLowerCase()}`);
  }

  const databaseUrl = process.env.DATABASE_URL;
  try {
    const parsed = new URL(databaseUrl ?? "");
    if (
      !["postgres:", "postgresql:"].includes(parsed.protocol) ||
      !parsed.hostname.endsWith(".neon.tech") ||
      !parsed.hostname.includes("-pooler.") ||
      decodeURIComponent(parsed.username) !== "zora_app" ||
      parsed.searchParams.get("sslmode") !== "require"
    ) {
      issues.push("unsafe_database_url");
    }
  } catch {
    issues.push("invalid_database_url");
  }

  for (const name of [
    "NEXT_PUBLIC_SUPABASE_URL",
    "KGML_API_URL",
    "NEXT_PUBLIC_MAP_STYLE_URL",
  ] as const) {
    try {
      if (new URL(process.env[name] ?? "").protocol !== "https:")
        issues.push(`unsafe_${name.toLowerCase()}`);
    } catch {
      issues.push(`invalid_${name.toLowerCase()}`);
    }
  }

  const poolMax = Number(process.env.DATABASE_POOL_MAX ?? "3");
  if (!Number.isInteger(poolMax) || poolMax < 1 || poolMax > 10)
    issues.push("invalid_database_pool_max");
  return issues;
}

export function assertProductionConfiguration() {
  const issues = productionConfigurationIssues();
  if (issues.length) {
    throw new Error(`Production configuration is incomplete: ${issues.join(", ")}`);
  }
}
