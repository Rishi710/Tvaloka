"use client";

import { useEffect } from "react";
import {
  publishCollectionViewed,
  publishProductViewed,
  type AnalyticsProduct,
} from "../lib/shopifyAnalytics";

// Product and collection pages are server components, so these tiny client
// components report the view once the page is on screen. They render nothing
// and take only plain values, so they add almost nothing to the page payload.

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
  }, [id, title, vendor, productType, variantId, variantTitle, amount, currencyCode]);

  return null;
}

export function CollectionViewTracker({ id, handle }: { id: string; handle: string }) {
  useEffect(() => {
    publishCollectionViewed(id, handle);
  }, [id, handle]);

  return null;
}
