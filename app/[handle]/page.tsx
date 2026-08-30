import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCollectionWithProducts, getNavCollections } from "../lib/shopify/queries/collection";
import { CollectionCatalog } from "../components/CollectionCatalog";

export const revalidate = 60; // ISR: revalidate collection pages every 60 seconds

interface CollectionPageProps {
  params: Promise<{
    handle: string;
  }>;
}

export async function generateMetadata({
  params,
}: CollectionPageProps): Promise<Metadata> {
  const { handle } = await params;
  try {
    const { collection } = await getCollectionWithProducts({
      collectionHandle: handle,
      first: 1,
    });

    if (!collection) {
      return {
        title: "Collection Not Found | Tvaloka",
      };
    }

    return {
      title: `${collection.title} | Tvaloka Ayurvedic Luxury`,
      description:
        collection.description ||
        `Explore pure Ayurvedic luxury formulations in our ${collection.title} collection.`,
    };
  } catch (error) {
    console.error(`[CollectionMetadata] Error fetching ${handle}:`, error);
    return {
      title: "Collection | Tvaloka Ayurvedic Luxury",
    };
  }
}

export async function generateStaticParams() {
  try {
    const collections = await getNavCollections();
    return collections
      .filter((c) => c.handle !== "frontpage")
      .map((c) => ({
        handle: c.handle,
      }));
  } catch {
    return [];
  }
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { handle } = await params;
  let collection = null;
  let products: any[] = [];

  try {
    const data = await getCollectionWithProducts({
      collectionHandle: handle,
      first: 50,
    });
    collection = data.collection;
    products = data.products;
  } catch (error) {
    console.error(`[CollectionPage] Error fetching collection "${handle}":`, error);
  }

  if (!collection) {
    notFound();
  }

  return (
    <main className="flex-1 bg-white">
      {/* ── Collection Hero Banner ────────────────────────────────────────── */}
      <section className="relative min-h-[175px] sm:min-h-[320px] lg:min-h-[480px] flex items-end justify-center overflow-hidden bg-[#111111]">
        {collection.image ? (
          <>
            <Image
              src={collection.image.url}
              alt={collection.image.altText || collection.title}
              fill
              priority
              sizes="100vw"
              className="object-cover object-center"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent sm:from-black/60 sm:via-black/20"
            />
          </>
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,_#222222,_#0a0a0a_70%)]" />
        )}

        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-5 pt-12 text-left text-white sm:px-6 sm:pb-12 sm:pt-20 lg:px-8 lg:pb-16">
          {/* <p className="text-[11px] sm:text-xs font-bold tracking-[0.35em] text-white/80 uppercase">
            Ayurvedic Ritual Collection
          </p> */}
          <h1 className="font-display text-2xl font-normal text-white sm:text-4xl lg:text-5xl tracking-wide">
            {collection.title}
          </h1>
          {collection.description && (
            <p className="mt-1 max-w-2xl text-xs leading-relaxed text-white/90 sm:text-sm">
              {collection.description}
            </p>
          )}
        </div>
      </section>

      {/* ── Interactive Collection Catalog (Pills, Sidebar Filters, Grid) ──── */}
      <CollectionCatalog
        collectionTitle={collection.title}
        collectionHandle={collection.handle}
        collectionDescription={collection.description}
        products={products}
      />

      {/* ── Ayurvedic Philosophy Section (Pure White Theme) ───────────────── */}
      <section className="border-t border-[#eeeeee] bg-white py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 text-center">
            <div className="p-4 border border-[#f0f0f0] rounded-[var(--radius-xs)] bg-[#fafafa]">
              <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-black">
                100% Ayurvedic
              </h3>
              <p className="mt-1.5 text-xs text-[#666666]">
                Formulated according to authentic classical texts.
              </p>
            </div>
            <div className="p-4 border border-[#f0f0f0] rounded-[var(--radius-xs)] bg-[#fafafa]">
              <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-black">
                Pure Botanicals
              </h3>
              <p className="mt-1.5 text-xs text-[#666666]">
                Cold-pressed organic herbs & essential oils.
              </p>
            </div>
            <div className="p-4 border border-[#f0f0f0] rounded-[var(--radius-xs)] bg-[#fafafa]">
              <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-black">
                Clean & Ethical
              </h3>
              <p className="mt-1.5 text-xs text-[#666666]">
                Cruelty-free, paraben-free & sustainably sourced.
              </p>
            </div>
            <div className="p-4 border border-[#f0f0f0] rounded-[var(--radius-xs)] bg-[#fafafa]">
              <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-black">
                Handcrafted Luxury
              </h3>
              <p className="mt-1.5 text-xs text-[#666666]">
                Small batches preserved in UV-protective glass.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

