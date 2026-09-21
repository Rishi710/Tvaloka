import type { ShopifyProduct } from "./types";

export interface Concern {
  /** Display name, tidied (trimmed, single-spaced). */
  name: string;
  /** How many products carry this concern. */
  count: number;
}

function parseConcernValues(value: string): string[] {
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed.map(String);
    if (typeof parsed === "string") return [parsed];
  } catch {
    // Not JSON — treat as a comma-separated list.
  }
  return value.split(",");
}

/**
 * Distinct concerns from every product's `custom.concern` metafield, most common first.
 * Values that differ only by case or stray whitespace (" Dry Hair" vs "Dry Hair") are merged.
 */
export function getConcerns(products: ShopifyProduct[]): Concern[] {
  const groups = new Map<string, { casings: Map<string, number>; count: number }>();

  for (const product of products) {
    const mf = product.metafields?.find(
      (m) => m && m.namespace === "custom" && m.key === "concern",
    );
    if (!mf?.value) continue;

    // Count each concern once per product, even if listed twice.
    const seenInProduct = new Set<string>();
    for (const raw of parseConcernValues(mf.value)) {
      const name = raw.replace(/\s+/g, " ").trim();
      if (!name) continue;
      const key = name.toLowerCase();
      if (seenInProduct.has(key)) continue;
      seenInProduct.add(key);

      const group = groups.get(key) ?? { casings: new Map(), count: 0 };
      group.count += 1;
      group.casings.set(name, (group.casings.get(name) ?? 0) + 1);
      groups.set(key, group);
    }
  }

  return Array.from(groups.values())
    .map((group) => ({
      // Use whichever casing the store uses most for this concern.
      name: Array.from(group.casings.entries()).sort((a, b) => b[1] - a[1])[0][0],
      count: group.count,
    }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}
