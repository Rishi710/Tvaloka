"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CloseIcon } from "./icons";

// Session storage key to avoid repeatedly annoying users after they close the popup
const POPUP_STORAGE_KEY = "tvaloka_home_popup_dismissed";

// Default promo lifestyle image for the right side
export const DEFAULT_POPUP_IMAGE = "/Image/img-1.jpg";

type HomePopupProps = {
  /** Eyebrow text (e.g. WELCOME!!) */
  eyebrow?: string;
  /** Main promotional headline */
  title?: string;
  /** Coupon discount code */
  code?: string;
  /** Subtitle instruction text */
  subtext?: string;
  /** CTA button label */
  ctaText?: string;
  /** Destination for the CTA button */
  ctaHref?: string;
  /** Small legal or terms disclaimer */
  termsText?: string;
  /** Image URL for the right-hand column */
  imageSrc?: string;
  /** Image alt description */
  altText?: string;
  /** Delay before popup appears in ms (default: 5000ms = 5s) */
  delayMs?: number;
  /** Whether to persist dismissal across page reloads in the same session (default: true) */
  persistInSession?: boolean;
};

export function HomePopup({
  eyebrow = "WELCOME!!",
  title = "10% off your first purchase",
  code = "FIRST10",
  subtext,
  ctaText = "SHOP NOW",
  ctaHref = "/products",
  termsText = "*Terms and conditions apply",
  imageSrc = DEFAULT_POPUP_IMAGE,
  altText = "Special welcome offer - Tvaloka Wellness",
  delayMs = 5000,
  persistInSession = true,
}: HomePopupProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isRendered, setIsRendered] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    if (persistInSession) {
      try {
        sessionStorage.setItem(POPUP_STORAGE_KEY, "true");
      } catch {
        // Fallback
      }
    }
    // Remove from DOM after transition completes
    setTimeout(() => {
      setIsRendered(false);
    }, 300);
  }, [persistInSession]);

  useEffect(() => {
    // Check if dismissed in this browser session
    if (persistInSession) {
      try {
        if (sessionStorage.getItem(POPUP_STORAGE_KEY) === "true") {
          return;
        }
      } catch {
        // Fallback if sessionStorage is blocked
      }
    }

    // Trigger popup after 5 seconds delay
    const timer = setTimeout(() => {
      setIsRendered(true);
      requestAnimationFrame(() => {
        setIsOpen(true);
      });
    }, delayMs);

    return () => clearTimeout(timer);
  }, [delayMs, persistInSession]);

  // Handle Escape key
  useEffect(() => {
    if (!isOpen) return;

    closeButtonRef.current?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        handleClose();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, handleClose]);

  if (!isRendered) return null;

  return (
    <aside
      aria-label="Welcome announcement"
      className={[
        "fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 transition-all duration-300 ease-out",
        isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
      ].join(" ")}
    >
      {/* ── Backdrop ──────────────────────────────────────────────────────── */}
      <div
        aria-hidden="true"
        onClick={handleClose}
        className={[
          "absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0",
        ].join(" ")}
      />

      {/* ── Modal Card ────────────────────────────────────────────────────── */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={[
          "relative z-10 w-full max-w-[360px] sm:max-w-lg md:max-w-2xl lg:max-w-3xl overflow-hidden rounded-xl sm:rounded-2xl bg-surface-base shadow-2xl ring-1 ring-black/10 transition-all duration-300 ease-out",
          isOpen ? "scale-100 opacity-100 translate-y-0" : "scale-95 opacity-0 translate-y-2",
        ].join(" ")}
      >
        {/* Close button at top right corner */}
        <button
          ref={closeButtonRef}
          type="button"
          onClick={handleClose}
          aria-label="Close popup"
          className="absolute top-2 right-2 sm:top-3 sm:right-3 z-30 flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-white/90 text-primary shadow-sm backdrop-blur-sm transition-all duration-150 hover:bg-white hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#73290a] cursor-pointer"
        >
          <CloseIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </button>

        {/* 2-column side-by-side layout across all viewports */}
        <div className="grid grid-cols-[1.18fr_0.82fr] sm:grid-cols-2">
          {/* Left Column: Offer Content */}
          <div className="flex flex-col items-center justify-center px-3 py-4 text-center sm:px-6 sm:py-8 md:p-10 lg:p-12">
            {/* Eyebrow */}
            <p className="text-[10px] font-bold tracking-[0.2em] text-[#73290a] uppercase sm:text-xs sm:tracking-[0.25em]">
              {eyebrow}
            </p>

            {/* Headline */}
            <h2 className="font-display mt-1.5 sm:mt-3 text-[15px] sm:text-xl md:text-2xl lg:text-3xl font-bold tracking-tight text-primary leading-tight sm:leading-snug">
              {title}
            </h2>

            {/* Description / Code */}
            <p className="mt-1 sm:mt-2.5 max-w-[170px] sm:max-w-xs text-[10px] sm:text-xs text-tertiary leading-tight sm:leading-relaxed">
              {subtext ?? (
                <>
                  Simply enter code{" "}
                  <strong className="font-bold text-primary tracking-wider">{code}</strong>
                  <br className="hidden sm:inline" /> at checkout*
                </>
              )}
            </p>

            {/* Shop Now CTA Button */}
            <Link
              href={ctaHref}
              onClick={handleClose}
              className="mt-2.5 sm:mt-5 md:mt-6 inline-flex items-center justify-center rounded-[var(--radius-xs)] bg-[#73290a] px-3.5 py-1.5 sm:px-6 sm:py-2.5 md:px-8 md:py-3 text-[10px] sm:text-xs font-semibold tracking-[0.15em] sm:tracking-[0.2em] text-ondark uppercase transition-all duration-200 hover:bg-[#5a1f07] hover:shadow-md active:scale-95 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#73290a]"
            >
              {ctaText}
            </Link>

            {/* Disclaimer */}
            {termsText && (
              <p className="mt-1.5 sm:mt-3 md:mt-4 text-[8px] sm:text-[10px] text-tertiary">
                {termsText}
              </p>
            )}
          </div>

          {/* Right Column: Lifestyle Image */}
          <div className="relative min-h-[190px] sm:min-h-[250px] md:min-h-[340px] w-full overflow-hidden bg-surface-muted">
            <Image
              src={imageSrc}
              alt={altText}
              fill
              sizes="(min-width: 768px) 384px, 45vw"
              className="object-cover object-top"
              priority
            />
          </div>
        </div>
      </div>
    </aside>
  );
}
