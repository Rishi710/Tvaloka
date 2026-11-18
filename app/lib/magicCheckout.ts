/**
 * Razorpay Magic Checkout — browser side. The server half is in
 * app/api/magic-checkout. Everything is off until NEXT_PUBLIC_RAZORPAY_KEY_ID is set.
 */

import { pixelPurchase, toContentId } from "./pixel";

const KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "";
const SCRIPT_SRC = "https://checkout.razorpay.com/v1/magic-checkout.js";

export const MAGIC_CHECKOUT_ENABLED = Boolean(KEY_ID);

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
}

export interface MagicCheckoutCallbacks {
  /** Payment confirmed and the Shopify order exists. */
  onPaid: (result: { orderStatusUrl: string }) => void;
  /** The shopper closed the modal without paying. */
  onDismiss: () => void;
  /** The shopper paid, but we couldn't confirm the order on our side. */
  onConfirmError: () => void;
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

  const options: RazorpayOptions = {
    key: KEY_ID,
    name: "Tvaloka Wellness",
    order_id: data.orderId,
    show_coupons: true,
    theme: { color: "#000000" },
    handler: async (payment) => {
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
        const done: {
          ok: boolean;
          orderStatusUrl?: string;
          value?: number;
          currency?: string;
          purchaseEventId?: string;
        } = await res.json();
        if (!res.ok || !done.ok || !done.orderStatusUrl) throw new Error("Order not confirmed");

        // Same event ID as the server's Purchase, so Meta counts it once.
        pixelPurchase({
          eventId: done.purchaseEventId,
          value: done.value ?? 0,
          currency: done.currency,
          contentIds,
        });
        callbacks.onPaid({ orderStatusUrl: done.orderStatusUrl });
      } catch {
        callbacks.onConfirmError();
      }
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
