import Link from "next/link";
import { BackToTopButton } from "./BackToTopButton";
import { SubscribeForm } from "./SubscribeForm";
import {
  FacebookIcon,
  InstagramIcon,
  LinkedinIcon,
  YoutubeIcon,
} from "./icons";

const shopLinks = [
  { label: "Best Seller", href: "/best-sellers" },
  { label: "Face Care", href: "/face-care" },
  { label: "Bath & Body Care", href: "/bath-body-care" },
  { label: "Hair Care", href: "/hair-care" },
  // { label: "Men's Care", href: "/men" },
  { label: "Baby Care", href: "/baby-care" },
  // { label: "Gifting", href: "/gifting" },
];

const aboutLinks = [
  { label: "Our Philosophy", href: "/about-us" },
  // { label: "Social Responsibility", href: "/about-us" },
  { label: "Shipping Policy", href: "/shipping-policy" },
  { label: "Return Policy", href: "/return-policy" },
  { label: "Policies", href: "/policies" },
  { label: "Terms", href: "/terms" },
  // { label: "Stores", href: "/stores" },
  // { label: "Careers", href: "/careers", badge: "We're hiring" },
];

const quickLinks = [
  { label: "New Launch", href: "/new-launches" },
  { label: "Wellness Care", href: "/wellness-care" },
  // { label: "My Account", href: "/account" },
  // { label: "Wellness Circle Sign In", href: "/circle/sign-in" },
  // { label: "Current Offers", href: "/" },
  // { label: "Customised Skincare", href: "/customised-skincare" },
  { label: "Our Ingredients", href: "/ingredients" },
  { label: "Blog", href: "/blog" },
  { label: "FAQs", href: "/faqs" },
  // { label: "My Order(s)", href: "/account/orders" },
  // { label: "Track My Order", href: "/track-order" },
];

const socialLinks = [
  { label: "Instagram", href: "https://instagram.com/tvalokawellness", Icon: InstagramIcon },
  { label: "Facebook", href: "https://facebook.com/tvalokawellness", Icon: FacebookIcon },
  { label: "YouTube", href: "https://youtube.com/@tvalokawellness", Icon: YoutubeIcon },
  // { label: "X (Twitter)", href: "https://x.com/tvalokawellness", Icon: XIcon },
  { label: "LinkedIn", href: "https://linkedin.com/company/tvalokawellness", Icon: LinkedinIcon },
];

const paymentMethods = ["Visa", "Mastercard", "Amex", "RuPay", "PayPal", "Net Banking", "COD"];

const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black";
const linkClass = `text-sm text-tertiary hover:text-primary hover:underline underline-offset-4 ${focusRing}`;

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string; badge?: string }[];
}) {
  return (
    <div>
      <h3 className="font-display text-md text-primary">{title}</h3>
      <ul className="mt-[var(--space-4)] flex flex-col gap-[var(--space-3)]">
        {links.map((link) => (
          <li key={link.href} className="flex flex-wrap items-center gap-[var(--space-2)]">
            <Link href={link.href} className={linkClass}>
              {link.label}
            </Link>
            {link.badge ? (
              <span className="rounded-full bg-action-onlight-bg px-[var(--space-2)] py-0.5 text-[10px] font-semibold text-action-onlight-text uppercase">
                {link.badge}
              </span>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SiteFooter() {
  return (
    <footer className="bg-surface-muted">
      <section
        aria-labelledby="footer-subscribe-heading"
        className="bg-action-onlight-bg"
      >
        <div className="mx-auto grid max-w-7xl items-center gap-[var(--space-5)] px-[var(--space-4)] py-[var(--space-6)] sm:gap-[var(--space-6)] sm:py-[var(--space-6)] lg:grid-cols-[1.1fr_1fr] lg:gap-[var(--space-6)] lg:py-[var(--space-7)] xl:gap-[var(--space-7)]">
          <div>
            <p className="text-xs font-semibold tracking-[0.3em] text-ondark-secondary uppercase">
              Newsletter
            </p>
            <h2
              id="footer-subscribe-heading"
              className="font-display mt-[var(--space-2)] text-lg text-ondark sm:text-xl"
            >
              Subscribe to Tvaloka
            </h2>
            <p className="mt-[var(--space-3)] max-w-md text-sm text-ondark-secondary">
              Ayurvedic rituals, new launches and early access to offers, delivered to your inbox.
            </p>
            <ul className="mt-[var(--space-4)] flex flex-wrap gap-x-[var(--space-5)] gap-y-[var(--space-2)] text-xs text-ondark">
              {["Ayurvedic rituals", "New launches", "Early access"].map((benefit) => (
                <li key={benefit} className="flex items-center gap-[var(--space-1)]">
                  <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
                    <path
                      d="M4.5 10.5l3.5 3.5 7.5-8"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
          <SubscribeForm />
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-[var(--space-4)] py-[var(--space-5)] sm:py-[var(--space-6)] lg:py-[var(--space-7)]">
        <div className="grid grid-cols-2 gap-x-[var(--space-4)] gap-y-[var(--space-6)] sm:gap-x-[var(--space-6)] lg:grid-cols-4 lg:gap-y-[var(--space-7)]">
          <FooterColumn title="Shop" links={shopLinks} />
          <FooterColumn title="About" links={aboutLinks} />
          <FooterColumn title="Quick Links" links={quickLinks} />

          <div>
            <h3 className="font-display text-md text-primary">Contact</h3>
            <div className="mt-[var(--space-4)] flex flex-col gap-[var(--space-1)] text-sm">
              <p className="text-tertiary">Email:</p>
              <a href="mailto:support@tvaloka.com" className={`${linkClass} break-all`}>
                support@tvaloka.com
              </a>
            </div>
            <Link
              href="/contact"
              className={`mt-[var(--space-3)] inline-block text-sm font-semibold text-primary underline underline-offset-4 ${focusRing}`}
            >
              Contact Us
            </Link>

            <h3 className="font-display text-md mt-[var(--space-6)] text-primary">Follow</h3>
            <ul className="mt-[var(--space-4)] flex flex-wrap gap-[var(--space-2)] sm:gap-[var(--space-3)]">
              {socialLinks.map(({ label, href, Icon }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className={`flex h-9 w-9 items-center justify-center rounded-full bg-black/[.04] text-primary hover:bg-black/[.08] ${focusRing}`}
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

       <div>
        <div className="mx-auto flex max-w-7xl flex-col gap-[var(--space-5)] px-[var(--space-4)] py-[var(--space-5)] sm:flex-row sm:items-center sm:justify-between">
          {/* <div>
            <p className="text-xs font-semibold tracking-wide text-tertiary uppercase">
              Payment Methods
            </p>
            <ul className="mt-[var(--space-3)] flex flex-wrap gap-[var(--space-2)]">
              {paymentMethods.map((method) => (
                <li
                  key={method}
                  className="rounded-[var(--radius-xs)] bg-black/[.04] px-[var(--space-2)] py-[var(--space-1)] text-[11px] font-semibold text-primary"
                >
                  {method}
                </li>
              ))}
            </ul>
          </div> */}
          <p className="text-xs text-tertiary">© {new Date().getFullYear()} Tvaloka Wellness</p>
        </div> 
      </div>

      <BackToTopButton />
    </footer>
  );
}
