import { NextRequest, NextResponse } from "next/server";
import { getProducts } from "@/app/lib/shopify/queries/product";
import { getNavCollections } from "@/app/lib/shopify/queries/collection";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";

  if (q.length < 2) {
    return NextResponse.json({ products: [], collections: [], tags: [] });
  }

  // Shopify Storefront query DSL — searches title, tag, product_type, vendor.
  // It cannot see metafield values, so "concern" terms (e.g. "Dry Hair") need
  // a separate pass below against the custom.concern metafield.
  const shopifyQuery = `title:*${q}* OR tag:*${q}* OR product_type:*${q}* OR vendor:*${q}*`;
  const ql = q.toLowerCase();

  const [titleMatches, allProducts, allCollections] = await Promise.all([
    getProducts({ query: shopifyQuery, first: 8 }).catch(() => []),
    getProducts({ first: 100 }).catch(() => []),
    getNavCollections(30).catch(() => []),
  ]);

  const concernMatches = allProducts.filter((p) => {
    const mf = p.metafields?.find((m) => m && m.namespace === "custom" && m.key === "concern");
    return !!mf?.value && mf.value.toLowerCase().includes(ql);
  });

  // Merge title/tag matches with concern-metafield matches, deduped, title matches first.
  const seen = new Set<string>();
  const products = [...titleMatches, ...concernMatches].filter((p) => {
    if (seen.has(p.id)) return false;
    seen.add(p.id);
    return true;
  }).slice(0, 8);

  // Filter collections by title
  const collections = allCollections
    .filter(
      (c) =>
        c.handle !== "frontpage" &&
        (c.title.toLowerCase().includes(ql) ||
          c.description?.toLowerCase().includes(ql))
    )
    .slice(0, 4);

  // Collect unique tags from matched products that contain the query string
  const tagSet = new Set<string>();
  for (const p of products) {
    for (const tag of p.tags) {
      if (tag.toLowerCase().includes(ql)) tagSet.add(tag);
    }
    // Also surface concern metafield values
    const concernMf = p.metafields?.find((m) => m.key === "concern");
    if (concernMf?.value) {
      try {
        const concerns: string[] = JSON.parse(concernMf.value);
        for (const c of concerns) {
          if (c.toLowerCase().includes(ql)) tagSet.add(c);
        }
      } catch {
        if (concernMf.value.toLowerCase().includes(ql))
          tagSet.add(concernMf.value);
      }
    }
  }

  const tags = Array.from(tagSet).slice(0, 6);

  return NextResponse.json({ products, collections, tags });
}
