"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { ProductCard } from "./ProductCard";
import type { ShopifyProduct } from "../lib/shopify/types";

// Common Ayurvedic ingredients dictionary to auto-tag / filter products
const KNOWN_INGREDIENTS = [
  "AMLA",
  "ANAGAIN",
  "BAKUCHIOL",
  "BALA",
  "BANANA PULP",
  "BASIL LEAF EXTRACT",
  "BETAINE",
  "BHRINGRAJ",
  "BRAHMI",
  "COCONUT",
  "HIBISCUS",
  "JAPAPATTI",
  "KASTURI MANJAL",
  "KUMKUMADI",
  "METHI",
  "NEEM",
  "ONION SEED",
  "RATANJOT",
  "ROSE",
  "SAFFRON",
  "SANDALWOOD",
  "SHIKAKAI",
  "TEA TREE",
];

// Common Ayurvedic concerns dictionary to auto-tag / filter products
const KNOWN_CONCERNS = [
  "DANDRUFF",
  "HAIR FALL",
  "DULL HAIR",
  "HAIR THINNING",
  "DRY HAIR",
  "CHEMICALLY TREATED",
  "FRIZZ CONTROL",
  "SPLIT ENDS",
  "GREYING",
  "DAMAGE REPAIR",
  "HYDRATION",
  "PIGMENTATION",
  "ANTI-AGING",
  "GLOW & BRIGHTENING",
];

export interface CollectionCatalogProps {
  collectionTitle: string;
  collectionHandle?: string;
  collectionDescription?: string;
  products: ShopifyProduct[];
}

