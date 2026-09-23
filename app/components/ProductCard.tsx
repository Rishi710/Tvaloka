"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { ShopifyProduct } from "../lib/shopify/types";
import { useCart } from "./CartContext";
import { CartIcon } from "./icons";
import { ProductRating, StarRating } from "./ProductRating";

// ---------------------------------------------------------------------------
// ProductCard props
// ---------------------------------------------------------------------------

export interface ProductCardProps {
  product: ShopifyProduct;
  /**
   * Badge text shown in the top-left corner of the image area.
   * e.g. "BEST SELLER", "TRENDING NOW", "NEW". Omit to auto-derive.
   */
  badge?: string;
  /**
   * Award / trust badge rendered below the primary badge.
   * Pass an image URL (e.g. Marie Claire Hair Awards logo). Omit to hide.
   */
  awardBadgeUrl?: string;
  awardBadgeAlt?: string;
  /** Average star rating (0–5). */
  rating?: number;
  /** Total review count shown next to stars. */
  reviewCount?: number;
  /**
   * Size / quantity descriptor displayed beneath the product title.
   * e.g. "2 sizes available", "50 ml", "200 g". Auto-derived when omitted.
   */
  sizeLabel?: string;
  /** Subtitle or benefit text (e.g., "Reduces Hair Fall & Dandruff"). */
  benefitText?: string;
  /**
   * Pre-formatted price string. Defaults to the product's minimum
   * variant price formatted with the en-IN locale.
   */
  formattedPrice?: string;
  /** Currency code used when `formattedPrice` is not provided. */
  currencyCode?: string;
  /** Initial wishlist state. Defaults to false. */
  wishlisted?: boolean;
  /** Called when the wishlist button is toggled. */
  onWishlistToggle?: (wishlisted: boolean) => void;
  /** Called when "Add to Bag" or a size is selected and added. */
  onAddToBag?: (product: ShopifyProduct, variantId: string) => Promise<void> | void;
  /** Extra CSS classes applied to the card root element. */
  className?: string;
}

// ---------------------------------------------------------------------------
// ProductCard
// ---------------------------------------------------------------------------

