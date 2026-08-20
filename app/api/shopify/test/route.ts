import { NextResponse } from "next/server";
import { shopifyFetch } from "@/app/lib/shopify";
import { getProducts } from "@/app/lib/shopify/queries/product";
import { getCollections } from "@/app/lib/shopify/queries/collection";

export async function GET() {
  try {
    const shopInfo = await shopifyFetch<{
      shop: {
        name: string;
        description: string;
        primaryDomain: {
          url: string;
          host: string;
        };
      };
    }>({
      query: `
        query getShopInfo {
          shop {
            name
            description
            primaryDomain {
              url
              host
            }
          }
        }
      `,
    });

    const products = await getProducts({ first: 5 });
    const collections = await getCollections(5);

    return NextResponse.json({
      status: "success",
      connected: true,
      shop: shopInfo.shop,
      productsCount: products.length,
      collectionsCount: collections.length,
      sampleProducts: products.map((p) => ({
        id: p.id,
        handle: p.handle,
        title: p.title,
        price: p.priceRange.minVariantPrice,
      })),
      sampleCollections: collections.map((c) => ({
        id: c.id,
        handle: c.handle,
        title: c.title,
      })),
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      {
        status: "error",
        connected: false,
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}
