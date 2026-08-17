"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon, HeartIcon, ShareIcon } from "./icons";
import { PLACEHOLDER_VIDEO_URL } from "../lib/videos";

type Story = {
  eyebrow: string;
  headline: string;
  productName: string;
  description: string;
  price: string;
  bgClassName: string;
  videoSrc: string;
};

const stories: Story[] = [
  {
    eyebrow: "Sandalwood & Rose",
    headline: "Settles like comfort",
    productName: "Body Mist - Sandalwood & Rose",
    description: "A fresh floral mist infused with sandalwood and rose to soften and hydrate.",
    price: "₹1,350",
    bgClassName: "bg-[radial-gradient(circle_at_30%_20%,_#262626,_#000000_65%)]",
    videoSrc: PLACEHOLDER_VIDEO_URL,
  },
  {
    eyebrow: "Sandalwood & Rose",
    headline: "Settles like comfort",
    productName: "Body Mist - Sandalwood & Rose",
    description: "A fresh floral mist infused with sandalwood and rose to soften and hydrate.",
    price: "₹1,350",
    bgClassName: "bg-[radial-gradient(circle_at_30%_20%,_#262626,_#000000_65%)]",
    videoSrc: PLACEHOLDER_VIDEO_URL,
  },
  {
    eyebrow: "Sandalwood & Rose",
    headline: "Settles like comfort",
    productName: "Body Mist - Sandalwood & Rose",
    description: "A fresh floral mist infused with sandalwood and rose to soften and hydrate.",
    price: "₹1,350",
    bgClassName: "bg-[radial-gradient(circle_at_30%_20%,_#262626,_#000000_65%)]",
    videoSrc: PLACEHOLDER_VIDEO_URL,
  },
  {
    eyebrow: "Sandalwood & Rose",
    headline: "Settles like comfort",
    productName: "Body Mist - Sandalwood & Rose",
    description: "A fresh floral mist infused with sandalwood and rose to soften and hydrate.",
    price: "₹1,350",
    bgClassName: "bg-[radial-gradient(circle_at_30%_20%,_#262626,_#000000_65%)]",
    videoSrc: PLACEHOLDER_VIDEO_URL,
  },
  {
    eyebrow: "Sandalwood & Rose",
    headline: "Settles like comfort",
    productName: "Body Mist - Sandalwood & Rose",
    description: "A fresh floral mist infused with sandalwood and rose to soften and hydrate.",
    price: "₹1,350",
    bgClassName: "bg-[radial-gradient(circle_at_30%_20%,_#262626,_#000000_65%)]",
    videoSrc: PLACEHOLDER_VIDEO_URL,
  },
  {
    eyebrow: "Sandalwood & Rose",
    headline: "Settles like comfort",
    productName: "Body Mist - Sandalwood & Rose",
    description: "A fresh floral mist infused with sandalwood and rose to soften and hydrate.",
    price: "₹1,350",
    bgClassName: "bg-[radial-gradient(circle_at_30%_20%,_#262626,_#000000_65%)]",
    videoSrc: PLACEHOLDER_VIDEO_URL,
  }
];

const focusRingOnLight =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black";
const focusRingOnDark =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

