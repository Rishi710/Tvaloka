import type { Metadata } from "next";
import ingredientsData from "../data/ingredients.json";
import { IngredientsView, Ingredient } from "./IngredientsView";
import { getProducts } from "../lib/shopify/queries/product";
import { ShopifyProduct } from "../lib/shopify/types";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Our Sacred Ingredients | Tvaloka Ayurvedic Luxury",
  description:
    "Explore the potent Ayurvedic herbs, cold-pressed oils, and sacred botanicals handcrafted in Tvaloka luxury formulations.",
};

export default async function IngredientsPage() {
  const ingredients: Ingredient[] = ingredientsData as Ingredient[];
  let products: ShopifyProduct[] = [];
  try {
    products = await getProducts({ first: 100 });
  } catch (error) {
    console.error("Failed to load products for ingredients page:", error);
  }

  return (
    <main className="flex-1 bg-white">
      <IngredientsView ingredients={ingredients} products={products} />
    </main>
  );
}
