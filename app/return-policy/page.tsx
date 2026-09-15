import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Return & Refund Policy | Tvaloka Wellness",
  description:
    "How returns, exchanges and refunds work at Tvaloka Wellness — eligibility, non-returnable items, and refund timelines.",
};

const linkClass =
  "text-primary underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black";
const h2Class = "font-display text-md text-primary";
const pClass = "mt-[var(--space-2)] text-sm leading-relaxed text-tertiary";
const ulClass = "mt-[var(--space-2)] list-disc space-y-1 pl-5 text-sm leading-relaxed text-tertiary";

export default function ReturnPolicyPage() {
  return (
    <main className="flex flex-1 flex-col bg-neutral-100">
      <div className="mx-auto w-full max-w-7xl px-[var(--space-4)] py-[var(--space-6)] sm:py-[var(--space-7)]">
        <div className="rounded-[var(--radius-xs)] bg-white p-[var(--space-5)] shadow-sm sm:p-[var(--space-7)]">
          <p className="text-xs font-semibold tracking-[0.3em] text-tertiary uppercase">Legal</p>
          <h1 className="font-display mt-[var(--space-3)] text-lg text-primary sm:text-xl">
            Return &amp; Refund Policy
          </h1>

          <div className="mt-[var(--space-6)]">
            <p className={pClass}>
              At Tvaloka Wellness, we craft every bottle with intention, softness, and stories
              from our roots. But if something doesn&rsquo;t feel right, we&rsquo;re here to make
              the journey back just as comforting.
            </p>
          </div>

          <div className="mt-[var(--space-6)]">
            <h2 className={h2Class}>7-Day Easy Returns</h2>
            <p className={pClass}>
              You have 7 days from the day your order arrives to request a return.
            </p>
            <p className={pClass}>
              To be eligible, the product must be unopened, unused, and in the same condition as
              when you received it, with the original packaging sealed and intact. Think of it as
              a product that hasn&rsquo;t yet begun its ritual with you.
            </p>
            <p className={`${pClass} font-semibold text-primary`}>To start a return:</p>
            <p className={pClass}>
              Simply write to us at{" "}
              <a href="mailto:returns@tvaloka.com" className={linkClass}>
                returns@tvaloka.com
              </a>
              . Our team will guide you gently through the process and share the return address
              along with clear instructions.
            </p>
            <p className={pClass}>
              Please note: items sent back without first requesting a return will not be
              accepted.
            </p>
          </div>

          <div className="mt-[var(--space-6)]">
            <h2 className={h2Class}>Damages &amp; Transit Issues</h2>
            <p className={pClass}>
              If your product reaches you broken, leaking, or not quite what you ordered, please
              reach out to us immediately. We&rsquo;ll look into it with care and make things
              right no stress, no friction.
            </p>
          </div>

          <div className="mt-[var(--space-6)]">
            <h2 className={h2Class}>Non-Returnable Items</h2>
            <p className={pClass}>
              Because we craft personal care products meant for delicate skin rituals, items
              cannot be returned once opened. We also do not accept returns on:
            </p>
            <ul className={ulClass}>
              <li>Opened or used products</li>
              <li>Items purchased on sale</li>
              <li>Gift cards</li>
            </ul>
            <p className={pClass}>
              If you&rsquo;re unsure about your specific case, just write to us we&rsquo;re
              happy to help.
            </p>
          </div>

          <div className="mt-[var(--space-6)]">
            <h2 className={h2Class}>Exchanges</h2>
            <p className={pClass}>
              If you&rsquo;d like something else instead, simply request a return for the
              unopened item. Once accepted, you may place a fresh order for the product you want.
              Simple and seamless.
            </p>
          </div>

          <div className="mt-[var(--space-6)]">
            <h2 className={h2Class}>Refunds</h2>
            <p className={pClass}>
              Once we receive your return and inspect the product, we&rsquo;ll let you know if
              the refund is approved.
            </p>
            <p className={pClass}>
              Approved refunds are processed to your original payment method within 5–7 business
              days.
            </p>
            <p className={pClass}>
              Your bank or payment provider may take a little extra time to reflect the credit thank you for your patience as it travels back to you.
            </p>
            <p className={pClass}>
              If more than 15 business days have passed since approval, please write to us at{" "}
              <a href="mailto:support@tvaloka.com" className={linkClass}>
                support@tvaloka.com
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
