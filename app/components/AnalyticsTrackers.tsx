"use client";

import { useEffect } from "react";
import {
  publishCollectionViewed,
  publishProductViewed,
  type AnalyticsProduct,
} from "../lib/shopifyAnalytics";
import { pixelViewCategory, pixelViewContent } from "../lib/pixel";

// Product and collection pages are server components, so these tiny client
// components report the view once the page is on screen (to Shopify Analytics
// and the Meta Pixel). They render nothing and take only plain values, so they
// add almost nothing to the page payload.

export function ProductViewTracker(product: AnalyticsProduct) {
  const { id, title, vendor, productType, variantId, variantTitle } = product;
  const { amount, currencyCode } = product.price;

  useEffect(() => {
    publishProductViewed({
      id,
      title,
      vendor,
      productType,
      variantId,
      variantTitle,
      price: { amount, currencyCode },
    });
    pixelViewContent({ id, variantId, title, price: amount, currencyCode });
  }, [id, title, vendor, productType, variantId, variantTitle, amount, currencyCode]);

  return null;
}

export function CollectionViewTracker({
  id,
  handle,
  title,
}: {
  id: string;
  handle: string;
  title: string;
}) {
  useEffect(() => {
    publishCollectionViewed(id, handle);
    pixelViewCategory(title, handle);
  }, [id, handle, title]);

  return null;
}
