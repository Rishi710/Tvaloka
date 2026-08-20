import { shopifyFetch, reshapeCart } from "../index";
import { ShopifyCart } from "../types";

const cartFragment = `
  fragment cartFields on Cart {
    id
    checkoutUrl
    totalQuantity
    cost {
      subtotalAmount {
        amount
        currencyCode
      }
      totalAmount {
        amount
        currencyCode
      }
      totalTaxAmount {
        amount
        currencyCode
      }
    }
    lines(first: 100) {
      edges {
        node {
          id
          quantity
          cost {
            totalAmount {
              amount
              currencyCode
            }
          }
          merchandise {
            ... on ProductVariant {
              id
              title
              price {
                amount
                currencyCode
              }
              selectedOptions {
                name
                value
              }
              product {
                id
                handle
                title
                featuredImage {
                  url
                  altText
                }
              }
            }
          }
        }
      }
    }
  }
`;

export async function createCart(): Promise<ShopifyCart | null> {
  const res = await shopifyFetch<{
    cartCreate: { cart: unknown };
  }>({
    query: `
      mutation createCart {
        cartCreate {
          cart {
            ...cartFields
          }
        }
      }
      ${cartFragment}
    `,
    cache: "no-store",
  });

  return reshapeCart(res.cartCreate.cart);
}

export async function getCart(cartId: string): Promise<ShopifyCart | null> {
  const res = await shopifyFetch<{
    cart: unknown;
  }>({
    query: `
      query getCart($cartId: ID!) {
        cart(id: $cartId) {
          ...cartFields
        }
      }
      ${cartFragment}
    `,
    variables: { cartId },
    cache: "no-store",
  });

  return reshapeCart(res.cart);
}

export async function addToCart(
  cartId: string,
  lines: Array<{ merchandiseId: string; quantity: number }>
): Promise<ShopifyCart | null> {
  const res = await shopifyFetch<{
    cartLinesAdd: { cart: unknown };
  }>({
    query: `
      mutation addToCart($cartId: ID!, $lines: [CartLineInput!]!) {
        cartLinesAdd(cartId: $cartId, lines: $lines) {
          cart {
            ...cartFields
          }
        }
      }
      ${cartFragment}
    `,
    variables: { cartId, lines },
    cache: "no-store",
  });

  return reshapeCart(res.cartLinesAdd.cart);
}

export async function removeFromCart(cartId: string, lineIds: string[]): Promise<ShopifyCart | null> {
  const res = await shopifyFetch<{
    cartLinesRemove: { cart: unknown };
  }>({
    query: `
      mutation removeFromCart($cartId: ID!, $lineIds: [ID!]!) {
        cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
          cart {
            ...cartFields
          }
        }
      }
      ${cartFragment}
    `,
    variables: { cartId, lineIds },
    cache: "no-store",
  });

  return reshapeCart(res.cartLinesRemove.cart);
}

export async function updateCartItemQuantity(
  cartId: string,
  lines: Array<{ id: string; quantity: number }>
): Promise<ShopifyCart | null> {
  const res = await shopifyFetch<{
    cartLinesUpdate: { cart: unknown };
  }>({
    query: `
      mutation updateCartItemQuantity($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
        cartLinesUpdate(cartId: $cartId, lines: $lines) {
          cart {
            ...cartFields
          }
        }
      }
      ${cartFragment}
    `,
    variables: { cartId, lines },
    cache: "no-store",
  });

  return reshapeCart(res.cartLinesUpdate.cart);
}
