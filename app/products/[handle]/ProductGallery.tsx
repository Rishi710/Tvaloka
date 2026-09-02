"use client";

import Image from "next/image";
import { useState, useRef, useCallback } from "react";

interface GalleryImage {
  url: string;
  altText?: string | null;
}

interface ProductGalleryProps {
  images: GalleryImage[];
  title: string;
}

export default function ProductGallery({ images, title }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Touch tracking refs — no state to avoid re-renders during swipe
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const swipeHandled = useRef(false);

  if (!images || images.length === 0) {
    return <div className="gallery-main-empty">No Image Available</div>;
  }

  const total = images.length;

  const goTo = useCallback(
    (index: number) => {
      setSelectedIndex(((index % total) + total) % total);
    },
    [total]
  );

  const prev = () => goTo(selectedIndex - 1);
  const next = () => goTo(selectedIndex + 1);

  // ─── Touch Handlers ────────────────────────────────────────────────────────
  // Strategy: on touchstart, record position.
  // On touchmove, if the swipe is MORE horizontal than vertical → preventDefault
  // to stop the page from scrolling and mark as horizontal.
  // On touchend, if horizontal swipe distance > threshold → navigate.
  // Otherwise, do nothing (let vertical scroll pass through to the page).

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    swipeHandled.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;

    const dx = e.touches[0].clientX - touchStartX.current;
    const dy = e.touches[0].clientY - touchStartY.current;

    // Only lock into horizontal mode when clearly swiping horizontally
    if (Math.abs(dx) > Math.abs(dy) + 6) {
      e.preventDefault(); // stop page vertical scroll
      swipeHandled.current = true;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!swipeHandled.current || touchStartX.current === null) return;

    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const THRESHOLD = 40; // px minimum swipe distance

    if (dx < -THRESHOLD) {
      next();
    } else if (dx > THRESHOLD) {
      prev();
    }

    touchStartX.current = null;
    touchStartY.current = null;
    swipeHandled.current = false;
  };

  return (
    <div className="product-gallery">
      {/* Thumbnail Strip — hidden on mobile, vertical left column on desktop */}
      {total > 1 && (
        <div className="gallery-thumbnails" role="listbox" aria-label="Product images">
          {images.map((img, i) => (
            <button
              key={i}
              type="button"
              role="option"
              aria-selected={i === selectedIndex}
              onClick={() => goTo(i)}
              className={`gallery-thumb-btn${i === selectedIndex ? " gallery-thumb-btn--active" : ""}`}
              aria-label={img.altText || `${title} image ${i + 1}`}
            >
              <div className="gallery-thumb-inner">
                <Image
                  src={img.url}
                  alt={img.altText || `${title} ${i + 1}`}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Main image area */}
      <div className="gallery-main relative">
        {/* Image container — NO overflow scroll, touch events handled manually */}
        <div
          className="gallery-main-image relative overflow-hidden"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {images.map((img, i) => (
            <div
              key={i}
              className={`absolute inset-0 transition-opacity duration-300 ${
                i === selectedIndex
                  ? "opacity-100 pointer-events-auto z-10"
                  : "opacity-0 pointer-events-none z-0"
              }`}
            >
              <Image
                src={img.url}
                alt={img.altText || `${title} image ${i + 1}`}
                fill
                priority={i === 0}
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 60vw, 45vw"
                className="object-contain gallery-main-img"
              />
            </div>
          ))}

          {/* Arrow nav — visible on mobile, hidden on desktop (desktop uses thumbnails) */}
          {total > 1 && (
            <>
              <button
                type="button"
                onClick={prev}
                className="absolute left-2.5 top-1/2 z-20 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-black shadow-md border border-black/10 backdrop-blur-sm transition-all hover:bg-black hover:text-white active:scale-95 sm:hidden"
                aria-label="Previous image"
              >
                <svg width="8" height="14" viewBox="0 0 10 18" fill="none" aria-hidden="true">
                  <path d="M9 1L1 9L9 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button
                type="button"
                onClick={next}
                className="absolute right-2.5 top-1/2 z-20 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-black shadow-md border border-black/10 backdrop-blur-sm transition-all hover:bg-black hover:text-white active:scale-95 sm:hidden"
                aria-label="Next image"
              >
                <svg width="8" height="14" viewBox="0 0 10 18" fill="none" aria-hidden="true">
                  <path d="M1 1L9 9L1 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </>
          )}
        </div>

        {/* Dash indicators — mobile only */}
        {total > 1 && (
          <div className="gallery-dashes pt-3" aria-hidden="true">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i)}
                className={`gallery-dash${i === selectedIndex ? " gallery-dash--active" : ""}`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
