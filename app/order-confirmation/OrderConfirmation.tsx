"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useSyncExternalStore } from "react";
import { LAST_ORDER_KEY, type LastOrder } from "../lib/magicCheckout";

function money(amount: number, currency: string) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

const PAYMENT_LABELS: Record<string, string> = {
  cod: "Cash on delivery",
  upi: "UPI",
  card: "Card",
  netbanking: "Net banking",
  wallet: "Wallet",
};

function CheckCircle() {
  return (
    <svg viewBox="0 0 48 48" fill="none" className="h-14 w-14" aria-hidden="true">
      <circle cx="24" cy="24" r="22" stroke="currentColor" strokeWidth="2" />
      <path
        d="M14 25l7 7 13-15"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const buttonPrimary =
  "inline-flex min-h-[48px] items-center justify-center rounded-[var(--radius-xs)] bg-action-onlight-bg px-8 text-xs font-semibold uppercase tracking-widest text-action-onlight-text transition-colors hover:bg-action-onlight-bg-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black";
const buttonSecondary =
  "inline-flex min-h-[48px] items-center justify-center rounded-[var(--radius-xs)] border border-black bg-white px-8 text-xs font-semibold uppercase tracking-widest text-black transition-colors hover:bg-black hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black";

// sessionStorage never changes while this page is open, so there is nothing to subscribe to.
const subscribe = () => () => {};
const readStoredOrder = (): string | null => {
  try {
    return sessionStorage.getItem(LAST_ORDER_KEY);
  } catch {
    return null;
  }
};
// On the server (and while hydrating) the order is unknown: undefined.
const readStoredOrderOnServer = (): string | null | undefined => undefined;

export function OrderConfirmation() {
  const raw = useSyncExternalStore(subscribe, readStoredOrder, readStoredOrderOnServer);
  // undefined: still reading storage; null: nothing there.
  const order = useMemo<LastOrder | null | undefined>(() => {
    if (raw === undefined) return undefined;
    if (!raw) return null;
    try {
      return JSON.parse(raw) as LastOrder;
    } catch {
      return null;
    }
  }, [raw]);

  if (order === undefined) {
    return <div className="mx-auto max-w-2xl px-4 py-24" aria-busy="true" />;
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-xl px-4 text-center sm:px-6">
        <h1 className="font-display text-2xl text-primary sm:text-3xl">No recent order</h1>
        <p className="mt-3 text-sm leading-relaxed text-tertiary">
          We couldn&rsquo;t find an order to show here. If you just placed one, a confirmation is on its way
          to your email.
        </p>
        <div className="mt-8">
          <Link href="/" className={buttonPrimary}>
            Continue shopping
          </Link>
        </div>
      </div>
    );
  }

  const processing = order.status === "processing";
  const paymentLabel = order.paymentMethod
    ? (PAYMENT_LABELS[order.paymentMethod.toLowerCase()] ?? order.paymentMethod)
    : null;

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6">
      <div className="text-center">
        <div className="flex justify-center text-primary">
          <CheckCircle />
        </div>
        <h1 className="mt-5 font-display text-2xl text-primary sm:text-3xl">
          {processing ? "Payment received" : "Thank you for your order"}
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-tertiary">
          {processing
            ? "We’re finalising your order. You’ll get a confirmation email shortly. Please don’t pay again."
            : order.email
              ? `Your order is confirmed. We’ve sent the details to ${order.email}.`
              : "Your order is confirmed. We’ll email you the details."}
        </p>
      </div>

      <section
        aria-labelledby="order-summary"
        className="mt-10 rounded-[var(--radius-xs)] border border-[#e5e5e5] bg-white"
      >
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b border-[#e5e5e5] px-5 py-4">
          <h2 id="order-summary" className="text-xs font-bold uppercase tracking-widest text-primary">
            Order summary
          </h2>
          <p className="text-xs text-tertiary">
            {order.orderName ? (
              <>
                Order <span className="font-semibold text-primary">{order.orderName}</span>
              </>
            ) : (
              <>
                Reference{" "}
                <span className="font-semibold text-primary">{order.razorpayOrderId}</span>
              </>
            )}
          </p>
        </div>

        <ul className="divide-y divide-[#f0f0f0] px-5">
          {order.items.map((item, index) => (
            <li key={`${item.title}-${index}`} className="flex items-center gap-4 py-4">
              <div className="relative h-16 w-16 flex-none overflow-hidden rounded-[var(--radius-xs)] border border-[#eeeeee] bg-[#fafafa]">
                {item.imageUrl && (
                  <Image src={item.imageUrl} alt={item.title} fill sizes="64px" className="object-cover" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold leading-snug text-primary">{item.title}</p>
                {item.subtitle && <p className="mt-0.5 text-xs text-tertiary">{item.subtitle}</p>}
                <p className="mt-0.5 text-xs text-tertiary">Qty {item.quantity}</p>
              </div>
              <p className="flex-none text-sm font-semibold text-primary">
                {money(item.priceAmount * item.quantity, order.currency)}
              </p>
            </li>
          ))}
        </ul>

        <dl className="space-y-2 border-t border-[#e5e5e5] px-5 py-4 text-sm">
          {paymentLabel && (
            <div className="flex justify-between gap-4">
              <dt className="text-tertiary">Payment</dt>
              <dd className="text-primary">{paymentLabel}</dd>
            </div>
          )}
          <div className="flex justify-between gap-4 text-base">
            <dt className="font-semibold text-primary">{processing ? "Amount" : "Total paid"}</dt>
            <dd className="font-semibold text-primary">{money(order.total, order.currency)}</dd>
          </div>
          <p className="pt-1 text-xs text-tertiary">Shipping, taxes and any coupon are included in the total.</p>
        </dl>
      </section>

      <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row">
        <Link href="/" className={buttonPrimary}>
          Continue shopping
        </Link>
        {order.orderStatusUrl && (
          <a href={order.orderStatusUrl} className={buttonSecondary}>
            Track your order
          </a>
        )}
      </div>

      <p className="mt-8 text-center text-xs text-tertiary">
        Questions about your order? Write to{" "}
        <a href="mailto:support@tvaloka.com" className="font-semibold text-primary underline underline-offset-2">
          support@tvaloka.com
        </a>
        .
      </p>
    </div>
  );
}
