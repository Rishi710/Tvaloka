import type { Metadata } from "next";
import { Open_Sans, Aboreto } from "next/font/google";
import { AnnouncementBar } from "./components/AnnouncementBar";
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
      }));
  } catch (error) {
    console.error("[RootLayout] Failed to fetch nav collections:", error);
    // navItems stays empty — SiteHeader renders only pinned static items
  }

  return (
    <html
      lang="en"
      className={`${openSans.variable} ${aboreto.variable} h-full antialiased`}
    >
      {/* suppressHydrationWarning: browser extensions (e.g. ColorZilla's
          cz-shortcut-listen) inject attributes onto <body> before React
          hydrates. That's a real DOM mismatch but not a bug in our markup,
          so only body's own attributes are exempted from the check. */}
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <AnnouncementBar />
        <SiteHeader navItems={navItems} />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
