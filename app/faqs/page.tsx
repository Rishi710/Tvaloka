import type { Metadata } from "next";
import Link from "next/link";
import { FaqAccordion, type FaqItem } from "../components/FaqAccordion";

export const metadata: Metadata = {
  title: "FAQs | Tvaloka Wellness",
  description:
    "Answers to common questions about ordering, shipping, returns, payments and our Ayurvedic formulations.",
};

const h2Class = "font-display text-md text-primary";
const linkClass =
  "text-primary underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black";

const orderingAndShipping: FaqItem[] = [
  {
    question: "How long does it take to process my order?",
    answer:
      "We dispatch all orders within 1–2 business days (Monday to Saturday), excluding public holidays. During festivals, sales, or new launches, processing may take slightly longer.",
  },
  {
    question: "How long will delivery take?",
    answer:
      "Once shipped, orders typically arrive within 3–5 business days in metro cities, 4–7 business days in Tier 2 & Tier 3 cities, and 6–10 business days in remote or interior areas. These are estimates from our courier partners and may vary.",
  },
  {
    question: "Is shipping free?",
    answer: "Yes, we offer free shipping on all orders across India.",
  },
  {
    question: "Do you ship internationally?",
    answer: "Not yet. We currently ship within India only, but international shipping will be introduced soon.",
  },
  {
    question: "How can I track my order?",
    answer: "Once your order is dispatched, you'll receive a tracking link via email, SMS, or WhatsApp.",
  },
];

const returnsAndRefunds: FaqItem[] = [
  {
    question: "What is your return policy?",
    answer:
      "You have 7 days from the day your order arrives to request a return. To be eligible, the product must be unopened, unused, and in the same condition as when you received it, with the original packaging sealed and intact.",
  },
  {
    question: "How do I start a return?",
    answer:
      "Write to us at returns@tvaloka.com and our team will share the return address along with clear instructions.",
  },
  {
    question: "Which items can't be returned?",
    answer: "We don't accept returns on opened or used products, items purchased on sale, or gift cards.",
  },
  {
    question: "Can I exchange a product instead of returning it?",
    answer:
      "Yes, simply request a return for the unopened item, and once it's accepted, place a fresh order for the product you'd like instead.",
  },
  {
    question: "How long do refunds take?",
    answer:
      "Once your return is received and inspected, approved refunds are processed to your original payment method within 5–7 business days.",
  },
];

const paymentsAndPricing: FaqItem[] = [
  {
    question: "What payment methods do you accept?",
    answer: "We accept Visa, Mastercard, American Express, RuPay, PayPal, Net Banking, and Cash on Delivery.",
  },
  {
    question: "What currency are your prices in?",
    answer: "All prices are listed in Indian Rupees (INR).",
  },
];

const products: FaqItem[] = [
  {
    question: "Are Tvaloka Wellness products cruelty-free?",
    answer:
      "Yes, we do not test on animals at any stage, and we maintain clean-ingredient discipline across sourcing, formulation, and manufacturing.",
  },
  {
    question: "Where can I learn more about the ingredients you use?",
    answer: "Visit our Ingredients page for details on the botanicals used across our formulations.",
  },
];

export default function FaqsPage() {
  return (
    <main className="flex flex-1 flex-col bg-neutral-100">
      <div className="mx-auto w-full max-w-7xl px-[var(--space-4)] py-[var(--space-6)] sm:py-[var(--space-7)]">
        <div className="rounded-[var(--radius-xs)] bg-white p-[var(--space-5)] shadow-sm sm:p-[var(--space-7)]">
          <p className="text-xs font-semibold tracking-[0.3em] text-tertiary uppercase">Support</p>
          <h1 className="font-display mt-[var(--space-3)] text-lg text-primary sm:text-xl">
            Frequently Asked Questions
          </h1>
          <p className="mt-[var(--space-2)] text-sm leading-relaxed text-tertiary">
            Can&rsquo;t find what you&rsquo;re looking for?{" "}
            <a href="mailto:support@tvaloka.com" className={linkClass}>
              support@tvaloka.com
            </a>
          </p>

          <div className="mt-[var(--space-6)]">
            <h2 className={h2Class}>Ordering &amp; Shipping</h2>
            <FaqAccordion items={orderingAndShipping} />
          </div>

          <div className="mt-[var(--space-6)]">
            <h2 className={h2Class}>Returns &amp; Refunds</h2>
            <FaqAccordion items={returnsAndRefunds} />
            <p className="mt-[var(--space-3)] text-sm leading-relaxed text-tertiary">
              Full details are on our{" "}
              <Link href="/return-policy" className={linkClass}>
                Return &amp; Refund Policy
              </Link>{" "}
              page.
            </p>
          </div>

          <div className="mt-[var(--space-6)]">
            <h2 className={h2Class}>Payments &amp; Pricing</h2>
            <FaqAccordion items={paymentsAndPricing} />
          </div>

          <div className="mt-[var(--space-6)]">
            <h2 className={h2Class}>Our Products</h2>
            <FaqAccordion items={products} />
          </div>

          <div className="mt-[var(--space-6)]">
            <h2 className={h2Class}>Still have a question?</h2>
            <p className="mt-[var(--space-2)] text-sm leading-relaxed text-tertiary">
              Email{" "}
              <a href="mailto:support@tvaloka.com" className={linkClass}>
                support@tvaloka.com
              </a>{" "}
              or call{" "}
              <a href="tel:+919981300183" className={linkClass}>
                +919981300183
              </a>
              . Our care team is available Monday to Saturday, 10am–7pm IST.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
