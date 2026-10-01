import type { Metadata } from "next";
import { Open_Sans, Aboreto } from "next/font/google";
import { AnnouncementBar } from "./components/AnnouncementBar";
import { CartProvider } from "./components/CartContext";
import { SideCart } from "./components/SideCart";
import { SiteFooter } from "./components/SiteFooter";
import { SiteHeader } from "./components/SiteHeader";
import type { NavItem } from "./components/SiteHeader";
import { getNavCollections } from "./lib/shopify/queries/collection";
import "./globals.css";

const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
});

const aboreto = Aboreto({
  variable: "--font-aboreto",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Tvaloka",
  description: "Tvaloka",
};

/**
 * Order the collection tabs appear in the header nav, by Shopify collection
 * handle. Reorder this list to reorder the tabs. Any collection not listed
 * here still shows, appended after these in whatever order Shopify returns.
 */
const NAV_COLLECTION_ORDER = [
  "best-sellers",
  "new-launches",
  "bath-body-care",
  "face-care",
  "baby-care",
  "hair-care",
  "wellness-care",
];

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let navItems: NavItem[] = [];

  try {
    const collections = await getNavCollections();
    navItems = collections
      .filter((c) => c.handle !== "frontpage") // Shopify's default "Home page" collection
      .map((c) => ({
        label: c.title,
        href: `/${c.handle}`,
        handle: c.handle,
      }))
      .sort((a, b) => {
        const rankA = NAV_COLLECTION_ORDER.indexOf(a.handle);
        const rankB = NAV_COLLECTION_ORDER.indexOf(b.handle);
        if (rankA === -1 && rankB === -1) return 0; // keep Shopify's order between unlisted ones
        if (rankA === -1) return 1;
        if (rankB === -1) return -1;
        return rankA - rankB;
      })
      .map(({ label, href }) => ({ label, href }));
  } catch (error) {
    console.error("[RootLayout] Failed to fetch nav collections:", error);
    // navItems stays empty — SiteHeader renders only pinned static items
  }

  return (
    <html
      lang="en"
      className={`${openSans.variable} ${aboreto.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      {/* suppressHydrationWarning: browser extensions (e.g. ColorZilla's
          cz-shortcut-listen) inject attributes onto <body> before React
          hydrates. That's a real DOM mismatch but not a bug in our markup,
          so only body's own attributes are exempted from the check. */}
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <CartProvider>
          <AnnouncementBar />
          <SiteHeader navItems={navItems} />
          {children}
          <SiteFooter />
          <SideCart />
        </CartProvider>
      </body>
    </html>
  );
}
