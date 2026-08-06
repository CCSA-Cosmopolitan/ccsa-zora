import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

export type DatabaseTransaction = postgres.TransactionSql;

export function createDatabase(databaseUrl = process.env.DATABASE_URL) {
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required to create the CCSA Zora database client.");
  }

  const configuredPoolSize = Number(process.env.DATABASE_POOL_MAX ?? "3");
  if (!Number.isInteger(configuredPoolSize) || configuredPoolSize < 1 || configuredPoolSize > 10) {
    throw new Error("DATABASE_POOL_MAX must be an integer between 1 and 10.");
  }

  const client = postgres(databaseUrl, {
    max: configuredPoolSize,
    prepare: false,
    connect_timeout: 15,
    idle_timeout: 20,
    max_lifetime: 60 * 30,
    connection: {
      application_name: process.env.VERCEL_ENV
        ? `ccsa-zora-web-${process.env.VERCEL_ENV}`
        : "ccsa-zora-local",
    },
  });

  return {
    client,
    db: drizzle(client, { schema }),
  };
}
