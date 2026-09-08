import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProductByHandle, getProducts } from "../../lib/shopify/queries/product";
import { ShareButton } from "../../components/ShareButton";
import ProductGallery from "./ProductGallery";
import { ProductAccordion } from "../../components/ProductAccordion";
import { ProductActions } from "./ProductActions";
import { ProductIngredientsSection } from "./ProductIngredientsSection";
import { getIngredientsForProduct } from "../../lib/productIngredients";
import type { ShopifyProduct } from "../../lib/shopify/types";

export const revalidate = 60; // ISR: revalidate every 60 seconds
export const dynamicParams = true; // Allow dynamic generation of un-prerendered products

interface ProductPageProps {
  params: Promise<{
    handle: string;
  }>;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { handle } = await params;
  const decodedHandle = decodeURIComponent(handle);
  try {
    const product = await getProductByHandle(decodedHandle);

    if (!product) {
      return {
        title: "Product Not Found | Tvaloka",
      };
    }

    return {
      title: `${product.title} | Tvaloka Ayurvedic Luxury`,
      description: product.description || `Pure Ayurvedic ${product.title} by Tvaloka.`,
    };
  } catch (error) {
    console.error(`[ProductMetadata] Error fetching ${handle}:`, error);
    return {
      title: "Product | Tvaloka Ayurvedic Luxury",
    };
  }
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
  const decodedHandle = decodeURIComponent(handle);
  let product = null;

  let allProducts: ShopifyProduct[] = [];
  try {
    product = await getProductByHandle(decodedHandle);
    allProducts = await getProducts({ first: 50 });
  } catch (error) {
    console.error(`[ProductDetailPage] Error fetching product "${decodedHandle}":`, error);
  }

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

  const productIngredients = getIngredientsForProduct(product.title);

  return (
    <main className="flex-1 bg-white py-4 sm:py-10 md:py-16">
      <div className="mx-auto max-w-7xl px-0 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-4 sm:mb-8 px-4 sm:px-0">
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

        <div className="grid grid-cols-1 gap-8 sm:gap-12 lg:grid-cols-2 lg:gap-16 lg:items-start">
          {/* Product Gallery (Sticky on desktop, full-width on mobile) */}
          <div className="lg:sticky lg:top-8 w-full">
            <ProductGallery
              images={
                product.images && product.images.length > 0
                  ? product.images
                  : product.featuredImage
                    ? [product.featuredImage]
                    : []
              }
              title={product.title}
            />
          </div>

          {/* Product Details & Actions */}
          <div className="flex flex-col justify-start px-4 sm:px-0">
            {(product.collections && product.collections.length > 0
              ? product.collections[0]
              : null) ? (
              <Link
                href={`/collections/${product.collections![0].handle}`}
                className="text-xs font-semibold tracking-widest text-tertiary uppercase hover:text-primary transition-colors"
              >
                {product.collections![0].title}
              </Link>
            ) : product.vendor ? (
              <p className="text-xs font-semibold tracking-widest text-tertiary uppercase">
                {product.vendor}
              </p>
            ) : null}
            <h1 className="font-display mt-2 text-2xl font-normal text-primary sm:text-3xl">
              {product.title}
            </h1>

            <div className="mt-4 flex items-center justify-between gap-4">
              <div className="flex items-baseline gap-3">
                <span className="text-2xl font-semibold text-primary">
                  {formattedPrice}
                </span>
                <span className="text-xs text-tertiary">Inclusive of all taxes</span>
              </div>
              <ShareButton title={product.title} />
            </div>

            {product.description && (
              <div className="mt-6">
                <h2 className="text-xs font-semibold tracking-wider text-primary uppercase">
                  Description
                </h2>
                <div
                  className="mt-3 text-sm leading-relaxed text-secondary space-y-3 prose"
                  dangerouslySetInnerHTML={{
                    __html: product.descriptionHtml || product.description,
                  }}
                />
              </div>
            )}

            {/* Quantity Stepper & Add to Cart (No horizontal dividing lines) */}
            <ProductActions product={product} />

            {/* Product Metafields Accordion with Ingredients */}
            <ProductAccordion
              metafields={product.metafields}
              ingredients={productIngredients}
            />
          </div>
        </div>

        {/* ── Sacred Ingredients Section (Same card design & modal as /ingredients) ── */}
        <ProductIngredientsSection
          ingredients={productIngredients}
          products={allProducts}
        />
      </div>
    </main>
  );
}
