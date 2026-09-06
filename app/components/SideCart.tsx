"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { useCart } from "./CartContext";
import { CloseIcon } from "./icons";

// ---------------------------------------------------------------------------
// Minus / Plus icons (inline — no extra import needed)
// ---------------------------------------------------------------------------

function MinusIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path
        fillRule="evenodd"
        d="M4 10a.75.75 0 01.75-.75h10.5a.75.75 0 010 1.5H4.75A.75.75 0 014 10z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// SideCart
// ---------------------------------------------------------------------------

export function SideCart() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, subtotal, currencyCode, totalQuantity } =
    useCart();

  const drawerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Focus trap + Escape key
  useEffect(() => {
    if (!isOpen) return;

    const FOCUSABLE =
      'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

    // Focus the close button when drawer opens
    setTimeout(() => closeButtonRef.current?.focus(), 50);

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        closeCart();
        return;
      }
      if (e.key !== "Tab") return;
      const drawer = drawerRef.current;
      if (!drawer) return;
      const focusables = Array.from(drawer.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, closeCart]);

  const formattedSubtotal = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(subtotal);

  return (
    <>
      {/* ── Backdrop ──────────────────────────────────────────────────────── */}
      <div
        aria-hidden="true"
        onClick={closeCart}
        className={[
          "fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px] transition-opacity duration-300",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        ].join(" ")}
      />

      {/* ── Drawer panel ──────────────────────────────────────────────────── */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping bag"
        className={[
          "fixed inset-y-0 right-0 z-50 flex w-full max-w-[420px] flex-col bg-white shadow-2xl",
          "transition-transform duration-300 ease-out",
          isOpen ? "translate-x-0" : "translate-x-full",
        ].join(" ")}
      >
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between border-b border-[#eeeeee] px-5 py-4">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-md tracking-wide text-black">
              Your Bag
            </span>
            {totalQuantity > 0 && (
              <span className="text-xs font-semibold text-[#666666]">
                ({totalQuantity} {totalQuantity === 1 ? "item" : "items"})
              </span>
            )}
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={closeCart}
            aria-label="Close bag"
            className="flex h-9 w-9 items-center justify-center rounded-full text-black transition-colors hover:bg-[#f5f5f5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-black"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        {/* ── Item list ───────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center h-full gap-5 px-8 text-center">
              <svg
                viewBox="0 0 64 64"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.2}
                className="h-16 w-16 text-[#cccccc]"
                aria-hidden="true"
              >
                <path d="M8 10h5l6 30h22l6-24H18" />
                <circle cx="26" cy="52" r="3.5" fill="currentColor" stroke="none" />
                <circle cx="39" cy="52" r="3.5" fill="currentColor" stroke="none" />
              </svg>
              <div>
                <p className="font-display text-md text-black">Your bag is empty</p>
                <p className="mt-1.5 text-xs text-[#666666]">
                  Add your favourite Ayurvedic formulations to get started.
                </p>
              </div>
              <button
                type="button"
                onClick={closeCart}
                className="mt-2 inline-flex items-center justify-center rounded-[5px] border border-black bg-black px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-white hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-black"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-[#f0f0f0] px-5">
              {items.map((item) => (
                <li key={item.variantId} className="flex gap-4 py-5">
                  {/* Thumbnail */}
                  <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-[5px] bg-[#f8f8f8] border border-[#eeeeee]">
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.imageAlt ?? item.title}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[10px] text-[#aaaaaa]">
                        No image
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex flex-1 flex-col justify-between gap-1">
                    <div>
                      <Link
                        href={`/products/${item.handle}`}
                        onClick={closeCart}
                        className="line-clamp-2 text-[13px] font-semibold leading-snug text-black hover:underline underline-offset-2"
                      >
                        {item.title}
                      </Link>
                      {item.variantTitle && (
                        <p className="mt-0.5 text-[11px] text-[#888888]">
                          {item.variantTitle}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      {/* Qty stepper */}
                      <div className="flex items-center rounded border border-[#dddddd]">
                        <button
                          type="button"
                          aria-label="Decrease quantity"
                          onClick={() =>
                            updateQuantity(item.variantId, item.quantity - 1)
                          }
                          className="flex h-7 w-7 items-center justify-center text-black transition-colors hover:bg-[#f5f5f5] disabled:opacity-30 focus-visible:outline-none"
                        >
                          <MinusIcon className="h-3 w-3" />
                        </button>
                        <span
                          className="w-7 text-center text-[12px] font-semibold text-black select-none"
                          aria-label={`Quantity: ${item.quantity}`}
                        >
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          aria-label="Increase quantity"
                          onClick={() =>
                            updateQuantity(item.variantId, item.quantity + 1)
                          }
                          className="flex h-7 w-7 items-center justify-center text-black transition-colors hover:bg-[#f5f5f5] focus-visible:outline-none"
                        >
                          <PlusIcon className="h-3 w-3" />
                        </button>
                      </div>

                      {/* Price + Remove */}
                      <div className="flex items-center gap-3">
                        <span className="text-[13px] font-semibold text-black">
                          {item.formattedPrice}
                        </span>
                        <button
                          type="button"
                          aria-label={`Remove ${item.title}`}
                          onClick={() => removeItem(item.variantId)}
                          className="text-[#aaaaaa] transition-colors hover:text-black focus-visible:outline-none"
                        >
                          <CloseIcon className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* ── Footer ──────────────────────────────────────────────────────── */}
        {items.length > 0 && (
          <div className="border-t border-[#eeeeee] px-5 pb-6 pt-4 space-y-4">
            {/* Subtotal row */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#666666]">
                Subtotal
              </span>
              <span className="text-sm font-bold text-black">{formattedSubtotal}</span>
            </div>
            <p className="text-[11px] text-[#888888]">
              Taxes &amp; shipping calculated at checkout.
            </p>

            {/* Checkout CTA */}
            <Link
              href="/cart"
              onClick={closeCart}
              className="flex w-full items-center justify-center rounded-[5px] bg-black px-6 py-3.5 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-[#1a1a1a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
            >
              Proceed to Checkout
            </Link>

            {/* Continue shopping */}
            <button
              type="button"
              onClick={closeCart}
              className="w-full text-center text-[11px] font-semibold uppercase tracking-wider text-[#666666] underline underline-offset-2 hover:text-black transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
}
