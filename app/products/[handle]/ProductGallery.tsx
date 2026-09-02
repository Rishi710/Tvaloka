"use client";

import Image from "next/image";
import { useState, useRef, useEffect, useCallback } from "react";

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
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isUserScrollingRef = useRef(false);

  if (!images || images.length === 0) {
    return <div className="gallery-main-empty">No Image Available</div>;
  }

  const total = images.length;

  const scrollToSlide = useCallback((index: number) => {
    const nextIndex = (index + total) % total;
    setSelectedIndex(nextIndex);

    const container = scrollContainerRef.current;
    if (container) {
      container.scrollTo({
        left: nextIndex * container.clientWidth,
        behavior: "smooth",
      });
    }
  }, [total]);

  const prev = () => scrollToSlide(selectedIndex - 1);
  const next = () => scrollToSlide(selectedIndex + 1);

  // Handle manual touch/scroll on mobile
  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    if (width > 0) {
      const newIndex = Math.round(container.scrollLeft / width);
      if (newIndex >= 0 && newIndex < total && newIndex !== selectedIndex) {
        setSelectedIndex(newIndex);
      }
    }
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
              onClick={() => scrollToSlide(i)}
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

      {/* Main image area with touch/swipe by hand on mobile */}
      <div className="gallery-main relative">
        {/* Mobile: Scrollable Snap Track / Desktop: Fixed Main View */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="gallery-main-image flex overflow-x-auto snap-x snap-mandatory scrollbar-hide touch-pan-x sm:overflow-hidden sm:block"
        >
          {images.map((img, i) => (
            <div
              key={i}
              className={`relative aspect-[4/5] w-full flex-shrink-0 snap-center sm:absolute sm:inset-0 transition-opacity duration-300 ${i === selectedIndex
                ? "sm:opacity-100 sm:pointer-events-auto sm:z-10"
                : "sm:opacity-0 sm:pointer-events-none sm:z-0"
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
        </div>

        {/* Arrow nav — clearly visible floating on left and right edges on mobile */}
        {total > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              className="absolute left-2.5 top-1/2 z-20 -translate-y-1/2 flex h-8.5 w-8.5 items-center justify-center rounded-full bg-white/90 text-black shadow-md border border-black/10 backdrop-blur-sm transition-all hover:bg-black hover:text-white active:scale-95 sm:hidden"
              aria-label="Previous image"
            >
              <svg width="8" height="14" viewBox="0 0 10 18" fill="none" aria-hidden="true">
                <path d="M9 1L1 9L9 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              type="button"
              onClick={next}
              className="absolute right-2.5 top-1/2 z-20 -translate-y-1/2 flex h-8.5 w-8.5 items-center justify-center rounded-full bg-white/90 text-black shadow-md border border-black/10 backdrop-blur-sm transition-all hover:bg-black hover:text-white active:scale-95 sm:hidden"
              aria-label="Next image"
            >
              <svg width="8" height="14" viewBox="0 0 10 18" fill="none" aria-hidden="true">
                <path d="M1 1L9 9L1 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </>
        )}

        {/* Dash indicators — mobile only */}
        {total > 1 && (
          <div className="gallery-dashes pt-5" aria-hidden="true">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => scrollToSlide(i)}
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

