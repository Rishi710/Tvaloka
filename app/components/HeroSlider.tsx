"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeftIcon, ChevronRightIcon } from "./icons";

type Slide = {
  eyebrow: string;
  headline: string;
  copy: string;
  ctaLabel: string;
  href: string;
  bgClassName: string;
};

const slides: Slide[] = [
  {
    eyebrow: "Online Exclusive",
    headline: "Rituals of Renewal",
    copy: "Cold-pressed Ayurvedic oils and serums, crafted for daily ritual.",
    ctaLabel: "Shop Face & Body",
    href: "/face",
    bgClassName: "bg-surface-base",
  },
  {
    eyebrow: "New In",
    headline: "Bath & Body, Reimagined",
    copy: "Traditional Ayurveda, formulated for modern skin.",
    ctaLabel: "Shop Bath & Body",
    href: "/bath-body",
    bgClassName: "bg-[radial-gradient(circle_at_20%_30%,_#1a1a1a,_#000000_60%)]",
  },
  {
    eyebrow: "Travel Ready",
    headline: "Wellness, Wherever You Go",
    copy: "The full ritual, in travel-friendly minis.",
    ctaLabel: "Shop Travel Minis",
    href: "/travel-minis",
    bgClassName: "bg-[radial-gradient(circle_at_80%_70%,_#1a1a1a,_#000000_60%)]",
  },
];

const AUTOPLAY_MS = 6000;
const SWIPE_THRESHOLD_PX = 40;

const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

export function HeroSlider() {
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

  const goTo = useCallback((next: number) => {
    setIndex(((next % slides.length) + slides.length) % slides.length);
  }, []);
  const goNext = useCallback(() => goTo(index + 1), [goTo, index]);
  const goPrev = useCallback(() => goTo(index - 1), [goTo, index]);

  const autoplayActive = isPlaying && !isInteracting && !prefersReducedMotion;

  useEffect(() => {
    if (!autoplayActive) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % slides.length);
    }, AUTOPLAY_MS);
    return () => window.clearInterval(timer);
  }, [autoplayActive]);

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

  const current = slides[index];

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
      <div className="relative h-[480px] sm:h-[520px] lg:h-[600px]">
        {slides.map((slide, slideIndex) => {
          const isActive = slideIndex === index;
          return (
            <div
              key={slide.headline}
              role="group"
              aria-roledescription="slide"
              aria-label={`${slideIndex + 1} of ${slides.length}`}
              aria-hidden={!isActive}
              inert={!isActive}
              className={`absolute inset-0 flex items-center transition-opacity duration-[var(--motion-fast)] ease-out ${slide.bgClassName} ${
                isActive ? "opacity-100" : "pointer-events-none opacity-0"
              }`}
            >
              <div className="mx-auto w-full max-w-7xl px-[var(--space-4)]">
                <div className="max-w-xl">
                  <p className="text-xs font-semibold tracking-[0.3em] text-ondark-secondary uppercase">
                    {slide.eyebrow}
                  </p>
                  <h2 className="font-display mt-[var(--space-3)] text-lg text-ondark sm:text-xl">
                    {slide.headline}
                  </h2>
                  <p className="mt-[var(--space-3)] max-w-md text-sm text-ondark-secondary">
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
        Slide {index + 1} of {slides.length}: {current.headline}
      </p>

      <button
        type="button"
        onClick={goPrev}
        className={`absolute top-1/2 left-[var(--space-4)] flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-[var(--radius-xs)] bg-surface-base/40 text-ondark hover:bg-surface-base/70 ${focusRing}`}
        aria-label="Previous slide"
      >
        <ChevronLeftIcon className="h-6 w-6" />
      </button>
      <button
        type="button"
        onClick={goNext}
        className={`absolute top-1/2 right-[var(--space-4)] flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-[var(--radius-xs)] bg-surface-base/40 text-ondark hover:bg-surface-base/70 ${focusRing}`}
        aria-label="Next slide"
      >
        <ChevronRightIcon className="h-6 w-6" />
      </button>

      {/* Required alongside autoplay: WCAG 2.2.2 Pause, Stop, Hide */}
      {/* <button
        type="button"
        onClick={() => setIsPlaying((playing) => !playing)}
        className={`absolute right-[var(--space-4)] bottom-[var(--space-4)] flex h-11 items-center gap-[var(--space-1)] rounded-[var(--radius-xs)] bg-surface-base/40 px-[var(--space-3)] text-xs font-semibold text-ondark hover:bg-surface-base/70 ${focusRing}`}
        aria-label={isPlaying ? "Pause slideshow" : "Play slideshow"}
      >
        {isPlaying ? "Pause" : "Play"}
      </button> */}

      <div className="absolute bottom-[var(--space-4)] left-1/2 flex -translate-x-1/2 gap-[var(--space-2)]">
        {slides.map((slide, slideIndex) => (
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
