"use client";

/**
 * Image loader for next/image (see images.loaderFile in next.config.ts).
 *
 * Vercel's built-in optimizer has a monthly limit on the free plan; once it was
 * used up every image came back 402 and the whole site showed broken pictures.
 * Product images live on Shopify's CDN, which resizes them itself via a `width`
 * parameter, so we ask for the size directly and skip Vercel's optimizer.
 * Local files in /public are small and are served as they are.
 */
export default function imageLoader({ src, width }: { src: string; width: number; quality?: number }): string {
  try {
    const url = new URL(src);
    if (url.hostname === "cdn.shopify.com" || url.hostname.endsWith(".shopify.com")) {
      url.searchParams.set("width", String(width));
      return url.toString();
    }
    return src;
  } catch {
    // Relative path (a file in /public). The width is only there so each size
    // is a distinct URL; the file server ignores it.
    return `${src}${src.includes("?") ? "&" : "?"}w=${width}`;
  }
}
