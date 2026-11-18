/**
 * Razorpay Magic Checkout — browser side. The server half is in
 * app/api/magic-checkout. Everything is off until NEXT_PUBLIC_RAZORPAY_KEY_ID is set.
 */

import { pixelPurchase, toContentId } from "./pixel";

const KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "";
const SCRIPT_SRC = "https://checkout.razorpay.com/v1/magic-checkout.js";

export const MAGIC_CHECKOUT_ENABLED = Boolean(KEY_ID);

/** Where the order summary is kept for the /order-confirmation page. */
export const LAST_ORDER_KEY = "tvaloka_last_order";

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature?: string;
}

interface RazorpayOptions {
  key: string;
  name: string;
  order_id: string;
  show_coupons: boolean;
  theme?: { color: string };
  handler: (response: RazorpayResponse) => void;
  modal: { ondismiss: () => void };
}

declare global {
  interface Window {
    // The docs show both forms; whichever the script defines is used.
    Razorpay?: new (options: RazorpayOptions) => { open: () => void };
    MagicCheckout?: { open: (options: RazorpayOptions) => void };
  }
}

export interface MagicCheckoutItem {
  variantId: string;
  productId: string;
  quantity: number;
  title: string;
  variantTitle?: string;
  sizeLabel?: string | null;
  imageUrl?: string | null;
  priceAmount: number;
}

/** What /order-confirmation shows. Kept in sessionStorage, never sent anywhere. */
export interface LastOrder {
  /** "confirmed": the Shopify order exists. "processing": paid, order still being created. */
  status: "confirmed" | "processing";
  orderName?: string;
  razorpayOrderId: string;
  paymentMethod?: string;
  email?: string;
  total: number;
  currency: string;
  orderStatusUrl?: string;
  items: Array<{
    title: string;
    subtitle?: string;
    imageUrl?: string | null;
    quantity: number;
    priceAmount: number;
  }>;
}

export interface MagicCheckoutCallbacks {
  /** The shopper paid. The order summary is saved under LAST_ORDER_KEY; show the confirmation page. */
  onPaid: () => void;
  /** The shopper closed the modal without paying. */
  onDismiss: () => void;
}

let scriptPromise: Promise<void> | null = null;

function loadScript(): Promise<void> {
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise<void>((resolve, reject) => {
    const el = document.createElement("script");
    el.src = SCRIPT_SRC;
    el.async = true;
    el.onload = () => resolve();
    el.onerror = () => {
      scriptPromise = null;
      reject(new Error("Could not load Magic Checkout"));
    };
    document.body.appendChild(el);
  });
  return scriptPromise;
}

function getCookie(name: string): string {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : "";
}

interface CompleteResponse {
  ok: boolean;
  orderStatusUrl?: string;
  orderName?: string;
  paymentMethod?: string;
  email?: string;
  value?: number;
  currency?: string;
  purchaseEventId?: string;
}

/**
 * Asks our server to create the order in Shopify for a payment that went
 * through. Card and UPI payments can take a moment to be marked as captured, so
 * a failed attempt is retried a couple of times before giving up.
 */
async function confirmOrder(
  payment: RazorpayResponse,
  contentIds: string[],
): Promise<CompleteResponse | null> {
  for (let attempt = 0; attempt < 3; attempt++) {
    if (attempt > 0) await new Promise((r) => setTimeout(r, 2500));
    try {
      const res = await fetch("/api/magic-checkout/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentId: payment.razorpay_payment_id,
          orderId: payment.razorpay_order_id,
          contentIds,
          sourceUrl: window.location.href,
        }),
      });
      const done: CompleteResponse = await res.json();
      if (res.ok && done.ok) return done;
      if (res.status === 400) return null; // our own validation rejected it; retrying won't help
    } catch {
      // network hiccup: try again
    }
  }
  return null;
}

/**
 * Opens the Magic Checkout modal for the given cart lines. Rejects if it can't
 * be opened (script blocked, Razorpay or Shopify error); the caller then falls
 * back to the normal Shopify checkout. Once the modal is open, the outcome is
 * reported through `callbacks`.
 */
export async function startMagicCheckout(
  items: MagicCheckoutItem[],
  callbacks: MagicCheckoutCallbacks,
): Promise<void> {
  const [, response] = await Promise.all([
    loadScript(),
    fetch("/api/magic-checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lines: items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
        fbp: getCookie("_fbp"),
        fbc: getCookie("_fbc"),
        sourceUrl: window.location.href,
      }),
    }),
  ]);
  const data: { ok: boolean; orderId?: string } = await response.json().catch(() => ({ ok: false }));
  if (!response.ok || !data.ok || !data.orderId) {
    throw new Error("Could not start Magic Checkout");
  }

  const contentIds = items.map((i) => toContentId(i.productId, i.variantId));
  const subtotal = items.reduce((sum, i) => sum + i.priceAmount * i.quantity, 0);

  const options: RazorpayOptions = {
    key: KEY_ID,
    name: "Tvaloka Wellness",
    order_id: data.orderId,
    show_coupons: true,
    theme: { color: "#000000" },
    handler: async (payment) => {
      const done = await confirmOrder(payment, contentIds);

      // The shopper has paid either way, so they always land on the
      // confirmation page. If our confirmation call failed, Razorpay still
      // creates the order in Shopify on its own shortly afterwards.
      const summary: LastOrder = {
        status: done ? "confirmed" : "processing",
        orderName: done?.orderName,
        razorpayOrderId: payment.razorpay_order_id,
        paymentMethod: done?.paymentMethod,
        email: done?.email,
        total: done?.value ?? subtotal,
        currency: done?.currency ?? "INR",
        orderStatusUrl: done?.orderStatusUrl,
        items: items.map((i) => ({
          title: i.title,
          subtitle: [i.variantTitle, i.sizeLabel].filter(Boolean).join(" · ") || undefined,
          imageUrl: i.imageUrl,
          quantity: i.quantity,
          priceAmount: i.priceAmount,
        })),
      };
      try {
        sessionStorage.setItem(LAST_ORDER_KEY, JSON.stringify(summary));
      } catch {
        // The page still works without the summary.
      }

      if (done) {
        // Same event ID as the server's Purchase, so Meta counts it once.
        pixelPurchase({
          eventId: done.purchaseEventId,
          value: done.value ?? 0,
          currency: done.currency,
          contentIds,
        });
      }
      callbacks.onPaid();
    },
    modal: { ondismiss: callbacks.onDismiss },
  };

  if (typeof window.Razorpay === "function") {
    new window.Razorpay(options).open();
  } else if (window.MagicCheckout?.open) {
    window.MagicCheckout.open(options);
  } else {
    throw new Error("Magic Checkout script did not initialise");
  }
}
