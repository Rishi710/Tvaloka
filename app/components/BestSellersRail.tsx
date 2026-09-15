"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "./icons";
import { ProductCard } from "./ProductCard";
import type { ShopifyProduct } from "../lib/shopify/types";

const focusRingOnLight =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black";

/**
 * Horizontal product rail: 2 cards visible on mobile (scrollable for more),
 * scaling up to ~5 visible at desktop widths. Mirrors the scroll-state /
 * arrow-button pattern used by TrustedTales's community-stories rail.
 */
export function BestSellersRail({ products }: { products: ShopifyProduct[] }) {
  const scrollerRef = useRef<HTMLUListElement>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);

  function updateScrollState() {
    const el = scrollerRef.current;
    if (!el) return;
    setCanScrollPrev(el.scrollLeft > 8);
    setCanScrollNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  }

  useEffect(() => {
    updateScrollState();
    window.addEventListener("resize", updateScrollState);
    return () => window.removeEventListener("resize", updateScrollState);
  }, []);

  function scrollByCard(direction: 1 | -1) {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-product-card]");
    const amount = (card?.offsetWidth ?? el.clientWidth * 0.46) + 16;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: direction * amount, behavior: reduceMotion ? "auto" : "smooth" });
  }

  return (
    <div className="relative">
      <ul
        ref={scrollerRef}
        onScroll={updateScrollState}
        aria-label="Best selling products"
        className="scrollbar-hide flex snap-x snap-mandatory gap-[var(--space-4)] overflow-x-auto scroll-smooth pb-[var(--space-2)]"
      >
        {products.map((product) => (
          <li
            key={product.id}
            data-product-card
            className="w-[46%] shrink-0 snap-start sm:w-[31%] md:w-[23%] lg:w-[19%]"
          >
            <ProductCard product={product} />
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={() => scrollByCard(-1)}
        disabled={!canScrollPrev}
        aria-label="Scroll to previous best sellers"
        className={`absolute top-[38%] left-[calc(var(--space-2)*-1)] hidden h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-action-onlight-bg text-action-onlight-text shadow-md disabled:pointer-events-none disabled:opacity-30 sm:flex ${focusRingOnLight}`}
      >
        <ChevronLeftIcon className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={() => scrollByCard(1)}
        disabled={!canScrollNext}
        aria-label="Scroll to more best sellers"
        className={`absolute top-[38%] right-[calc(var(--space-2)*-1)] hidden h-11 w-11 -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-full bg-action-onlight-bg text-action-onlight-text shadow-md disabled:pointer-events-none disabled:opacity-30 sm:flex ${focusRingOnLight}`}
      >
        <ChevronRightIcon className="h-5 w-5" />
      </button>
    </div>
  );
}
