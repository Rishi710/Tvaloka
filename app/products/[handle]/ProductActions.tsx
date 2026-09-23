"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ShopifyProduct } from "../../lib/shopify/types";
import { useCart } from "../../components/CartContext";
import { CartIcon, CloseIcon } from "../../components/icons";

function MinusIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function GiftIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="3" y="9" width="18" height="4" rx="1" />
      <path d="M5 13h14v7a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-7Z" />
      <path d="M12 9v12" />
      <path d="M12 9c-1.5-4-6.5-4.5-6.5-1.5C5.5 9.3 7.3 9 12 9Z" />
      <path d="M12 9c1.5-4 6.5-4.5 6.5-1.5C18.5 9.3 16.7 9 12 9Z" />
    </svg>
  );
}

function TagIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M11.6 3.4 20 11.8a2 2 0 0 1 0 2.8l-5.4 5.4a2 2 0 0 1-2.8 0L3.4 11.6a2 2 0 0 1-.6-1.4V4.4A1 1 0 0 1 3.8 3.4h5.8a2 2 0 0 1 2 0Z" />
      <circle cx="8" cy="8" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

interface ProductActionsProps {
  product: ShopifyProduct;
}

export function ProductActions({ product }: ProductActionsProps) {
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [selectedVariantId, setSelectedVariantId] = useState<string>(
    product.variants?.[0]?.id || ""
  );
  const [isWhatsNewOpen, setIsWhatsNewOpen] = useState(false);

  const { addItem } = useCart();

  useEffect(() => {
    if (!isWhatsNewOpen) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsWhatsNewOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isWhatsNewOpen]);

  const selectedVariant =
    product.variants?.find((v) => v.id === selectedVariantId) ||
    product.variants?.[0] ||
    null;

  const isAvailable =
    product.availableForSale && (selectedVariant?.availableForSale ?? true);

  // custom.size — a plain label (e.g. "200 ML"), not a set of options to pick
  // between, so it's a static value display rather than another picker.
  const sizeValue = product.metafields?.find((m) => m.key === "size")?.value;

  const handleAddToCart = () => {
    if (!isAvailable || !selectedVariant) return;
    setAdding(true);
    addItem(product, selectedVariant.id, quantity);
    setTimeout(() => {
      setAdding(false);
    }, 400);
  };

  return (
    <div className="mt-8 space-y-5">
      {/* Variant Selector (if multiple variants exist) */}
      {product.variants && product.variants.length > 1 && (
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-primary mb-2">
            Size / Option
          </label>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((variant) => {
              const isSelected = variant.id === selectedVariantId;
              return (
                <button
                  key={variant.id}
                  type="button"
                  onClick={() => setSelectedVariantId(variant.id)}
                  className={`rounded border px-3.5 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${isSelected
                      ? "border-black bg-black text-white"
                      : "border-[#dddddd] bg-white text-primary hover:border-black"
                    }`}
                >
                  {variant.title}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Quantity Stepper + Size (custom.size metafield) + assurance pills, side by side */}
      <div className="flex flex-wrap items-end gap-2">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-primary mb-2">
            Quantity
          </label>
          <div className="inline-flex items-center rounded border border-[#dddddd] bg-white">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1 || !isAvailable}
              className="flex h-10 w-10 items-center justify-center text-primary transition-colors hover:bg-[#f5f5f5] disabled:opacity-30 disabled:cursor-not-allowed focus-visible:outline-none"
              aria-label="Decrease quantity"
            >
              <MinusIcon className="h-3.5 w-3.5" />
            </button>
            <span className="w-12 text-center text-sm font-semibold text-primary select-none">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity((q) => q + 1)}
              disabled={!isAvailable}
              className="flex h-10 w-10 items-center justify-center text-primary transition-colors hover:bg-[#f5f5f5] disabled:opacity-30 disabled:cursor-not-allowed focus-visible:outline-none"
              aria-label="Increase quantity"
            >
              <PlusIcon className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {sizeValue && (
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-primary mb-2">
              Size
            </label>
            <div className="flex h-10 items-center rounded border border-[#dddddd] bg-white px-4 text-sm font-semibold text-primary">
              {sizeValue}
            </div>
          </div>
        )}

        {/* Assurance pills — same height and row as Quantity/Size, not a separate block */}
        <button
          type="button"
          className="flex h-10 items-center gap-2 rounded bg-[#F7E5B5] px-4 text-xs font-bold uppercase tracking-wide text-primary transition-colors hover:bg-[#f2d998]"
        >
          <GiftIcon className="h-4 w-4 shrink-0" />
          Available Offers
        </button>
        <button
          type="button"
          onClick={() => setIsWhatsNewOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={isWhatsNewOpen}
          className="flex h-10 items-center gap-2 rounded bg-[#F7E5B5] px-4 text-xs font-bold uppercase tracking-wide text-primary transition-colors hover:bg-[#f2d998]"
        >
          <TagIcon className="h-4 w-4 shrink-0" />
          What&rsquo;s New
        </button>
      </div>

      {/* What's New modal */}
      {isWhatsNewOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="What's new"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-3 sm:p-5 md:p-6"
          onClick={() => setIsWhatsNewOpen(false)}
        >
          <div
            className="relative w-full max-w-md rounded-2xl bg-white p-6 text-left shadow-2xl sm:p-7"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsWhatsNewOpen(false)}
              aria-label="Close"
              className="absolute right-3 top-3 z-30 flex h-8 w-8 items-center justify-center rounded-full bg-black/[0.05] text-[#666666] transition-colors hover:bg-black/[0.1] hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
            >
              <CloseIcon className="h-4 w-4" />
            </button>

            <h3 className="font-display text-md text-primary">What&rsquo;s New</h3>

            <ul className="mt-4 space-y-4 text-sm leading-relaxed text-tertiary">
              <li>
                Discover our new{" "}
                <Link
                  href="/baby-care"
                  onClick={() => setIsWhatsNewOpen(false)}
                  className="font-bold text-primary underline underline-offset-2 hover:text-black"
                >
                  Bachpan
                </Link>{" "}
                range specially crafted for your young ones&rsquo; delicate skin.
              </li>
              <li>
                Experience our intense moisturization expert{" "}
                <Link
                  href="/products/jojoba-cold-pressed-oil-for-hair-skin-100-pure"
                  onClick={() => setIsWhatsNewOpen(false)}
                  className="font-bold text-primary underline underline-offset-2 hover:text-black"
                >
                  Jojoba
                </Link>{" "}
                and{" "}
                <Link
                  href="/products/argan-cold-pressed-oil-for-hair-skin-100-pure"
                  onClick={() => setIsWhatsNewOpen(false)}
                  className="font-bold text-primary underline underline-offset-2 hover:text-black"
                >
                  Argan
                </Link>{" "}
                oil for velvety soft skin.
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Add to Cart Action Button */}
      <div>
        <button
          type="button"
          disabled={!isAvailable || adding}
          onClick={handleAddToCart}
          className="flex w-full items-center justify-center gap-2.5 rounded-[var(--radius-xs)] bg-action-onlight-bg py-4 text-sm font-semibold tracking-wider text-action-onlight-text uppercase transition-colors hover:bg-action-onlight-bg-hover disabled:bg-surface-muted disabled:text-tertiary disabled:cursor-not-allowed cursor-pointer"
        >
          {adding ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent shrink-0" />
              <span>Adding...</span>
            </>
          ) : isAvailable ? (
            <>
              <CartIcon className="h-4 w-4 shrink-0" />
              <span>Add to Cart</span>
            </>
          ) : (
            <span>Sold Out</span>
          )}
        </button>
      </div>
    </div>
  );
}