export function CollectionCatalog({
  collectionTitle,
  collectionHandle = "all",
  collectionDescription,
  products,
}: CollectionCatalogProps) {
  // ── States ───────────────────────────────────────────────────────────────
  const [selectedProductType, setSelectedProductType] = useState<string>("ALL");
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>([]);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>("bestseller");
  const [gridColumns, setGridColumns] = useState<2 | 3 | 4>(4);

  // Mobile drawer states
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [mobileSortOpen, setMobileSortOpen] = useState(false);

  // Sidebar accordions state
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({
    ingredient: true,
    concern: true,
    price: true,
  });

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // ── 1. Extract dynamic product types for the pill strip ───────────────────
  const productTypes = useMemo(() => {
    const types = new Set<string>();
    products.forEach((p) => {
      if (p.productType && p.productType.trim() !== "") {
        types.add(p.productType.trim().toUpperCase());
      }
      // Also look for specific category tags
      p.tags?.forEach((t) => {
        const u = t.toUpperCase();
        if (
          u.includes("CLEANSER") ||
          u.includes("CONDITIONER") ||
          u.includes("OIL") ||
          u.includes("SERUM") ||
          u.includes("MASK") ||
          u.includes("SPRAY") ||
          u.includes("CREAM") ||
          u.includes("LOTION") ||
          u.includes("TONER")
        ) {
          types.add(u);
        }
      });
    });

    const list = Array.from(types);
    return list.length > 0
      ? list
      : [
        "HAIR CLEANSERS",
        "HAIR CONDITIONERS",
        "HEAD MASSAGE OILS",
        "HAIR SERUM",
        "HAIR MASKS",
        "HAIR THICKENING SPRAY",
      ];
  }, [products]);

  // ── 2. Extract available ingredients for filter sidebar ───────────────────
  const availableIngredients = useMemo(() => {
    const counts: { [key: string]: number } = {};

    KNOWN_INGREDIENTS.forEach((ing) => {
      let count = 0;
      products.forEach((p) => {
        const text = `${p.title} ${p.description} ${p.tags?.join(" ")}`.toUpperCase();
        if (text.includes(ing)) {
          count++;
        }
      });
      if (count > 0) {
        counts[ing] = count;
      }
    });

    // If counts are small, provide at least top relevant list
    if (Object.keys(counts).length === 0) {
      return KNOWN_INGREDIENTS.slice(0, 8).map((ing) => ({ name: ing, count: 1 }));
    }

    return Object.entries(counts).map(([name, count]) => ({ name, count }));
  }, [products]);

  // ── 3. Extract available concerns for filter sidebar ──────────────────────
  const availableConcerns = useMemo(() => {
    const counts: { [key: string]: number } = {};

    KNOWN_CONCERNS.forEach((concern) => {
      let count = 0;
      products.forEach((p) => {
        const text = `${p.title} ${p.description} ${p.tags?.join(" ")}`.toUpperCase();
        if (text.includes(concern)) {
          count++;
        }
      });
      if (count > 0) {
        counts[concern] = count;
      }
    });

    if (Object.keys(counts).length === 0) {
      return KNOWN_CONCERNS.slice(0, 6).map((c) => ({ name: c, count: 1 }));
    }

    return Object.entries(counts).map(([name, count]) => ({ name, count }));
  }, [products]);

  // ── Filter toggling helpers ───────────────────────────────────────────────
  const toggleIngredient = (ing: string) => {
    setSelectedIngredients((prev) =>
      prev.includes(ing) ? prev.filter((i) => i !== ing) : [...prev, ing]
    );
  };

  const toggleConcern = (concern: string) => {
    setSelectedConcerns((prev) =>
      prev.includes(concern) ? prev.filter((c) => c !== concern) : [...prev, concern]
    );
  };

  const togglePriceRange = (range: string) => {
    setSelectedPriceRanges((prev) =>
      prev.includes(range) ? prev.filter((r) => r !== range) : [...prev, range]
    );
  };

  const clearAllFilters = () => {
    setSelectedProductType("ALL");
    setSelectedIngredients([]);
    setSelectedConcerns([]);
    setSelectedPriceRanges([]);
  };

  const totalActiveFilters =
    (selectedProductType !== "ALL" ? 1 : 0) +
    selectedIngredients.length +
    selectedConcerns.length +
    selectedPriceRanges.length;

  // ── Filter & Sort Execution ───────────────────────────────────────────────
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // 1. Product type filter
    if (selectedProductType !== "ALL") {
      result = result.filter((p) => {
        const text = `${p.productType} ${p.title} ${p.tags?.join(" ")}`.toUpperCase();
        return text.includes(selectedProductType);
      });
    }

    // 2. Ingredients filter (OR inside category)
    if (selectedIngredients.length > 0) {
      result = result.filter((p) => {
        const text = `${p.title} ${p.description} ${p.tags?.join(" ")}`.toUpperCase();
        return selectedIngredients.some((ing) => text.includes(ing));
      });
    }

    // 3. Concerns filter
    if (selectedConcerns.length > 0) {
      result = result.filter((p) => {
        const text = `${p.title} ${p.description} ${p.tags?.join(" ")}`.toUpperCase();
        return selectedConcerns.some((c) => text.includes(c));
      });
    }

    // 4. Price range filter
    if (selectedPriceRanges.length > 0) {
      result = result.filter((p) => {
        const amount = parseFloat(p.priceRange?.minVariantPrice?.amount || "0");
        return selectedPriceRanges.some((range) => {
          if (range === "under-1000") return amount < 1000;
          if (range === "1000-2000") return amount >= 1000 && amount <= 2000;
          if (range === "2000-3000") return amount > 2000 && amount <= 3000;
          if (range === "above-3000") return amount > 3000;
          return true;
        });
      });
    }

    // 5. Sorting
    result.sort((a, b) => {
      const priceA = parseFloat(a.priceRange?.minVariantPrice?.amount || "0");
      const priceB = parseFloat(b.priceRange?.minVariantPrice?.amount || "0");

      if (sortBy === "price-asc") return priceA - priceB;
      if (sortBy === "price-desc") return priceB - priceA;
      if (sortBy === "title-asc") return a.title.localeCompare(b.title);
      if (sortBy === "newest") return b.id.localeCompare(a.id);
      // Default: bestseller (featured order)
      return 0;
    });

    return result;
  }, [
    products,
    selectedProductType,
    selectedIngredients,
    selectedConcerns,
    selectedPriceRanges,
    sortBy,
  ]);

  return (
    <div className="w-full bg-white text-black min-h-screen">
      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 1. Subcategory / Product Type Pill Carousel (Image 2)             */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div className="border-b border-[#f0f0f0] bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5 overflow-x-auto scrollbar-hide py-1">
            <button
              type="button"
              onClick={() => setSelectedProductType("ALL")}
              className={`shrink-0 rounded-full px-5 py-2 text-[11px] sm:text-xs font-semibold tracking-wider uppercase transition-all ${selectedProductType === "ALL"
                ? "bg-black text-white shadow-sm"
                : "border border-[#dcdcdc] bg-white text-[#444444] hover:border-black hover:text-black"
                }`}
            >
              All Formulations
            </button>
            {productTypes.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setSelectedProductType(type)}
                className={`shrink-0 rounded-full px-5 py-2 text-[11px] sm:text-xs font-semibold tracking-wider uppercase transition-all ${selectedProductType === type
                  ? "bg-black text-white shadow-sm"
                  : "border border-[#dcdcdc] bg-white text-[#444444] hover:border-black hover:text-black"
                  }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 2. Breadcrumbs & Layout Toolbar Row                                 */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 pt-6 pb-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2 text-[11px] sm:text-xs font-medium uppercase tracking-wider text-[#666666]">
              <li>
                <Link href="/" className="hover:text-black transition-colors">
                  HOME
                </Link>
              </li>
              <li>
                <span className="text-[#999999]">&gt;</span>
              </li>
              <li className="text-black font-semibold">
                {collectionTitle.toUpperCase()}
              </li>
            </ol>
          </nav>

          {/* Desktop Right Toolbar: Grid density toggles & Sort dropdown */}
          <div className="hidden sm:flex items-center gap-6">
            {/* Grid density icons */}
            <div className="flex items-center gap-2 border-r border-[#e5e5e5] pr-6">
              <button
                type="button"
                aria-label="3 Columns View"
                onClick={() => setGridColumns(2)}
                className={`p-1.5 rounded transition-colors ${gridColumns === 2 ? "text-black bg-gray-100" : "text-[#888888] hover:text-black"
                  }`}
              >
                {/* 2 columns icon */}
                <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor">
                  <rect x="2" y="2" width="5" height="12" rx="1" />
                  <rect x="9" y="2" width="5" height="12" rx="1" />
                </svg>
              </button>
              <button
                type="button"
                aria-label="4 Columns View"
                onClick={() => setGridColumns(4)}
                className={`p-1.5 rounded transition-colors ${gridColumns === 4 ? "text-black bg-gray-100" : "text-[#888888] hover:text-black"
                  }`}
              >
                {/* 4 columns icon */}
                <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor">
                  <rect x="1.5" y="2" width="2.5" height="12" rx="0.5" />
                  <rect x="5" y="2" width="2.5" height="12" rx="0.5" />
                  <rect x="8.5" y="2" width="2.5" height="12" rx="0.5" />
                  <rect x="12" y="2" width="2.5" height="12" rx="0.5" />
                </svg>
              </button>
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <label htmlFor="sort-desktop" className="sr-only">
                Sort By
              </label>
              <select
                id="sort-desktop"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none rounded border border-[#cccccc] bg-white py-1.5 pl-3 pr-8 text-xs font-semibold uppercase tracking-wider text-black hover:border-black focus:outline-none focus:ring-1 focus:ring-black cursor-pointer"
              >
                <option value="bestseller">SORT BY (BESTSELLER)</option>
                <option value="price-asc">PRICE (LOW TO HIGH)</option>
                <option value="price-desc">PRICE (HIGH TO LOW)</option>
                <option value="newest">NEWEST ARRIVALS</option>
                <option value="title-asc">NAME (A TO Z)</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-black">
                <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Toolbar Buttons */}
        <div className="mt-4 flex sm:hidden items-center justify-between border-y border-[#eeeeee] py-2.5">
          <button
            type="button"
            onClick={() => setMobileFilterOpen(true)}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-black"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="7" y1="12" x2="17" y2="12" />
              <line x1="10" y1="18" x2="14" y2="18" />
            </svg>
            <span>FILTER {totalActiveFilters > 0 && `(${totalActiveFilters})`}</span>
          </button>

          <div className="h-4 w-px bg-gray-200" />

          <button
            type="button"
            onClick={() => setMobileSortOpen(true)}
            className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-black"
          >
            <span>SORT: {sortBy.toUpperCase().replace("-", " ")}</span>
            <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 3. Main Catalog Section: Sidebar (Desktop) + Product Grid           */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[240px_1fr]">
          {/* ── Left Sidebar Filter (Desktop) ──────────────────────────────── */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[#e5e5e5] pb-3">
                <span className="text-xs font-bold uppercase tracking-widest text-black">
                  FILTER
                </span>
                {totalActiveFilters > 0 && (
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="text-[11px] font-semibold text-[#666666] hover:text-black hover:underline"
                  >
                    RESET ALL
                  </button>
                )}
              </div>

              {/* 1. INGREDIENT Accordion */}
              <div className="border-b border-[#e5e5e5] pb-5">
                <button
                  type="button"
                  onClick={() => toggleSection("ingredient")}
                  className="flex w-full items-center justify-between py-1 text-left text-xs font-bold uppercase tracking-wider text-black"
                >
                  <span>INGREDIENT</span>
                  <svg
                    className={`h-3.5 w-3.5 transition-transform ${openSections.ingredient ? "rotate-180" : ""}`}
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

                {openSections.ingredient && (
                  <div className="mt-3 max-h-56 overflow-y-auto pr-2 space-y-2.5">
                    {availableIngredients.map(({ name, count }) => {
                      const isChecked = selectedIngredients.includes(name);
                      return (
                        <label
                          key={name}
                          className="flex items-center gap-2.5 cursor-pointer text-xs text-[#333333] hover:text-black group"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleIngredient(name)}
                            className="h-3.5 w-3.5 rounded-none border-gray-300 text-black focus:ring-0 cursor-pointer"
                          />
                          <span className={`uppercase font-medium ${isChecked ? "font-bold text-black" : ""}`}>
                            {name}
                          </span>
                          <span className="text-[10px] text-[#888888] ml-auto">({count})</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 2. CONCERN Accordion */}
              <div className="border-b border-[#e5e5e5] pb-5">
                <button
                  type="button"
                  onClick={() => toggleSection("concern")}
                  className="flex w-full items-center justify-between py-1 text-left text-xs font-bold uppercase tracking-wider text-black"
                >
                  <span>CONCERN</span>
                  <svg
                    className={`h-3.5 w-3.5 transition-transform ${openSections.concern ? "rotate-180" : ""}`}
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

                {openSections.concern && (
                  <div className="mt-3 max-h-56 overflow-y-auto pr-2 space-y-2.5">
                    {availableConcerns.map(({ name, count }) => {
                      const isChecked = selectedConcerns.includes(name);
                      return (
                        <label
                          key={name}
                          className="flex items-center gap-2.5 cursor-pointer text-xs text-[#333333] hover:text-black group"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleConcern(name)}
                            className="h-3.5 w-3.5 rounded-none border-gray-300 text-black focus:ring-0 cursor-pointer"
                          />
                          <span className={`uppercase font-medium ${isChecked ? "font-bold text-black" : ""}`}>
                            {name}
                          </span>
                          <span className="text-[10px] text-[#888888] ml-auto">({count})</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 3. PRICE RANGE Accordion */}
              <div className="border-b border-[#e5e5e5] pb-5">
                <button
                  type="button"
                  onClick={() => toggleSection("price")}
                  className="flex w-full items-center justify-between py-1 text-left text-xs font-bold uppercase tracking-wider text-black"
                >
                  <span>PRICE</span>
                  <svg
                    className={`h-3.5 w-3.5 transition-transform ${openSections.price ? "rotate-180" : ""}`}
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

                {openSections.price && (
                  <div className="mt-3 space-y-2.5">
                    {[
                      { id: "under-1000", label: "Under ₹1,000" },
                      { id: "1000-2000", label: "₹1,000 - ₹2,000" },
                      { id: "2000-3000", label: "₹2,000 - ₹3,000" },
                      { id: "above-3000", label: "Above ₹3,000" },
                    ].map((p) => {
                      const isChecked = selectedPriceRanges.includes(p.id);
                      return (
                        <label
                          key={p.id}
                          className="flex items-center gap-2.5 cursor-pointer text-xs text-[#333333] hover:text-black group"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => togglePriceRange(p.id)}
                            className="h-3.5 w-3.5 rounded-none border-gray-300 text-black focus:ring-0 cursor-pointer"
                          />
                          <span className={`font-medium ${isChecked ? "font-bold text-black" : ""}`}>
                            {p.label}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </aside>

          {/* ── Product Grid ──────────────────────────────────────────────── */}
          <main>
            {filteredProducts.length === 0 ? (
              <div className="py-24 text-center">
                <p className="font-display text-lg font-medium text-black">
                  No formulations found
                </p>
                <p className="mt-2 text-xs text-[#666666]">
                  Try clearing some filters to explore all Ayurvedic formulations.
                </p>
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="mt-6 inline-block rounded border border-black bg-black px-6 py-2.5 text-xs font-semibold tracking-wider text-white uppercase transition-colors hover:bg-white hover:text-black"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div
                className={`grid grid-cols-2 gap-x-3 gap-y-6 sm:gap-x-5 sm:gap-y-8 ${gridColumns === 2
                  ? "lg:grid-cols-2"
                  : "lg:grid-cols-3 xl:grid-cols-4"
                  }`}
              >
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 4. Mobile Slide-Over Filter Drawer                                  */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 transition-opacity"
            onClick={() => setMobileFilterOpen(false)}
          />

          {/* Drawer content */}
          <div className="relative ml-auto flex h-full w-full max-w-xs flex-col bg-white shadow-2xl">
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
              <span className="text-sm font-bold uppercase tracking-widest text-black">
                Filters {totalActiveFilters > 0 && `(${totalActiveFilters})`}
              </span>
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="p-1 text-gray-500 hover:text-black"
              >
                ✕
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
              {/* Product type pills inside drawer */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-black mb-2.5">
                  Category
                </h4>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedProductType("ALL")}
                    className={`rounded-full px-3 py-1.5 text-[10px] font-semibold tracking-wider uppercase ${selectedProductType === "ALL"
                      ? "bg-black text-white"
                      : "border border-gray-300 text-gray-700"
                      }`}
                  >
                    All
                  </button>
                  {productTypes.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setSelectedProductType(type)}
                      className={`rounded-full px-3 py-1.5 text-[10px] font-semibold tracking-wider uppercase ${selectedProductType === type
                        ? "bg-black text-white"
                        : "border border-gray-300 text-gray-700"
                        }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ingredients */}
              <div className="border-t border-gray-100 pt-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-black mb-2.5">
                  Ingredients
                </h4>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {availableIngredients.map(({ name, count }) => {
                    const isChecked = selectedIngredients.includes(name);
                    return (
                      <label key={name} className="flex items-center gap-2 text-xs text-gray-800">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleIngredient(name)}
                          className="h-4 w-4 rounded border-gray-300 text-black focus:ring-0"
                        />
                        <span>{name}</span>
                        <span className="text-[10px] text-gray-400 ml-auto">({count})</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Concern */}
              <div className="border-t border-gray-100 pt-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-black mb-2.5">
                  Concerns
                </h4>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {availableConcerns.map(({ name, count }) => {
                    const isChecked = selectedConcerns.includes(name);
                    return (
                      <label key={name} className="flex items-center gap-2 text-xs text-gray-800">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleConcern(name)}
                          className="h-4 w-4 rounded border-gray-300 text-black focus:ring-0"
                        />
                        <span>{name}</span>
                        <span className="text-[10px] text-gray-400 ml-auto">({count})</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Price */}
              <div className="border-t border-gray-100 pt-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-black mb-2.5">
                  Price
                </h4>
                <div className="space-y-2">
                  {[
                    { id: "under-1000", label: "Under ₹1,000" },
                    { id: "1000-2000", label: "₹1,000 - ₹2,000" },
                    { id: "2000-3000", label: "₹2,000 - ₹3,000" },
                    { id: "above-3000", label: "Above ₹3,000" },
                  ].map((p) => {
                    const isChecked = selectedPriceRanges.includes(p.id);
                    return (
                      <label key={p.id} className="flex items-center gap-2 text-xs text-gray-800">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => togglePriceRange(p.id)}
                          className="h-4 w-4 rounded border-gray-300 text-black focus:ring-0"
                        />
                        <span>{p.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="border-t border-gray-200 p-4 flex gap-3">
              <button
                type="button"
                onClick={clearAllFilters}
                className="w-1/2 rounded border border-black py-2.5 text-xs font-semibold uppercase tracking-wider text-black hover:bg-gray-100"
              >
                Clear All
              </button>
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="w-1/2 rounded bg-black py-2.5 text-xs font-semibold uppercase tracking-wider text-white hover:bg-gray-800"
              >
                Apply ({filteredProducts.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 5. Mobile Sort Bottom Sheet                                         */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {mobileSortOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:hidden">
          <div
            className="fixed inset-0 bg-black/50 transition-opacity"
            onClick={() => setMobileSortOpen(false)}
          />
          <div className="relative w-full rounded-t-xl bg-white p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <span className="text-xs font-bold uppercase tracking-widest text-black">
                Sort Formulations
              </span>
              <button
                type="button"
                onClick={() => setMobileSortOpen(false)}
                className="text-xs font-bold text-gray-500 hover:text-black"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              {[
                { id: "bestseller", label: "Bestseller (Featured)" },
                { id: "price-asc", label: "Price: Low to High" },
                { id: "price-desc", label: "Price: High to Low" },
                { id: "newest", label: "Newest Arrivals" },
                { id: "title-asc", label: "Name: A to Z" },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    setSortBy(opt.id);
                    setMobileSortOpen(false);
                  }}
                  className={`flex w-full items-center justify-between py-2 text-xs uppercase tracking-wider font-semibold ${sortBy === opt.id ? "text-black" : "text-gray-500"
                    }`}
                >
                  <span>{opt.label}</span>
                  {sortBy === opt.id && <span>✓</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
