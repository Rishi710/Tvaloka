import { NextResponse } from "next/server";
import { getProducts } from "@/app/lib/shopify/queries/product";
import { getCollectionProducts } from "@/app/lib/shopify/queries/collection";
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

function extractConcerns(products: ShopifyProduct[]): string[] {
  const counts = new Map<string, number>();
  for (const p of products) {
    const mf = p.metafields?.find((m) => m && m.namespace === "custom" && m.key === "concern");
    if (!mf?.value) continue;
    let values: string[] = [];
    try {
      const parsed = JSON.parse(mf.value);
      if (Array.isArray(parsed)) values = parsed.map(String);
    } catch {
      values = mf.value.split(",");
    }
    for (const raw of values) {
      const label = raw.trim();
      if (!label) continue;
      const key = label.toLowerCase();
      counts.set(key, (counts.get(key) ?? 0) + 1);
      // Keep the first-seen casing for display.
      if (!counts.has(`label:${key}`)) counts.set(`label:${key}`, 0);
    }
  }

  return Array.from(counts.entries())
    .filter(([key]) => !key.startsWith("label:"))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([key]) => key.replace(/\b\w/g, (c) => c.toUpperCase()));
}

export async function GET() {
  const [bestSellers, allProducts] = await Promise.all([
    getCollectionProducts({ collectionHandle: "best-sellers", first: 5 }).catch(() => []),
    getProducts({ first: 100 }).catch(() => []),
  ]);

  const popularProducts = (bestSellers.length > 0 ? bestSellers : allProducts.slice(0, 5)).map(
    toPopularProduct
  );
  const concerns = extractConcerns(allProducts);

  return NextResponse.json({ popularProducts, concerns });
}
