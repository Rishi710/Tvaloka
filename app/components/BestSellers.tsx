import Link from "next/link";
import { getCollectionProducts } from "../lib/shopify/queries/collection";
import type { ShopifyProduct } from "../lib/shopify/types";
import { BestSellersRail } from "./BestSellersRail";

// The store's real "Best Sellers" collection (verified handle: best-sellers).
const BEST_SELLERS_COLLECTION_HANDLE = "best-sellers";

interface BestSellersProps {
  /** Pass the current PDP's product id so it doesn't also show up in its own rail. */
  excludeProductId?: string;
  className?: string;
}

export async function BestSellers({ excludeProductId, className = "" }: BestSellersProps) {
  let products: ShopifyProduct[] = [];
  try {
    products = await getCollectionProducts({
      collectionHandle: BEST_SELLERS_COLLECTION_HANDLE,
      first: 24,
    });
  } catch (error) {
    console.error("Failed to load best sellers from Shopify:", error);
  }

  if (excludeProductId) {
    products = products.filter((p) => p.id !== excludeProductId);
  }

  if (!products || products.length === 0) {
    return null; // Don't render if the collection is empty or the fetch failed.
  }

  return (
    <section
      className={`bg-white py-[var(--space-5)] sm:py-[var(--space-6)] lg:py-[var(--space-7)] ${className}`}
    >
      <div className="mx-auto max-w-7xl px-[var(--space-4)]">
        <div className="flex items-end justify-between pb-[var(--space-4)]">
          <div>
            <p className="text-xs font-semibold tracking-[0.25em] text-secondary uppercase">
              Customer Favourites
            </p>
            <h2 className="font-display mt-1 text-lg text-primary sm:text-xl">
              Best Sellers
            </h2>
          </div>
          <Link
            href={`/${BEST_SELLERS_COLLECTION_HANDLE}`}
            className="text-sm font-medium text-black"
          >
            View All <span aria-hidden="true">→</span>
          </Link>
        </div>

        <div className="mt-[var(--space-6)]">
          <BestSellersRail products={products} />
        </div>
      </div>
    </section>
  );
}
