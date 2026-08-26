"use client";

import Image from "next/image";
import { useState } from "react";

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

  if (!images || images.length === 0) {
    return (
      <div className="gallery-main-empty">No Image Available</div>
    );
  }

  const total = images.length;
  const selectedImage = images[selectedIndex];

  const prev = () => setSelectedIndex((i) => (i - 1 + total) % total);
  const next = () => setSelectedIndex((i) => (i + 1) % total);

  return (
    <div className="product-gallery">
      {/* Thumbnail Strip — hidden on mobile, vertical left column on desktop */}
      {total > 1 && (
        <div className="gallery-thumbnails" role="listbox" aria-label="Product images">
          {images.map((img, i) => (
            <button
              key={i}
              role="option"
              aria-selected={i === selectedIndex}
              onClick={() => setSelectedIndex(i)}
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
      <div className="gallery-main">
        <div className="gallery-main-image">
          <Image
            src={selectedImage.url}
            alt={selectedImage.altText || title}
            fill
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 60vw, 45vw"
            className="object-contain gallery-main-img"
          />

          {/* Arrow nav — mobile only */}
          {total > 1 && (
            <>
              <button
                onClick={prev}
                className="gallery-arrow gallery-arrow--prev"
                aria-label="Previous image"
              >
                <svg width="10" height="18" viewBox="0 0 10 18" fill="none" aria-hidden="true">
                  <path d="M9 1L1 9L9 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <button
                onClick={next}
                className="gallery-arrow gallery-arrow--next"
                aria-label="Next image"
              >
                <svg width="10" height="18" viewBox="0 0 10 18" fill="none" aria-hidden="true">
                  <path d="M1 1L9 9L1 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </>
          )}
        </div>

        {/* Dash indicators — mobile only */}
        {total > 1 && (
          <div className="gallery-dashes" aria-hidden="true">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setSelectedIndex(i)}
                className={`gallery-dash${i === selectedIndex ? " gallery-dash--active" : ""}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
