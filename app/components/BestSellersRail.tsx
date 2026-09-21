"use client";

import { ProductCard } from "./ProductCard";
import { ScrollRail } from "./ScrollRail";
import type { ShopifyProduct } from "../lib/shopify/types";

export function BestSellersRail({
  products,
  label = "Best Sellers",
}: {
  products: ShopifyProduct[];
  /** Collection name, used in the rail's accessible labels. */
  label?: string;
}) {
  return (
    <ScrollRail label={label}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </ScrollRail>
  );
}
