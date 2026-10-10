import { shopifyFetch, removeEdgesAndNodes, reshapeProduct, reshapeProducts } from "../index";
import { ShopifyProduct, ShopifySizeOption } from "../types";

// custom.size_option is a list of product references: each size is its own
// product, and every product in the group lists the whole group (itself included).
const sizeOptionsSelection = `
  sizeOptions: metafield(namespace: "custom", key: "size_option") {
    references(first: 10) {
      nodes {
        ... on Product {
          id
          handle
          title
          availableForSale
          size: metafield(namespace: "custom", key: "size") {
            value
          }
        }
      }
    }
  }
`;

type RawSizeOptions = {
  references?: {
    nodes?: Array<{
      id?: string;
      handle?: string;
      title?: string;
      availableForSale?: boolean;
      size?: { value?: string } | null;
    } | null>;
  } | null;
} | null;

function normalizeSizeOptions(raw: RawSizeOptions | undefined): ShopifySizeOption[] {
  const nodes = raw?.references?.nodes ?? [];
  return nodes.flatMap((node) =>
    node?.id && node.handle
      ? [
          {
            id: node.id,
            handle: node.handle,
            title: node.title ?? node.handle,
            size: node.size?.value?.trim() || null,
            availableForSale: node.availableForSale ?? true,
          },
        ]
      : [],
  );
}

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
      { namespace: "custom", key: "additional_information" },
      { namespace: "custom", key: "concern" },
      { namespace: "custom", key: "ingredient" },
      { namespace: "custom", key: "size" }
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
    next: { revalidate: 3600, tags: ["products"] },
  });

  return reshapeProducts(removeEdgesAndNodes(res.products));
}

export async function getProductByHandle(handle: string): Promise<ShopifyProduct | null> {
  const decodedHandle = decodeURIComponent(handle);
  const res = await shopifyFetch<{
    product?: unknown;
    productByHandle?: unknown;
  }>({
    query: `
      query getProductByHandle($handle: String!) {
        product(handle: $handle) {
          ...productFields
          ${sizeOptionsSelection}
        }
        productByHandle(handle: $handle) {
          ...productFields
          ${sizeOptionsSelection}
        }
      }
      ${productFragment}
    `,
    variables: { handle: decodedHandle },
    next: { revalidate: 3600, tags: [`product-${decodedHandle}`] },
  });

  const raw = (res.product || res.productByHandle) as
    | ({ sizeOptions?: RawSizeOptions } & Record<string, unknown>)
    | null
    | undefined;
  const product = reshapeProduct(raw);
  if (product) product.sizeOptions = normalizeSizeOptions(raw?.sizeOptions);
  return product;
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
    next: { revalidate: 3600, tags: ["products"] },
  });

  return reshapeProducts(res.productRecommendations || []);
}
