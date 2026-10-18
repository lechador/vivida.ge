import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import type { NeonHttpDatabase } from "drizzle-orm/neon-http";
import { drizzle as drizzleNodePg } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as schema from "./schema";

function isNeonHost(connectionString: string): boolean {
  try {
    return new URL(connectionString).hostname.endsWith(".neon.tech");
  } catch {
    return true;
  }
}

function createMockDb(): NeonHttpDatabase<typeof schema> {
  const emptyResult = Object.assign([] as unknown[], { rows: [], rowCount: 0 });
  const promise = Promise.resolve(emptyResult);
  const chain: unknown = new Proxy(function () {}, {
    get(_, prop) {
      if (prop === "then") return promise.then.bind(promise);
      if (prop === "catch") return promise.catch.bind(promise);
      if (prop === "finally") return promise.finally.bind(promise);
      if (prop === Symbol.iterator)
        return emptyResult[Symbol.iterator].bind(emptyResult);
      if (prop === "rows") return [];
      if (prop === "rowCount") return 0;
      if (prop === "length") return 0;
      if (prop === "transaction")
        return async (cb: (tx: unknown) => unknown) => cb(chain);
      if (prop === "query") {
        return new Proxy(
          {},
          {
            get: () => ({
              findMany: async () => [],
              findFirst: async () => null,
            }),
          },
        );
      }
      return () => chain;
    },
    apply() {
      return chain;
    },
  });
  return chain as NeonHttpDatabase<typeof schema>;
}

let dbInstance: NeonHttpDatabase<typeof schema>;
const url = process.env.DATABASE_URL?.trim();

if (!url) {
  console.warn("[AI Studio] DATABASE_URL not set — using in-memory mock database");
  dbInstance = createMockDb();
} else {
  try {
    dbInstance = isNeonHost(url)
      ? drizzle(neon(url), { schema })
      : (drizzleNodePg(new Pool({ connectionString: url }), {
          schema,
        }) as unknown as NeonHttpDatabase<typeof schema>);
  } catch {
    console.warn("[AI Studio] Database connection failed — using mock database");
    dbInstance = createMockDb();
  }
}

export const db: NeonHttpDatabase<typeof schema> = dbInstance;

export { schema };

