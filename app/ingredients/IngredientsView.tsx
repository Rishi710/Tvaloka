"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { SearchIcon, CloseIcon } from "../components/icons";
import type { ShopifyProduct } from "../lib/shopify/types";

export interface Ingredient {
  word: string;
  image: string;
  tags: string[];
  about: string;
  subtitle: string;
  work: string;
  foundIn: string[];
}

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

function IngredientThumbnail({
  src,
  name,
  size = "md",
}: {
  src?: string;
  name: string;
  size?: "md" | "lg";
}) {
  const hasImage = Boolean(src && typeof src === "string" && src.trim() !== "");
  const initial = name ? name.trim().charAt(0).toUpperCase() : "T";

  if (hasImage) {
    return (
      <Image
        src={src!.trim()}
        alt={name}
        fill
        sizes={size === "lg" ? "120px" : "100px"}
        className="object-cover"
      />
    );
  }

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#f5f2eb] text-[#716353]">
      <LeafIcon className={size === "lg" ? "h-6 w-6 text-[#8b7965]" : "h-5 w-5 text-[#8b7965]"} />
      <span className="font-display mt-0.5 text-[10px] sm:text-[11px] font-semibold tracking-wider text-[#5f5142]">
        {initial}
      </span>
    </div>
  );
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

  // 1. Exact normalized match
  const exact = products.find((p) => normalizeString(p.title) === normalizedTarget);
  if (exact) return exact;

  // 2. Primary keyword match (e.g. "Keshya", "Sanjeevani", "Prabha", "Shuddhi", "Sugandha")
  const words = cleanName.split(/\s+/).filter((w) => w.length > 2);
  if (words.length > 0) {
    const primaryWord = words[0];
    const matched = products.find((p) => {
      const pTitle = p.title.toLowerCase();
      const pHandle = p.handle.toLowerCase();
      return pTitle.includes(primaryWord) || pHandle.includes(primaryWord);
    });
    if (matched) return matched;
  }

  // 3. Substring match
  const substringMatch = products.find((p) => {
    const pNorm = normalizeString(p.title);
    return normalizedTarget.includes(pNorm) || pNorm.includes(normalizedTarget);
  });
  if (substringMatch) return substringMatch;

  return null;
}

function parseBotanicalName(rawName: string) {
  if (!rawName) return { common: "", latin: null };
  const match = rawName.match(/^(.*?)\s*\((.*?)\)$/);
  if (match) {
    return {
      common: match[1].trim(),
      latin: match[2].trim(),
    };
  }
  return { common: rawName.trim(), latin: null };
}

function formatPrice(amount?: string, currencyCode: string = "INR") {
  if (!amount) return null;
  const num = parseFloat(amount);
  if (isNaN(num)) return null;
  const symbol = currencyCode === "INR" ? "₹" : currencyCode + " ";
  return `${symbol}${num.toLocaleString("en-IN")}`;
}

interface IngredientsViewProps {
  ingredients: Ingredient[];
  products?: ShopifyProduct[];
}

