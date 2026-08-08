import fs from "node:fs";
import { resolve } from "node:path";
import postgres from "postgres";

const [, , relativeSqlPath] = process.argv;
const databaseUrl = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;

if (!relativeSqlPath) {
  throw new Error("Usage: node scripts/run-sql.mjs <relative-sql-file>");
}

if (!databaseUrl) {
  throw new Error("DATABASE_URL_UNPOOLED or DATABASE_URL is required.");
}

const sqlPath = resolve(process.cwd(), relativeSqlPath);
console.log(`Running SQL script: ${relativeSqlPath}`);

try {
  const sqlContent = fs.readFileSync(sqlPath, "utf8");
  const sql = postgres(databaseUrl);

  // Execute the multi-statement raw SQL string directly in PostgreSQL
  await sql.unsafe(sqlContent);
  await sql.end();

  console.log(`SQL script ${relativeSqlPath} executed successfully.`);
  process.exit(0);
} catch (error) {
  console.error(`Error executing SQL script ${relativeSqlPath}:`, error);
  process.exit(1);
}
