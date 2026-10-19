"use client";

import { ShopifyScripts } from "@shopify/hydrogen/react";

// Non-secret identifiers for this shop. The Shop ID comes from the Storefront
// API (`shop { id }`). The storefront ID is the Headless channel's own ID and
// can only be read in Shopify Admin, so it lives in an env var.
const SHOP_ID = process.env.NEXT_PUBLIC_SHOPIFY_SHOP_ID || "gid://shopify/Shop/100530454892";
const STOREFRONT_ID = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ID;
const MYSHOPIFY_DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || "tvaloka.myshopify.com";

/**
 * Loads Shopify's own storefront scripts (Customer Privacy API, analytics bus
 * and the storefront analytics script) using Shopify's official helper. This is
 * what makes visits, product views and add-to-carts show up in Shopify
 * Analytics for a headless storefront: it sends page views on load and on every
 * client-side navigation, and receives the product/collection/cart events we
 * publish from app/lib/shopifyAnalytics.ts.
 *
 * Orders aren't reported from here: they're created by Shopify's own checkout,
 * which Shopify already counts.
 *
 * Renders nothing until NEXT_PUBLIC_SHOPIFY_STOREFRONT_ID is set, so the site
 * never sends half-attributed events.
 */
export default function ShopifyAnalytics() {
  if (!STOREFRONT_ID) {
    if (process.env.NODE_ENV === "development") {
      console.info(
        "[Shopify Analytics] Off: set NEXT_PUBLIC_SHOPIFY_STOREFRONT_ID (Headless channel storefront ID) to enable it.",
      );
    }
    return null;
  }

  return (
    <ShopifyScripts
      shop={{
        shopId: SHOP_ID,
        storefrontId: STOREFRONT_ID,
        myshopifyDomain: MYSHOPIFY_DOMAIN,
      }}
      analytics={{ channel: "headless" }}
      consent={{ mode: "no-banner" }}
      i18n={{ country: "IN", language: "EN", currency: "INR" }}
      webMcp={false}
    />
  );
}
