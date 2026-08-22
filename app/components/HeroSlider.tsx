"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeftIcon, ChevronRightIcon } from "./icons";

export type Slide = {
  eyebrow: string;
  headline: string;
  copy: string;
  ctaLabel: string;
  href: string;
  /** Base colour behind the photo — shows for the moment before it decodes. */
  bgClassName: string;
  image: string;
  alt: string;
  /** Which part of the photo to keep when it is cropped to the banner box. */
  objectPositionClassName?: string;
};

const defaultSlides: Slide[] = [
  {
    eyebrow: "Online Exclusive",
    headline: "Rituals of Renewal",
    copy: "Cold-pressed Ayurvedic oils and serums, crafted for daily ritual.",
    ctaLabel: "Shop Face & Body",
    href: "/face-care",
    bgClassName: "bg-surface-base",
    image: "/Image/banner-1.jpeg",
    alt: "Ayurvedic botanicals rose, saffron, vanilla, amla, aloe and neem laid out on cream cloth",
  },
  {
    eyebrow: "New In",
    headline: "Bath & Body, Reimagined",
    copy: "Traditional Ayurveda, formulated for modern skin.",
    ctaLabel: "Shop Bath & Body",
    href: "/bath-body-care",
    bgClassName: "bg-[radial-gradient(circle_at_20%_30%,_#1a1a1a,_#000000_60%)]",
    image: "https://cdn.shopify.com/s/files/1/1005/3045/4892/files/banner-2.webp?v=1787263013",
    alt: "A woman resting beside a lotus flower, roses, saffron and Ayurvedic botanicals arranged on a banana leaf",
    // Subject sits left, where the copy goes — favour the right of the frame.
    objectPositionClassName: "object-right",
  },
  {
    eyebrow: "Travel Ready",
    headline: "Wellness, Wherever You Go",
    copy: "The full ritual, in travel-friendly minis.",
    ctaLabel: "Shop Hair Care",
    href: "/hair-care",
    bgClassName: "bg-[radial-gradient(circle_at_80%_70%,_#1a1a1a,_#000000_60%)]",
    image: "https://cdn.shopify.com/s/files/1/1005/3045/4892/files/WhatsApp_Image_2026-08-20_at_20.21.39.webp?v=1787262046",
    alt: "Three dropper bottles of facial oil and serum on linen, surrounded by rosemary and blossoms",
    objectPositionClassName: "object-right",
  },
];

/**
 * Keeps overlaid copy legible over bright photos. Below `lg` the copy spans
 * most of the width, so it needs a near-even wash; from `lg` the copy occupies
 * only the left ~45% and the scrim can fall away to let the photo show.
 * Both variants measure clear of WCAG AA for every string in `slides`.
 */
const scrim =
  "bg-[linear-gradient(to_right,rgba(0,0,0,0.55),rgba(0,0,0,0.35))] " +
  "lg:bg-[linear-gradient(to_right,rgba(0,0,0,0.5),rgba(0,0,0,0.25)_60%,transparent)]";

const AUTOPLAY_MS = 6000;
const SWIPE_THRESHOLD_PX = 40;

const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

interface HeroSliderProps {
  slides?: Slide[];
}

