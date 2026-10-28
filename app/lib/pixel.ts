/**
 * Meta Pixel + Conversions API helpers.
 *
 * Each event is sent twice with one shared event ID, and Meta counts it once:
 *   1. in the browser through `fbq`
 *   2. from our server through /api/meta-events → Conversions API, which still
 *      works when an ad blocker or Safari blocks the Pixel
 *
 * Everything here does nothing until NEXT_PUBLIC_META_PIXEL_ID is set, and on
 * localhost, so development traffic never reaches the real dataset.
 *
 * Purchase, AddPaymentInfo and (by default) InitiateCheckout are NOT sent from
 * here: they happen on Shopify's checkout, which the Facebook & Instagram sales
 * channel already reports. Sending them from here as well would double count.
 */

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

export const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || "";

/**
 * Set NEXT_PUBLIC_META_TRACK_CHECKOUT=true only if the Facebook & Instagram
 * channel is NOT reporting InitiateCheckout, otherwise it is counted twice.
 */
const TRACK_CHECKOUT = process.env.NEXT_PUBLIC_META_TRACK_CHECKOUT === "true";

/**
 * How product IDs are written in `content_ids`. They must match the Content ID
 * of the items in the Meta catalogue, or events won't link to products.
 *   "variant" (default): the bare numeric variant ID, e.g. 42746505068610
 *   "shopify": what the Facebook & Instagram channel writes, shopify_IN_<product>_<variant>
 * Check a synced item's Content ID in Commerce Manager and set accordingly.
 */
const CONTENT_ID_FORMAT = process.env.NEXT_PUBLIC_META_CONTENT_ID_FORMAT || "variant";

// ── Helpers ──────────────────────────────────────────────────────────────────

function numericId(gid: string): string {
  return gid.split("/").pop() || gid;
}

/** The catalogue Content ID for a product (and its variant) given as Shopify GIDs. */
export function toContentId(productGid: string, variantGid?: string | null): string {
  if (CONTENT_ID_FORMAT === "shopify" && variantGid) {
    return `shopify_IN_${numericId(productGid)}_${numericId(variantGid)}`;
  }
  return variantGid ? numericId(variantGid) : numericId(productGid);
}

function isLocalOrigin(): boolean {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname;
  return host === "localhost" || host === "127.0.0.1" || host === "0.0.0.0";
}

function enabled(): boolean {
  return Boolean(PIXEL_ID) && typeof window !== "undefined" && !isLocalOrigin();
}

function eventId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function getCookie(name: string): string {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : "";
}

// React can run an effect twice (Strict Mode, quick re-renders); one view = one event.
const recent = new Map<string, number>();
function isDuplicate(key: string, windowMs = 2000): boolean {
  const now = Date.now();
  const last = recent.get(key);
  if (last !== undefined && now - last < windowMs) return true;
  recent.set(key, now);
  return false;
}

type EventData = Record<string, unknown>;

/** Sends one event through both channels. Never throws and never blocks the page. */
function track(
  name: string,
  data: EventData,
  options: { custom?: boolean; email?: string } = {},
): void {
  if (!enabled()) return;
  const id = eventId();

  try {
    if (typeof window.fbq === "function") {
      window.fbq(options.custom ? "trackCustom" : "track", name, data, { eventID: id });
    }
  } catch {
    // The Pixel must never break the page.
  }

  // `keepalive` lets the request finish even if the page is navigating away
  // (checkout hand-off, tel:/mailto: links).
  try {
    void fetch("/api/meta-events", {
      method: "POST",
      keepalive: true,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventName: name,
        eventId: id,
        eventData: data,
        email: options.email,
        sourceUrl: window.location.href,
        userAgent: navigator.userAgent,
        fbp: getCookie("_fbp"),
        fbc: getCookie("_fbc"),
      }),
    }).catch(() => {});
  } catch {
    // ignore
  }
}

// ── Events ───────────────────────────────────────────────────────────────────

/** Browser-only; the landing page's PageView is sent by the base script. */
export function pixelPageView(): void {
  if (!enabled() || typeof window.fbq !== "function") return;
  window.fbq("track", "PageView");
}

export interface PixelProduct {
  id: string;
  variantId?: string | null;
  title: string;
  /** Unit price as a plain number string, e.g. "1200.00" */
  price: string;
  currencyCode?: string;
}

/** Product page viewed. */
export function pixelViewContent(p: PixelProduct): void {
  if (!enabled() || isDuplicate(`vc:${p.id}`)) return;
  track("ViewContent", {
    content_ids: [toContentId(p.id, p.variantId)],
    content_type: "product",
    content_name: p.title,
    value: parseFloat(p.price),
    currency: p.currencyCode || "INR",
  });
}

/** Collection page viewed. ViewCategory is Meta's own event name for this. */
export function pixelViewCategory(collectionTitle: string, handle: string): void {
  if (!enabled() || isDuplicate(`vcat:${handle}`)) return;
  track("ViewCategory", { content_category: collectionTitle, content_type: "product_group" }, { custom: true });
}

/** Search run from the search bar. */
export function pixelSearch(query: string): void {
  const term = query.trim();
  if (!enabled() || term.length < 2 || isDuplicate(`s:${term.toLowerCase()}`, 5000)) return;
  track("Search", { search_string: term });
}

/** Item added to the cart. */
export function pixelAddToCart(p: PixelProduct & { quantity: number }): void {
  if (!enabled()) return;
  track("AddToCart", {
    content_ids: [toContentId(p.id, p.variantId)],
    content_type: "product",
    content_name: p.title,
    value: parseFloat(p.price) * p.quantity,
    currency: p.currencyCode || "INR",
    num_items: p.quantity,
  });
}

/** Visitor switched to another size of the product. */
export function pixelCustomizeProduct(p: { id: string; title: string; size?: string | null }): void {
  if (!enabled() || isDuplicate(`cp:${p.id}`, 1000)) return;
  track("CustomizeProduct", {
    content_ids: [numericId(p.id)],
    content_type: "product_group",
    content_name: p.title,
    ...(p.size ? { content_category: p.size } : {}),
  });
}

/** Newsletter signup. The email is hashed on the server before it reaches Meta. */
export function pixelLead(email: string): void {
  if (!enabled()) return;
  track("Lead", { content_name: "Newsletter signup" }, { email });
}

/** Phone or email link clicked, or the contact form sent. */
export function pixelContact(via: "phone" | "email" | "form"): void {
  if (!enabled() || isDuplicate(`c:${via}`, 3000)) return;
  track("Contact", { content_name: via });
}

/**
 * Shopper pressed "Proceed to Checkout". Off unless NEXT_PUBLIC_META_TRACK_CHECKOUT=true
 * (see the note at the top of this file).
 */
export function pixelInitiateCheckout(p: {
  contentIds: string[];
  numItems: number;
  value: number;
  currencyCode?: string;
}): void {
  if (!TRACK_CHECKOUT || !enabled()) return;
  track("InitiateCheckout", {
    content_ids: p.contentIds,
    content_type: "product",
    num_items: p.numItems,
    value: p.value,
    currency: p.currencyCode || "INR",
  });
}
