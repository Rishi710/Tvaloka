import Image from "next/image";
import Link from "next/link";
import { getProducts } from "../lib/shopify/queries/product";
import { getConcerns } from "../lib/shopify/concerns";
import { CONCERN_IMAGES, getConcernImage } from "../lib/concernImages";
import type { ShopifyProduct } from "../lib/shopify/types";
import { ScrollRail } from "./ScrollRail";

export async function ConcernSection({ className = "" }: { className?: string }) {
  let products: ShopifyProduct[] = [];
  try {
    products = await getProducts({ first: 100 });
  } catch (error) {
    console.error("Failed to load concerns from Shopify:", error);
  }

  const concerns = getConcerns(products);
  if (concerns.length === 0) {
    return null; // Nothing to show if no product has a concern or the fetch failed.
  }

  return (
    <section className={`bg-white py-10 ${className}`}>
      <div className="mx-auto max-w-7xl px-[var(--space-4)]">
        <div className="pb-[var(--space-4)]">
          <p className="text-xs font-semibold tracking-[0.25em] text-tertiary uppercase">
            Find Your Ritual
          </p>
          <h2 className="font-display mt-1 text-lg text-primary sm:text-xl">Shop by Concern</h2>
        </div>

        <div className="mt-[var(--space-6)]">
          <ScrollRail label="Shop by concern" arrowTopClassName="top-1/2">
            {concerns.map(({ name }) => {
              const image = getConcernImage(name) ?? CONCERN_IMAGES[name.toLowerCase()];
              return (
                <Link
                  key={name}
                  href={`/products?concern=${encodeURIComponent(name)}`}
                  className="group relative block aspect-[4/5] overflow-hidden rounded-[var(--radius-xs)] bg-[radial-gradient(circle_at_30%_25%,_#262626,_#000000_65%)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
                >
                  {image ? (
                    <Image
                      src={image}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 19vw, (min-width: 768px) 23vw, (min-width: 640px) 31vw, 46vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : null}
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,.72),rgba(0,0,0,0)_55%)]"
                  />
                  <span className="font-display absolute right-[var(--space-3)] bottom-[var(--space-3)] left-[var(--space-3)] text-sm text-ondark uppercase sm:text-md">
                    {name}
                  </span>
                </Link>
              );
            })}
          </ScrollRail>
        </div>
      </div>
    </section>
  );
}
