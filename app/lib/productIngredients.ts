import ingredientsData from "../data/ingredients.json";
import type { Ingredient } from "../ingredients/IngredientsView";

export interface MatchedIngredient {
  word: string;
  commonName: string;
  latinName: string | null;
  image?: string;
  tags?: string[];
  about?: string;
  subtitle?: string;
  work?: string;
}

export function parseBotanicalName(rawName: string) {
  if (!rawName) return { common: "", latin: null };
  const match = rawName.match(/^(.*?)\s*\((.*?)\)$/);
  if (match) {
    return {
      common: match[1].trim(),
      latin: match[2].trim(),
    };
  }
  return { common: rawName.trim(), latin: null };
}

function normalize(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/**
 * Finds all exact ingredients in ingredients.json that are formulated in this product.
 */
export function getIngredientsForProduct(title: string): Ingredient[] {
  if (!title) return [];
  const normTitle = normalize(title);
  const firstWord = title.trim().split(/\s+/)[0]?.toLowerCase() || "";

  const matched = (ingredientsData as Ingredient[]).filter((ing) => {
    return ing.foundIn?.some((prodName: string) => {
      const normProd = normalize(prodName);
      if (normProd === normTitle) return true;
      if (normTitle.includes(normProd) || normProd.includes(normTitle)) return true;

      const prodFirstWord = prodName.trim().split(/\s+/)[0]?.toLowerCase() || "";
      if (firstWord.length > 3 && prodFirstWord === firstWord) {
        return true;
      }
      return false;
    });
  });

  // Deduplicate by common botanical name
  const seen = new Set<string>();
  const results: Ingredient[] = [];

  matched.forEach((ing) => {
    const { common } = parseBotanicalName(ing.word);
    const key = common.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      results.push(ing);
    }
  });

  return results;
}
