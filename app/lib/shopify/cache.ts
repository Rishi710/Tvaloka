/**
 * How long cached Shopify data (and so the pages built from it) may go before
 * a timed refresh. Vercel bills ISR writes in 8 KB blocks, and Next uses the
 * SHORTEST window of everything a page reads, so one short window anywhere
 * drags every page that includes it.
 *
 * Shopify webhooks (app/api/revalidate) refresh real changes immediately, so
 * these timers are only a safety net and can be long.
 */

/** Header collection list. Read by every page via the root layout. */
export const REVALIDATE_NAV = 60 * 60 * 24 * 7; // 7 days

/** Product lists and collection pages: home rails, /products, search, collections. */
export const REVALIDATE_LISTS = 60 * 60 * 6; // 6 hours

/** One product and what a product page needs beside it. Webhooks refresh edits at once. */
export const REVALIDATE_PRODUCT = 60 * 60 * 24; // 24 hours

/** Blog articles. Shopify offers no article webhook here, so these rely on the timer. */
export const REVALIDATE_ARTICLES = 60 * 60 * 6; // 6 hours
