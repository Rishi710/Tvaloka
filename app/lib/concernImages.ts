/**
 * Image for each concern card on the home page.
 *
 * Keys are normalized to lowercase strings (e.g. "dry skin", "dandruff").
 * Both lowercase and title-case keys are provided for maximum compatibility.
 *
 * The order of the keys below is the display order of the concern cards on
 * the home page — reorder entries here to reorder the cards.
 */
export const CONCERN_IMAGES: Record<string, string> = {
  // Lowercase keys (standard lookup)
  // "dandruff": "https://cdn.shopify.com/s/files/1/1005/3045/4892/files/Dandruff.webp?v=1790081167",
  // "dull skin": "https://cdn.shopify.com/s/files/1/1005/3045/4892/files/Dull_skin.webp?v=1790081167",
  // "frizzy hair": "https://cdn.shopify.com/s/files/1/1005/3045/4892/files/Frizzy_Hair.webp?v=1790081168",
  // "hair growth": "https://cdn.shopify.com/s/files/1/1005/3045/4892/files/Hair_Growth.webp?v=1790081168",
  // "diaper rash": "https://cdn.shopify.com/s/files/1/1005/3045/4892/files/Diaper_rash.webp?v=1790081167",
  // "hair damage": "https://cdn.shopify.com/s/files/1/1005/3045/4892/files/Hair_Damage.webp?v=1790081167",
  // "hair damge": "https://cdn.shopify.com/s/files/1/1005/3045/4892/files/Hair_Damage.webp?v=1790081167", // typo alias
  // "hair fall": "https://cdn.shopify.com/s/files/1/1005/3045/4892/files/Hairfall_2.webp?v=1790081168",
  // "skin hydration": "https://cdn.shopify.com/s/files/1/1005/3045/4892/files/Skin_Hydration.webp?v=1790081167",
  // "skin soothing": "https://cdn.shopify.com/s/files/1/1005/3045/4892/files/Skin_Soothing.webp?v=1790081167",

  // Title-case aliases
  "Dry Skin": "https://cdn.shopify.com/s/files/1/1005/3045/4892/files/Dry_Skin.jpg?v=1790081054",
  "Dry Hair": "https://cdn.shopify.com/s/files/1/1005/3045/4892/files/Dry_Hair.webp?v=1790081167",
  // "Scalp Care": "https://cdn.shopify.com/s/files/1/1005/3045/4892/files/Scalp_Care.webp?v=1790081167",
  "Dandruff": "https://cdn.shopify.com/s/files/1/1005/3045/4892/files/Dandruff.webp?v=1790081167",
  "Dull Skin": "https://cdn.shopify.com/s/files/1/1005/3045/4892/files/Dull_skin.webp?v=1790081167",
  "Skin Hydration": "https://cdn.shopify.com/s/files/1/1005/3045/4892/files/Skin_Hydration.webp?v=1790081167",
  "Frizzy Hair": "https://cdn.shopify.com/s/files/1/1005/3045/4892/files/Frizzy_Hair.webp?v=1790081168",
  "Hair Growth": "https://cdn.shopify.com/s/files/1/1005/3045/4892/files/Hair_Growth.webp?v=1790081168",
  "Hair Damage": "https://cdn.shopify.com/s/files/1/1005/3045/4892/files/Hair_Damage.webp?v=1790081167",
  // "Hair Damge": "https://cdn.shopify.com/s/files/1/1005/3045/4892/files/Hair_Damage.webp?v=1790081167",
  "Hair Fall": "https://cdn.shopify.com/s/files/1/1005/3045/4892/files/Hairfall_2.webp?v=1790081168",
  "Skin Soothing": "https://cdn.shopify.com/s/files/1/1005/3045/4892/files/Skin_Soothing.webp?v=1790081167",
  // "Diaper Rash": "https://cdn.shopify.com/s/files/1/1005/3045/4892/files/Diaper_rash.webp?v=1790081167",
  // "Tummy Discomfort": "https://cdn.shopify.com/s/files/1/1005/3045/4892/files/Tummy_Discomfort.webp?v=1790170797"
};

/**
 * Case-insensitive lookup helper for concern images.
 */
export function getConcernImage(name: string): string | undefined {
  if (!name) return undefined;
  const normalized = name.trim().toLowerCase();
  return CONCERN_IMAGES[normalized] || CONCERN_IMAGES[name];
}

/**
 * Concern names in the order their images are listed above, deduplicated by
 * normalized name (e.g. "Dry Hair" and "dry hair" count as the same entry,
 * kept at its first position).
 */
export function getConcernOrder(): string[] {
  const seen = new Set<string>();
  const order: string[] = [];
  for (const key of Object.keys(CONCERN_IMAGES)) {
    const normalized = key.trim().toLowerCase();
    if (seen.has(normalized)) continue;
    seen.add(normalized);
    order.push(normalized);
  }
  return order;
}

// Remaining concerns waiting for images:
// "Gentle Cleansing": "",
// "Dry Scalp": "",
// "Baby Massage": "",
// "Hair Nourishment": "",
// "Skin Nourishment": "",
// "Gentle Care": "",
// "Excess Oil": "",
// "Moisture": "",
// "Skin Freshness": "",
// "Skin Irritation": "",
