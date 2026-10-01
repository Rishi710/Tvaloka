import type { Metadata } from "next";
import Image from "next/image";
import { getProducts } from "../lib/shopify/queries/product";
import { ShopifyProduct } from "../lib/shopify/types";
import { CollectionCatalog } from "../components/CollectionCatalog";

// Swap this URL to change the banner photo on this page.
const BANNER_IMAGE_URL =
  "https://cdn.shopify.com/s/files/1/1005/3045/4892/files/Ingredient_jpg.jpg?v=1788647916";

export const metadata: Metadata = {
  title: "All Formulations | Tvaloka Ayurvedic Luxury",
  description: "Explore our complete range of authentic, handcrafted Ayurvedic luxury formulations.",
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { concern } = await searchParams;
  const selectedConcern = (Array.isArray(concern) ? concern[0] : concern)?.trim() ?? "";

  let products: ShopifyProduct[] = [];
  try {
    products = await getProducts({ first: 100 });
  } catch (error) {
    console.error("Failed to load products from Shopify:", error);
  }

  return (
    <main className="flex-1 bg-white">
      {/* ── Banner ────────────────────────────────────────────────────────── */}
      <section className="relative flex min-h-[175px] items-end justify-center overflow-hidden bg-[#111111] sm:min-h-[320px] lg:min-h-[480px]">
        <Image
          src="https://cdn.shopify.com/s/files/1/1005/3045/4892/files/IMG_6522.webp?v=1790809164"
          alt="Ayurvedic botanicals and formulations"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent sm:from-black/60 sm:via-black/20"
        />
        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pt-12 pb-5 text-left sm:px-6 sm:pt-20 sm:pb-12 lg:px-8 lg:pb-16">
          <p className="text-[11px] font-bold tracking-[0.35em] text-white/90 uppercase">
            Ayurvedic Wellness & Beauty
          </p>
          <h1 className="font-display mt-2 text-2xl font-normal text-white sm:text-4xl lg:text-5xl tracking-wide">
            All Formulations
          </h1>
          <p className="mt-1 max-w-2xl text-xs leading-relaxed text-white/90 sm:text-sm">
            Pure botanical cold-pressed essentials handcrafted in auspicious micro-batches.
          </p>
        </div>
      </section>

      {/* ── Interactive Catalog ───────────────────────────────────────────── */}
      <CollectionCatalog
        key={selectedConcern}
        collectionTitle="All Products"
        collectionHandle="all"
        products={products}
        initialConcerns={selectedConcern ? [selectedConcern.toUpperCase()] : []}
      />
    </main>
  );
}

