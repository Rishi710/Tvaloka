"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeftIcon, ChevronRightIcon, MuteIcon, VolumeIcon } from "./icons";
import type { ShopifyProduct } from "../lib/shopify/types";

export interface TrustedTaleItem {
  product: ShopifyProduct;
  videoSrc: string;
}

const focusRingOnLight =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black";
const focusRingOnDark =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

const overlayButton =
  "flex h-11 w-11 items-center justify-center rounded-full bg-white text-primary shadow-md transition-colors hover:bg-white/90 " +
  focusRingOnDark;

function ArrowUpRightIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path d="M7 17 17 7" />
      <path d="M8 7h9v9" />
    </svg>
  );
}

// A <video> paints solid black until it has decoded a frame, which
// briefly blacks out the gradient behind it while scrolling into view.
// Keep it transparent until it actually has something to show.
function StoryVideo({ src, muted }: { src: string; muted: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isReady, setIsReady] = useState(false);
  const markReady = () => setIsReady(true);

  // React does not reliably update the `muted` attribute after mount, so set
  // the property directly. Unmuting follows a click, so playback is allowed.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = muted;
    if (!muted && video.paused) void video.play().catch(() => {});
  }, [muted]);

  return (
    <video
      ref={videoRef}
      className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-[var(--motion-fast)] ease-out ${
        isReady ? "opacity-100" : "opacity-0"
      }`}
      src={src}
      autoPlay
      muted
      loop
      playsInline
      // Several instances of the same src can be flaky about firing
      // loadeddata individually, so treat any of these as "has a frame".
      onLoadedData={markReady}
      onCanPlay={markReady}
      onPlaying={markReady}
      onTimeUpdate={markReady}
    />
  );
}

function formatMoney(amount: string, currencyCode?: string) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currencyCode || "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(parseFloat(amount));
}

export function TrustedTales({ items }: { items: TrustedTaleItem[] }) {
  const scrollerRef = useRef<HTMLUListElement>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);
  // Only one card plays with sound at a time.
  const [unmutedIndex, setUnmutedIndex] = useState<number | null>(null);

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
    const card = el.querySelector<HTMLElement>("[data-story-card]");
    const amount = (card?.offsetWidth ?? el.clientWidth * 0.8) + 16;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: direction * amount, behavior: reduceMotion ? "auto" : "smooth" });
  }

  return (
    <section className="bg-surface-muted">
      <div className="mx-auto max-w-7xl px-[var(--space-4)] py-[var(--space-2)] sm:py-[var(--space-6)] lg:py-[var(--space-6)]">
        <h2 className="font-display text-lg text-primary sm:text-xl">Trusted Tales</h2>
        <p className="mt-[var(--space-2)] max-w-2xl text-sm text-tertiary">
          Experience Ayurveda, share your story. Be part of the{" "}
          <span className="font-semibold text-primary">#Tvalokababycare</span> — tag{" "}
          <span className="font-semibold text-primary">@tvalokawellness</span> to get featured.
        </p>

        <div className="relative mt-[var(--space-6)]">
          <ul
            ref={scrollerRef}
            onScroll={updateScrollState}
            aria-label="Community stories"
            className="scrollbar-hide flex snap-x snap-mandatory gap-[var(--space-4)] overflow-x-auto scroll-smooth pb-[var(--space-2)]"
          >
            {items.map(({ product, videoSrc }, index) => {
              const price = product.priceRange?.minVariantPrice;
              const formattedPrice = price ? formatMoney(price.amount, price.currencyCode) : null;
              // Shopify "Compare at price" on the default variant — only shown when
              // genuinely higher than the selling price.
              const compareAt = product.variants?.[0]?.compareAtPrice;
              const formattedCompareAt =
                price && compareAt && parseFloat(compareAt.amount) > parseFloat(price.amount)
                  ? formatMoney(compareAt.amount, compareAt.currencyCode)
                  : null;
              const href = `/products/${product.handle}`;
              const isMuted = unmutedIndex !== index;

              return (
                <li
                  key={product.id}
                  data-story-card
                  className="w-[78%] shrink-0 snap-start sm:w-[45%] md:w-[32%] lg:w-[24%] xl:w-[19%]"
                >
                  <div className="relative aspect-[9/16] overflow-hidden rounded-[var(--radius-xs)] bg-[radial-gradient(circle_at_30%_20%,_#262626,_#000000_65%)]">
                    <StoryVideo src={videoSrc} muted={isMuted} />

                    <button
                      type="button"
                      onClick={() => setUnmutedIndex(isMuted ? index : null)}
                      aria-label={isMuted ? `Unmute video for ${product.title}` : `Mute video for ${product.title}`}
                      aria-pressed={!isMuted}
                      className={`absolute top-[var(--space-3)] right-[var(--space-3)] ${overlayButton}`}
                    >
                      {isMuted ? <MuteIcon className="h-5 w-5" /> : <VolumeIcon className="h-5 w-5" />}
                    </button>

                    <Link
                      href={href}
                      aria-label={`View ${product.title}`}
                      className={`absolute right-[var(--space-3)] bottom-[var(--space-3)] ${overlayButton}`}
                    >
                      <ArrowUpRightIcon className="h-5 w-5" />
                    </Link>
                  </div>

                  <div className="mt-[var(--space-3)]">
                    <h3 className="font-display line-clamp-2 min-h-[2lh] text-md leading-snug text-primary">
                      <Link
                        href={href}
                        title={product.title}
                        className=""
                      >
                        {product.title}
                      </Link>
                    </h3>
                    <div className="mt-[var(--space-1)] flex items-baseline justify-between gap-[var(--space-3)]">
                      <p className="text-xs tracking-wide text-tertiary uppercase">
                        {product.productType}
                      </p>
                      {formattedPrice ? (
                        <p className="flex shrink-0 items-baseline gap-[var(--space-2)]">
                          {formattedCompareAt ? (
                            <span className="text-xs text-tertiary line-through">
                              {formattedCompareAt}
                            </span>
                          ) : null}
                          <span className="text-md font-semibold text-primary">
                            {formattedPrice}
                          </span>
                        </p>
                      ) : null}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          <button
            type="button"
            onClick={() => scrollByCard(-1)}
            disabled={!canScrollPrev}
            aria-label="Scroll to previous stories"
            className={`absolute top-1/3 left-[calc(var(--space-2)*-1)] hidden h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-action-onlight-bg text-action-onlight-text shadow-md disabled:pointer-events-none disabled:opacity-30 sm:flex ${focusRingOnLight}`}
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => scrollByCard(1)}
            disabled={!canScrollNext}
            aria-label="Scroll to more stories"
            className={`absolute top-1/3 right-[calc(var(--space-2)*-1)] hidden h-11 w-11 -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-full bg-action-onlight-bg text-action-onlight-text shadow-md disabled:pointer-events-none disabled:opacity-30 sm:flex ${focusRingOnLight}`}
          >
            <ChevronRightIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
