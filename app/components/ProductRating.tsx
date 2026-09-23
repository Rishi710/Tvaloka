"use client";

import { useEffect, useState } from "react";

/** Renders 5 gold stars plus the numeric average and review count. */
export function StarRating({
  rating,
  reviewCount,
  size = "sm",
}: {
  rating: number;
  reviewCount: number;
  size?: "sm" | "md";
}) {
  const starClass = size === "md" ? "size-4" : "size-3.5";
  const textClass = size === "md" ? "text-xs" : "text-[11px]";
  return (
    <div
      className="flex items-center gap-1.5"
      aria-label={`Rated ${rating.toFixed(1)} out of 5 stars, ${reviewCount} reviews`}
    >
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }, (_, i) => {
          const filled = i + 1 <= Math.round(rating);
          return (
            <svg
              key={i}
              viewBox="0 0 20 20"
              aria-hidden="true"
              focusable="false"
              className={`${starClass} text-[#FBBF24]`}
            >
              <polygon
                points="10,2 12.35,7.5 18.5,8.1 14,12.1 15.4,18 10,15 4.6,18 6,12.1 1.5,8.1 7.65,7.5"
                fill={filled ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth={filled ? "0" : "1.2"}
              />
            </svg>
          );
        })}
      </div>
      <span className={`${textClass} font-semibold text-black`}>{rating.toFixed(1)}</span>
      <span className={`${textClass} text-[#707070]`}>({reviewCount} reviews)</span>
    </div>
  );
}

/**
 * Fetches a product's real rating from Judge.me (same source as the PDP's
 * review section) and renders it via <StarRating>. Renders nothing while
 * loading, on failure, or when the product genuinely has no reviews yet —
 * never a placeholder or fabricated rating.
 */
export function ProductRating({
  productId,
  size = "sm",
  className = "",
}: {
  /** Shopify GID, e.g. "gid://shopify/Product/123456". */
  productId: string;
  size?: "sm" | "md";
  className?: string;
}) {
  const [review, setReview] = useState<{ averageRating: number; totalReviews: number } | null>(
    null,
  );

  useEffect(() => {
    let cancelled = false;
    const numericId = productId.split("/").pop();
    if (!numericId) return;

    fetch(`/api/reviews?productId=${numericId}`, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || !data || typeof data.averageRating !== "number") return;
        if (data.totalReviews > 0) {
          setReview({ averageRating: data.averageRating, totalReviews: data.totalReviews });
        }
      })
      .catch(() => {
        // No reviews service reachable — stays hidden.
      });

    return () => {
      cancelled = true;
    };
  }, [productId]);

  if (!review) return null;

  return (
    <div className={className}>
      <StarRating rating={review.averageRating} reviewCount={review.totalReviews} size={size} />
    </div>
  );
}
