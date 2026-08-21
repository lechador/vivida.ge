import Link from "next/link";

import { Button } from "@/components/ui/button";

/** Static public CTA: no per-page session endpoint invocation. */
export function MarketingCta() {
  return (
    <Button asChild variant="mystic" size="sm">
      <Link href="/signup">დაიწყე უფასოდ</Link>
    </Button>
  );
}
