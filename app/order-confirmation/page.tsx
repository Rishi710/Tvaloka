import type { Metadata } from "next";
import { OrderConfirmation } from "./OrderConfirmation";

export const metadata: Metadata = {
  title: "Order confirmed | Tvaloka Wellness",
  // A personal page: it should never show up in search results.
  robots: { index: false, follow: false },
};

export default function OrderConfirmationPage() {
  return (
    <main className="flex-1 bg-white py-10 sm:py-16">
      <OrderConfirmation />
    </main>
  );
}
