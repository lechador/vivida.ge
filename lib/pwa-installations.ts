import { lt } from "drizzle-orm";

import { db } from "@/db";
import { pwaInstallations } from "@/db/schema";

/** Keep only installed-web-app profiles seen within the last 13 months. */
export async function prunePwaInstallations(): Promise<void> {
  try {
    const cutoff = new Date();
    cutoff.setUTCMonth(cutoff.getUTCMonth() - 13);
    await db
      .delete(pwaInstallations)
      .where(lt(pwaInstallations.lastOpenedAt, cutoff));
  } catch (error) {
    console.warn("[pwa] prune failed:", (error as Error).message);
  }
}
