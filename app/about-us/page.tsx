import type { Metadata } from "next";
import Link from "next/link";
import { MediaFrame } from "../components/MediaFrame";
import { PlayIcon } from "../components/icons";
import { PLACEHOLDER_VIDEO_URL } from "../lib/videos";

export const metadata: Metadata = {
  title: "About Us | Tvaloka Wellness",
  description:
    "Ancient Ayurvedic wisdom, formulated for modern skin — our origin, philosophy, craft and certifications.",
};

// space.7 (96.66px) is the documented "major section" rhythm, but applying
// it at mobile width — where sections stack to one narrow column — leaves
// huge dead-zone gaps between short blocks. Step it in from space.5 (20px)
// through space.6 (30px) before reaching the full desktop value at lg.
const sectionClass =
  "mx-auto max-w-7xl px-[var(--space-4)] py-[var(--space-5)] sm:py-[var(--space-6)] lg:py-[var(--space-7)]";

/** Brand film. A direct video file URL; empty renders the placeholder frame. */
const BRAND_FILM_URL = PLACEHOLDER_VIDEO_URL;

/**
 * Left-anchored scrim, for overlaid copy that sits on the left. Slightly
 * heavier at the anchor than the right-hand variant since the hero photo is a
 * bright cream flat-lay; every overlaid string measures well clear of its
 * WCAG AA floor against the composited image.
 */
const scrimFromLeft =
  "bg-[linear-gradient(to_right,rgba(0,0,0,.8),rgba(0,0,0,.52)_55%,rgba(0,0,0,.18))]";
/** Right-anchored variant, for images whose subject sits on the left. */
const scrimFromRight =
  "bg-[linear-gradient(to_left,rgba(0,0,0,.78),rgba(0,0,0,.5)_55%,rgba(0,0,0,.2))]";

/** Small-caps label with the hairline rule beneath it, used to open each section. */
function Eyebrow({ children, onDark = false }: { children: string; onDark?: boolean }) {
  return (
    <div>
      {/* Full white over imagery — the dimmer secondary grey drops below the
          4.5:1 this 12px label needs once a photo is behind it. */}
      <p
        className={`text-xs font-semibold tracking-[0.3em] uppercase ${
          onDark ? "text-ondark" : "text-tertiary"
        }`}
      >
        {children}
      </p>
      <span
        aria-hidden="true"
        className={`mt-[var(--space-2)] block h-px w-6 ${
          onDark ? "bg-ondark" : "bg-tertiary"
        }`}
      />
    </div>
  );
}

function KnowMoreLink({
  href,
  label,
  onDark = false,
}: {
  href: string;
  label: string;
  onDark?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`mt-[var(--space-5)] inline-flex items-center gap-[var(--space-3)] border-b pb-[var(--space-1)] text-xs font-semibold tracking-[0.2em] uppercase ${
        onDark
          ? "border-ondark-secondary text-ondark hover:border-ondark focus-visible:outline-white"
          : "border-tertiary text-primary hover:border-primary focus-visible:outline-black"
      } focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2`}
    >
      {label}
      <span aria-hidden="true">→</span>
    </Link>
  );
}

