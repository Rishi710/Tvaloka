import Link from "next/link";
import { getProducts } from "../lib/shopify/queries/product";
import { ShopifyProduct } from "../lib/shopify/types";
import { ProductCard } from "./ProductCard";

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
    <section className="bg-white py-[var(--space-7)]">
      <div className="mx-auto max-w-7xl px-[var(--space-4)]">
        <div className="flex items-end justify-between pb-[var(--space-4)]">
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
            className="text-sm font-medium text-black"
          >
            View All <span aria-hidden="true">→</span>
          </Link>
        </div>

        <div className="mt-[var(--space-6)] grid grid-cols-1 gap-[var(--space-5)] sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}

