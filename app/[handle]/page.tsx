import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCollectionWithProducts, getNavCollections } from "../lib/shopify/queries/collection";
import { ShopifyProduct } from "../lib/shopify/types";

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
  const { collection, products } = await getCollectionWithProducts({
    collectionHandle: handle,
    first: 50,
  });

  if (!collection) {
    notFound();
  }

  return (
    <main className="flex-1 bg-surface-base">
      {/* Collection Hero Header */}
      <section className="relative min-h-[320px] sm:min-h-[380px] lg:min-h-[480px] flex items-center overflow-hidden bg-surface-base">
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
            {/* Scrim for text legibility without washing out the photo */}
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent lg:w-3/4"
            />
          </>
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,_#1a1a1a,_#000000_60%)]" />
        )}

        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="mb-4">
            <ol className="flex items-center space-x-2 text-xs text-white/80">
              <li>
                <Link href="/" className="hover:text-white transition-colors underline-offset-4 hover:underline">
                  Home
                </Link>
              </li>
              <li>
                <span className="text-white/60">/</span>
              </li>
              <li className="font-medium text-white capitalize">
                {collection.title}
              </li>
            </ol>
          </nav>

          <div className="max-w-2xl">
            <p className="text-xs font-semibold tracking-[0.3em] text-white/90 uppercase">
              Ayurvedic Ritual Collection
            </p>
            <h1 className="font-display mt-2 text-2xl font-normal text-white sm:text-3xl lg:text-5xl">
              {collection.title}
            </h1>
            {collection.description && (
              <p className="mt-3 text-sm leading-relaxed text-white/90 sm:text-base">
                {collection.description}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Collection Product Catalog */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between border-b border-border-default pb-4">
          <p className="text-xs font-medium tracking-wide text-secondary uppercase">
            Showing {products.length} {products.length === 1 ? "Formulation" : "Formulations"}
          </p>
        </div>

        {products.length === 0 ? (
          <div className="py-20 text-center">
            <p className="font-display text-lg text-primary">
              Formulations Arriving Soon
            </p>
            <p className="mt-2 text-sm text-secondary">
              Our master botanists are hand-crafting new Ayurvedic batches for this ritual.
            </p>
            <Link
              href="/"
              className="mt-6 inline-block rounded-[var(--radius-xs)] bg-action-onlight-bg px-6 py-3 text-xs font-semibold tracking-wider text-action-onlight-text uppercase transition-colors hover:bg-action-onlight-bg-hover"
            >
              Explore All Collections
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product: ShopifyProduct) => {
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
                  className="group relative flex flex-col overflow-hidden rounded-[var(--radius-xs)] border border-border-default bg-surface-muted transition-all duration-200 hover:border-border-active hover:shadow-lg"
                >
                  {/* Product Image Frame */}
                  <div className="relative aspect-square w-full overflow-hidden bg-surface-base">
                    {product.featuredImage ? (
                      <Image
                        src={product.featuredImage.url}
                        alt={product.featuredImage.altText || product.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-surface-muted text-xs text-tertiary">
                        No Image Available
                      </div>
                    )}

                    {!product.availableForSale && (
                      <span className="absolute top-2 left-2 rounded-xs bg-surface-base/90 px-2.5 py-1 text-[10px] font-semibold text-tertiary uppercase backdrop-blur-xs">
                        Sold Out
                      </span>
                    )}
                  </div>

                  {/* Product Meta */}
                  <div className="flex flex-1 flex-col justify-between p-4 sm:p-5">
                    <div>
                      {product.vendor && (
                        <p className="text-[10px] font-semibold tracking-widest text-tertiary uppercase">
                          {product.vendor}
                        </p>
                      )}
                      <h2 className="font-display mt-1 text-sm font-medium text-primary group-hover:text-action-onlight-text line-clamp-2">
                        <Link href={`/products/${product.handle}`}>
                          <span aria-hidden="true" className="absolute inset-0" />
                          {product.title}
                        </Link>
                      </h2>
                      {product.description && (
                        <p className="mt-2 text-xs text-secondary line-clamp-2 leading-relaxed">
                          {product.description}
                        </p>
                      )}
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-border-default/60 pt-3">
                      <div>
                        <span className="text-xs text-tertiary mr-1">MRP</span>
                        <span className="text-sm font-semibold text-primary">
                          {formattedPrice}
                        </span>
                      </div>
                      <span className="text-xs font-medium text-action-onlight-text group-hover:translate-x-0.5 transition-transform">
                        View Ritual →
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Ayurvedic Philosophy Section */}
      <section className="border-t border-border-default bg-surface-muted/50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 text-center">
            <div className="p-4">
              <h3 className="font-display text-sm font-semibold text-primary">100% Ayurvedic</h3>
              <p className="mt-1 text-xs text-secondary">Formulated according to authentic classical texts.</p>
            </div>
            <div className="p-4">
              <h3 className="font-display text-sm font-semibold text-primary">Pure Botanicals</h3>
              <p className="mt-1 text-xs text-secondary">Cold-pressed organic herbs & essential oils.</p>
            </div>
            <div className="p-4">
              <h3 className="font-display text-sm font-semibold text-primary">Clean & Ethical</h3>
              <p className="mt-1 text-xs text-secondary">Cruelty-free, paraben-free & sustainably sourced.</p>
            </div>
            <div className="p-4">
              <h3 className="font-display text-sm font-semibold text-primary">Handcrafted Luxury</h3>
              <p className="mt-1 text-xs text-secondary">Small batches preserved in UV-protective glass.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
