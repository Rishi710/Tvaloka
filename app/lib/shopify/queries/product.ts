import { shopifyFetch, removeEdgesAndNodes, reshapeProduct, reshapeProducts } from "../index";
import { ShopifyProduct } from "../types";

const productFragment = `
  fragment productFields on Product {
    id
    handle
    title
    description
    descriptionHtml
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
    images(first: 10) {
      edges {
        node {
          url
          altText
          width
          height
        }
      }
    }
    collections(first: 3) {
      edges {
        node {
          handle
          title
        }
      }
    }
    variants(first: 25) {
      edges {
        node {
          id
          title
          availableForSale
          sku
          price {
            amount
            currencyCode
          }
          compareAtPrice {
            amount
            currencyCode
          }
          selectedOptions {
            name
            value
          }
          image {
            url
            altText
          }
        }
      }
    }
    metafields(identifiers: [
      { namespace: "custom", key: "benefits" },
      { namespace: "custom", key: "how_to_use" },
      { namespace: "custom", key: "faqs" },
      { namespace: "custom", key: "safety_information" },
      { namespace: "custom", key: "additional_information" }
    ]) {
      id
      namespace
      key
      value
      type
    }
  }
`;

export async function getProducts({
  query,
  reverse,
  sortKey,
  first = 20,
}: {
  query?: string;
  reverse?: boolean;
  sortKey?: string;
  first?: number;
} = {}): Promise<ShopifyProduct[]> {
  const res = await shopifyFetch<{
    products: { edges: Array<{ node: unknown }> };
  }>({
    query: `
      query getProducts($query: String, $reverse: Boolean, $sortKey: ProductSortKeys, $first: Int) {
        products(query: $query, reverse: $reverse, sortKey: $sortKey, first: $first) {
          edges {
            node {
              ...productFields
            }
          }
        }
      }
      ${productFragment}
    `,
    variables: { query, reverse, sortKey, first },
    next: { revalidate: 60, tags: ["products"] },
  });

  return reshapeProducts(removeEdgesAndNodes(res.products));
}

export async function getProductByHandle(handle: string): Promise<ShopifyProduct | null> {
  const res = await shopifyFetch<{
    productByHandle: unknown;
  }>({
    query: `
      query getProductByHandle($handle: String!) {
        productByHandle(handle: $handle) {
          ...productFields
        }
      }
      ${productFragment}
    `,
    variables: { handle },
    next: { revalidate: 60, tags: [`product-${handle}`] },
  });

  return reshapeProduct(res.productByHandle);
}

export async function getProductRecommendations(productId: string): Promise<ShopifyProduct[]> {
  const res = await shopifyFetch<{
    productRecommendations: unknown[];
  }>({
    query: `
      query getProductRecommendations($productId: ID!) {
        productRecommendations(productId: $productId) {
          ...productFields
        }
      }
      ${productFragment}
    `,
    variables: { productId },
    next: { revalidate: 60 },
  });

  return reshapeProducts(res.productRecommendations || []);
}
