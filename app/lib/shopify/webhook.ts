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
    // A create/delete changes which products exist, so every shared listing
    // (home rails, /products, ingredients, search, concern section) needs to
    // catch up — those all share the broad "products" / "collection-products"
    // tags today, so this is intentionally wide.
    case "products/create":
    case "products/delete":
      return ["products", "collection-products", ...(handle ? [`product-${handle}`] : [])];

    // An update just changes that product's own fields (price, description,
    // images, …) — only its own page needs to be fresh immediately. The
    // shared listing pages catch up on their normal hourly refresh instead of
    // regenerating sitewide on every single edit.
    case "products/update":
      return handle ? [`product-${handle}`] : [];

    case "collections/create":
    case "collections/delete":
      return ["collections", "collection-products", ...(handle ? [`collection-${handle}`] : [])];

    // Same reasoning as products/update: a rename/description edit only
    // needs that one collection page refreshed immediately.
    case "collections/update":
      return handle ? [`collection-${handle}`] : ["collections"];

    case "articles/create":
    case "articles/update":
    case "articles/delete":
      return ["articles", ...(handle ? [`article-${handle}`] : [])];

    default:
      return null;
  }
}
