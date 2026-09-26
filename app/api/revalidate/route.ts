import type { NextRequest } from "next/server";
import { revalidateTag } from "next/cache";
import { isValidShopifySignature, tagsForWebhook } from "@/app/lib/shopify/webhook";

// Receives Shopify webhooks (product / collection / article changes) and marks
// only the affected cached data stale, so pages refresh when something actually
// changes instead of on a timer.
export async function POST(request: NextRequest) {
  const secret = process.env.SHOPIFY_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[/api/revalidate] SHOPIFY_WEBHOOK_SECRET is not set; refusing all requests.");
    return Response.json({ error: "Webhook not configured" }, { status: 500 });
  }

  // The signature covers the exact raw body, so read it as text before parsing.
  const rawBody = await request.text();
  const signature = request.headers.get("x-shopify-hmac-sha256");
  if (!isValidShopifySignature(rawBody, signature, secret)) {
    return Response.json({ error: "Invalid signature" }, { status: 401 });
  }

  const topic = request.headers.get("x-shopify-topic") ?? "";
  let payload: { handle?: unknown } = {};
  try {
    payload = JSON.parse(rawBody);
  } catch {
    // Body wasn't JSON; fall back to the broad tags for the topic.
  }

  const tags = tagsForWebhook(topic, payload);
  if (!tags) {
    // Signed by Shopify but not a topic we act on — acknowledge so it isn't retried.
    return Response.json({ ok: true, ignored: topic });
  }

  for (const tag of tags) revalidateTag(tag, "max");
  return Response.json({ ok: true, topic, revalidated: tags });
}
