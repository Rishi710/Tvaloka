import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Shopify signs every webhook body with the webhook secret (HMAC-SHA256,
 * base64) and sends it in the `X-Shopify-Hmac-Sha256` header. Anything that
 * doesn't match is not from Shopify and must be ignored.
 */
export function isValidShopifySignature(rawBody: string, signature: string | null, secret: string) {
  if (!signature) return false;
  const expected = createHmac("sha256", secret).update(rawBody, "utf8").digest();
  let received: Buffer;
  try {
    received = Buffer.from(signature, "base64");
  } catch {
    return false;
  }
  return received.length === expected.length && timingSafeEqual(received, expected);
}

/**
 * Which cache tags to mark stale for a webhook topic, matching the tags set on
 * the Shopify fetches in app/lib/shopify/queries/*.
 *
 * Returns null for topics we don't handle.
 */
export function tagsForWebhook(topic: string, payload: { handle?: unknown }): string[] | null {
  const handle = typeof payload.handle === "string" && payload.handle ? payload.handle : null;

  switch (topic) {
    case "products/create":
    case "products/update":
    case "products/delete":
        
      return ["products", "collection-products", ...(handle ? [`product-${handle}`] : [])];

    case "collections/create":
    case "collections/update":
    case "collections/delete":
      return ["collections", "collection-products", ...(handle ? [`collection-${handle}`] : [])];

    case "articles/create":
    case "articles/update":
    case "articles/delete":
      return ["articles", ...(handle ? [`article-${handle}`] : [])];

    default:
      return null;
  }
}
