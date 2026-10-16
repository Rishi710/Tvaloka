import { PLACEHOLDER_VIDEO_URL } from "./videos";

export interface TrustedTaleEntry {
  /** Shopify product handle — the last part of the product URL (/products/<handle>). */
  handle: string;
  /** Direct video file URL (.mp4 / .webm), e.g. one uploaded to Shopify Files. */
  videoSrc: string;
}

/**
 * The cards in the "Trusted Tales" section, in display order.
 *
 * - Change `videoSrc` to point a card at its own video.
 * - Change `handle` to show a different product — either its URL handle or
 *   its exact product name. Its name, type, price and compare price are read
 *   live from Shopify.
 * - Add or remove lines to add or remove cards.
 */
export const TRUSTED_TALES: TrustedTaleEntry[] = [
  {
    handle: "Vedikaa Baby Tummy Roll-On Sesame & Peppermint Oil",
    videoSrc: "https://cdn.shopify.com/videos/c/o/v/21a92f5342dd4d089d66617b5911b9d9.mp4",
  },
  {
    handle: "Nyra Baby Hair Oil Sesame, Castor & Rosemary Oil",
    videoSrc: "https://cdn.shopify.com/videos/c/o/v/75475243923d47e4a60d458f4e1d9f88.mp4",
  },
  {
    handle: "Castor Cold Pressed Oil For Hair & Skin 100% Pure",
    videoSrc: "https://cdn.shopify.com/videos/c/o/v/b51d8927330845adb68a25d289302439.mp4",
  },
  {
    handle: "Aabhaa Baby Face Cream Aloe Vera, Rose, Shea Butter & Vitamin E",
    videoSrc: "https://cdn.shopify.com/videos/c/o/v/b2d3ac2f4ba94fdaa57bf564646c8e17.mp4",
  },
  {
    handle: "Castor Cold Pressed Oil For Hair & Skin 100% Pure",
    videoSrc: "https://cdn.shopify.com/videos/c/o/v/1325f802c6c44162b7d25dcbca11f33f.mp4",
  },
  {
    handle: "Navya Baby Massage Oil Almond & Sandalwood Oil",
    videoSrc: "https://cdn.shopify.com/videos/c/o/v/75475243923d47e4a60d458f4e1d9f88.mp4",
  },
  // {
  //   handle: "lavender-essential-oil-for-hair-skin",
  //   videoSrc: PLACEHOLDER_VIDEO_URL,
  // },
];
