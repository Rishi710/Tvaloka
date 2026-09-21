"use client";

import { Children, useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "./icons";

const focusRingOnLight =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black";

/**
 * Horizontal snap rail: 2 items visible on mobile (scrollable for more),
 * scaling up to ~5 visible at desktop widths, with prev/next arrows from `sm`.
 */
export function ScrollRail({
  label,
  children,
  arrowTopClassName = "top-[38%]",
}: {
  /** Name of what is being scrolled, used in the rail's accessible labels. */
  label: string;
  children: ReactNode;
  /** Vertical anchor for the arrows, tuned to where each item's visual centre sits. */
  arrowTopClassName?: string;
}) {
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

  function scrollByItem(direction: 1 | -1) {
    const el = scrollerRef.current;
    if (!el) return;
    const item = el.querySelector<HTMLElement>("[data-rail-item]");
    const amount = (item?.offsetWidth ?? el.clientWidth * 0.46) + 16;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: direction * amount, behavior: reduceMotion ? "auto" : "smooth" });
  }

  return (
    <div className="relative">
      <ul
        ref={scrollerRef}
        onScroll={updateScrollState}
        aria-label={label}
        className="scrollbar-hide flex snap-x snap-mandatory gap-[var(--space-4)] overflow-x-auto scroll-smooth pb-[var(--space-2)]"
      >
        {Children.toArray(children).map((child, index) => (
          <li
            key={index}
            data-rail-item
            className="w-[46%] shrink-0 snap-start sm:w-[31%] md:w-[23%] lg:w-[19%]"
          >
            {child}
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={() => scrollByItem(-1)}
        disabled={!canScrollPrev}
        aria-label={`Scroll to previous ${label}`}
        className={`absolute ${arrowTopClassName} left-[calc(var(--space-2)*-1)] hidden h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-action-onlight-bg text-action-onlight-text shadow-md disabled:pointer-events-none disabled:opacity-30 sm:flex ${focusRingOnLight}`}
      >
        <ChevronLeftIcon className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={() => scrollByItem(1)}
        disabled={!canScrollNext}
        aria-label={`Scroll to more ${label}`}
        className={`absolute ${arrowTopClassName} right-[calc(var(--space-2)*-1)] hidden h-11 w-11 -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-full bg-action-onlight-bg text-action-onlight-text shadow-md disabled:pointer-events-none disabled:opacity-30 sm:flex ${focusRingOnLight}`}
      >
        <ChevronRightIcon className="h-5 w-5" />
      </button>
    </div>
  );
}
