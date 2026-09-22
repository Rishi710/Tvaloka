"use client";

import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";

/* ─── helpers ─────────────────────────────────────────────────────── */

function extractNumericId(gid: string): string {
  const parts = gid.split("/");
  return parts[parts.length - 1];
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

/* ─── Star Icon ───────────────────────────────────────────────────── */

function StarIcon({
  filled = true,
  half = false,
  className = "h-4 w-4",
}: {
  filled?: boolean;
  half?: boolean;
  className?: string;
}) {
  if (half) {
    return (
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className={`${className} text-[#d97706]`}
        fill="currentColor"
      >
        <defs>
          <linearGradient id="half-star" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="50%" stopColor="currentColor" />
            <stop offset="50%" stopColor="#e5e5e5" />
          </linearGradient>
        </defs>
        <path
          fill="url(#half-star)"
          d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={`${className} ${filled ? "text-[#d97706]" : "text-[#e5e5e5]"}`}
      fill="currentColor"
    >
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" | "lg" }) {
  const sizeClass = size === "lg" ? "h-5 w-5" : size === "md" ? "h-4 w-4" : "h-3.5 w-3.5";
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = rating >= star;
        const isHalf = !isFilled && rating >= star - 0.5;
        return <StarIcon key={star} filled={isFilled} half={isHalf} className={sizeClass} />;
      })}
    </div>
  );
}

/* ─── Interactive Star picker for Form ────────────────────────────── */

function StarPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hovered, setHovered] = useState(0);
  const labels = ["Poor", "Fair", "Good", "Very Good", "Excellent"];

  return (
    <div className="flex flex-col items-start gap-1.5">
      <div className="flex gap-1" role="group" aria-label="Star rating selection">
        {[1, 2, 3, 4, 5].map((star) => {
          const isSelected = star <= (hovered || value);
          return (
            <button
              key={star}
              type="button"
              aria-label={`${star} star${star > 1 ? "s" : ""} — ${labels[star - 1]}`}
              onClick={() => onChange(star)}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              className="cursor-pointer p-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black rounded"
            >
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className={`h-7 w-7 transition-colors duration-150 ${
                  isSelected ? "text-[#d97706]" : "text-[#d5d5d5]"
                }`}
                fill="currentColor"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </button>
          );
        })}
      </div>
      {hovered || value ? (
        <p className="text-[11px] font-semibold text-[#555555] uppercase tracking-wider">
          {labels[(hovered || value) - 1]}
        </p>
      ) : (
        <p className="text-[11px] text-[#888888]">Tap to rate</p>
      )}
    </div>
  );
}

/* ─── Form Field Helper ───────────────────────────────────────────── */

