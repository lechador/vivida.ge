"use client";

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

import { FB_PIXEL_ID, fbTrack } from "@/lib/fb-pixel";

/**
 * Meta / Facebook Pixel loader + route-change PageView tracker.
 *
 * App Router doesn't reload the document on internal navigation, so we
 * have to manually fire `PageView` whenever the pathname or query string
 * changes. The base script init below also fires the very first PageView
 * on initial load.
 *
 * Wrapped in <Suspense> because `useSearchParams()` requires a Suspense
 * boundary somewhere in the tree per Next 16 conventions.
 */
export function FbPixel() {
  if (!FB_PIXEL_ID) return null;

  return (
    <>
      <Script
        id="fb-pixel"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window,document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${FB_PIXEL_ID}');
fbq('track', 'PageView');
          `,
        }}
      />
      {/* <noscript> fallback so visitors with JS disabled still register a
          hit. The 1×1 pixel image makes a request to Meta directly. */}
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt=""
          height={1}
          width={1}
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${FB_PIXEL_ID}&ev=PageView&noscript=1`}
        />
      </noscript>
      <Suspense fallback={null}>
        <RouteChangeTracker />
      </Suspense>
    </>
  );
}

function RouteChangeTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!pathname) return;
    fbTrack("PageView");
    // Fire only on the change itself; the values aren't used in the body.
  }, [pathname, searchParams]);

  return null;
}
