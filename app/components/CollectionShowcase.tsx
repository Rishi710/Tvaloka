import Link from "next/link";
import { getCollectionProducts } from "../lib/shopify/queries/collection";
import type { ShopifyProduct } from "../lib/shopify/types";
import { BestSellersRail } from "./BestSellersRail";
import { REVALIDATE_LISTS } from "../lib/shopify/cache";

interface CollectionShowcaseProps {
  /** Shopify collection handle, also used for the "View All" link. */
  collectionHandle: string;
  eyebrow: string;
  title: string;
  /** Pass the current PDP's product id so it doesn't also show up in its own rail. */
  excludeProductId?: string;
  className?: string;
  /** How many products to fetch. A different size gets its own cache entry. */
  pageSize?: number;
  /** Seconds before a timed refresh. */
  revalidate?: number;
}

export async function CollectionShowcase({
  collectionHandle,
  eyebrow,
  title,
  excludeProductId,
  className = "",
  pageSize = 24,
  revalidate = REVALIDATE_LISTS,
}: CollectionShowcaseProps) {
  let products: ShopifyProduct[] = [];
  try {
    products = await getCollectionProducts({ collectionHandle, first: pageSize, revalidate });
  } catch (error) {
    console.error(`Failed to load "${collectionHandle}" collection from Shopify:`, error);
  }

  if (excludeProductId) {
    products = products.filter((p) => p.id !== excludeProductId);
  }

  if (!products || products.length === 0) {
    return null; // Don't render if the collection is empty or the fetch failed.
  }

  return (
    <section
      className={`bg-white py-10 ${className}`}
    >
      <div className="mx-auto max-w-7xl px-[var(--space-4)]">
        <div className="flex items-end justify-between pb-[var(--space-4)]">
          <div>
            <p className="text-xs font-semibold tracking-[0.25em] text-tertiary uppercase">
              {eyebrow}
            </p>
            <h2 className="font-display mt-1 text-lg text-primary sm:text-xl">{title}</h2>
          </div>
          <Link href={`/${collectionHandle}`} className="text-sm font-medium text-black">
            View All <span aria-hidden="true">→</span>
          </Link>
        </div>

        <div className="mt-[var(--space-6)]">
          <BestSellersRail products={products} label={title} />
        </div>
      </div>
    </section>
  );
}