export default function AboutUsPage() {
  return (
    <main className="flex flex-1 flex-col">
      {/* Hero banner — copy sets the height, image fills behind it */}
      <section className="relative flex min-h-[46vw] items-center lg:min-h-[38vw]">
        <MediaFrame
          src="/Image/banner-1.jpeg"
          alt="Ayurvedic botanicals — rose, saffron, vanilla, amla, aloe and neem — laid out on cream cloth"
          label="Hero banner image"
          className="rounded-none"
          sizes="100vw"
          fill
          priority
        />
        <div aria-hidden="true" className={`absolute inset-0 ${scrimFromLeft}`} />
        <div className={`${sectionClass} relative w-full`}>
          <Eyebrow onDark>About Us</Eyebrow>
          <h1 className="font-display mt-[var(--space-4)] max-w-2xl text-lg text-ondark sm:text-xl">
            Ancient wisdom, infused with modern aesthetic
          </h1>
        </div>
      </section>

      {/* Intro */}
      <section className="bg-surface-muted">
        <div className={`${sectionClass} grid gap-[var(--space-6)] lg:grid-cols-2 lg:gap-[var(--space-7)]`}>
          <div>
            <Eyebrow>About Us</Eyebrow>
            <h2 className="font-display mt-[var(--space-4)] text-lg text-primary">
              Welcome to a world where ancient wisdom is infused with modern aesthetic.
            </h2>
          </div>
          <p className="max-w-2xl text-sm text-tertiary lg:pt-[var(--space-6)]">
            Tvaloka Wellness is an authentic, traditional skincare brand rooted in the ancient
            science of Ayurveda. We formulate with a modern sensibility — pairing time-tested
            recipes with contemporary standards of efficacy, sensorial experience and pleasure of
            use, so that a daily ritual feels as considered as it is effective.
          </p>
        </div>
      </section>

      {/* Philosophy — image left, copy right */}
      <section className="bg-surface-muted">
        <div className={`${sectionClass} grid items-center gap-[var(--space-6)] lg:grid-cols-2 lg:gap-[var(--space-7)]`}>
          <MediaFrame
            src="/Image/img-3.jpg"
            alt="Ground spices and herbs in terracotta bowls arranged in the shape of a tree on dark wood"
            label="Philosophy image"
            aspectClassName="aspect-[4/5]"
          />
          <div>
            <Eyebrow>Our Philosophy</Eyebrow>
            <h2 className="font-display mt-[var(--space-4)] text-lg text-primary">
              If you cannot eat it, do not use it on your skin
            </h2>
            <p className="mt-[var(--space-4)] max-w-md text-sm text-tertiary">
              This is the Ayurvedic standard we hold ourselves to: ingredients pure enough to eat
              are ingredients good enough for your skin. Every formulation is built from living
              substances — cold-pressed oils, herbs, flowers and roots — chosen for the purifying,
              nutritive and balancing properties that nourish skin and support lasting beauty.
            </p>
          </div>
        </div>
      </section>

      {/* Origin — full-bleed banner. Copy sits right because this image's
          subject occupies the left half. */}
      <section className="relative flex min-h-[56vw] items-center lg:min-h-[40vw]">
        <MediaFrame
          src="/Image/banner-2.jpeg"
          alt="A woman resting beside a lotus flower, roses, saffron and Ayurvedic botanicals arranged on a banana leaf"
          label="Origin image"
          className="rounded-none"
          sizes="100vw"
          fill
        />
        <div aria-hidden="true" className={`absolute inset-0 ${scrimFromRight}`} />
        <div className={`${sectionClass} relative w-full`}>
          <div className="ml-auto max-w-lg">
            <Eyebrow onDark>Origin</Eyebrow>
            <h2 className="font-display mt-[var(--space-4)] text-lg text-ondark sm:text-xl">
              Our Spiritual Home
            </h2>
            <p className="mt-[var(--space-5)] text-sm text-ondark">
              Our spiritual home and manufacturing base sits in the Himalayan foothills of
              Uttarakhand — a sublime terrain of delicate alpine flora, snow-fed rivers and
              mountain peaks that form a natural barrier against the world&rsquo;s impurities.
            </p>
            <KnowMoreLink href="/origin" label="Know more" onDark />
          </div>
        </div>
      </section>

      {/* Manufacturing — image left, copy right */}
      <section className="bg-surface-muted">
        <div className={`${sectionClass} grid items-center gap-[var(--space-6)] lg:grid-cols-2 lg:gap-[var(--space-7)]`}>
          <MediaFrame
            src="/Image/img-2.jpg"
            alt="Three dropper bottles of facial oil and serum on linen, surrounded by rosemary and blossoms"
            label="Manufacturing image"
            aspectClassName="aspect-[4/5]"
          />
          <div>
            <Eyebrow>Our Manufacturing Excellence</Eyebrow>
            <h2 className="font-display mt-[var(--space-4)] text-lg text-primary">
              State of the Art Manufacturing
            </h2>
            <p className="mt-[var(--space-4)] max-w-2xl text-sm text-tertiary">
              Our facility is built to pharmaceutical-grade production standards, with a dedicated
              R&amp;D department and green-by-design systems that keep the process as conscientious
              as the product. Formulations are prepared using traditional, artisanal methods —
              infusing Ayurvedic herbs, aromatic flowers and pure essential oils grown organically
              on our own farms and sourced from the regions across India where each is at its
              finest.
            </p>
          </div>
        </div>
      </section>

      {/* Brand film */}
      <section className="bg-surface-muted">
        <div className={sectionClass}>
          <div className="grid gap-[var(--space-5)] lg:grid-cols-2 lg:gap-[var(--space-7)]">
            <h2 className="font-display text-lg text-primary">Discover Luxurious Ayurveda</h2>
            <p className="max-w-2xl text-sm text-tertiary">
              Tvaloka lives between the Himalayas and the modern city; between mythology and
              modernity. Within these bottles and boxes, experience the profound beauty and
              regenerative power of ancient Ayurveda.
            </p>
          </div>

          <div className="relative mt-[var(--space-6)]">
            {BRAND_FILM_URL ? (
              // Native controls: keyboard-operable and screen-reader labelled
              // for free, which a custom overlay would have to re-implement.
              <video
                src={BRAND_FILM_URL}
                aria-label="Tvaloka Wellness brand film"
                controls
                playsInline
                preload="metadata"
                className="aspect-video w-full rounded-[var(--radius-xs)] bg-surface-base object-cover"
              />
            ) : (
              <>
                <MediaFrame
                  label="Brand film — set BRAND_FILM_URL"
                  aspectClassName="aspect-video"
                  sizes="100vw"
                />
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-muted text-surface-base">
                    <PlayIcon className="ml-0.5 h-6 w-6" />
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Expertise — copy left, image right */}
      <section className="bg-surface-muted">
        <div className={`${sectionClass} grid items-center gap-[var(--space-6)] lg:grid-cols-2 lg:gap-[var(--space-7)]`}>
          <div className="lg:order-1">
            <Eyebrow>Our Expertise</Eyebrow>
            <h2 className="font-display mt-[var(--space-4)] text-lg text-primary">
              Discover Ayurveda
            </h2>
            <p className="mt-[var(--space-4)] max-w-md text-sm text-tertiary">
              Ayurveda — &lsquo;the knowledge of life&rsquo; — is one of the world&rsquo;s oldest
              systems of health and healing, refined over thousands of years. It works on four
              levels: body, breath, mind and spirit. Only when these sit in balance does beauty
              read as more than surface deep.
            </p>
            <KnowMoreLink href="/ingredients" label="Know more" />
          </div>
          <MediaFrame
            src="/Image/img-1.jpg"
            alt="A smiling woman patting skincare cream beneath her eye"
            label="Expertise image"
            aspectClassName="aspect-[4/5]"
            className="lg:order-2"
          />
        </div>
      </section>

      {/* Values — copy left, image right */}
      <section className="bg-surface-muted">
        <div className={`${sectionClass} grid items-center gap-[var(--space-6)] lg:grid-cols-2 lg:gap-[var(--space-7)]`}>
          <div className="lg:order-1">
            <Eyebrow>Our Values</Eyebrow>
            <h2 className="font-display mt-[var(--space-4)] text-lg text-primary">
              Social Responsibility
            </h2>
            <p className="mt-[var(--space-4)] max-w-md text-sm text-tertiary">
              Reviving traditional craft has been part of our purpose from the beginning. We work
              directly with rural communities and local growers, so that the knowledge and
              livelihoods behind every formulation are sustained rather than extracted.
            </p>
            <KnowMoreLink href="/social-responsibility" label="Know more" />
          </div>
          <MediaFrame label="Values image — community partners" className="lg:order-2" />
        </div>
      </section>

      {/* Certifications */}
      {/* <section className="bg-surface-muted">
        <div className={`${sectionClass} grid gap-[var(--space-6)] lg:grid-cols-2 lg:gap-[var(--space-7)]`}>
          <div>
            <Eyebrow>Our Certifications</Eyebrow>
            <h2 className="font-display mt-[var(--space-4)] text-lg text-primary">
              Clean, cruelty free beauty
            </h2>
          </div>
          <p className="text-sm text-tertiary lg:pt-[var(--space-6)]">
            The Ayurvedic standard for beauty has always been fresh, seasonal and natural. We hold
            that line across our own products — no animal testing at any stage, and clean-ingredient
            discipline carried through sourcing, formulation and manufacturing. Certification
            details for each range are listed alongside the products themselves.
          </p>
        </div>
      </section> */}
    </main>
  );
}
