"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { SearchIcon, CloseIcon, CheckIcon } from "../components/icons";

export interface Ingredient {
  word: string;
  image: string;
  tags: string[];
  about: string;
  subtitle: string;
  work: string;
  foundIn: string[];
}

interface IngredientsViewProps {
  ingredients: Ingredient[];
}

export function IngredientsView({ ingredients }: IngredientsViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string>("ALL");
  const [selectedLetter, setSelectedLetter] = useState<string>("ALL");
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

  // Extract available initial letters
  const availableLetters = useMemo(() => {
    const set = new Set<string>();
    ingredients.forEach((item) => {
      if (item.word) {
        set.add(item.word.charAt(0).toUpperCase());
      }
    });
    return Array.from(set).sort();
  }, [ingredients]);

  // Filtered ingredients
  const filteredIngredients = useMemo(() => {
    return ingredients.filter((item) => {
      // 1. Tag filter
      if (selectedTag !== "ALL") {
        const hasTag = item.tags?.some(
          (t) => t.trim().toLowerCase() === selectedTag.toLowerCase()
        );
        if (!hasTag) return false;
      }

      // 2. Letter filter
      if (selectedLetter !== "ALL") {
        if (item.word.charAt(0).toUpperCase() !== selectedLetter) {
          return false;
        }
      }

      // 3. Search query
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
  }, [ingredients, selectedTag, selectedLetter, searchQuery]);

  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedTag("ALL");
    setSelectedLetter("ALL");
  };

  const hasActiveFilters = searchQuery !== "" || selectedTag !== "ALL" || selectedLetter !== "ALL";

  return (
    <div className="w-full bg-white text-black min-h-screen">
      {/* ── 1. Hero Section with Responsive Background Image ─────────────── */}
      <section className="relative flex min-h-[380px] sm:min-h-[440px] lg:min-h-[500px] items-center justify-center overflow-hidden bg-[#111111] py-14 sm:py-20 lg:py-24">
        {/* Background Image */}
        <Image
          src="https://cdn.shopify.com/s/files/1/1005/3045/4892/files/Hero_best_seller.webp?v=1787821514"
          alt="Ayurvedic herbs and sacred botanicals background"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />

        {/* Scrim Overlay for Contrast & Readability across all devices */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/55 to-black/80 sm:from-black/60 sm:via-black/50 sm:to-black/70 backdrop-blur-[0.5px]"
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
                placeholder="Search ingredients, benefits (e.g. Saffron, Glow, Hydration)..."
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

          {/* A-Z Quick Jump Bar */}
          <div className="mt-2.5 flex items-center justify-between border-t border-[#f0f0f0] pt-2.5">
            <div className="flex flex-wrap items-center gap-1 sm:gap-1.5">
              <span className="mr-2 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#999999]">
                Index:
              </span>
              <button
                type="button"
                onClick={() => setSelectedLetter("ALL")}
                className={`px-1.5 py-0.5 text-[11px] sm:text-xs font-semibold transition-colors ${selectedLetter === "ALL"
                  ? "text-black underline underline-offset-4"
                  : "text-[#888888] hover:text-black"
                  }`}
              >
                All
              </button>
              {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((letter) => {
                const isAvailable = availableLetters.includes(letter);
                const isSelected = selectedLetter === letter;

                if (!isAvailable) {
                  return (
                    <span
                      key={letter}
                      className="px-1 text-[11px] sm:text-xs font-normal text-[#cccccc] cursor-not-allowed select-none"
                    >
                      {letter}
                    </span>
                  );
                }

                return (
                  <button
                    key={letter}
                    type="button"
                    onClick={() => setSelectedLetter(isSelected ? "ALL" : letter)}
                    className={`px-1 text-[11px] sm:text-xs font-bold transition-colors ${isSelected
                      ? "text-black underline underline-offset-4"
                      : "text-[#444444] hover:text-black hover:underline"
                      }`}
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
                className="text-[11px] font-semibold uppercase tracking-wider text-[#777777] hover:text-black transition-colors"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ── 3. Ingredients Grid ───────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
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
            <div className="mb-6 flex items-center justify-between">
              <p className="text-xs font-medium text-[#666666]">
                Showing <strong className="text-black">{filteredIngredients.length}</strong> {filteredIngredients.length === 1 ? "botanical" : "botanicals"}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
              {filteredIngredients.map((ing) => (
                <div
                  key={ing.word}
                  className="group flex flex-col justify-between rounded-xl border border-[#eeeeee] bg-white p-6 shadow-sm transition-all duration-300 hover:border-black/30 hover:shadow-md"
                >
                  <div>
                    {/* Image & Header */}
                    <div className="flex items-center gap-4">
                      <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-full border border-[#f0f0f0] bg-[#fafafa] p-2 transition-transform duration-300 group-hover:scale-105">
                        <Image
                          src={ing.image}
                          alt={ing.word}
                          fill
                          sizes="100px"
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h2 className="font-display text-xl font-normal text-black truncate tracking-wide">
                          {ing.word}
                        </h2>
                        {/* Tags */}
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {ing.tags.map((t) => (
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

                    {/* How It Works Box */}
                    {/* {ing.work && (
                      <div className="mt-4 rounded-lg border border-[#f0f0f0] bg-[#fafafa] p-3.5">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-black">
                          How it works:
                        </p>
                        <p className="mt-1 text-xs leading-relaxed text-[#666666]">
                          {ing.work}
                        </p>
                      </div>
                    )} */}
                  </div>

                  {/* Footer: Found In & Learn More Modal Button */}
                  <div className="mt-6 border-t border-[#f0f0f0] pt-4">
                    {/* {ing.foundIn && ing.foundIn.length > 0 && (
                      <div className="mb-3">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#888888]">
                          Found In:
                        </span>
                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                          {ing.foundIn.map((prod) => (
                            <span
                              key={prod}
                              className="inline-block rounded-[var(--radius-xs)] border border-[#e0e0e0] bg-white px-2 py-0.5 text-[10px] font-medium text-black"
                            >
                              {prod}
                            </span>
                          ))}
                        </div>
                      </div>
                    )} */}

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
        )}
      </section>

      {/* ── 4. Detail Modal ──────────────────────────────────────────────── */}
      {activeModalIngredient && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity"
          onClick={() => setActiveModalIngredient(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 sm:p-8 shadow-2xl text-left"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setActiveModalIngredient(null)}
              className="absolute right-5 top-5 rounded-full p-2 text-[#777777] hover:bg-[#f0f0f0] hover:text-black transition-colors"
              aria-label="Close dialog"
            >
              <CloseIcon className="h-5 w-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-5 border-b border-[#f0f0f0] pb-6">
              <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-full border border-[#f0f0f0] bg-[#fafafa] p-2">
                <Image
                  src={activeModalIngredient.image}
                  alt={activeModalIngredient.word}
                  fill
                  sizes="100px"
                  className="object-cover"
                />
              </div>
              <div>
                <p className="text-[11px] font-bold tracking-[0.3em] text-[#666666] uppercase">
                  Ayurvedic Botanical
                </p>
                <h3 className="font-display mt-1 text-2xl sm:text-3xl font-normal text-black">
                  {activeModalIngredient.word}
                </h3>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {activeModalIngredient.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded-full bg-black text-white px-3 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
                    >
                      {t.trim()}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="mt-6 space-y-6 text-sm text-[#333333] leading-relaxed">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-black">
                  About this Ingredient
                </h4>
                <p className="mt-2 leading-relaxed text-[#555555]">
                  {activeModalIngredient.about}
                </p>
              </div>

              {activeModalIngredient.subtitle && (
                <div className="rounded-xl bg-[#fafafa] border border-[#f0f0f0] p-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-black">
                    Primary Benefits
                  </h4>
                  <p className="mt-1.5 text-xs sm:text-sm text-[#555555]">
                    {activeModalIngredient.subtitle}
                  </p>
                </div>
              )}

              {activeModalIngredient.work && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-black">
                    How it Works on Cellular Level
                  </h4>
                  <p className="mt-2 text-xs sm:text-sm text-[#555555]">
                    {activeModalIngredient.work}
                  </p>
                </div>
              )}

              {activeModalIngredient.foundIn && activeModalIngredient.foundIn.length > 0 && (
                <div className="border-t border-[#f0f0f0] pt-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-black">
                    Formulated In
                  </h4>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {activeModalIngredient.foundIn.map((prod) => (
                      <span
                        key={prod}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-black/20 bg-white px-3 py-1 text-xs font-medium text-black shadow-2xs"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-black" />
                        {prod}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Action */}
            <div className="mt-8 pt-4 border-t border-[#f0f0f0] flex justify-end">
              <button
                type="button"
                onClick={() => setActiveModalIngredient(null)}
                className="rounded-full bg-black px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-white hover:bg-neutral-800 transition-colors"
              >
                Close
              </button>
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
