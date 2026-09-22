/**
 * Image for each concern card on the home page.
 *
 * Keys are normalized to lowercase strings (e.g. "dry skin", "dandruff").
 * Both lowercase and title-case keys are provided for maximum compatibility.
 */
export const CONCERN_IMAGES: Record<string, string> = {
  // Lowercase keys (standard lookup)
  "dry skin": "https://cdn.shopify.com/s/files/1/1005/3045/4892/files/Dry_Skin.jpg?v=1790081054",
  "scalp care": "https://cdn.shopify.com/s/files/1/1005/3045/4892/files/Scalp_Care.webp?v=1790081167",
  "dry hair": "https://cdn.shopify.com/s/files/1/1005/3045/4892/files/Dry_Hair.webp?v=1790081167",
  "dandruff": "https://cdn.shopify.com/s/files/1/1005/3045/4892/files/Dandruff.webp?v=1790081167",
  "dull skin": "https://cdn.shopify.com/s/files/1/1005/3045/4892/files/Dull_skin.webp?v=1790081167",
  "frizzy hair": "https://cdn.shopify.com/s/files/1/1005/3045/4892/files/Frizzy_Hair.webp?v=1790081168",
  "hair growth": "https://cdn.shopify.com/s/files/1/1005/3045/4892/files/Hair_Growth.webp?v=1790081168",
  "diaper rash": "https://cdn.shopify.com/s/files/1/1005/3045/4892/files/Diaper_rash.webp?v=1790081167",
  "hair damage": "https://cdn.shopify.com/s/files/1/1005/3045/4892/files/Hair_Damage.webp?v=1790081167",
  "hair damge": "https://cdn.shopify.com/s/files/1/1005/3045/4892/files/Hair_Damage.webp?v=1790081167", // typo alias
  "hair fall": "https://cdn.shopify.com/s/files/1/1005/3045/4892/files/Hairfall_2.webp?v=1790081168",
  "skin hydration": "https://cdn.shopify.com/s/files/1/1005/3045/4892/files/Skin_Hydration.webp?v=1790081167",
  "skin soothing": "https://cdn.shopify.com/s/files/1/1005/3045/4892/files/Skin_Soothing.webp?v=1790081167",

  // Title-case aliases
  "Dandruff": "https://cdn.shopify.com/s/files/1/1005/3045/4892/files/Dandruff.webp?v=1790081167",
  "Dull Skin": "https://cdn.shopify.com/s/files/1/1005/3045/4892/files/Dull_skin.webp?v=1790081167",
  "Frizzy Hair": "https://cdn.shopify.com/s/files/1/1005/3045/4892/files/Frizzy_Hair.webp?v=1790081168",
  "Hair Growth": "https://cdn.shopify.com/s/files/1/1005/3045/4892/files/Hair_Growth.webp?v=1790081168",
  "Diaper Rash": "https://cdn.shopify.com/s/files/1/1005/3045/4892/files/Diaper_rash.webp?v=1790081167",
  "Hair Damage": "https://cdn.shopify.com/s/files/1/1005/3045/4892/files/Hair_Damage.webp?v=1790081167",
  "Hair Damge": "https://cdn.shopify.com/s/files/1/1005/3045/4892/files/Hair_Damage.webp?v=1790081167",
  "Hair Fall": "https://cdn.shopify.com/s/files/1/1005/3045/4892/files/Hairfall_2.webp?v=1790081168",
  "Skin Hydration": "https://cdn.shopify.com/s/files/1/1005/3045/4892/files/Skin_Hydration.webp?v=1790081167",
  "Skin Soothing": "https://cdn.shopify.com/s/files/1/1005/3045/4892/files/Skin_Soothing.webp?v=1790081167",
};

/**
 * Case-insensitive lookup helper for concern images.
 */
export function getConcernImage(name: string): string | undefined {
  if (!name) return undefined;
  const normalized = name.trim().toLowerCase();
  return CONCERN_IMAGES[normalized] || CONCERN_IMAGES[name];
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
// "Tummy Discomfort": ""
