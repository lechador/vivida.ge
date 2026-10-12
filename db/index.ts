import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import type { NeonHttpDatabase } from "drizzle-orm/neon-http";
import { drizzle as drizzleNodePg } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as schema from "./schema";

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error("DATABASE_URL is not set");
}

/**
 * `@neondatabase/serverless` talks HTTP to Neon's SQL endpoint, it does not
 * speak the Postgres wire protocol. Pointing it at a plain Postgres server
 * (CI's `postgres:17-alpine` service on localhost:5432) makes every query fail
 * with `NeonDbError: Error connecting to database: TypeError: fetch failed`,
 * which is what broke `next build` in CI the moment a build step was added.
 *
 * So pick the driver from the host: Neon over HTTP in prod/preview, plain
 * node-postgres anywhere else. Both expose the same query-builder surface, and
 * this codebase uses no relational (`db.query.*`) or `$client` APIs.
 */
function isNeonHost(connectionString: string): boolean {
  try {
    return new URL(connectionString).hostname.endsWith(".neon.tech");
  } catch {
    // Not a parseable URL, let the Neon driver surface its own error rather
    // than silently opening a TCP pool to somewhere unexpected.
    return true;
  }
}

/**
 * Typed as the Neon database because that is what production runs; the
 * node-postgres instance is structurally compatible for everything used here.
 *
 * Caveat: `db.transaction()` throws "No transactions support in neon-http
 * driver" at runtime under Neon, but works under node-postgres. Both type-check
 * identically, so CI can green-light a transaction path that fails in prod.
 * See lib/photos-core.ts promotePhoto().
 */
export const db: NeonHttpDatabase<typeof schema> = isNeonHost(url)
  ? drizzle(neon(url), { schema })
  : (drizzleNodePg(new Pool({ connectionString: url }), {
      schema,
    }) as unknown as NeonHttpDatabase<typeof schema>);

export { schema };
