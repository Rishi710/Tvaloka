import { NextRequest, NextResponse } from "next/server";
import { sendMetaCapiEvent, type MetaCapiEventData } from "@/app/lib/meta-capi";

export const dynamic = "force-dynamic";

/**
 * Relay for browser Pixel events: the page posts the same event (and event ID)
 * it gave the Pixel, and we forward it to Meta's Conversions API from the
 * server, adding the visitor's IP and user agent. Ad blockers and Safari's
 * tracking limits stop the Pixel but not this.
 *
 * Only the events the storefront actually sends are accepted, so this can't be
 * used to push arbitrary events into the dataset.
 */
const ALLOWED_EVENTS = new Set([
  "ViewContent",
  "ViewCategory",
  "Search",
  "AddToCart",
  "CustomizeProduct",
  "InitiateCheckout",
  "Lead",
  "Contact",
]);

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function str(value: unknown, max = 500): string | undefined {
  return typeof value === "string" && value.length > 0 ? value.slice(0, max) : undefined;
}

function sanitizeEventData(raw: unknown): MetaCapiEventData | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const d = raw as Record<string, unknown>;
  const out: MetaCapiEventData = {};
  if (Array.isArray(d.content_ids)) {
    out.content_ids = d.content_ids.filter((v): v is string => typeof v === "string").slice(0, 100);
  }
  if (typeof d.content_type === "string") out.content_type = d.content_type.slice(0, 40);
  if (typeof d.content_name === "string") out.content_name = d.content_name.slice(0, 200);
  if (typeof d.content_category === "string") out.content_category = d.content_category.slice(0, 200);
  if (typeof d.search_string === "string") out.search_string = d.search_string.slice(0, 200);
  if (typeof d.value === "number" && Number.isFinite(d.value)) out.value = d.value;
  if (typeof d.currency === "string") out.currency = d.currency.slice(0, 3).toUpperCase();
  if (typeof d.num_items === "number" && Number.isFinite(d.num_items)) out.num_items = d.num_items;
  return out;
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 });
  }

  const eventName = str(body.eventName, 60);
  const eventId = str(body.eventId, 100);
  if (!eventName || !ALLOWED_EVENTS.has(eventName) || !eventId) {
    return NextResponse.json({ success: false, error: "Invalid event" }, { status: 400 });
  }

  const rawIp = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip");
  const clientIp = rawIp ? rawIp.split(",")[0].trim() : undefined;
  const email = str(body.email, 254);

  const result = await sendMetaCapiEvent({
    eventName,
    eventId,
    eventData: sanitizeEventData(body.eventData),
    sourceUrl: str(body.sourceUrl, 2000),
    userData: {
      clientIp,
      userAgent: str(body.userAgent, 500) ?? request.headers.get("user-agent") ?? undefined,
      fbp: str(body.fbp, 200),
      fbc: str(body.fbc, 500),
      email: email && EMAIL_PATTERN.test(email) ? email : undefined,
    },
  });

  if (!result.success) {
    return NextResponse.json({ success: false }, { status: 502 });
  }
  return NextResponse.json({ success: true, skipped: result.skipped });
}
