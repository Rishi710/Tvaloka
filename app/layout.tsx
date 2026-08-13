import type { Metadata } from "next";
import { Open_Sans, Aboreto } from "next/font/google";
import { AnnouncementBar } from "./components/AnnouncementBar";
import { SiteHeader } from "./components/SiteHeader";
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${openSans.variable} ${aboreto.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AnnouncementBar />
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
