"use client";

import React, { useState } from "react";
import { ShopifyProduct } from "../../lib/shopify/types";
import { useCart } from "../../components/CartContext";

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

interface ProductActionsProps {
  product: ShopifyProduct;
}

export function ProductActions({ product }: ProductActionsProps) {
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [selectedVariantId, setSelectedVariantId] = useState<string>(
    product.variants?.[0]?.id || ""
  );

  const { addItem } = useCart();

  const selectedVariant =
    product.variants?.find((v) => v.id === selectedVariantId) ||
    product.variants?.[0] ||
    null;

  const isAvailable =
    product.availableForSale && (selectedVariant?.availableForSale ?? true);

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

      {/* Quantity Stepper (Just above Add to Cart button) */}
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

      {/* Add to Cart Action Button */}
      <div>
        <button
          type="button"
          disabled={!isAvailable || adding}
          onClick={handleAddToCart}
          className="w-full rounded-[var(--radius-xs)] bg-action-onlight-bg py-4 text-sm font-semibold tracking-wider text-action-onlight-text uppercase transition-colors hover:bg-action-onlight-bg-hover disabled:bg-surface-muted disabled:text-tertiary disabled:cursor-not-allowed cursor-pointer"
        >
          {adding ? "Adding..." : isAvailable ? "Add to Cart" : "Sold Out"}
        </button>
      </div>
    </div>
  );
}