function Field({
  label,
  id,
  error,
  children,
}: {
  label: string;
  id: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-semibold uppercase tracking-wider text-black">
        {label}
      </label>
      {children}
      {error && (
        <p className="text-[11px] text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border border-[#d5d5d5] bg-white px-3.5 py-2.5 text-sm text-black placeholder:text-[#aaaaaa] outline-none transition-colors focus:border-black focus:ring-1 focus:ring-black";

/* ─── Write a Review Modal ────────────────────────────────────────── */

interface WriteReviewModalProps {
  productId: string;
  productTitle: string;
  onClose: () => void;
  onSuccess: () => void;
}

type SubmitState = "idle" | "submitting" | "success" | "error";

function WriteReviewModal({
  productId,
  productTitle,
  onClose,
  onSuccess,
}: WriteReviewModalProps) {
  const [rating, setRating] = useState(5);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [submitError, setSubmitError] = useState<string>("");
  const overlayRef = useRef<HTMLDivElement>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    firstFieldRef.current?.focus();
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onClose]);

  function validate() {
    const e: Record<string, string> = {};
    if (!rating) e.rating = "Please select a star rating.";
    if (!name.trim()) e.name = "Your name is required.";
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      e.email = "A valid email address is required.";
    if (!body.trim() || body.trim().length < 5)
      e.body = "Review must be at least 5 characters.";
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setErrors({});
    setSubmitState("submitting");

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, name, email, rating, title, body }),
      });

      const d = (await res.json().catch(() => ({}))) as { error?: string; success?: boolean };

      if (!res.ok || !d.success) {
        setSubmitError(d.error ?? "Submission failed. Please try again.");
        setSubmitState("error");
        return;
      }

      setSubmitState("success");
      onSuccess();
    } catch (err) {
      setSubmitError(String(err));
      setSubmitState("error");
    }
  }

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-5 bg-black/60 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Write a review"
    >
      <div className="relative w-full max-w-lg max-h-[94vh] overflow-y-auto bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl">
        {/* Modal Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#eeeeee] bg-white px-5 sm:px-6 py-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#888888]">
              Share Your Experience
            </p>
            <h3 className="font-display mt-0.5 text-xl font-normal text-black tracking-wide">
              Write a Review
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close review form"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f4f4f4] text-[#666666] transition-colors hover:bg-black hover:text-white cursor-pointer"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="h-4 w-4" aria-hidden="true">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </div>

        {submitState === "success" ? (
          <div className="flex flex-col items-center gap-4 px-6 py-14 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-black text-white">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" aria-hidden="true">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </div>
            <div>
              <p className="text-base font-semibold text-black">Thank you for your review!</p>
              <p className="mt-1 text-xs text-[#888888] max-w-xs mx-auto">
                Your review for <span className="font-semibold text-black">{productTitle}</span> has been submitted and is being processed.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="mt-2 rounded-full border border-black bg-black px-7 py-2.5 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-white hover:text-black cursor-pointer"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="px-5 sm:px-6 py-6 flex flex-col gap-5">
            {/* Product context */}
            <div className="rounded-lg bg-[#f7f7f7] px-3.5 py-2.5">
              <p className="text-[11px] text-[#888888]">Reviewing</p>
              <p className="text-xs font-semibold text-black line-clamp-1">{productTitle}</p>
            </div>

            {/* Rating */}
            <Field label="Your Rating" id="rating" error={errors.rating}>
              <StarPicker
                value={rating}
                onChange={(v) => {
                  setRating(v);
                  setErrors((p) => ({ ...p, rating: "" }));
                }}
              />
            </Field>

            {/* Name + Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Your Name" id="rev-name" error={errors.name}>
                <input
                  ref={firstFieldRef}
                  id="rev-name"
                  type="text"
                  autoComplete="name"
                  placeholder="e.g. Ram"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setErrors((p) => ({ ...p, name: "" }));
                  }}
                  className={inputCls}
                />
              </Field>
              <Field label="Email Address" id="rev-email" error={errors.email}>
                <input
                  id="rev-email"
                  type="email"
                  autoComplete="email"
                  placeholder="ram@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrors((p) => ({ ...p, email: "" }));
                  }}
                  className={inputCls}
                />
              </Field>
            </div>
            <p className="text-[10px] text-[#888888] -mt-3">
              Your email will remain private and won&apos;t be publicly displayed.
            </p>

            {/* Review Title */}
            <Field label="Review Title (optional)" id="rev-title">
              <input
                id="rev-title"
                type="text"
                placeholder="e.g. Smells wonderful, works great!"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={inputCls}
              />
            </Field>

            {/* Review Body */}
            <Field label="Your Review" id="rev-body" error={errors.body}>
              <textarea
                id="rev-body"
                rows={4}
                placeholder="Share your honest thoughts and experience with this product…"
                value={body}
                onChange={(e) => {
                  setBody(e.target.value);
                  setErrors((p) => ({ ...p, body: "" }));
                }}
                className={`${inputCls} resize-none`}
              />
              <p className="text-[10px] text-[#888888] text-right">{body.length} / 2000</p>
            </Field>

            {/* Server Error */}
            {submitState === "error" && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-xs text-red-700" role="alert">
                <p className="font-semibold">Submission failed</p>
                {submitError && <p className="mt-0.5 opacity-90">{submitError}</p>}
              </div>
            )}

            {/* Submit CTA */}
            <button
              type="submit"
              disabled={submitState === "submitting"}
              className="mt-1 inline-flex items-center justify-center gap-2 rounded-full border border-black bg-black px-8 py-3 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-white hover:text-black disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {submitState === "submitting" ? (
                <>
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Submitting…
                </>
              ) : (
                "Submit Review"
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

/* ─── Skeleton ────────────────────────────────────────────────────── */

function ReviewsSkeleton() {
  return (
    <div className="space-y-4" aria-label="Loading reviews…">
      {[1, 2].map((i) => (
        <div key={i} className="rounded-xl border border-[#eeeeee] bg-white p-6 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-[#f0f0f0] animate-pulse" />
              <div className="space-y-1.5">
                <div className="h-3.5 w-28 rounded bg-[#f0f0f0] animate-pulse" />
                <div className="h-3 w-16 rounded bg-[#f0f0f0] animate-pulse" />
              </div>
            </div>
            <div className="h-3 w-20 rounded bg-[#f0f0f0] animate-pulse" />
          </div>
          <div className="h-4 w-48 rounded bg-[#f0f0f0] animate-pulse" />
          <div className="h-3.5 w-full rounded bg-[#f0f0f0] animate-pulse" />
          <div className="h-3.5 w-3/4 rounded bg-[#f0f0f0] animate-pulse" />
        </div>
      ))}
    </div>
  );
}

/* ─── Types ────────────────────────────────────────────────────────── */

interface ParsedReview {
  id: string;
  rating: number;
  date: string;
  author: string;
  title: string;
  body: string;
  verifiedBuyer: boolean;
}

interface HistogramItem {
  rating: number;
  count: number;
  percentage: number;
}

interface ReviewsSectionProps {
  productId: string;
  productTitle: string;
}

type LoadState = "idle" | "loading" | "done" | "error";

/* ─── Main Component ──────────────────────────────────────────────── */

export function ReviewsSection({ productId, productTitle }: ReviewsSectionProps) {
  const numericId = extractNumericId(productId);

  const [reviews, setReviews] = useState<ParsedReview[]>([]);
  const [totalReviews, setTotalReviews] = useState<number>(0);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [histogram, setHistogram] = useState<HistogramItem[]>([]);
  const [loadState, setLoadState] = useState<LoadState>("idle");
  const [showForm, setShowForm] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<"newest" | "highest" | "lowest">("newest");
  const sectionRef = useRef<HTMLElement>(null);

  const fetchReviews = useCallback(() => {
    setLoadState("loading");
    fetch(`/api/reviews?productId=${numericId}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d: {
        totalReviews?: number;
        averageRating?: number;
        histogram?: HistogramItem[];
        reviews?: ParsedReview[];
      }) => {
        setReviews(d.reviews ?? []);
        setTotalReviews(d.totalReviews ?? (d.reviews ? d.reviews.length : 0));
        setAverageRating(d.averageRating ?? 0);
        setHistogram(d.histogram ?? []);
        setLoadState("done");
      })
      .catch(() => setLoadState("error"));
  }, [numericId]);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && loadState === "idle") {
          fetchReviews();
          obs.disconnect();
        }
      },
      { rootMargin: "300px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [fetchReviews, loadState]);

  // Filter & Sort
  const filteredAndSortedReviews = useMemo(() => {
    let list = [...reviews];
    if (selectedRating !== null) {
      list = list.filter((r) => r.rating === selectedRating);
    }
    list.sort((a, b) => {
      if (sortBy === "highest") return b.rating - a.rating;
      if (sortBy === "lowest") return a.rating - b.rating;
      // newest
      const dateA = a.date ? new Date(a.date).getTime() : 0;
      const dateB = b.date ? new Date(b.date).getTime() : 0;
      return dateB - dateA;
    });
    return list;
  }, [reviews, selectedRating, sortBy]);

  return (
    <section
      ref={sectionRef}
      id="product-reviews"
      className="mt-16 sm:mt-24 border-t border-[#e5e5e5] pt-12 sm:pt-16 px-4 sm:px-0"
      aria-label="Customer reviews"
    >
      {/* ── Section Header ── */}
      <div className="mb-8 sm:mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="text-left">
          <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.25em] text-[#666666]">
            Customer Reviews
          </p>
          <h2 className="font-display mt-2 text-2xl sm:text-3xl font-normal text-black tracking-wide">
            What Our Customers Say
          </h2>
          <p className="mt-1.5 text-xs text-[#888888] max-w-md">
            Verified feedback from customers who have experienced{" "}
            <span className="font-semibold text-black">{productTitle}</span>.
          </p>
        </div>

        <button
          type="button"
          id="write-review-btn"
          onClick={() => setShowForm(true)}
          className="inline-flex shrink-0 items-center gap-2 self-start sm:self-auto rounded-full border border-black bg-black px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-white hover:text-black cursor-pointer shadow-sm"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-3.5 w-3.5"
            aria-hidden="true"
          >
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
          </svg>
          Write a Review
        </button>
      </div>

      {/* Thank you notification after submitting */}
      {reviewSubmitted && !showForm && (
        <div className="mb-8 flex items-center gap-3 rounded-xl border border-[#d5d5d5] bg-[#fafafa] px-5 py-4">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-black text-white">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5" aria-hidden="true">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-semibold text-black">Review submitted!</p>
            <p className="text-[11px] text-[#666666]">
              Thank you for sharing your experience. Your review is being synced with Judge.me.
            </p>
          </div>
        </div>
      )}

      {/* Loading */}
      {loadState === "loading" && <ReviewsSkeleton />}

      {/* Error state */}
      {loadState === "error" && (
        <div className="flex flex-col items-center gap-4 rounded-xl border border-[#eeeeee] bg-[#fafafa] py-14 text-center">
          <p className="text-sm text-[#888888]">Reviews couldn&apos;t be loaded right now.</p>
          <button
            type="button"
            onClick={fetchReviews}
            className="rounded-full border border-black bg-white px-5 py-2 text-xs font-semibold uppercase tracking-wider text-black transition-colors hover:bg-black hover:text-white cursor-pointer"
          >
            Try again
          </button>
        </div>
      )}

      {/* ── Loaded State with Reviews ── */}
      {loadState === "done" && totalReviews > 0 && (
        <div className="space-y-8">
          {/* Rating Summary Card */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 rounded-2xl border border-[#eeeeee] bg-[#fafafa] p-6 sm:p-8">
            {/* Big Rating Block */}
            <div className="md:col-span-4 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-[#e5e5e5] pb-6 md:pb-0 md:pr-6 text-center">
              <span className="font-display text-5xl sm:text-6xl font-normal text-black">
                {averageRating.toFixed(1)}
              </span>
              <div className="mt-2">
                <StarRating rating={averageRating} size="md" />
              </div>
              <p className="mt-2 text-xs font-medium text-[#666666]">
                Based on {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
              </p>
            </div>

            {/* Star Distribution Histogram */}
            <div className="md:col-span-8 flex flex-col justify-center space-y-2">
              {[5, 4, 3, 2, 1].map((star) => {
                const item = histogram.find((h) => h.rating === star);
                const count = item ? item.count : reviews.filter((r) => r.rating === star).length;
                const percentage = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
                const isSelected = selectedRating === star;

                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setSelectedRating(isSelected ? null : star)}
                    className={`group flex items-center gap-3 text-left w-full rounded-md px-2 py-1 transition-colors cursor-pointer ${
                      isSelected ? "bg-black/5 font-semibold" : "hover:bg-black/5"
                    }`}
                  >
                    <div className="flex items-center gap-1 w-14 shrink-0 text-xs text-[#555555]">
                      <span>{star}</span>
                      <StarIcon filled className="h-3.5 w-3.5" />
                    </div>
                    <div className="relative h-2 flex-1 rounded-full bg-[#e5e5e5] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-black transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="w-12 text-right text-xs text-[#888888] tabular-nums shrink-0">
                      {percentage}% ({count})
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Controls: Filter chips + Sort dropdown */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#eeeeee] pb-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-[#888888] uppercase tracking-wider mr-1">
                Filter:
              </span>
              <button
                type="button"
                onClick={() => setSelectedRating(null)}
                className={`rounded-full px-3.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
                  selectedRating === null
                    ? "bg-black text-white"
                    : "bg-[#f0f0f0] text-[#555555] hover:bg-[#e4e4e4]"
                }`}
              >
                All ({totalReviews})
              </button>
              {[5, 4, 3, 2, 1].map((star) => {
                const count = reviews.filter((r) => r.rating === star).length;
                if (count === 0) return null;
                const isSelected = selectedRating === star;
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setSelectedRating(isSelected ? null : star)}
                    className={`rounded-full px-3.5 py-1 text-xs font-medium transition-colors cursor-pointer inline-flex items-center gap-1 ${
                      isSelected
                        ? "bg-black text-white"
                        : "bg-[#f0f0f0] text-[#555555] hover:bg-[#e4e4e4]"
                    }`}
                  >
                    <span>{star}</span>
                    <StarIcon filled={!isSelected} className={`h-3 w-3 ${isSelected ? "text-white" : "text-[#d97706]"}`} />
                    <span>({count})</span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2 text-xs">
              <label htmlFor="sort-reviews" className="text-[#888888] font-medium">
                Sort:
              </label>
              <select
                id="sort-reviews"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "newest" | "highest" | "lowest")}
                className="rounded-lg border border-[#d5d5d5] bg-white px-2.5 py-1 text-xs text-black outline-none focus:border-black cursor-pointer"
              >
                <option value="newest">Most Recent</option>
                <option value="highest">Highest Rating</option>
                <option value="lowest">Lowest Rating</option>
              </select>
            </div>
          </div>

          {/* Reviews List */}
          {filteredAndSortedReviews.length === 0 ? (
            <div className="py-12 text-center text-[#888888]">
              <p className="text-sm">No reviews match the selected filter.</p>
              <button
                type="button"
                onClick={() => setSelectedRating(null)}
                className="mt-2 text-xs font-semibold text-black underline cursor-pointer"
              >
                Show all reviews
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAndSortedReviews.map((rev) => {
                const initial = (rev.author || "V").charAt(0).toUpperCase();
                return (
                  <article
                    key={rev.id}
                    className="rounded-xl border border-[#eeeeee] bg-white p-6 transition-shadow hover:shadow-sm"
                  >
                    {/* Reviewer info row */}
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#111111] text-white text-xs font-medium">
                          {initial}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-semibold text-black">{rev.author}</h4>
                            {rev.verifiedBuyer && (
                              <span className="inline-flex items-center gap-1 rounded bg-[#e8f5e9] px-2 py-0.5 text-[10px] font-semibold text-[#2e7d32]">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} className="h-2.5 w-2.5" aria-hidden="true">
                                  <path d="M20 6 9 17l-5-5" />
                                </svg>
                                Verified Buyer
                              </span>
                            )}
                          </div>
                          {rev.date && (
                            <time className="text-[11px] text-[#888888]" dateTime={rev.date}>
                              {formatDate(rev.date)}
                            </time>
                          )}
                        </div>
                      </div>

                      {/* Stars */}
                      <StarRating rating={rev.rating} size="sm" />
                    </div>

                    {/* Review Title */}
                    {rev.title && (
                      <h5 className="mt-4 text-sm font-semibold text-black">{rev.title}</h5>
                    )}

                    {/* Review Body */}
                    <p className="mt-2 text-sm leading-relaxed text-[#444444] whitespace-pre-line">
                      {rev.body}
                    </p>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Empty State when totalReviews === 0 ── */}
      {loadState === "done" && totalReviews === 0 && !reviewSubmitted && (
        <div className="flex flex-col items-center gap-5 rounded-2xl border border-dashed border-[#d5d5d5] bg-[#fafafa] py-16 px-6 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#f0f0f0] text-[#666666]">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-6 w-6" aria-hidden="true">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </div>
          <div>
            <p className="text-base font-semibold text-black">No reviews yet for {productTitle}</p>
            <p className="mt-1 text-xs text-[#888888]">
              Be the first to share your experience with our community.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 rounded-full border border-black bg-black px-7 py-2.5 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-white hover:text-black cursor-pointer shadow-sm"
          >
            Write the First Review
          </button>
        </div>
      )}

      {/* Write a Review Modal */}
      {showForm && (
        <WriteReviewModal
          productId={numericId}
          productTitle={productTitle}
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            setShowForm(false);
            setReviewSubmitted(true);
            fetchReviews();
          }}
        />
      )}
    </section>
  );
}
