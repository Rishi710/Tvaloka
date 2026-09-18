"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  useTransition,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CloseIcon, SearchIcon } from "./icons";
import type { ShopifyProduct } from "../lib/shopify/types";
import type { ShopifyCollection } from "../lib/shopify/types";
import Image from "next/image";

interface SearchResults {
  products: ShopifyProduct[];
  collections: ShopifyCollection[];
  tags: string[];
}

interface PopularProduct {
  handle: string;
  title: string;
  price: string;
  image: string | null;
  imageAlt: string;
}

interface LandingData {
  popularProducts: PopularProduct[];
  concerns: string[];
}

const SUGGESTION_CHIPS = [
  { label: "Face Care", query: "face care" },
  { label: "Hair Care", query: "hair care" },
  { label: "Wellness", query: "wellness" },
  { label: "Best Sellers", query: "best seller" },
  { label: "New Launch", query: "new launch" },
  { label: "Baby Care", query: "baby care" },
];

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export function SmartSearch({
  onClose,
}: {
  onClose: () => void;
}) {
  const router = useRouter();
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isPending, startTransition] = useTransition();
  const [landing, setLanding] = useState<LandingData | null>(null);

  const debouncedQuery = useDebounce(query, 300);

  // Fetch landing content (bestseller chips' backing data, concerns, popular
  // products) once per mount — independent of the debounced search query.
  useEffect(() => {
    let cancelled = false;
    fetch("/api/search/landing")
      .then((res) => res.json())
      .then((data: LandingData) => {
        if (!cancelled) setLanding(data);
      })
      .catch(() => {
        // silently fail — the static suggestion chips still render
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Focus trap + scroll lock
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    inputRef.current?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  // Fetch results
  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setResults(null);
      setActiveIndex(-1);
      return;
    }
    startTransition(async () => {
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(debouncedQuery)}`
        );
        const data: SearchResults = await res.json();
        setResults(data);
        setActiveIndex(-1);
      } catch {
        // silently fail
      }
    });
  }, [debouncedQuery]);

  // Build flat navigable items list for keyboard nav
  const flatItems: { href: string; label: string }[] = [];
  if (results) {
    for (const p of results.products) {
      flatItems.push({ href: `/products/${p.handle}`, label: p.title });
    }
    for (const c of results.collections) {
      flatItems.push({ href: `/${c.handle}`, label: c.title });
    }
    for (const t of results.tags) {
      flatItems.push({
        href: `/products?q=${encodeURIComponent(t)}`,
        label: t,
      });
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, flatItems.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && flatItems[activeIndex]) {
        router.push(flatItems[activeIndex].href);
        onClose();
      } else if (query.trim()) {
        router.push(`/products?q=${encodeURIComponent(query.trim())}`);
        onClose();
      }
    }
  }

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (query.trim()) {
        router.push(`/products?q=${encodeURIComponent(query.trim())}`);
        onClose();
      }
    },
    [query, router, onClose]
  );

  const hasResults =
    results &&
    (results.products.length > 0 ||
      results.collections.length > 0 ||
      results.tags.length > 0);
  const noResults =
    results &&
    debouncedQuery.length >= 2 &&
    !hasResults &&
    !isPending;

  let flatIdx = 0;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[200] flex flex-col"
      style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(2px)" }}
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      {/* Search panel */}
      <div
        className="relative w-full"
        style={{ background: "var(--color-surface-muted)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Input row */}
        <form
          role="search"
          aria-label="Smart product search"
          onSubmit={handleSubmit}
          className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-4 sm:px-6"
        >
          <label htmlFor={inputId} className="sr-only">
            Search by product name, concern, category, tag or collection
          </label>
          <SearchIcon className="h-5 w-5 shrink-0 text-primary opacity-50" />
          <input
            id={inputId}
            ref={inputRef}
            type="search"
            autoComplete="off"
            spellCheck={false}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search products, concerns, categories…"
            aria-autocomplete="list"
            aria-controls={hasResults ? "search-listbox" : undefined}
            aria-activedescendant={
              activeIndex >= 0 ? `search-item-${activeIndex}` : undefined
            }
            className="min-w-0 flex-1 bg-transparent text-sm text-primary outline-none placeholder:text-tertiary sm:text-base"
          />
          {/* Loading spinner */}
          {isPending && (
            <span
              aria-hidden="true"
              className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent opacity-40"
            />
          )}
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setResults(null);
                inputRef.current?.focus();
              }}
              aria-label="Clear search"
              className="flex h-8 w-8 shrink-0 items-center justify-center text-tertiary hover:text-primary"
            >
              <CloseIcon className="h-4 w-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close search"
            className="ml-1 flex h-8 w-8 shrink-0 items-center justify-center text-primary"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </form>

        {/* Thin divider */}
        <div style={{ height: "1px", background: "var(--color-hairline)" }} />

        {/* Landing content — shown when no query yet */}
        {!query && (
          <div className="mx-auto max-h-[70vh] max-w-7xl overflow-y-auto px-4 pb-6 pt-5 sm:px-6">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_1.1fr] lg:gap-12">
              {/* Left column — bestseller chips + shop by concern */}
              <div>
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-tertiary">
                  Bestsellers
                </p>
                <ul className="flex flex-wrap gap-2">
                  {SUGGESTION_CHIPS.map((chip) => (
                    <li key={chip.label}>
                      <button
                        type="button"
                        onClick={() => {
                          setQuery(chip.query);
                          inputRef.current?.focus();
                        }}
                        className="rounded-full border border-hairline bg-black/[.03] px-4 py-1.5 text-xs font-semibold text-primary transition-colors hover:border-primary hover:bg-primary hover:text-white"
                      >
                        {chip.label}
                      </button>
                    </li>
                  ))}
                </ul>

                {landing && landing.concerns.length > 0 && (
                  <>
                    <p className="mb-3 mt-7 text-[11px] font-semibold uppercase tracking-widest text-tertiary">
                      Shop by Concern
                    </p>
                    <ul className="grid grid-cols-2 gap-2">
                      {landing.concerns.map((concern) => (
                        <li key={concern}>
                          <button
                            type="button"
                            onClick={() => {
                              setQuery(concern);
                              inputRef.current?.focus();
                            }}
                            className="w-full rounded-[5px] border border-hairline px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-primary transition-colors hover:border-primary hover:bg-black/[.04]"
                          >
                            {concern}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>

              {/* Right column — popular products */}
              {landing && landing.popularProducts.length > 0 && (
                <div>
                  <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-tertiary">
                    Popular Products
                  </p>
                  <ul className="flex flex-col gap-1">
                    {landing.popularProducts.map((product, i) => (
                      <li key={product.handle}>
                        <Link
                          href={`/products/${product.handle}`}
                          onClick={onClose}
                          className={`flex items-center gap-3 rounded-[5px] px-2 py-2.5 transition-colors hover:bg-black/[.04] ${
                            i === 0 ? "border border-hairline bg-black/[.03]" : ""
                          }`}
                        >
                          <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-[5px] bg-hairline">
                            {product.image ? (
                              <Image
                                src={product.image}
                                alt={product.imageAlt}
                                fill
                                sizes="48px"
                                className="object-cover"
                              />
                            ) : (
                              <span className="flex h-full w-full items-center justify-center text-[10px] text-tertiary">
                                ✦
                              </span>
                            )}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-semibold text-primary">
                              {product.title}
                            </span>
                            <span className="block text-xs text-tertiary">
                              ₹{product.price}
                            </span>
                          </span>
                          <span
                            className="shrink-0 text-xs text-tertiary"
                            aria-hidden="true"
                          >
                            →
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Results */}
        {(hasResults || noResults) && (
          <div className="mx-auto max-w-3xl px-4 pb-6 pt-3 sm:px-6">
            {noResults && (
              <p className="py-4 text-sm text-tertiary">
                No results for &ldquo;{debouncedQuery}&rdquo;. Try a different
                search.
              </p>
            )}

            {hasResults && (
              <ul
                id="search-listbox"
                ref={listboxRef}
                role="listbox"
                aria-label="Search results"
                className="flex flex-col gap-0"
              >
                {/* ── Products ── */}
                {results!.products.length > 0 && (
                  <>
                    <li role="presentation">
                      <p className="mb-2 mt-1 text-[11px] font-semibold uppercase tracking-widest text-tertiary">
                        Products
                      </p>
                    </li>
                    {results!.products.map((product) => {
                      const idx = flatIdx++;
                      const isActive = activeIndex === idx;
                      return (
                        <li
                          key={product.id}
                          id={`search-item-${idx}`}
                          role="option"
                          aria-selected={isActive}
                        >
                          <Link
                            href={`/products/${product.handle}`}
                            onClick={onClose}
                            className="flex items-center gap-3 rounded-[5px] px-2 py-2 transition-colors hover:bg-black/[.04]"
                            style={
                              isActive
                                ? { background: "rgba(0,0,0,0.06)" }
                                : {}
                            }
                          >
                            {/* Thumbnail */}
                            <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-[5px] bg-hairline">
                              {product.featuredImage?.url ? (
                                <Image
                                  src={product.featuredImage.url}
                                  alt={
                                    product.featuredImage.altText ||
                                    product.title
                                  }
                                  fill
                                  sizes="48px"
                                  className="object-cover"
                                />
                              ) : (
                                <span className="flex h-full w-full items-center justify-center text-[10px] text-tertiary">
                                  ✦
                                </span>
                              )}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-sm font-semibold text-primary">
                                {product.title}
                              </span>
                              {product.productType && (
                                <span className="block truncate text-xs text-tertiary">
                                  {product.productType}
                                </span>
                              )}
                            </span>
                            <span className="shrink-0 text-xs text-tertiary">
                              ₹
                              {Math.round(
                                Number(
                                  product.priceRange.minVariantPrice.amount
                                )
                              ).toLocaleString("en-IN")}
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                  </>
                )}

                {/* ── Collections ── */}
                {results!.collections.length > 0 && (
                  <>
                    <li role="presentation">
                      <p className="mb-2 mt-4 text-[11px] font-semibold uppercase tracking-widest text-tertiary">
                        Collections
                      </p>
                    </li>
                    {results!.collections.map((col) => {
                      const idx = flatIdx++;
                      const isActive = activeIndex === idx;
                      return (
                        <li
                          key={col.id}
                          id={`search-item-${idx}`}
                          role="option"
                          aria-selected={isActive}
                        >
                          <Link
                            href={`/${col.handle}`}
                            onClick={onClose}
                            className="flex items-center gap-3 rounded-[5px] px-2 py-2.5 transition-colors hover:bg-black/[.04]"
                            style={
                              isActive
                                ? { background: "rgba(0,0,0,0.06)" }
                                : {}
                            }
                          >
                            <span
                              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs"
                              style={{
                                background: "var(--color-hairline)",
                                color: "var(--color-tertiary)",
                              }}
                            >
                              ❧
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-sm font-semibold text-primary">
                                {col.title}
                              </span>
                              {col.description && (
                                <span className="block truncate text-xs text-tertiary">
                                  {col.description}
                                </span>
                              )}
                            </span>
                            <span
                              className="shrink-0 text-xs text-tertiary"
                              aria-hidden="true"
                            >
                              →
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                  </>
                )}

                {/* ── Tags / Concerns ── */}
                {results!.tags.length > 0 && (
                  <>
                    <li role="presentation">
                      <p className="mb-2 mt-4 text-[11px] font-semibold uppercase tracking-widest text-tertiary">
                        Concerns & Tags
                      </p>
                    </li>
                    <li role="presentation">
                      <ul className="flex flex-wrap gap-2 px-2 pb-1">
                        {results!.tags.map((tag) => {
                          const idx = flatIdx++;
                          const isActive = activeIndex === idx;
                          return (
                            <li
                              key={tag}
                              id={`search-item-${idx}`}
                              role="option"
                              aria-selected={isActive}
                            >
                              <Link
                                href={`/products?q=${encodeURIComponent(tag)}`}
                                onClick={onClose}
                                className="inline-block rounded-full border border-hairline px-3 py-1 text-xs font-semibold text-primary transition-colors hover:border-primary hover:bg-primary hover:text-white"
                                style={
                                  isActive
                                    ? {
                                        background: "black",
                                        color: "white",
                                        borderColor: "black",
                                      }
                                    : {}
                                }
                              >
                                {tag}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </li>
                  </>
                )}

                {/* View all results link */}
                <li role="presentation">
                  <div
                    className="mt-4 pt-3"
                    style={{ borderTop: "1px solid var(--color-hairline)" }}
                  >
                    <Link
                      href={`/products?q=${encodeURIComponent(debouncedQuery)}`}
                      onClick={onClose}
                      className="text-xs font-semibold text-primary underline underline-offset-4 hover:opacity-70"
                    >
                      View all results for &ldquo;{debouncedQuery}&rdquo; →
                    </Link>
                  </div>
                </li>
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
