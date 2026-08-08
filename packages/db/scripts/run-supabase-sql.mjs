import fs from "node:fs";
import { resolve } from "node:path";
import postgres from "postgres";

const [, , relativeSqlPath] = process.argv;
const databaseUrl = process.env.SUPABASE_DATABASE_URL;

if (!relativeSqlPath) {
  throw new Error("Usage: node scripts/run-supabase-sql.mjs <relative-sql-file>");
}

if (!databaseUrl) {
  throw new Error("SUPABASE_DATABASE_URL is required for Supabase Auth/Storage setup SQL.");
}

const sqlPath = resolve(process.cwd(), relativeSqlPath);
console.log(`Running Supabase SQL script: ${relativeSqlPath}`);

try {
  const sqlContent = fs.readFileSync(sqlPath, "utf8");
  const sql = postgres(databaseUrl);

  // Execute the multi-statement raw SQL string directly in Supabase
  await sql.unsafe(sqlContent);
  await sql.end();

  console.log(`Supabase SQL script ${relativeSqlPath} executed successfully.`);
  process.exit(0);
} catch (error) {
  console.error(`Error executing Supabase SQL script ${relativeSqlPath}:`, error);
  process.exit(1);
}