export function HeroSlider({ slides = defaultSlides }: HeroSliderProps) {
  const activeSlides = slides.length > 0 ? slides : defaultSlides;
  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isInteracting, setIsInteracting] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() =>
    typeof window === "undefined"
      ? false
      : window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  const sectionRef = useRef<HTMLElement>(null);
  const touchStartX = useRef<number | null>(null);
  const liveRegionId = useId();

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = (event: MediaQueryListEvent) => setPrefersReducedMotion(event.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  const goTo = useCallback(
    (next: number) => {
      setIndex(((next % activeSlides.length) + activeSlides.length) % activeSlides.length);
    },
    [activeSlides.length],
  );
  const goNext = useCallback(() => goTo(index + 1), [goTo, index]);
  const goPrev = useCallback(() => goTo(index - 1), [goTo, index]);

  const autoplayActive = isPlaying && !isInteracting && !prefersReducedMotion;

  useEffect(() => {
    if (!autoplayActive) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % activeSlides.length);
    }, AUTOPLAY_MS);
    return () => window.clearInterval(timer);
  }, [autoplayActive, activeSlides.length]);

  // Reset to first slide when the slide list changes
  useEffect(() => {
    setIndex(0);
  }, [activeSlides]);

  function onKeyDown(event: React.KeyboardEvent) {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      goNext();
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      goPrev();
    }
  }

  function onBlurCapture(event: React.FocusEvent) {
    if (!sectionRef.current?.contains(event.relatedTarget as Node)) {
      setIsInteracting(false);
    }
  }

  function onTouchStart(event: React.TouchEvent) {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  }

  function onTouchEnd(event: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const endX = event.changedTouches[0]?.clientX ?? touchStartX.current;
    const delta = endX - touchStartX.current;
    if (Math.abs(delta) > SWIPE_THRESHOLD_PX) {
      if (delta < 0) goNext();
      else goPrev();
    }
    touchStartX.current = null;
  }

  if (activeSlides.length === 0) return null;

  const current = activeSlides[index];

  return (
    <section
      ref={sectionRef}
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured collections"
      className="relative overflow-hidden bg-surface-base"
      onMouseEnter={() => setIsInteracting(true)}
      onMouseLeave={() => setIsInteracting(false)}
      onFocus={() => setIsInteracting(true)}
      onBlur={onBlurCapture}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onKeyDown={onKeyDown}
    >
      <div className="relative h-[480px] sm:h-[550px] lg:h-[640px]">
        {activeSlides.map((slide, slideIndex) => {
          const isActive = slideIndex === index;
          return (
            <div
              key={slide.headline}
              role="group"
              aria-roledescription="slide"
              aria-label={`${slideIndex + 1} of ${activeSlides.length}`}
              aria-hidden={!isActive}
              inert={!isActive}
              className={`absolute inset-0 flex items-center transition-opacity duration-[var(--motion-fast)] ease-out ${
                slide.bgClassName
              } ${isActive ? "opacity-100" : "pointer-events-none opacity-0"}`}
            >
              <Image
                src={slide.image}
                alt={slide.alt}
                fill
                sizes="100vw"
                priority={slideIndex === 0}
                className={`object-cover ${slide.objectPositionClassName ?? ""}`}
              />
              <div aria-hidden="true" className={`absolute inset-0 ${scrim}`} />

              <div className="relative mx-auto w-full max-w-7xl px-6 sm:px-14 lg:px-16">
                <div className="max-w-xl">
                  <p className="text-xs font-semibold tracking-[0.3em] text-ondark uppercase">
                    {slide.eyebrow}
                  </p>
                  <h2 className="font-display mt-[var(--space-3)] text-lg text-ondark sm:text-xl">
                    {slide.headline}
                  </h2>
                  <p className="mt-[var(--space-3)] max-w-md text-sm text-ondark">
                    {slide.copy}
                  </p>
                  <Link
                    href={slide.href}
                    tabIndex={isActive ? 0 : -1}
                    className={`mt-[var(--space-6)] inline-block rounded-[var(--radius-xs)] bg-action-ondark-bg px-[var(--space-5)] py-[var(--space-3)] text-sm font-semibold text-action-ondark-text transition-colors duration-[var(--motion-instant)] hover:bg-action-ondark-bg-hover active:bg-action-ondark-bg-active ${focusRing}`}
                  >
                    {slide.ctaLabel}
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <p id={liveRegionId} aria-live="polite" className="sr-only">
        Slide {index + 1} of {activeSlides.length}: {current.headline}
      </p>

      <button
        type="button"
        onClick={goPrev}
        className={`absolute top-1/2 left-[var(--space-4)] hidden sm:flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-[var(--radius-xs)] bg-surface-base/40 text-ondark hover:bg-surface-base/70 ${focusRing}`}
        aria-label="Previous slide"
      >
        <ChevronLeftIcon className="h-6 w-6" />
      </button>
      <button
        type="button"
        onClick={goNext}
        className={`absolute top-1/2 right-[var(--space-4)] hidden sm:flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-[var(--radius-xs)] bg-surface-base/40 text-ondark hover:bg-surface-base/70 ${focusRing}`}
        aria-label="Next slide"
      >
        <ChevronRightIcon className="h-6 w-6" />
      </button>

      <div className="absolute bottom-[var(--space-4)] left-1/2 flex -translate-x-1/2 gap-[var(--space-2)]">
        {activeSlides.map((slide, slideIndex) => (
          <button
            key={slide.headline}
            type="button"
            onClick={() => goTo(slideIndex)}
            aria-label={`Go to slide ${slideIndex + 1}`}
            aria-current={slideIndex === index ? "true" : undefined}
            className={`h-2.5 w-2.5 rounded-full ${focusRing} ${
              slideIndex === index ? "bg-surface-muted" : "bg-surface-muted/40"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
