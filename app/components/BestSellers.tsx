import { CollectionShowcase } from "./CollectionShowcase";

// The store's real "Best Sellers" collection (verified handle: best-sellers).
const BEST_SELLERS_COLLECTION_HANDLE = "best-sellers";

interface BestSellersProps {
  /** Pass the current PDP's product id so it doesn't also show up in its own rail. */
  excludeProductId?: string;
  className?: string;
}

export function BestSellers({ excludeProductId, className }: BestSellersProps) {
  return (
    <CollectionShowcase
      collectionHandle={BEST_SELLERS_COLLECTION_HANDLE}
      eyebrow="Customer Favourites"
      title="Best Sellers"
      excludeProductId={excludeProductId}
      className={className}
    />
  );
}
