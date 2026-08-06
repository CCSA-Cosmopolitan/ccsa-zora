import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

const [, , relativeSqlPath] = process.argv;
const databaseUrl = process.env.SUPABASE_DATABASE_URL;

if (!relativeSqlPath) throw new Error("Usage: node scripts/run-supabase-sql.mjs <relative-sql-file>");
if (!databaseUrl) throw new Error("SUPABASE_DATABASE_URL is required for Supabase Auth/Storage setup SQL.");

const result = spawnSync(
  "psql",
  ["--dbname", databaseUrl, "--set", "ON_ERROR_STOP=1", "--file", resolve(process.cwd(), relativeSqlPath)],
  { stdio: "inherit", shell: false },
);

if (result.error) throw result.error;
process.exit(result.status ?? 1);
