import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shipping Policy | Tvaloka Wellness",
  description:
    "Order processing times, shipping timelines, tracking, delivery attempts and everything else you need to know about how Tvaloka Wellness ships your order.",
};

const linkClass =
  "text-primary underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black";
const h2Class = "font-display text-md text-primary";
const pClass = "mt-[var(--space-2)] text-sm leading-relaxed text-tertiary";
const ulClass = "mt-[var(--space-2)] list-disc space-y-1 pl-5 text-sm leading-relaxed text-tertiary";

export default function ShippingPolicyPage() {
  return (
    <main className="flex flex-1 flex-col bg-neutral-100">
      <div className="mx-auto w-full max-w-7xl px-[var(--space-4)] py-[var(--space-6)] sm:py-[var(--space-7)]">
        <div className="rounded-[var(--radius-xs)] bg-white p-[var(--space-5)] shadow-sm sm:p-[var(--space-7)]">
          <p className="text-xs font-semibold tracking-[0.3em] text-tertiary uppercase">Legal</p>
          <h1 className="font-display mt-[var(--space-3)] text-lg text-primary sm:text-xl">
            Shipping Policy
          </h1>

          <div className="mt-[var(--space-6)]">
            <p className={pClass}>
              At Tvaloka Wellness, we prepare every order with intention and care — packed
              softly, shipped swiftly, and sent from our studio to your doorstep like a small
              ritual of comfort.
            </p>
          </div>

          <div className="mt-[var(--space-6)]">
            <h2 className={h2Class}>1. Order Processing Time</h2>
            <p className={pClass}>
              We dispatch all orders within 1–2 business days (Monday to Saturday), excluding
              public holidays.
            </p>
            <p className={pClass}>
              During festivals, sales, or new launches, processing time may be slightly longer,
              but we&rsquo;ll always try to keep you informed.
            </p>
          </div>

          <div className="mt-[var(--space-6)]">
            <h2 className={h2Class}>2. Shipping Timelines</h2>
            <p className={pClass}>Once shipped, your order typically arrives within:</p>
            <ul className={ulClass}>
              <li>Metro cities: 3–5 business days</li>
              <li>Tier 2 &amp; Tier 3 cities: 4–7 business days</li>
              <li>Remote/interior areas: 6–10 business days</li>
            </ul>
            <p className={pClass}>
              Please note these are estimated timelines provided by our courier partners and may
              vary due to weather, operational delays, or unforeseen logistics issues.
            </p>
          </div>

          <div className="mt-[var(--space-6)]">
            <h2 className={h2Class}>3. Shipping Charges</h2>
            <p className={pClass}>We offer free shipping on all orders across India.</p>
          </div>

          <div className="mt-[var(--space-6)]">
            <h2 className={h2Class}>4. Order Tracking</h2>
            <p className={pClass}>
              Once your order is dispatched, you&rsquo;ll receive a tracking link via email, SMS,
              or WhatsApp so you can follow your package as it travels to you.
            </p>
            <p className={pClass}>
              If tracking is delayed in updating, don&rsquo;t worry — it usually syncs within 24
              hours.
            </p>
          </div>

          <div className="mt-[var(--space-6)]">
            <h2 className={h2Class}>5. Delivery Attempts</h2>
            <p className={pClass}>Our courier partner will make two delivery attempts.</p>
            <p className={pClass}>
              If the order is undeliverable due to an incorrect address, an unreachable phone
              number, or refusal to accept it, it will be returned to us. Reshipping charges may
              apply.
            </p>
          </div>

          <div className="mt-[var(--space-6)]">
            <h2 className={h2Class}>6. Incorrect Address or Contact Details</h2>
            <p className={pClass}>Please double-check your address and phone number at checkout.</p>
            <p className={pClass}>
              If you need to correct details after placing an order, write to us immediately at{" "}
              <a href="mailto:support@tvaloka.com" className={linkClass}>
                support@tvaloka.com
              </a>
              . Once shipped, address changes may not be possible.
            </p>
          </div>

          <div className="mt-[var(--space-6)]">
            <h2 className={h2Class}>7. Damaged, Leaking, or Incorrect Orders</h2>
            <p className={pClass}>
              If your parcel arrives damaged, leaking, or containing incorrect items, please
              reach out within 48 hours of delivery with:
            </p>
            <ul className={ulClass}>
              <li>Order ID</li>
              <li>Photos of the parcel and product</li>
              <li>A short description of the issue</li>
            </ul>
            <p className={pClass}>
              We&rsquo;ll make it right with a replacement or refund as per our policy.
            </p>
          </div>

          <div className="mt-[var(--space-6)]">
            <h2 className={h2Class}>8. Out-of-Stock Items</h2>
            <p className={pClass}>
              If an item becomes unavailable after your order is placed, we will contact you with
              the option to:
            </p>
            <ul className={ulClass}>
              <li>Replace it with another product</li>
              <li>Receive a full refund</li>
              <li>Hold the order until the item restocks (if applicable)</li>
            </ul>
          </div>

          <div className="mt-[var(--space-6)]">
            <h2 className={h2Class}>9. Shipping Restrictions</h2>
            <p className={pClass}>
              We currently ship within India only. International shipping will be introduced
              soon — stay tuned.
            </p>
          </div>

          <div className="mt-[var(--space-6)]">
            <h2 className={h2Class}>10. Contact Us</h2>
            <p className={pClass}>For any shipping-related questions, we&rsquo;re always here to help:</p>
            <p className={pClass}>
              <a href="mailto:support@tvaloka.com" className={linkClass}>
                support@tvaloka.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
