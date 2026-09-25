import Image from "next/image";

// Files live in /public/Tvaloka Code. The badges already carry their own
// labels, so `label` is only used for accessible alt text.
const badges = [
  { label: "Cruelty free", file: "Cruelty free.png" },
  { label: "Vegan product", file: "Vegan Product.png" },
  { label: "Paraben free", file: "Paraben free.png" },
  { label: "Sulfate free", file: "Sulfate free.png" },
  { label: "Silicone free", file: "Silicon Free.png" },
  { label: "No mineral oil", file: "No mineral.png" },
  { label: "For all skin types", file: "For all skin types.png" },
];

export function TvalokaCode({ className = "" }: { className?: string }) {
  return (
    <section className={`bg-white py-10 lg:py-[var(--space-6)] ${className}`}>
      <div className="mx-auto max-w-7xl px-[var(--space-4)]">
        <div className="pb-[var(--space-4)]">
          <p className="text-xs font-semibold tracking-[0.25em] text-tertiary uppercase">
            Our Promise
          </p>
          <h2 className="font-display mt-1 text-lg text-primary sm:text-xl">The Tvaloka Code</h2>
          <p className="mt-[var(--space-2)] max-w-2xl text-sm text-tertiary">
            Clean, cruelty-free and gentle on every skin type.
          </p>
        </div>

        <ul
          aria-label="The Tvaloka Code"
          className="scrollbar-hide scroll-px-[var(--space-4)] -mx-[var(--space-4)] mt-[var(--space-4)] flex snap-x snap-mandatory items-center gap-[var(--space-3)] overflow-x-auto px-[var(--space-4)] lg:mx-0 lg:justify-between lg:overflow-visible lg:px-0"
        >
          {badges.map((badge) => (
            <li
              key={badge.label}
              className="w-24 shrink-0 snap-start sm:w-28 lg:w-[120px]"
            >
              <Image
                src={encodeURI(`/Tvaloka Code/${badge.file}`)}
                alt={badge.label}
                width={3125}
                height={3125}
                sizes="(min-width: 1024px) 120px, (min-width: 640px) 112px, 96px"
                className="h-auto w-full transition-transform duration-[var(--motion-fast)] hover:scale-105"
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
