import { shopifyFetch, removeEdgesAndNodes, reshapeProducts } from "../index";
import { ShopifyCollection, ShopifyProduct } from "../types";

/**
 * Lightweight collection fetch used by the nav bar and hero slider.
 * Returns all collections with their banner image and description.
 * Revalidates every 5 minutes (ISR), tagged so on-demand revalidation
 * via `revalidateTag("collections")` clears it immediately.
 */
export async function getNavCollections(first = 20): Promise<ShopifyCollection[]> {
  const res = await shopifyFetch<{
    collections: {
      edges: Array<{
        node: {
          id: string;
          handle: string;
          title: string;
          description: string;
          updatedAt: string;
          image: {
            url: string;
            altText: string | null;
            width?: number;
            height?: number;
          } | null;
        };
      }>;
    };
  }>({
    query: `
      query getNavCollections($first: Int!) {
        collections(first: $first) {
          edges {
            node {
              id
              handle
              title
              description
              updatedAt
              image {
                url
                altText
                width
                height
              }
            }
          }
        }
      }
    `,
    variables: { first },
    next: { revalidate: 300, tags: ["collections"] },
  });

  return removeEdgesAndNodes(res.collections);
}

export async function getCollections(first = 20): Promise<ShopifyCollection[]> {
  const res = await shopifyFetch<{
    collections: {
      edges: Array<{
        node: {
          id: string;
          handle: string;
          title: string;
          description: string;
          updatedAt: string;
          image: {
            url: string;
            altText: string | null;
          } | null;
        };
      }>;
    };
  }>({
    query: `
      query getCollections($first: Int!) {
        collections(first: $first) {
          edges {
            node {
              id
              handle
              title
              description
              updatedAt
              image {
                url
                altText
              }
            }
          }
        }
      }
    `,
    variables: { first },
    next: { revalidate: 300, tags: ["collections"] },
  });

  return removeEdgesAndNodes(res.collections);
}

export async function getCollectionProducts({
  collectionHandle,
  first = 20,
}: {
  collectionHandle: string;
  first?: number;
}): Promise<ShopifyProduct[]> {
  const res = await shopifyFetch<{
    collection: {
      products: {
        edges: Array<{ node: unknown }>;
      };
    } | null;
  }>({
    query: `
      query getCollectionProducts($handle: String!, $first: Int!) {
        collection(handle: $handle) {
          products(first: $first) {
            edges {
              node {
                id
                handle
                title
                description
                availableForSale
                vendor
                productType
                tags
                priceRange {
                  minVariantPrice {
                    amount
                    currencyCode
                  }
                  maxVariantPrice {
                    amount
                    currencyCode
                  }
                }
                featuredImage {
                  url
                  altText
                  width
                  height
                }
                images(first: 5) {
                  edges {
                    node {
                      url
                      altText
                    }
                  }
                }
                variants(first: 10) {
                  edges {
                    node {
                      id
                      title
                      availableForSale
                      price {
                        amount
                        currencyCode
                      }
                      compareAtPrice {
                        amount
                        currencyCode
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    `,
    variables: { handle: collectionHandle, first },
    next: { revalidate: 60, tags: [`collection-${collectionHandle}`] },
  });

  if (!res.collection) return [];
  return reshapeProducts(removeEdgesAndNodes(res.collection.products));
}

export async function getCollectionWithProducts({
  collectionHandle,
  first = 50,
}: {
  collectionHandle: string;
  first?: number;
}): Promise<{
  collection: ShopifyCollection | null;
  products: ShopifyProduct[];
}> {
  const res = await shopifyFetch<{
    collection: {
      id: string;
      handle: string;
      title: string;
      description: string;
      updatedAt: string;
      image: {
        url: string;
        altText: string | null;
        width?: number;
        height?: number;
      } | null;
      products: {
        edges: Array<{ node: unknown }>;
      };
    } | null;
  }>({
    query: `
      query getCollectionWithProducts($handle: String!, $first: Int!) {
        collection(handle: $handle) {
          id
          handle
          title
          description
          updatedAt
          image {
            url
            altText
            width
            height
          }
          products(first: $first) {
            edges {
              node {
                id
                handle
                title
                description
                availableForSale
                vendor
                productType
                tags
                priceRange {
                  minVariantPrice {
                    amount
                    currencyCode
                  }
                  maxVariantPrice {
                    amount
                    currencyCode
                  }
                }
                featuredImage {
                  url
                  altText
                  width
                  height
                }
                images(first: 5) {
                  edges {
                    node {
                      url
                      altText
                    }
                  }
                }
                variants(first: 10) {
                  edges {
                    node {
                      id
                      title
                      availableForSale
                      price {
                        amount
                        currencyCode
                      }
                      compareAtPrice {
                        amount
                        currencyCode
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    `,
    variables: { handle: collectionHandle, first },
    next: { revalidate: 60, tags: [`collection-${collectionHandle}`] },
  });

  if (!res.collection) {
    return { collection: null, products: [] };
  }

  const { products, ...collectionData } = res.collection;
  return {
    collection: collectionData as ShopifyCollection,
    products: reshapeProducts(removeEdgesAndNodes(products)),
  };
}

