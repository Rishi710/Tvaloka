"use client";

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef } from "react";
import { PIXEL_ID, pixelContact, pixelPageView } from "../lib/pixel";

/**
 * Sends PageView on client-side route changes. The first load is left to the
 * base script below: this effect can run before the afterInteractive script has
 * defined window.fbq, which would silently drop the landing PageView.
 * useSearchParams needs a Suspense boundary.
 */
function RouteTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    pixelPageView();
  }, [pathname, searchParams]);

  return null;
}

/** Contact event for any tel: or mailto: link, wherever it appears on the site. */
function ContactLinkTracker() {
  useEffect(() => {
    function onClick(event: MouseEvent) {
      const link = (event.target as Element | null)?.closest?.("a[href]");
      const href = link?.getAttribute("href")?.toLowerCase() ?? "";
      if (href.startsWith("tel:")) pixelContact("phone");
      else if (href.startsWith("mailto:")) pixelContact("email");
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}

/**
 * Meta Pixel base code. Renders nothing until NEXT_PUBLIC_META_PIXEL_ID is set,
 * and does not initialise on localhost.
 */
export default function MetaPixel() {
  if (!PIXEL_ID) return null;

  return (
    <>
      <Script
        id="meta-pixel-base"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            if (!/^(localhost|127\\.0\\.0\\.1|0\\.0\\.0\\.0)$/.test(window.location.hostname)) {
              fbq('init', '${PIXEL_ID}');
              fbq('track', 'PageView');
            }
          `,
        }}
      />

      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>

      <Suspense fallback={null}>
        <RouteTracker />
      </Suspense>
      <ContactLinkTracker />
    </>
  );
}