export function ProductCard({
  product,
  badge,
  awardBadgeUrl,
  awardBadgeAlt = "Award badge",
  rating,
  reviewCount,
  sizeLabel,
  benefitText,
  formattedPrice: formattedPriceProp,
  currencyCode,
  onAddToBag,
  className = "",
}: ProductCardProps) {
  const [addingToBag, setAddingToBag] = useState(false);
  const [showSizePicker, setShowSizePicker] = useState(false);
  const { addItem } = useCart();

  // Use the passed-in handler or fall back to the global cart addItem
  const handleAddToBag: ProductCardProps["onAddToBag"] =
    onAddToBag ?? ((product, variantId) => addItem(product, variantId));

  // ── Derived badge from Shopify tags ─────────────────────────────────────
  const derivedBadge =
    badge ??
    (product.tags?.some((t) => t.toLowerCase().includes("bestseller") || t.toLowerCase().includes("best seller"))
      ? "BEST SELLER"
      : product.tags?.some((t) => t.toLowerCase().includes("trending"))
        ? "TRENDING NOW"
        : product.tags?.some((t) => t.toLowerCase().includes("new"))
          ? "NEW"
          : product.tags?.find((t) => {
            const lower = t.toLowerCase();
            return lower.includes("award") || lower.includes("featured");
          })?.toUpperCase());

  // ── Price ─────────────────────────────────────────────────────────────────
  const price = product.priceRange?.minVariantPrice;
  const displayPrice =
    formattedPriceProp ??
    (price && price.amount
      ? new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: currencyCode ?? price.currencyCode ?? "INR",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(parseFloat(price.amount))
      : null);

  // Shopify's "Compare at price" on the default variant — only shown when
  // it's genuinely higher than the selling price, never a fabricated discount.
  const compareAtPrice = product.variants?.[0]?.compareAtPrice;
  const showCompareAtPrice =
    price && compareAtPrice && parseFloat(compareAtPrice.amount) > parseFloat(price.amount);
  const displayCompareAtPrice = showCompareAtPrice
    ? new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currencyCode ?? compareAtPrice.currencyCode ?? "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(parseFloat(compareAtPrice.amount))
    : null;

  // ── Clean description or benefit ──────────────────────────────────────────
  const cleanDescription =
    benefitText ??
    (product.description
      ? product.description.replace(/<[^>]*>?/gm, "").split(".")[0].trim()
      : "");

  // ── Variant & Size Derivation ─────────────────────────────────────────────
  const variants = product.variants || [];
  const hasMultipleVariants = variants.length > 1;

  // custom.size — the same metafield shown as a plain label on the PDP
  // (e.g. "200 ML"), preferred over any variant-derived guess.
  const sizeMetafieldValue = product.metafields?.find((m) => m.key === "size")?.value;

  let derivedSize = sizeLabel ?? sizeMetafieldValue;
  if (!derivedSize) {
    if (hasMultipleVariants) {
      derivedSize = `${variants.length} sizes available`;
    } else if (variants[0]?.selectedOptions) {
      const opt = variants[0].selectedOptions.find((o) => {
        const name = o.name.toLowerCase();
        return name === "size" || name === "weight" || name === "volume";
      });
      derivedSize = opt?.value || (variants[0]?.title !== "Default Title" ? variants[0]?.title : undefined);
    }
  }

  // Real reviews only — no rating shown when a product has none yet, and no
  // caller-supplied override, so ProductRating fetches it from Judge.me.
  const hasRatingOverride = rating !== undefined && reviewCount !== undefined && reviewCount > 0;

  const pdpHref = `/products/${product.handle}`;
  const isSoldOut = !product.availableForSale;

  // ── Handlers ─────────────────────────────────────────────────────────────
  async function handleAddVariantToBag(variantId: string, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (addingToBag || isSoldOut) return;
    setAddingToBag(true);
    setShowSizePicker(false);
    try {
      await handleAddToBag?.(product, variantId);
    } finally {
      setAddingToBag(false);
    }
  }

  return (
    <article
      className={[
        "group relative flex flex-col justify-between overflow-hidden bg-white text-left",
        "transition-all duration-[var(--motion-instant)]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div>
        {/* ── Image container ──────────────────────────────────────────────── */}
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-black rounded-[var(--radius-xs)] border border-[#eeeeee]">
          {/* Stretched accessible link */}
          <Link
            href={pdpHref}
            className="absolute inset-0 z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2"
            aria-label={`View ${product.title}`}
          />

          {product.featuredImage ? (
            <Image
              src={product.featuredImage.url}
              alt={product.featuredImage.altText || product.title}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-[var(--motion-fast)] group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-[#707070]">
              No Image
            </div>
          )}

          {/* Primary top-left badge (e.g. BEST SELLER) */}
          {derivedBadge && (
            <span className="absolute top-2 left-2 z-20 bg-[#222222] px-2 py-0.5 text-[9px] sm:text-[10px] font-bold tracking-wider text-white uppercase">
              {derivedBadge}
            </span>
          )}

          {/* Award badge image (if present) */}
          {awardBadgeUrl && (
            <div className="absolute top-8 left-2 z-20">
              <Image
                src={awardBadgeUrl}
                alt={awardBadgeAlt}
                width={48}
                height={32}
                className="object-contain"
              />
            </div>
          )}

          {/* Sold Out overlay */}
          {isSoldOut && (
            <div
              aria-hidden="true"
              className="absolute inset-0 z-20 flex items-center justify-center bg-white/75 backdrop-blur-[1px]"
            >
              <span className="bg-black px-3 py-1 text-[11px] font-bold tracking-widest text-white uppercase">
                Sold Out
              </span>
            </div>
          )}

          {/* Wishlist button — bottom right */}
          {/* <button
            type="button"
            aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
            aria-pressed={wishlisted}
            onClick={handleWishlistToggle}
            className={[
              "absolute bottom-2 right-2 z-20 flex h-8 w-8 items-center justify-center rounded-full",
              "bg-white/90 shadow-sm border border-black/5 hover:bg-white hover:scale-110",
              "transition-all duration-[var(--motion-instant)]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]",
              wishlisted ? "text-red-600" : "text-black",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <HeartIcon
              className={[
                "h-4 w-4 transition-all duration-[var(--motion-instant)]",
                wishlisted ? "fill-red-600 stroke-red-600" : "fill-none stroke-current",
              ]
                .filter(Boolean)
                .join(" ")}
            />
          </button> */}

          {/* Size picker quick-drawer overlay if open */}
          {showSizePicker && hasMultipleVariants && (
            <div className="absolute inset-0 z-30 flex flex-col justify-end bg-black/40 backdrop-blur-[2px] p-3">
              <div className="rounded bg-white p-3 shadow-xl">
                <div className="mb-2 flex items-center justify-between border-b border-gray-100 pb-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-black">
                    Select Size
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowSizePicker(false);
                    }}
                    className="text-xs font-semibold text-gray-500 hover:text-black"
                  >
                    ✕
                  </button>
                </div>
                <div className="flex flex-col gap-1.5 max-h-36 overflow-y-auto">
                  {variants.map((v) => {
                    const vPrice = v.price?.amount
                      ? new Intl.NumberFormat("en-IN", {
                        style: "currency",
                        currency: v.price.currencyCode || "INR",
                        minimumFractionDigits: 2,
                      }).format(parseFloat(v.price.amount))
                      : "";

                    return (
                      <button
                        key={v.id}
                        type="button"
                        disabled={!v.availableForSale}
                        onClick={(e) => handleAddVariantToBag(v.id, e)}
                        className="flex items-center justify-between rounded border border-gray-200 px-2.5 py-1.5 text-xs text-black hover:border-black hover:bg-black hover:text-white disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-black transition-colors"
                      >
                        <span className="font-medium">{v.title}</span>
                        <span className="font-semibold">{vPrice}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Product Meta Details ────────────────────────────────────────── */}
        <div className="mt-3 flex flex-col gap-1">
          {/* Title */}
          <h3 className="font-display text-[14px] sm:text-[16px] font-semibold uppercase tracking-[0.03em] text-black line-clamp-2 leading-snug">
            <Link href={pdpHref} className="hover:text-brand-secondary">
              {product.title}
            </Link>
          </h3>

          {/* Subtitle / Benefit text */}
          {cleanDescription && (
            <p className="text-[11px] text-[#666666] line-clamp-1 leading-normal">
              {cleanDescription}
            </p>
          )}

          {/* Rating — real reviews only, shown above the price */}
          {hasRatingOverride ? (
            <div className="mt-0.5">
              <StarRating rating={rating!} reviewCount={reviewCount!} />
            </div>
          ) : (
            <ProductRating productId={product.id} className="mt-0.5" />
          )}

          {/* Price (left) + Size (right), same line */}
          {(displayPrice || derivedSize) && (
            <p className="mt-0.5 flex items-baseline justify-between gap-2 text-[14px] sm:text-[16px] font-normal text-black">
              <span className="flex items-baseline gap-1.5">
                {displayPrice}
                {displayCompareAtPrice && (
                  <span className="text-[12px] text-[#888888] line-through">
                    {displayCompareAtPrice}
                  </span>
                )}
              </span>
              {derivedSize && (
                <span className="text-[14px] text-black font-normal">
                  {derivedSize}
                </span>
              )}
            </p>
          )}
        </div>
      </div>

      {/* ── CTA Action Button ────────────────────────────────────────────── */}
      <div className="mt-3">
        {isSoldOut ? (
          <button
            type="button"
            disabled
            className="w-full min-h-[38px] sm:min-h-[40px] rounded-[var(--radius-xs)] border border-gray-300 bg-gray-100 text-[11px] sm:text-xs font-medium uppercase tracking-wider text-gray-400 cursor-not-allowed"
          >
            Sold Out
          </button>
        ) : hasMultipleVariants ? (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowSizePicker(!showSizePicker);
            }}
            className="flex w-full min-h-[38px] sm:min-h-[40px] items-center justify-center gap-1.5 rounded-[var(--radius-xs)] border border-black bg-white px-3 text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-black transition-colors hover:bg-black hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
          >
            <span>SELECT SIZE</span>
            <svg
              className={`h-3.5 w-3.5 transition-transform ${showSizePicker ? "rotate-180" : ""}`}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        ) : (
          <button
            type="button"
            onClick={(e) => handleAddVariantToBag(variants[0]?.id || "", e)}
            disabled={addingToBag}
            className="flex w-full min-h-[38px] sm:min-h-[40px] items-center justify-center gap-2 rounded-[var(--radius-xs)] border border-black bg-white px-3 text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-black transition-colors hover:bg-black hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
          >
            {addingToBag ? (
              <>
                <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent shrink-0" />
                <span>Adding…</span>
              </>
            ) : (
              <>
                <CartIcon className="h-3.5 w-3.5 shrink-0" />
                <span>Add to Cart</span>
              </>
            )}
          </button>
        )}
      </div>
    </article>
  );
}

