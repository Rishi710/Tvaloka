"use client";

import Image from "next/image";
import Link from "next/link";

const IMAGE_SRC = "https://cdn.shopify.com/s/files/1/1005/3045/4892/files/Why_Ayurveda_Today_jpg.jpg?v=1791375035";

const focusRingOnDark =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

export function RitualSpotlight() {
  return (
    <section className="bg-surface-muted">
      <div className="mx-auto grid max-w-7xl items-center gap-[var(--space-6)] px-[var(--space-4)] py-[var(--space-4)] sm:py-[var(--space-4)] md:grid-cols-2 md:gap-[var(--space-7)] lg:py-[var(--space-6)]">
        <div>
          <h2 className="font-display text-lg text-primary sm:text-xl">Why Ayurveda, Today?</h2>
          <p className="mt-[var(--space-4)] max-w-md text-sm text-tertiary">
            {/* A time-tested Ayurvedic remedy known to reduce hair fall and support density.
            Discover the ritual behind stronger, healthier hair.
            ### Why Ayurveda, Today? */}
            Because timeless wisdom still has a place in modern life. Ayurveda brings us back to nature, balance, and intentional care nourishing your skin, hair, and body rather than chasing overnight transformation.
          </p>
          <Link
            href="/hair"
            className={`mt-[var(--space-6)] inline-flex items-center gap-[var(--space-2)] rounded-[var(--radius-xs)] bg-action-onlight-bg px-[var(--space-5)] py-[var(--space-3)] text-sm font-semibold text-action-onlight-text transition-colors duration-[var(--motion-instant)] hover:bg-action-onlight-bg-hover active:bg-action-onlight-bg-active ${focusRingOnDark}`}
          >
            Explore Now
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        <div className="relative aspect-video overflow-hidden rounded-[var(--radius-xs)] bg-[radial-gradient(circle_at_30%_20%,_#1a1a1a,_#000000_60%)]">
          <Image
            src={IMAGE_SRC}
            alt="Why Ayurveda, Today?"
            fill
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}
