import type { Metadata } from "next";
import { getProducts } from "../lib/shopify/queries/product";
import { ShopifyProduct } from "../lib/shopify/types";
import { CollectionCatalog } from "../components/CollectionCatalog";

export const revalidate = 60; // ISR: revalidate every 60 seconds

export const metadata: Metadata = {
  title: "All Formulations | Tvaloka Ayurvedic Luxury",
  description: "Explore our complete range of authentic, handcrafted Ayurvedic luxury formulations.",
};

export default async function ProductsPage() {
  let products: ShopifyProduct[] = [];
  try {
    products = await getProducts({ first: 100 });
  } catch (error) {
    console.error("Failed to load products from Shopify:", error);
  }

  return (
    <main className="flex-1 bg-white">
      {/* ── Banner ────────────────────────────────────────────────────────── */}
      <section className="border-b border-[#f0f0f0] bg-[#fafafa] py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-[11px] font-bold tracking-[0.35em] text-[#666666] uppercase">
            Ayurvedic Wellness & Beauty
          </p>
          <h1 className="font-display mt-2 text-2xl font-normal text-black sm:text-4xl">
            All Formulations
          </h1>
          <p className="mx-auto mt-2 max-w-xl text-xs text-[#666666] sm:text-sm">
            Pure botanical cold-pressed essentials handcrafted in auspicious micro-batches.
          </p>
        </div>
      </section>

      {/* ── Interactive Catalog ───────────────────────────────────────────── */}
      <CollectionCatalog
        collectionTitle="All Products"
        collectionHandle="all"
        products={products}
      />
    </main>
  );
}