export function IngredientsView({ ingredients, products = [] }: IngredientsViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string>("ALL");
  const [activeLetter, setActiveLetter] = useState<string>("");
  const [activeModalIngredient, setActiveModalIngredient] = useState<Ingredient | null>(null);

  // Extract all unique tags
  const allTags = useMemo(() => {
    const set = new Set<string>();
    ingredients.forEach((item) => {
      item.tags?.forEach((t) => {
        const trimmed = t.trim();
        if (trimmed) set.add(trimmed);
      });
    });
    return Array.from(set).sort();
  }, [ingredients]);

  // Filter ingredients by tag and search query
  const filteredIngredients = useMemo(() => {
    return ingredients.filter((item) => {
      // 1. Tag filter
      if (selectedTag !== "ALL") {
        const hasTag = item.tags?.some(
          (t) => t.trim().toLowerCase() === selectedTag.toLowerCase()
        );
        if (!hasTag) return false;
      }

      // 2. Search query
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = item.word.toLowerCase().includes(q);
        const matchesSubtitle = item.subtitle?.toLowerCase().includes(q);
        const matchesAbout = item.about?.toLowerCase().includes(q);
        const matchesWork = item.work?.toLowerCase().includes(q);
        const matchesTags = item.tags?.some((t) => t.toLowerCase().includes(q));
        const matchesFoundIn = item.foundIn?.some((p) => p.toLowerCase().includes(q));

        if (!matchesName && !matchesSubtitle && !matchesAbout && !matchesWork && !matchesTags && !matchesFoundIn) {
          return false;
        }
      }

      return true;
    });
  }, [ingredients, selectedTag, searchQuery]);

  // Alphabetically sorted and grouped ingredients by initial letter of common name
  const { groupedIngredients, availableLetters } = useMemo(() => {
    // Sort all filtered ingredients alphabetically by common name
    const sorted = [...filteredIngredients].sort((a, b) => {
      const nameA = parseBotanicalName(a.word).common.toLowerCase();
      const nameB = parseBotanicalName(b.word).common.toLowerCase();
      return nameA.localeCompare(nameB);
    });

    // Group by first letter of common botanical name
    const groups: Record<string, Ingredient[]> = {};
    sorted.forEach((item) => {
      const common = parseBotanicalName(item.word).common.trim();
      const letter = (common.charAt(0) || "#").toUpperCase();
      if (!groups[letter]) {
        groups[letter] = [];
      }
      groups[letter].push(item);
    });

    const letters = Object.keys(groups).sort();

    return {
      groupedIngredients: groups,
      availableLetters: letters,
    };
  }, [filteredIngredients]);

  // Smooth scroll to a letter section partition
  const scrollToLetter = (letter: string) => {
    setActiveLetter(letter);
    const el = document.getElementById(`section-${letter}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Observe which letter section is currently in view during scrolling
  useEffect(() => {
    if (typeof window === "undefined" || availableLetters.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const letter = entry.target.getAttribute("data-letter");
            if (letter) {
              setActiveLetter(letter);
              break;
            }
          }
        }
      },
      {
        rootMargin: "-110px 0px -65% 0px",
        threshold: 0,
      }
    );

    availableLetters.forEach((letter) => {
      const el = document.getElementById(`section-${letter}`);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [availableLetters]);

  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedTag("ALL");
  };

  const hasActiveFilters = searchQuery !== "" || selectedTag !== "ALL";

  return (
    <div className="w-full bg-white text-black min-h-screen">
      {/* ── 1. Hero Section with Responsive Background Image ─────────────── */}
      <section className="relative flex min-h-[380px] sm:min-h-[440px] lg:min-h-[500px] items-center justify-center overflow-hidden bg-[#111111] py-14 sm:py-20 lg:py-24">
        {/* Background Image */}
        <Image
          src="https://cdn.shopify.com/s/files/1/1005/3045/4892/files/Ingredient_jpg.jpg?v=1788647916"
          alt="Ayurvedic herbs and sacred botanicals background"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />

        {/* Scrim Overlay for Contrast & Readability across all devices */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/55 to-black/80 sm:from-black/40 sm:via-black/40 sm:to-black/40 backdrop-blur-[0.1px]"
        />

        <div className="relative z-10 mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-[11px] sm:text-xs font-semibold tracking-[0.35em] text-white/90 uppercase">
            Pure Botanical Glossary
          </p>
          <h1 className="font-display mt-3 text-3xl font-normal text-white sm:text-5xl lg:text-6xl tracking-wide">
            Our Sacred Ingredients
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-xs sm:text-sm leading-relaxed text-white/85">
            Every Tvaloka formulation is handcrafted with potent Ayurvedic botanicals, cold-pressed oils,
            and sacred herbs preserved in their purest state for cellular vitality.
          </p>

          {/* Search Bar */}
          <div className="relative mx-auto mt-8 max-w-xl">
            <div className="relative flex items-center">
              <span className="pointer-events-none absolute left-4 text-[#666666]">
                <SearchIcon className="h-4 w-4" />
              </span>
              <input
                type="text"
                placeholder="Search ingredients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-full border border-white/30 bg-white/95 py-3.5 pl-11 pr-11 text-xs sm:text-sm text-black placeholder-[#777777] shadow-xl backdrop-blur-md transition-all focus:border-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-white/80"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 text-[#777777] hover:text-black transition-colors"
                  aria-label="Clear search"
                >
                  <CloseIcon className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. Filter Bar & Alphabetical Index ────────────────────────────── */}
      <section className="sticky top-0 z-20 border-b border-[#e5e5e5] bg-white/95 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          {/* Benefit Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-1">
            <button
              type="button"
              onClick={() => setSelectedTag("ALL")}
              className={`flex-shrink-0 rounded-full px-4 py-1.5 text-[11px] sm:text-xs font-semibold uppercase tracking-wider transition-colors ${selectedTag === "ALL"
                ? "bg-black text-white"
                : "border border-[#e0e0e0] bg-white text-[#555555] hover:border-black hover:text-black"
                }`}
            >
              All Formulations ({ingredients.length})
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setSelectedTag(tag === selectedTag ? "ALL" : tag)}
                className={`flex-shrink-0 rounded-full px-3.5 py-1.5 text-[11px] sm:text-xs font-medium uppercase tracking-wider transition-colors ${selectedTag === tag
                  ? "bg-black text-white"
                  : "border border-[#e0e0e0] bg-white text-[#666666] hover:border-black hover:text-black"
                  }`}
              >
                {tag}
              </button>
            ))}
          </div>

          {/* A-Z Quick Jump Bar (Centered, only existing letters, no "Index:" word) */}
          <div className="relative mt-2.5 flex items-center justify-center border-t border-[#f0f0f0] pt-2.5">
            <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-2">
              {availableLetters.map((letter) => {
                const isActive = activeLetter === letter;
                return (
                  <button
                    key={letter}
                    type="button"
                    onClick={() => scrollToLetter(letter)}
                    className={`min-w-[28px] sm:min-w-[32px] py-1 px-1.5 text-xs sm:text-sm font-semibold transition-all rounded text-center ${isActive
                        ? "text-black font-bold underline underline-offset-4 decoration-2 decoration-black"
                        : "text-[#666666] hover:text-black hover:bg-black/[0.04]"
                      }`}
                    aria-label={`Jump to letter ${letter}`}
                  >
                    {letter}
                  </button>
                );
              })}
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="hidden md:inline-block absolute right-0 text-[11px] font-semibold uppercase tracking-wider text-[#777777] hover:text-black transition-colors"
              >
                Reset Filters
              </button>
            )}
          </div>

          {hasActiveFilters && (
            <div className="mt-2 flex justify-center md:hidden">
              <button
                type="button"
                onClick={clearAllFilters}
                className="text-[11px] font-semibold uppercase tracking-wider text-[#777777] hover:text-black transition-colors"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ── 3. Ingredients Catalog & Letter Partitions ────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        {filteredIngredients.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-sm font-semibold tracking-wider text-black uppercase">
              No matching ingredients found
            </p>
            <p className="mt-1 text-xs text-[#777777]">
              Try searching with another keyword or resetting active filters.
            </p>
            <button
              type="button"
              onClick={clearAllFilters}
              className="mt-5 rounded-full bg-black px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-white hover:bg-neutral-800 transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-medium text-[#666666]">
                Showing <strong className="text-black">{filteredIngredients.length}</strong> {filteredIngredients.length === 1 ? "botanical" : "botanicals"}
              </p>
            </div>

            {availableLetters.map((letter) => {
              const letterItems = groupedIngredients[letter] || [];
              if (letterItems.length === 0) return null;

              return (
                <div key={letter} className="mb-10 sm:mb-14">
                  {/* Letter Partition Divider */}
                  <div
                    id={`section-${letter}`}
                    data-letter={letter}
                    className="flex items-center justify-center gap-4 pt-8 sm:pt-12 pb-6 sm:pb-8 scroll-mt-28 sm:scroll-mt-32"
                  >
                    <div className="h-[1px] flex-1 bg-[#e5e5e5]" />
                    <span className="font-display text-2xl sm:text-3xl font-normal tracking-wide text-black px-3 select-none">
                      {letter}
                    </span>
                    <div className="h-[1px] flex-1 bg-[#e5e5e5]" />
                  </div>

                  {/* Cards Grid for this Letter */}
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
                    {letterItems.map((ing) => (
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
                                    <h2 className="font-display text-lg sm:text-xl font-normal text-black truncate tracking-wide">
                                      {common}
                                    </h2>
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
                            className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-black bg-white py-2 text-xs font-semibold uppercase tracking-wider text-black transition-colors hover:bg-black hover:text-white"
                          >
                            Read Full Details →
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── 4. Detail Modal (2-Column Responsive Apothecary Layout) ─────── */}
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
              className="absolute right-3 top-3 sm:right-5 sm:top-5 z-30 flex h-8 w-8 items-center justify-center rounded-full bg-black/[0.05] text-[#666666] transition-colors hover:bg-black/[0.1] hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
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
                          {/* <p className="text-[10px] sm:text-[11px] font-bold tracking-[0.25em] text-[#888888] uppercase">
                              Ayurvedic Botanical
                            </p> */}
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
                        <Link
                          key={prodName}
                          href={productHref}
                          className="group/prod flex items-center gap-3 rounded-xl border border-[#eeeeee] bg-[#fafafa] p-2.5 sm:p-3 transition-all duration-200 hover:border-black hover:bg-white hover:shadow-sm"
                        >
                          {/* Product Thumbnail */}
                          <div className="relative h-14 w-14 sm:h-16 sm:w-16 flex-shrink-0 overflow-hidden rounded-lg border border-[#e5e5e5] bg-white">
                            {matchedProduct?.featuredImage?.url ? (
                              <Image
                                src={matchedProduct.featuredImage.url}
                                alt={matchedProduct.featuredImage.altText || matchedProduct.title}
                                fill
                                sizes="70px"
                                className="object-cover transition-transform duration-200 group-hover/prod:scale-105"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-[#f7f5f0] text-[#888888]">
                                <LeafIcon className="h-5 w-5 text-[#8b7965]" />
                              </div>
                            )}
                          </div>

                          {/* Product Info */}
                          <div className="flex-1 min-w-0">
                            <h5 className="font-sans text-xs font-semibold text-black leading-snug line-clamp-2 group-hover/prod:text-black">
                              {matchedProduct ? matchedProduct.title : prodName}
                            </h5>

                            <div className="mt-1.5 flex items-center justify-between gap-2">
                              {priceFormatted ? (
                                <span className="text-xs font-bold text-black">
                                  {priceFormatted}
                                </span>
                              ) : (
                                <span className="text-[11px] text-[#777777]">
                                  Ayurvedic Luxury
                                </span>
                              )}

                              <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold text-black uppercase tracking-wider group-hover/prod:underline underline-offset-2">
                                View Product
                                <span className="transition-transform duration-150 group-hover/prod:translate-x-0.5" aria-hidden="true">→</span>
                              </span>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-[#e0e0e0] bg-[#fafafa] p-6 text-center">
                    <LeafIcon className="h-7 w-7 text-[#8b7965]" />
                    <p className="mt-2 text-xs font-semibold text-black uppercase tracking-wider">
                      Signature Botanical
                    </p>
                    <p className="mt-1 text-xs text-[#777777]">
                      Used across our custom Ayurvedic formulations.
                    </p>
                    <Link
                      href="/products"
                      className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-black underline underline-offset-4"
                    >
                      Browse all formulations →
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 5. Ayurvedic Quality Commitment ──────────────────────────────── */}
      {/* <section className="border-t border-[#eeeeee] bg-[#fafafa] py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-[11px] font-bold tracking-[0.35em] text-[#666666] uppercase">
            Our Purity Pledge
          </p>
          <h2 className="font-display mt-2 text-2xl sm:text-3xl lg:text-4xl font-normal text-black tracking-wide">
            Ethical Sourcing &amp; Authentic Extraction
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-xs sm:text-sm text-[#666666] leading-relaxed">
            All botanicals are ethically sourced from Himalayan foothills and traditional growers,
            cold-pressed in auspicious lunar cycles, and preserved without synthetic parabens, sulphates, or silicones.
          </p>

          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-[#eeeeee] bg-white p-6 shadow-2xs">
              <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-black">
                100% Ayurvedic
              </h3>
              <p className="mt-2 text-xs text-[#666666]">
                Rooted in authentic Charaka &amp; Sushruta classical texts.
              </p>
            </div>
            <div className="rounded-xl border border-[#eeeeee] bg-white p-6 shadow-2xs">
              <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-black">
                Cold-Pressed Oils
              </h3>
              <p className="mt-2 text-xs text-[#666666]">
                Extracted without heat to preserve living phytochemical nutrients.
              </p>
            </div>
            <div className="rounded-xl border border-[#eeeeee] bg-white p-6 shadow-2xs">
              <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-black">
                Zero Harsh Chemicals
              </h3>
              <p className="mt-2 text-xs text-[#666666]">
                No parabens, mineral oils, artificial fragrances, or sulphates.
              </p>
            </div>
            <div className="rounded-xl border border-[#eeeeee] bg-white p-6 shadow-2xs">
              <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-black">
                Auspicious Batches
              </h3>
              <p className="mt-2 text-xs text-[#666666]">
                Handcrafted in micro-batches sealed in protective UV glass.
              </p>
            </div>
          </div>
        </div>
      </section> */}
    </div>
  );
}
