import {
  ShopifyArticle,
  ShopifyCart,
  ShopifyCollection,
  ShopifyGraphQLResponse,
  ShopifyProduct,
  ShopifyProductVariant,
} from "./types";

const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || "tvaloka.myshopify.com";
const apiVersion = process.env.SHOPIFY_STOREFRONT_API_VERSION || "2024-10";
const storefrontPublicToken = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN || "";
const storefrontPrivateToken = process.env.SHOPIFY_STOREFRONT_PRIVATE_TOKEN || "";

const endpoint = `https://${domain}/api/${apiVersion}/graphql.json`;

export async function shopifyFetch<T>({
  query,
  variables,
  headers,
  cache = "force-cache",
  next,
}: {
  query: string;
  variables?: Record<string, unknown>;
  headers?: HeadersInit;
  cache?: RequestCache;
  next?: NextFetchRequestConfig;
}): Promise<T> {
  // Use private token when executing server-side if available, otherwise use public storefront token
  const isServer = typeof window === "undefined";
  const authHeaders: Record<string, string> = {};

  if (isServer && storefrontPrivateToken) {
    authHeaders["Shopify-Storefront-Private-Token"] = storefrontPrivateToken;
  } else if (storefrontPublicToken) {
    authHeaders["X-Shopify-Storefront-Access-Token"] = storefrontPublicToken;
  }

  try {
    const result = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders,
        ...headers,
      },
      body: JSON.stringify({
        query,
        variables,
      }),
      cache,
      ...(next && { next }),
    });

    const body: ShopifyGraphQLResponse<T> = await result.json();

    if (body.errors) {
      console.error("[Shopify Fetch Error]:", body.errors);
      throw new Error(body.errors[0]?.message || "Failed to fetch data from Shopify");
    }

    if (!body.data) {
      throw new Error("[Shopify Fetch Error]: Response missing data property");
    }

    return body.data;
  } catch (error) {
    console.error("[Shopify API Call Failed]:", error);
    throw error;
  }
}

// Data reshaping utilities
export function removeEdgesAndNodes<T>(array: { edges: Array<{ node: T }> } | undefined | null): T[] {
  if (!array || !array.edges) return [];
  return array.edges.map((edge) => edge.node);
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export function reshapeProduct(product: any): ShopifyProduct | null {
  if (!product) return null;

  const images = removeEdgesAndNodes(product.images);
  const variants = removeEdgesAndNodes(product.variants).map((variant: any) => ({
    ...variant,
    selectedOptions: variant.selectedOptions || [],
  }));

  return {
    ...product,
    images,
    variants: variants as ShopifyProductVariant[],
    tags: product.tags || [],
  };
}

export function reshapeProducts(products: any[]): ShopifyProduct[] {
  return products.map((p) => reshapeProduct(p)).filter((p): p is ShopifyProduct => p !== null);
}

export function reshapeArticle(article: any): ShopifyArticle | null {
  if (!article) return null;
  return {
    ...article,
    tags: article.tags || [],
  };
}

export function reshapeArticles(articles: any[]): ShopifyArticle[] {
  return articles.map((a) => reshapeArticle(a)).filter((a): a is ShopifyArticle => a !== null);
}

export function reshapeCart(cart: any): ShopifyCart | null {
  if (!cart) return null;

  const lines = removeEdgesAndNodes(cart.lines).map((line: any) => ({
    ...line,
    merchandise: {
      ...line.merchandise,
      selectedOptions: line.merchandise.selectedOptions || [],
    },
  }));

  return {
    ...cart,
    lines,
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

