import { getProductByHandle } from "../lib/shopify/queries/product";
import { TRUSTED_TALES } from "../lib/trustedTales";
import { TrustedTales, type TrustedTaleItem } from "./TrustedTales";

// Accepts either a real handle or a pasted product name and turns it into
// Shopify's handle form: lowercase, every run of other characters becomes "-".
// "Castor Cold Pressed Oil For Hair & Skin 100% Pure"
//   -> "castor-cold-pressed-oil-for-hair-skin-100-pure"
function toHandle(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Cards come from app/lib/trustedTales.ts; product details are read live from Shopify.
export async function TrustedTalesSection() {
  const results = await Promise.all(
    TRUSTED_TALES.map(async (entry): Promise<TrustedTaleItem | null> => {
      const handle = toHandle(entry.handle);
      try {
        const product = await getProductByHandle(handle);
        if (!product) {
          console.warn(`Trusted Tales: no product found for "${entry.handle}" (tried "${handle}")`);
          return null;
        }
        return { product, videoSrc: entry.videoSrc };
      } catch (error) {
        console.error(`Failed to load Trusted Tales product "${entry.handle}":`, error);
        return null;
      }
    }),
  );

  const items = results.filter((item): item is TrustedTaleItem => item !== null);
  if (items.length === 0) return null;
  return <TrustedTales items={items} />;
}
