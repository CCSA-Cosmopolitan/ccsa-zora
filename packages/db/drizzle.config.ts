import { defineConfig } from "drizzle-kit";

const migrationDatabaseUrl = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;

if (!migrationDatabaseUrl) {
  throw new Error("DATABASE_URL_UNPOOLED or DATABASE_URL is required to run Drizzle commands.");
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/schema/index.ts",
  out: "./drizzle",
  dbCredentials: {
    url: migrationDatabaseUrl,
  },
  extensionsFilters: ["postgis"],
  strict: true,
  verbose: true,
});
