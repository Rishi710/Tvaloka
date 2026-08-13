"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "./icons";

const messages = [
  "We deliver across India & internationally.",
  "Complimentary shipping on orders above ₹1,999.",
  "Handcrafted in small batches using traditional Ayurvedic recipes.",
];

const ROTATE_MS = 5000;

const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

export function AnnouncementBar() {
  const [index, setIndex] = useState(0);
  const [isInteracting, setIsInteracting] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() =>
    typeof window === "undefined"
      ? false
      : window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = (event: MediaQueryListEvent) => setPrefersReducedMotion(event.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  const goTo = useCallback((next: number) => {
    setIndex(((next % messages.length) + messages.length) % messages.length);
  }, []);
  const goNext = useCallback(() => goTo(index + 1), [goTo, index]);
  const goPrev = useCallback(() => goTo(index - 1), [goTo, index]);

  const autoplayActive = !isInteracting && !prefersReducedMotion;

  useEffect(() => {
    if (!autoplayActive) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % messages.length);
    }, ROTATE_MS);
    return () => window.clearInterval(timer);
  }, [autoplayActive]);

  function onBlurCapture(event: React.FocusEvent) {
    if (!barRef.current?.contains(event.relatedTarget as Node)) {
      setIsInteracting(false);
    }
  }

  return (
    <div
      ref={barRef}
      role="region"
      aria-label="Store announcements"
      className="bg-surface-base text-ondark"
      onMouseEnter={() => setIsInteracting(true)}
      onMouseLeave={() => setIsInteracting(false)}
      onFocus={() => setIsInteracting(true)}
      onBlur={onBlurCapture}
    >
      <div className="relative mx-auto flex max-w-7xl items-center justify-center gap-[var(--space-2)] px-[var(--space-6)] py-[var(--space-2)]">
        <button
          type="button"
          onClick={goPrev}
          className={`flex h-4 w-4 shrink-0 items-center justify-center text-ondark-secondary hover:text-ondark ${focusRing}`}
          aria-label="Previous announcement"
        >
          <ChevronLeftIcon className="h-4 w-4" />
        </button>
        <div className="relative h-4 w-full max-w-md overflow-hidden text-center">
          {messages.map((message, messageIndex) => (
            <p
              key={message}
              aria-hidden={messageIndex !== index}
              className={`absolute inset-0 text-xs font-medium tracking-wide transition-opacity duration-[var(--motion-fast)] ease-out ${
                messageIndex === index ? "opacity-100" : "pointer-events-none opacity-0"
              }`}
            >
              {message}
            </p>
          ))}
        </div>
        <button
          type="button"
          onClick={goNext}
          className={`flex h-4 w-4 shrink-0 items-center justify-center text-ondark-secondary hover:text-ondark ${focusRing}`}
          aria-label="Next announcement"
        >
          <ChevronRightIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
