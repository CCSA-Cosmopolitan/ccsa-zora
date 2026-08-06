import { createDatabase } from "@ccsa-zora/db/client";

type DatabaseBundle = ReturnType<typeof createDatabase>;

declare global {
  // eslint-disable-next-line no-var
  var __zoraDatabase: DatabaseBundle | undefined;
}

export function getDatabase() {
  globalThis.__zoraDatabase ??= createDatabase();
  return globalThis.__zoraDatabase;
}