// A <video> paints solid black until it has decoded a frame, which
// briefly blacks out the gradient behind it while scrolling into view.
// Keep it transparent until it actually has something to show.
function StoryVideo({ src }: { src: string }) {
  const [isReady, setIsReady] = useState(false);
  const markReady = () => setIsReady(true);

  return (
    <video
      className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-[var(--motion-fast)] ease-out ${
        isReady ? "opacity-100" : "opacity-0"
      }`}
      src={src}
      autoPlay
      muted
      loop
      playsInline
      // Several instances of the same src can be flaky about firing
      // loadeddata individually, so treat any of these as "has a frame".
      onLoadedData={markReady}
      onCanPlay={markReady}
      onPlaying={markReady}
      onTimeUpdate={markReady}
    />
  );
}

export function TrustedTales() {
  const scrollerRef = useRef<HTMLUListElement>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);

  function updateScrollState() {
    const el = scrollerRef.current;
    if (!el) return;
    setCanScrollPrev(el.scrollLeft > 8);
    setCanScrollNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  }

  useEffect(() => {
    updateScrollState();
    window.addEventListener("resize", updateScrollState);
    return () => window.removeEventListener("resize", updateScrollState);
  }, []);

  function scrollByCard(direction: 1 | -1) {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-story-card]");
    const amount = (card?.offsetWidth ?? el.clientWidth * 0.8) + 16;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: direction * amount, behavior: reduceMotion ? "auto" : "smooth" });
  }

  return (
    <section className="bg-surface-muted">
      <div className="mx-auto max-w-7xl px-[var(--space-4)] py-[var(--space-7)]">
        <h2 className="font-display text-lg text-primary sm:text-xl">Trusted Tales</h2>
        <p className="mt-[var(--space-2)] max-w-2xl text-sm text-tertiary">
          Experience Ayurveda, share your story. Be part of the{" "}
          <span className="font-semibold text-primary">#Tvalokababycare</span> — tag{" "}
          <span className="font-semibold text-primary">@tvalokawellness</span> to get featured.
        </p>

        <div className="relative mt-[var(--space-6)]">
          <ul
            ref={scrollerRef}
            onScroll={updateScrollState}
            aria-label="Community stories"
            className="scrollbar-hide flex snap-x snap-mandatory gap-[var(--space-4)] overflow-x-auto scroll-smooth pb-[var(--space-2)]"
          >
            {stories.map((story, index) => (
              <li
                key={index}
                data-story-card
                className="w-[78%] shrink-0 snap-start sm:w-[45%] md:w-[32%] lg:w-[24%] xl:w-[19%]"
              >
                <div
                  className={`relative aspect-[9/16] bg-white overflow-hidden rounded-[var(--radius-xs)] ${story.bgClassName}`}
                >
                  {story.videoSrc ? <StoryVideo src={story.videoSrc} /> : null}
                  <div className="absolute inset-x-0 top-0 p-[var(--space-3)]">
                    <p className="text-[10px] font-semibold tracking-[0.3em] text-ondark-secondary uppercase">
                      {story.eyebrow}
                    </p>
                    <p className="font-display mt-[var(--space-1)] text-md text-ondark italic">
                      {story.headline}
                    </p>
                  </div>
                  <div className="absolute right-[var(--space-2)] bottom-[var(--space-2)] flex gap-[var(--space-2)]">
                    <button
                      type="button"
                      className={`flex h-8 w-8 items-center justify-center text-ondark hover:text-ondark-secondary ${focusRingOnDark}`}
                      aria-label={`Like ${story.productName}`}
                    >
                      <HeartIcon className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      className={`flex h-8 w-8 items-center justify-center text-ondark hover:text-ondark-secondary ${focusRingOnDark}`}
                      aria-label={`Share ${story.productName}`}
                    >
                      <ShareIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div className="mt-[var(--space-3)] flex gap-[var(--space-2)]">
                  <span
                    aria-hidden="true"
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-base text-[10px] font-semibold text-ondark"
                  >
                    {story.productName.charAt(0)}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-primary">
                      {story.productName}
                    </p>
                    <p className="mt-[var(--space-1)] line-clamp-2 text-xs text-tertiary">
                      {story.description}
                    </p>
                    <p className="mt-[var(--space-1)] text-sm font-semibold text-primary">
                      {story.price}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={() => scrollByCard(-1)}
            disabled={!canScrollPrev}
            aria-label="Scroll to previous stories"
            className={`absolute top-1/2 left-[calc(var(--space-2)*-1)] hidden h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-surface-base text-ondark shadow-md disabled:pointer-events-none disabled:opacity-30 sm:flex ${focusRingOnLight}`}
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => scrollByCard(1)}
            disabled={!canScrollNext}
            aria-label="Scroll to more stories"
            className={`absolute top-1/2 right-[calc(var(--space-2)*-1)] hidden h-11 w-11 -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-full bg-surface-base text-ondark shadow-md disabled:pointer-events-none disabled:opacity-30 sm:flex ${focusRingOnLight}`}
          >
            <ChevronRightIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
