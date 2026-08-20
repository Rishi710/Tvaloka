import { shopifyFetch, removeEdgesAndNodes, reshapeProducts } from "../index";
import { ShopifyCollection, ShopifyProduct } from "../types";

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
