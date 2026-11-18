/**
 * Razorpay Magic Checkout (headless Shopify) — server-side calls.
 * Docs: https://razorpay.com/docs/payments/magic-checkout/shopify/custom/web-integration-nextjs
 *
 * Flow: Shopify cart (Storefront API) → Razorpay "checkout" for that cart →
 * Razorpay order → modal on our page → "complete" creates the Shopify order.
 *
 * Off until NEXT_PUBLIC_RAZORPAY_KEY_ID (the live Key ID) is set. Razorpay's
 * Magic APIs are keyed by Key ID only; they answer "Authorization Failed" until
 * Razorpay's team has linked this Shopify store to the merchant account.
 */

// RAZORPAY_API_BASE only exists so tests can point this at a local stand-in.
const API_BASE = process.env.RAZORPAY_API_BASE || "https://api.razorpay.com/v1";

export const RAZORPAY_KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "";

export function isMagicCheckoutConfigured(): boolean {
  return Boolean(RAZORPAY_KEY_ID);
}

export class MagicCheckoutError extends Error {
  constructor(
    message: string,
    public status = 502,
    public detail?: unknown,
  ) {
    super(message);
  }
}

async function razorpayPost<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${API_BASE}${path}?key_id=${encodeURIComponent(RAZORPAY_KEY_ID)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    console.error(`[Magic Checkout] ${path} failed (${response.status}):`, data);
    throw new MagicCheckoutError(`Razorpay ${path} failed`, response.status, data);
  }
  return data as T;
}

const numericId = (gid: string) => gid.split("/").pop() || gid;

export interface MagicCartLine {
  variantId: string; // Shopify GID
  productId: string; // Shopify GID
  quantity: number;
}

export interface MagicAnalytics {
  fbp?: string;
  fbc?: string;
  sourceUrl?: string;
  userAgent?: string;
}

/** Steps 1 + 2 of the flow: register the Shopify cart with Razorpay, then create the order. */
export async function createMagicOrder(
  shopifyCartId: string,
  lines: MagicCartLine[],
  analytics: MagicAnalytics = {},
): Promise<{ orderId: string; checkoutId: string }> {
  // "gid://shopify/Cart/<token>?key=<key>" → token is everything after /Cart/.
  const token = shopifyCartId.split("/Cart/")[1];
  if (!token) throw new MagicCheckoutError("Unexpected Shopify cart id", 500);

  const checkout = await razorpayPost<{ shopify_checkout_id: string }>("/magic/checkout/shopify", {
    cart: {
      token,
      note: null,
      attributes: { Source: "Tvaloka web" },
      item_count: lines.reduce((sum, l) => sum + l.quantity, 0),
      items: lines.map((l) => ({
        id: Number(numericId(l.variantId)),
        quantity: l.quantity,
        product_id: Number(numericId(l.productId)),
        variant_id: Number(numericId(l.variantId)),
      })),
    },
  });

  const order = await razorpayPost<{ order_id: string }>("/magic/order/shopify", {
    shopify_checkout_id: checkout.shopify_checkout_id,
    fb_analytics: {
      fbp: analytics.fbp,
      fbc: analytics.fbc,
      event_source_url: analytics.sourceUrl,
    },
    utm_parameters: {
      landing_page_url: analytics.sourceUrl,
      user_agent: analytics.userAgent,
    },
  });

  return { orderId: order.order_id, checkoutId: checkout.shopify_checkout_id };
}

export interface MagicCompletedOrder {
  id: number;
  order_id: string; // Shopify order name, e.g. "#32697"
  payment_id: string;
  payment_method?: string;
  payment_currency?: string;
  total_amount: number; // paise
  order_status_url: string;
  customer_details?: {
    email?: string;
    contact?: string;
  };
}

/** After payment: creates the order in Shopify. */
export function completeMagicCheckout(paymentId: string, orderId: string): Promise<MagicCompletedOrder> {
  return razorpayPost<MagicCompletedOrder>("/1cc/shopify/complete", {
    razorpay_payment_id: paymentId,
    razorpay_order_id: orderId,
  });
}
