import { NextResponse } from "next/server";
import { getProducts } from "@/app/lib/shopify/queries/product";
import { getCollectionProducts } from "@/app/lib/shopify/queries/collection";
import { getConcerns } from "@/app/lib/shopify/concerns";
import type { ShopifyProduct } from "@/app/lib/shopify/types";

export const runtime = "edge";

interface PopularProduct {
  handle: string;
  title: string;
  price: string;
  image: string | null;
  imageAlt: string;
}

function toPopularProduct(p: ShopifyProduct): PopularProduct {
  return {
    handle: p.handle,
    title: p.title,
    price: Math.round(Number(p.priceRange.minVariantPrice.amount)).toLocaleString("en-IN"),
    image: p.featuredImage?.url ?? null,
    imageAlt: p.featuredImage?.altText || p.title,
  };
}

export async function GET() {
  const [bestSellers, allProducts] = await Promise.all([
    getCollectionProducts({ collectionHandle: "best-sellers", first: 5 }).catch(() => []),
    getProducts({ first: 100 }).catch(() => []),
  ]);

  const popularProducts = (bestSellers.length > 0 ? bestSellers : allProducts.slice(0, 5)).map(
    toPopularProduct
  );
  const concerns = getConcerns(allProducts)
    .slice(0, 8)
    .map((c) => c.name);

  return NextResponse.json({ popularProducts, concerns });
}
