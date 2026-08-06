import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

const [, , relativeSqlPath] = process.argv;
const databaseUrl = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;

if (!relativeSqlPath) {
  throw new Error("Usage: node scripts/run-sql.mjs <relative-sql-file>");
}

if (!databaseUrl) {
  throw new Error("DATABASE_URL_UNPOOLED or DATABASE_URL is required.");
}

const result = spawnSync(
  "psql",
  [
    "--dbname",
    databaseUrl,
    "--set",
    "ON_ERROR_STOP=1",
    "--file",
    resolve(process.cwd(), relativeSqlPath),
  ],
  {
    stdio: "inherit",
    shell: false,
  },
);

if (result.error) {
  throw result.error;
}

process.exit(result.status ?? 1);
