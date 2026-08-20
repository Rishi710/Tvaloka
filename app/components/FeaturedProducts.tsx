import Image from "next/image";
import Link from "next/link";
import { getProducts } from "../lib/shopify/queries/product";
import { ShopifyProduct } from "../lib/shopify/types";

export async function FeaturedProducts() {
  let products: ShopifyProduct[] = [];
  try {
    products = await getProducts({ first: 4 });
  } catch (error) {
    console.error("Failed to load featured products from Shopify:", error);
  }

  if (!products || products.length === 0) {
    return null; // Don't render if no products found or failed to fetch
  }

  return (
    <section className="bg-surface-base py-[var(--space-7)]">
      <div className="mx-auto max-w-7xl px-[var(--space-4)]">
        <div className="flex items-end justify-between border-b border-border-default pb-[var(--space-4)]">
          <div>
            <p className="text-xs font-semibold tracking-[0.25em] text-secondary uppercase">
              Curated Essentials
            </p>
            <h2 className="font-display mt-1 text-lg text-primary sm:text-xl">
              Featured Formulations
            </h2>
          </div>
          <Link
            href="/products"
            className="text-sm font-medium text-action-onlight-text hover:underline"
          >
            View All <span aria-hidden="true">→</span>
          </Link>
        </div>

        <div className="mt-[var(--space-6)] grid grid-cols-1 gap-[var(--space-5)] sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => {
            const price = product.priceRange?.minVariantPrice;
            const formattedPrice = price
              ? new Intl.NumberFormat("en-IN", {
                  style: "currency",
                  currency: price.currencyCode || "INR",
                  maximumFractionDigits: 0,
                }).format(parseFloat(price.amount))
              : null;

            return (
              <div
                key={product.id}
                className="group relative flex flex-col overflow-hidden rounded-[var(--radius-xs)] border border-border-default bg-surface-muted transition-all duration-[var(--motion-instant)] hover:border-border-active hover:shadow-md"
              >
                <div className="relative aspect-square w-full overflow-hidden bg-surface-base">
                  {product.featuredImage ? (
                    <Image
                      src={product.featuredImage.url}
                      alt={product.featuredImage.altText || product.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-surface-muted text-xs text-tertiary">
                      No Image
                    </div>
                  )}

                  {!product.availableForSale && (
                    <span className="absolute top-2 left-2 rounded-xs bg-surface-base/90 px-2 py-0.5 text-[10px] font-semibold text-tertiary uppercase">
                      Sold Out
                    </span>
                  )}
                </div>

                <div className="flex flex-1 flex-col justify-between p-[var(--space-4)]">
                  <div>
                    {product.vendor && (
                      <p className="text-[10px] font-semibold tracking-wider text-tertiary uppercase">
                        {product.vendor}
                      </p>
                    )}
                    <h3 className="font-display mt-1 text-sm font-medium text-primary line-clamp-1 group-hover:text-action-onlight-text">
                      <Link href={`/products/${product.handle}`}>
                        <span aria-hidden="true" className="absolute inset-0" />
                        {product.title}
                      </Link>
                    </h3>
                  </div>

                  <div className="mt-[var(--space-3)] flex items-center justify-between border-t border-border-default/50 pt-[var(--space-3)]">
                    <p className="text-sm font-semibold text-primary">
                      {formattedPrice}
                    </p>
                    <span className="text-xs font-semibold text-action-onlight-text">
                      View →
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
