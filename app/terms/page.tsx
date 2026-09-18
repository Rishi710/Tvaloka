import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service | Tvaloka Wellness",
  description:
    "The terms that govern your use of the Tvaloka Wellness website, online store and related services.",
};

// A legal document's "last updated" date is a fixed point in time, not
// whatever day the page happens to be rebuilt — so this is a hardcoded
// string, not new Date(), unlike e.g. the footer's copyright year.
const LAST_UPDATED = "15 September 2026";

const linkClass =
  "text-primary underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black";
const h2Class = "font-display text-md text-primary";
const pClass = "mt-[var(--space-2)] text-sm leading-relaxed text-tertiary";
const ulClass = "mt-[var(--space-2)] list-disc space-y-1 pl-5 text-sm leading-relaxed text-tertiary";

export default function TermsOfServicePage() {
  return (
    <main className="flex flex-1 flex-col bg-neutral-100">
      <div className="mx-auto w-full max-w-7xl px-[var(--space-4)] py-[var(--space-6)] sm:py-[var(--space-7)]">
        <div className="rounded-[var(--radius-xs)] bg-white p-[var(--space-5)] shadow-sm sm:p-[var(--space-7)]">
          <p className="text-xs font-semibold tracking-[0.3em] text-tertiary uppercase">Legal</p>
          <h1 className="font-display mt-[var(--space-3)] text-lg text-primary sm:text-xl">
            Terms of Service
          </h1>
          <p className="mt-[var(--space-2)] text-xs text-tertiary">Last updated: {LAST_UPDATED}</p>

          <div className="mt-[var(--space-6)]">
            <p className={pClass}>
              Welcome to Tvaloka Wellness. The terms &ldquo;we&rdquo;, &ldquo;us&rdquo;, and
              &ldquo;our&rdquo; refer to Tvaloka Wellness, operated by Ma&amp;Me Enterprises Pvt.
              Ltd., an Indian company registered in Indore, Madhya Pradesh. These Terms of Service
              (&ldquo;Terms&rdquo;) govern your use of our website, online store, and all related
              services (collectively, the &ldquo;Services&rdquo;). Our store is powered by Shopify,
              which enables us to provide these Services to you.
            </p>
            <p className={pClass}>
              By accessing or using the Services, you agree to be bound by these Terms and by our{" "}
              <Link href="/policies" className={linkClass}>
                Privacy Policy
              </Link>
              . If you do not agree, you may not use the Services.
            </p>

            <div className="mt-[var(--space-6)]">
              <h2 className={h2Class}>1. Eligibility &amp; Account Access</h2>
              <p className={pClass}>
                By agreeing to these Terms, you confirm that you are 18 years or older and legally
                capable of entering into a binding contract under Indian law.
              </p>
              <p className={pClass}>
                You may be required to provide accurate and complete information (such as email,
                address, and payment details) to use certain features. You are solely responsible
                for maintaining the confidentiality of your account and for all activity under your
                account.
              </p>
            </div>

            <div className="mt-[var(--space-6)]">
              <h2 className={h2Class}>2. Our Products</h2>
              <p className={pClass}>
                We make every effort to accurately display product details. However:
              </p>
              <ul className={ulClass}>
                <li>Colours and appearance may vary based on your device.</li>
                <li>Product descriptions, formulations, and prices may change without notice.</li>
                <li>We may discontinue or limit quantities of products at our discretion.</li>
                <li>
                  We do not guarantee that any product will meet your expectations or that
                  descriptions will be error-free.
                </li>
              </ul>
            </div>

            <div className="mt-[var(--space-6)]">
              <h2 className={h2Class}>3. Orders &amp; Acceptance</h2>
              <p className={pClass}>
                When you place an order, you are making an offer to purchase. An order is
                considered accepted only when we send you a confirmation email and successfully
                process your payment.
              </p>
              <p className={pClass}>
                We reserve the right to refuse, modify, or cancel any order for reasons including
                product availability, errors, or suspected fraud. If your order is cancelled, we
                will notify you via the contact details you provided.
              </p>
              <p className={pClass}>
                All purchases are subject to our{" "}
                <Link href="/policies" className={linkClass}>
                  Refund &amp; Return Policy
                </Link>
                . You represent that purchases are for personal use and not for resale.
              </p>
            </div>

            <div className="mt-[var(--space-6)]">
              <h2 className={h2Class}>4. Pricing, Payments &amp; Billing</h2>
              <p className={pClass}>
                Prices are listed in Indian Rupees (INR) and may be changed without notice. Prices
                shown at checkout will be the final charges before shipping and taxes.
              </p>
              <p className={pClass}>
                You agree to provide current, accurate, and complete payment information. By
                submitting payment details, you confirm that:
              </p>
              <ul className={ulClass}>
                <li>You are authorised to use the selected payment method.</li>
                <li>All charges will be honoured by your bank or payment provider.</li>
                <li>You will pay all applicable amounts including GST, shipping, and any additional charges.</li>
              </ul>
              <p className={pClass}>
                We are not responsible for payment failures or transaction delays.
              </p>
            </div>

            <div className="mt-[var(--space-6)]">
              <h2 className={h2Class}>5. Shipping, Delivery &amp; Risk of Loss</h2>
              <p className={pClass}>
                Estimated shipping times are provided for convenience and are not guaranteed.
                Delivery delays may occur due to courier issues, strikes, weather conditions, or
                other factors outside our control.
              </p>
              <p className={pClass}>
                Once we hand over your order to the courier partner, risk of loss passes to you.
              </p>
            </div>

            <div className="mt-[var(--space-6)]">
              <h2 className={h2Class}>6. Intellectual Property</h2>
              <p className={pClass}>
                All content available through the Services, including trademarks, text, images,
                videos, graphics, product descriptions, and layouts, is owned by Tvaloka Wellness /
                Ma&amp;Me Enterprises Pvt. Ltd. or our licensors.
              </p>
              <p className={pClass}>
                You may not copy, reproduce, modify, distribute, or exploit any part of the
                Services without prior written permission. All rights not expressly granted to you
                are reserved.
              </p>
            </div>

            <div className="mt-[var(--space-6)]">
              <h2 className={h2Class}>7. Optional Third-Party Tools &amp; Integrations</h2>
              <p className={pClass}>
                The Services may provide access to third-party tools or applications. We do not
                control these tools and provide them &ldquo;as is&rdquo; without warranties. Your
                use of third-party tools is entirely at your own risk and subject to the respective
                provider&rsquo;s terms.
              </p>
              <p className={pClass}>Future features or tools added to the site also fall under these Terms.</p>
            </div>

            <div className="mt-[var(--space-6)]">
              <h2 className={h2Class}>8. Third-Party Links</h2>
              <p className={pClass}>
                The Services may contain links to external websites. We do not endorse or take
                responsibility for third-party content, privacy practices, or transactions.
                Engaging with these sites is solely at your own risk.
              </p>
            </div>

            <div className="mt-[var(--space-6)]">
              <h2 className={h2Class}>9. Relationship With Shopify</h2>
              <p className={pClass}>
                Our store is powered by Shopify. Purchases made on our website are transactions
                between you and Tvaloka Wellness (Ma&amp;Me Enterprises Pvt. Ltd.). Shopify is not
                responsible for product quality, safety, delivery, damages, or disputes arising
                from your purchase.
              </p>
              <p className={pClass}>
                You expressly release Shopify from any liability related to your transactions with
                us.
              </p>
            </div>

            <div className="mt-[var(--space-6)]">
              <h2 className={h2Class}>10. Privacy Policy</h2>
              <p className={pClass}>
                Your information is processed in accordance with our{" "}
                <Link href="/policies" className={linkClass}>
                  Privacy Policy
                </Link>{" "}
                and Shopify&rsquo;s data policies. By using the Services, you consent to data
                collection, storage, and processing as described.
              </p>
              <p className={pClass}>
                Some data may be transferred to or stored in other countries for processing by
                Shopify or third-party partners.
              </p>
            </div>

            <div className="mt-[var(--space-6)]">
              <h2 className={h2Class}>11. Feedback</h2>
              <p className={pClass}>
                Any feedback, reviews, ideas, or suggestions (&ldquo;Feedback&rdquo;) submitted by
                you may be used by us without restrictions or compensation. You grant us a
                worldwide, royalty-free, perpetual licence to use, display, modify, and distribute
                such Feedback.
              </p>
              <p className={pClass}>You represent that your Feedback:</p>
              <ul className={ulClass}>
                <li>Is original and lawful</li>
                <li>Does not violate intellectual property rights</li>
                <li>Does not contain harmful, offensive, or misleading content</li>
              </ul>
              <p className={pClass}>We may remove Feedback that violates these Terms.</p>
            </div>

            <div className="mt-[var(--space-6)]">
              <h2 className={h2Class}>12. Errors &amp; Corrections</h2>
              <p className={pClass}>
                Occasionally product descriptions, pricing, availability, or other site information
                may contain errors. We reserve the right to correct any inaccuracies or cancel
                orders based on inaccurate information.
              </p>
            </div>

            <div className="mt-[var(--space-6)]">
              <h2 className={h2Class}>13. Prohibited Uses</h2>
              <p className={pClass}>You may not use the Services for:</p>
              <ul className={ulClass}>
                <li>Unlawful, fraudulent, or harmful activities</li>
                <li>Harassment, abuse, or defamation</li>
                <li>Uploading viruses or malicious code</li>
                <li>Copying or scraping site content</li>
                <li>Circumventing security features</li>
                <li>Misrepresentation or impersonation</li>
                <li>Interference with the website&rsquo;s functionality</li>
              </ul>
              <p className={pClass}>Violation may result in account suspension or legal action.</p>
            </div>

            <div className="mt-[var(--space-6)]">
              <h2 className={h2Class}>14. Termination</h2>
              <p className={pClass}>
                We may suspend or terminate your access to the Services at any time, without
                notice, for violation of these Terms or for any reason deemed necessary.
              </p>
              <p className={pClass}>
                Sections related to Intellectual Property, Feedback, Limitation of Liability, and
                Governing Law continue to apply after termination.
              </p>
            </div>

            <div className="mt-[var(--space-6)]">
              <h2 className={h2Class}>15. Disclaimer of Warranties</h2>
              <p className={pClass}>
                Our Services and products are provided on an &ldquo;as is&rdquo; and &ldquo;as
                available&rdquo; basis. To the extent permitted by Indian law, we disclaim all
                warranties, express or implied, including fitness for purpose, merchantability, and
                non-infringement.
              </p>
              <p className={pClass}>
                We do not guarantee uninterrupted, error-free service or accuracy of content.
              </p>
            </div>

            <div className="mt-[var(--space-6)]">
              <h2 className={h2Class}>16. Limitation of Liability</h2>
              <p className={pClass}>
                To the fullest extent permitted by law, Tvaloka Wellness / Ma&amp;Me Enterprises
                Pvt. Ltd. shall not be liable for:
              </p>
              <ul className={ulClass}>
                <li>Loss of profits, revenue, data, or goodwill</li>
                <li>Indirect, incidental, or consequential damages</li>
                <li>Delays, service interruptions, or errors</li>
                <li>Losses arising from third-party services or shipping partners</li>
                <li>Misuse of products not used as directed</li>
              </ul>
              <p className={pClass}>
                Our total liability shall not exceed the amount you paid for the product in
                question.
              </p>
            </div>

            <div className="mt-[var(--space-6)]">
              <h2 className={h2Class}>17. Indemnification</h2>
              <p className={pClass}>
                You agree to indemnify and hold harmless Tvaloka Wellness, Shopify, and associated
                personnel from claims, losses, damages, or expenses arising from:
              </p>
              <ul className={ulClass}>
                <li>Your breach of these Terms</li>
                <li>Your misuse of the Services</li>
                <li>Your violation of Indian laws or third-party rights</li>
              </ul>
            </div>

            <div className="mt-[var(--space-6)]">
              <h2 className={h2Class}>18. Severability</h2>
              <p className={pClass}>
                If any part of these Terms is found unenforceable, the remaining provisions remain
                valid and enforceable.
              </p>
            </div>

            <div className="mt-[var(--space-6)]">
              <h2 className={h2Class}>19. Waiver &amp; Entire Agreement</h2>
              <p className={pClass}>
                Failure to enforce a right does not constitute a waiver of that right. These Terms
                constitute the entire agreement between you and Tvaloka Wellness regarding the
                Services.
              </p>
            </div>

            <div className="mt-[var(--space-6)]">
              <h2 className={h2Class}>20. Assignment</h2>
              <p className={pClass}>
                You may not assign your rights under these Terms without our written consent. We
                may assign our rights without notice.
              </p>
            </div>

            <div className="mt-[var(--space-6)]">
              <h2 className={h2Class}>21. Governing Law &amp; Jurisdiction (India)</h2>
              <p className={pClass}>
                These Terms shall be governed by and interpreted in accordance with the laws of
                India. All disputes shall be subject to the exclusive jurisdiction of the courts of
                Indore, Madhya Pradesh.
              </p>
            </div>

            <div className="mt-[var(--space-6)]">
              <h2 className={h2Class}>22. Changes to Terms</h2>
              <p className={pClass}>
                We reserve the right to modify these Terms at any time. Updated versions will be
                posted on this page. Continued use after changes constitutes acceptance.
              </p>
            </div>

            <div className="mt-[var(--space-6)]">
              <h2 className={h2Class}>23. Contact Information</h2>
              <p className={`${pClass} font-semibold text-primary`}>
                Tvaloka Wellness (Ma&amp;Me Enterprises Pvt. Ltd.)
              </p>
              <p className={pClass}>
                <a href="mailto:support@tvaloka.com" className={linkClass}>
                  support@tvaloka.com
                </a>
              </p>
              <p className={pClass}>
                Business Address: Plot 96, Indralok Colony, Sudama Nagar, Indore, Madhya Pradesh,
                India (452009)
              </p>
              <p className={pClass}>CIN: U47721MP2025PTC076952</p>
              <p className={pClass}>GST: 23AATCM4233D1ZM</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
