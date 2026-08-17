import type { Metadata } from "next";
import { ContactForm } from "../components/ContactForm";
import { ClockIcon, LocationIcon, MailIcon, PhoneIcon } from "../components/icons";

export const metadata: Metadata = {
  title: "Contact Us | Tvaloka Wellness",
  description:
    "Reach the Tvaloka Wellness care team for order enquiries, product advice and feedback.",
};

const details = [
  {
    Icon: MailIcon,
    label: "Email",
    value: "hello@tvalokawellness.com",
    href: "mailto:hello@tvalokawellness.com",
    note: "We reply within two working days.",
  },
  {
    Icon: PhoneIcon,
    label: "Phone",
    value: "+91 9109066839",
    href: "tel:+919109066839",
    note: "You can Connect to our Expert.",
  },
  {
    Icon: ClockIcon,
    label: "Care team hours",
    value: "Monday to Saturday, 10am – 7pm IST",
    note: "Closed on public holidays.",
  },
  {
    Icon: LocationIcon,
    label: "Address",
    value: "Plot 96, Indralok Colony, Sudama Nagar, Indore, Madhya Pradesh, India",
    href: "/stores",
    note: "Header Quater Address",
  },
];

export default function ContactPage() {
  return (
    <main className="flex flex-1 flex-col">
      <section className="bg-[radial-gradient(circle_at_25%_30%,_#1a1a1a,_#000000_65%)]">
        <div className="mx-auto max-w-7xl px-[var(--space-4)] py-[var(--space-7)]">
          <p className="text-xs font-semibold tracking-[0.3em] text-ondark-secondary uppercase">
            We are here to help
          </p>
          <h1 className="font-display mt-[var(--space-3)] text-lg text-ondark sm:text-xl">
            Contact Us
          </h1>
          <p className="mt-[var(--space-4)] max-w-xl text-sm text-ondark-secondary">
            Questions about a ritual, an order, or which formulation suits your skin? Our care
            team is happy to guide you.
          </p>
        </div>
      </section>

      <section className="bg-surface-muted">
        <div className="mx-auto grid max-w-7xl gap-[var(--space-7)] px-[var(--space-4)] py-[var(--space-7)] lg:grid-cols-2">
          <div>
            <h2 className="font-display text-md text-primary">Get in touch</h2>
            <p className="mt-[var(--space-3)] max-w-md text-sm text-tertiary">
              Choose whichever suits you best — every message reaches the same care team.
            </p>

            <ul className="mt-[var(--space-6)] flex flex-col gap-[var(--space-5)]">
              {details.map(({ Icon, label, value, href, note }) => (
                <li key={label} className="flex gap-[var(--space-4)]">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black/[.04] text-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold tracking-wide text-tertiary uppercase">
                      {label}
                    </p>
                    {href ? (
                      <a
                        href={href}
                        className="mt-[var(--space-1)] inline-block text-sm font-semibold text-primary underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
                      >
                        {value}
                      </a>
                    ) : (
                      <p className="mt-[var(--space-1)] text-sm font-semibold text-primary">
                        {value}
                      </p>
                    )}
                    <p className="mt-[var(--space-1)] text-xs text-tertiary">{note}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <ContactForm />
        </div>
      </section>
    </main>
  );
}
