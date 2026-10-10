import { NextRequest, NextResponse } from "next/server";
import { getProducts } from "@/app/lib/shopify/queries/product";
import { getNavCollections } from "@/app/lib/shopify/queries/collection";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";

  if (q.length < 2) {
    return NextResponse.json({ products: [], collections: [], tags: [] });
  }

  const ql = q.toLowerCase();

  // Search runs over the catalogue list that is already cached and shared with
  // the rest of the site. Asking Shopify per keyword instead created a new
  // cache entry for every distinct search term, each one billed as an ISR write.
  const [allProducts, allCollections] = await Promise.all([
    getProducts({ first: 100 }).catch(() => []),
    getNavCollections(30).catch(() => []),
  ]);

  const concernText = (p: (typeof allProducts)[number]) =>
    p.metafields?.find((m) => m && m.namespace === "custom" && m.key === "concern")?.value ?? "";

  // Every word typed must appear somewhere in the title, type, vendor, tags or
  // concerns, so "hair oil" and "oil hair" both find hair oils.
  const words = ql.split(/\s+/).filter(Boolean);
  const matches = (text: string) => words.every((w) => text.includes(w));

  const directMatches = allProducts.filter((p) =>
    matches([p.title, p.productType, p.vendor, ...p.tags].join(" ").toLowerCase())
  );
  const concernMatches = allProducts.filter((p) => matches(concernText(p).toLowerCase()));

  // Title/tag matches first, then concern matches, deduped.
  const seen = new Set<string>();
  const products = [...directMatches, ...concernMatches]
    .filter((p) => {
      if (seen.has(p.id)) return false;
      seen.add(p.id);
      return true;
    })
    .slice(0, 8);

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
