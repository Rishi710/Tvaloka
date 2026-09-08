"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CloseIcon } from "../../components/icons";
import { IngredientThumbnail } from "../../components/IngredientThumbnail";
import type { ShopifyProduct } from "../../lib/shopify/types";
import type { Ingredient } from "../../ingredients/IngredientsView";
import { parseBotanicalName } from "../../lib/productIngredients";

function LeafIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
    </svg>
  );
}

function formatPrice(amount?: string, currencyCode: string = "INR") {
  if (!amount) return null;
  const num = parseFloat(amount);
  if (isNaN(num)) return null;
  const symbol = currencyCode === "INR" ? "₹" : currencyCode + " ";
  return `${symbol}${num.toLocaleString("en-IN")}`;
}

function normalizeString(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function findMatchingProduct(
  prodName: string,
  products: ShopifyProduct[] = []
): ShopifyProduct | null {
  if (!products || products.length === 0) return null;

  const cleanName = prodName.trim().toLowerCase();
  const normalizedTarget = normalizeString(cleanName);

  const exact = products.find((p) => normalizeString(p.title) === normalizedTarget);
  if (exact) return exact;

  const words = cleanName.split(/\s+/).filter((w) => w.length > 2);
  if (words.length > 0) {
    const matched = products.find((p) => {
      const pTitle = p.title.toLowerCase();
      return words.every((word) => pTitle.includes(word));
    });
    if (matched) return matched;
  }

  return (
    products.find((p) => {
      const pTitle = p.title.toLowerCase();
      return cleanName.includes(pTitle) || pTitle.includes(cleanName);
    }) || null
  );
}

interface ProductIngredientsSectionProps {
  ingredients: Ingredient[];
  products?: ShopifyProduct[];
}

export function ProductIngredientsSection({
  ingredients,
  products = [],
}: ProductIngredientsSectionProps) {
  const [activeModalIngredient, setActiveModalIngredient] = useState<Ingredient | null>(null);

  if (!ingredients || ingredients.length === 0) {
    return null;
  }

  return (
    <section className="mt-16 sm:mt-24 border-t border-[#e5e5e5] pt-12 sm:pt-16 px-4 sm:px-0">
      <div className="mb-8 sm:mb-10 text-left">
        <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.25em] text-[#666666]">
          What&apos;s Inside
        </p>
        <h2 className="font-display mt-2 text-2xl sm:text-3xl font-normal text-black tracking-wide">
          Key Ingredients in this Formulation
        </h2>
      </div>

      {/* Exact Same Cards Grid as /ingredients */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
        {ingredients.map((ing) => (
          <div
            key={ing.word}
            className="group flex flex-col justify-between rounded-xl border border-[#eeeeee] bg-white p-6 shadow-sm transition-all duration-300 hover:border-black/30 hover:shadow-md"
          >
            <div>
              {/* Image & Header */}
              <div className="flex items-center gap-4">
                <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-full border border-[#f0f0f0] bg-[#fafafa] transition-transform duration-300 group-hover:scale-105">
                  <IngredientThumbnail
                    src={ing.image}
                    name={ing.word}
                    size="md"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  {(() => {
                    const { common, latin } = parseBotanicalName(ing.word);
                    return (
                      <>
                        <h3 className="font-display text-lg sm:text-xl font-normal text-black truncate tracking-wide uppercase">
                          {common}
                        </h3>
                        {latin && (
                          <p className="font-serif italic text-xs text-[#777777] truncate mt-0.5">
                            ({latin})
                          </p>
                        )}
                      </>
                    );
                  })()}
                  {/* Tags */}
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {ing.tags?.map((t) => (
                      <span
                        key={t}
                        className="rounded-full bg-[#f4f4f4] px-2.5 py-0.5 text-[10px] font-semibold text-[#444444] uppercase tracking-wider"
                      >
                        {t.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Subtitle / Key Benefit */}
              <p className="mt-5 text-xs sm:text-sm leading-relaxed text-[#444444] line-clamp-3">
                {ing.subtitle || ing.about}
              </p>
            </div>

            {/* Footer: Learn More Modal Button */}
            <div className="mt-6 border-t border-[#f0f0f0] pt-4">
              <button
                type="button"
                onClick={() => setActiveModalIngredient(ing)}
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-black bg-white py-2 text-xs font-semibold uppercase tracking-wider text-black transition-colors hover:bg-black hover:text-white cursor-pointer"
              >
                Read Full Details →
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 text-center">
        <Link
          href="/ingredients"
          className="inline-flex items-center gap-2 rounded-full border border-black bg-white px-7 py-3 text-xs font-semibold uppercase tracking-wider text-black transition-colors hover:bg-black hover:text-white"
        >
          Explore more Ingredients →
        </Link>
      </div>

      {/* ── Detail Modal (Exact Same Layout as /ingredients) ─────── */}
      {activeModalIngredient && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-6 bg-black/65 backdrop-blur-sm transition-opacity"
          onClick={() => setActiveModalIngredient(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative max-h-[92vh] w-full max-w-4xl lg:max-w-5xl overflow-y-auto scrollbar-hide rounded-2xl bg-white p-4 sm:p-7 lg:p-9 shadow-2xl text-left"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setActiveModalIngredient(null)}
              className="absolute right-3 top-3 sm:right-5 sm:top-5 z-30 flex h-8 w-8 items-center justify-center rounded-full bg-black/[0.05] text-[#666666] transition-colors hover:bg-black/[0.1] hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black cursor-pointer"
              aria-label="Close dialog"
            >
              <CloseIcon className="h-4 w-4" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 lg:gap-10">
              {/* ── Left Column: Botanical Profile (7 cols on md+) ── */}
              <div className="md:col-span-7 flex flex-col gap-5 sm:gap-6">
                {/* Botanical Header Card */}
                <div className="flex items-start gap-3.5 sm:gap-5 pr-8 sm:pr-0">
                  <div className="relative h-16 w-16 sm:h-24 sm:w-24 flex-shrink-0 overflow-hidden rounded-full border border-[#f0f0f0] bg-[#fafafa]">
                    <IngredientThumbnail
                      src={activeModalIngredient.image}
                      name={activeModalIngredient.word}
                      size="lg"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    {(() => {
                      const { common, latin } = parseBotanicalName(activeModalIngredient.word);
                      return (
                        <>
                          <h3 className="font-display mt-0.5 text-lg sm:text-2xl lg:text-3xl font-normal text-black leading-tight tracking-wide break-words">
                            {common}
                          </h3>
                          {latin && (
                            <p className="font-serif italic text-xs sm:text-sm text-[#777777] mt-0.5">
                              ({latin})
                            </p>
                          )}
                        </>
                      );
                    })()}
                    {activeModalIngredient.tags && activeModalIngredient.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {activeModalIngredient.tags.map((t) => (
                          <span
                            key={t}
                            className="rounded-full bg-black text-white px-2.5 py-0.5 text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider"
                          >
                            {t.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* About this Ingredient */}
                <div>
                  <h4 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-black">
                    About this Ingredient
                  </h4>
                  <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-[#555555]">
                    {activeModalIngredient.about}
                  </p>
                </div>

                {/* How it Works on Cellular Level */}
                {activeModalIngredient.work && (
                  <div className="rounded-xl border border-[#f0f0f0] bg-[#fafafa] p-3.5 sm:p-4">
                    <div className="flex items-center gap-2">
                      <LeafIcon className="h-4 w-4 text-[#888888]" />
                      <h4 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-black">
                        How it Works on Cellular Level
                      </h4>
                    </div>
                    <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-[#555555]">
                      {activeModalIngredient.work}
                    </p>
                  </div>
                )}
              </div>

              {/* ── Right Column: Formulated In / Interactive Products (5 cols on md+) ── */}
              <div className="md:col-span-5 border-t border-[#eeeeee] md:border-t-0 md:border-l md:border-[#f0f0f0] pt-4 sm:pt-5 md:pt-0 md:pl-6 lg:pl-8 flex flex-col">
                <div className="mb-3">
                  <div className="flex items-center gap-2">
                    <h4 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-black">
                      Formulated In
                    </h4>
                    {activeModalIngredient.foundIn && (
                      <span className="rounded-full bg-[#f4f4f4] px-2 py-0.5 text-[10px] font-semibold text-[#555555]">
                        ({activeModalIngredient.foundIn.length})
                      </span>
                    )}
                  </div>
                </div>

                {/* Products List */}
                {activeModalIngredient.foundIn && activeModalIngredient.foundIn.length > 0 ? (
                  <div className="space-y-2.5 sm:space-y-3 max-h-[42vh] md:max-h-[52vh] overflow-y-auto scrollbar-hide pr-0.5">
                    {activeModalIngredient.foundIn.map((prodName) => {
                      const matchedProduct = findMatchingProduct(prodName, products);
                      const productHref = matchedProduct ? `/products/${matchedProduct.handle}` : "/products";
                      const price = matchedProduct?.priceRange?.minVariantPrice;
                      const priceFormatted = price ? formatPrice(price.amount, price.currencyCode) : null;

                      return (
                        <div
                          key={prodName}
                          className="flex items-center gap-3 rounded-xl border border-[#eeeeee] bg-[#fafafa] p-2.5 sm:p-3 transition-colors hover:border-black/20 hover:bg-white"
                        >
                          <div className="relative h-12 w-12 sm:h-14 sm:w-14 flex-shrink-0 overflow-hidden rounded-lg border border-[#e5e5e5] bg-white">
                            {matchedProduct?.featuredImage ? (
                              <Image
                                src={matchedProduct.featuredImage.url}
                                alt={matchedProduct.featuredImage.altText || prodName}
                                fill
                                sizes="60px"
                                className="object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-[#f5f5f5] text-[#999999]">
                                <LeafIcon className="h-4 w-4" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs sm:text-sm font-semibold text-black leading-snug line-clamp-2">
                              {prodName}
                            </p>
                            {priceFormatted && (
                              <p className="text-[11px] font-medium text-[#666666] mt-0.5">
                                {priceFormatted}
                              </p>
                            )}
                          </div>
                          <Link
                            href={productHref}
                            className="flex-shrink-0 rounded-lg border border-black bg-white px-2.5 py-1.5 text-[10px] sm:text-[11px] font-semibold text-black uppercase tracking-wider transition-colors hover:bg-black hover:text-white"
                          >
                            View
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-[#888888] italic">
                    Exclusive Ayurvedic botanical extraction.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
