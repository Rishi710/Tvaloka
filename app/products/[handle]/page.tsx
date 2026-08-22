import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProductByHandle, getProducts } from "../../lib/shopify/queries/product";

export const revalidate = 60; // ISR: revalidate every 60 seconds

interface ProductPageProps {
  params: Promise<{
    handle: string;
  }>;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { handle } = await params;
  const product = await getProductByHandle(handle);

  if (!product) {
    return {
      title: "Product Not Found | Tvaloka",
    };
  }

  return {
    title: `${product.title} | Tvaloka Ayurvedic Luxury`,
    description: product.description || `Pure Ayurvedic ${product.title} by Tvaloka.`,
  };
}

export async function generateStaticParams() {
  try {
    const products = await getProducts({ first: 50 });
    return products.map((p) => ({
      handle: p.handle,
    }));
  } catch {
    return [];
  }
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { handle } = await params;
  const product = await getProductByHandle(handle);

  if (!product) {
    notFound();
  }

  const price = product.priceRange?.minVariantPrice;
  const formattedPrice = price
    ? new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: price.currencyCode || "INR",
        maximumFractionDigits: 0,
      }).format(parseFloat(price.amount))
    : null;

  return (
    <main className="flex-1 bg-surface-base py-10 md:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-8">
          <ol className="flex items-center space-x-2 text-xs text-tertiary">
            <li>
              <Link href="/" className="hover:text-primary transition-colors">
                Home
              </Link>
            </li>
            <li>
              <span>/</span>
            </li>
            <li>
              <span className="text-secondary">Products</span>
            </li>
            <li>
              <span>/</span>
            </li>
            <li className="font-medium text-primary line-clamp-1">
              {product.title}
            </li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Product Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square w-full overflow-hidden rounded-[var(--radius-xs)] border border-border-default bg-surface-muted">
              {product.featuredImage ? (
                <Image
                  src={product.featuredImage.url}
                  alt={product.featuredImage.altText || product.title}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm text-tertiary">
                  No Image Available
                </div>
              )}
            </div>

            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {product.images.slice(0, 4).map((img, i) => (
                  <div
                    key={i}
                    className="relative aspect-square overflow-hidden rounded-[var(--radius-xs)] border border-border-default bg-surface-muted"
                  >
                    <Image
                      src={img.url}
                      alt={img.altText || `${product.title} photo ${i + 1}`}
                      fill
                      sizes="25vw"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Details & Actions */}
          <div className="flex flex-col justify-start">
            {product.vendor && (
              <p className="text-xs font-semibold tracking-widest text-tertiary uppercase">
                {product.vendor}
              </p>
            )}
            <h1 className="font-display mt-2 text-2xl font-normal text-primary sm:text-3xl">
              {product.title}
            </h1>

            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-2xl font-semibold text-primary">
                {formattedPrice}
              </span>
              <span className="text-xs text-tertiary">Inclusive of all taxes</span>
            </div>

            {product.description && (
              <div className="mt-6 border-t border-border-default pt-6">
                <h2 className="text-xs font-semibold tracking-wider text-primary uppercase">
                  Description & Benefits
                </h2>
                <div
                  className="mt-3 text-sm leading-relaxed text-secondary space-y-3 prose"
                  dangerouslySetInnerHTML={{
                    __html: product.descriptionHtml || product.description,
                  }}
                />
              </div>
            )}

            {/* Action Button */}
            <div className="mt-8 pt-6 border-t border-border-default">
              <button
                type="button"
                disabled={!product.availableForSale}
                className="w-full rounded-[var(--radius-xs)] bg-action-onlight-bg py-4 text-sm font-semibold tracking-wider text-action-onlight-text uppercase transition-colors hover:bg-action-onlight-bg-hover disabled:bg-surface-muted disabled:text-tertiary disabled:cursor-not-allowed"
              >
                {product.availableForSale ? "Add to Cart" : "Sold Out"}
              </button>
            </div>

            {/* Ayurvedic Quality Badges */}
            <div className="mt-10 rounded-[var(--radius-xs)] border border-border-default bg-surface-muted p-5">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="font-semibold text-primary">🌿 100% Ayurvedic</p>
                  <p className="text-tertiary mt-0.5">Classical formulations</p>
                </div>
                <div>
                  <p className="font-semibold text-primary">✨ Cruelty Free</p>
                  <p className="text-tertiary mt-0.5">Ethically made in India</p>
                </div>
                <div>
                  <p className="font-semibold text-primary">📦 Eco Packaging</p>
                  <p className="text-tertiary mt-0.5">UV-protective containers</p>
                </div>
                <div>
                  <p className="font-semibold text-primary">🚚 Express Shipping</p>
                  <p className="text-tertiary mt-0.5">Direct to your doorstep</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
