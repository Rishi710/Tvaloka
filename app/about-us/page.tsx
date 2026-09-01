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
        className={`text-xs font-semibold tracking-[0.3em] uppercase ${onDark ? "text-ondark" : "text-tertiary"
          }`}
      >
        {children}
      </p>
      <span
        aria-hidden="true"
        className={`mt-[var(--space-2)] block h-px w-6 ${onDark ? "bg-ondark" : "bg-tertiary"
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
      className={`mt-[var(--space-5)] inline-flex items-center gap-[var(--space-3)] border-b pb-[var(--space-1)] text-xs font-semibold tracking-[0.2em] uppercase ${onDark
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
      <section className="relative flex min-h-[58vw] items-center items-end justify-center lg:min-h-[38vw]">
        <MediaFrame
          src="https://cdn.shopify.com/s/files/1/1005/3045/4892/files/About_Us.webp?v=1787598716"
          alt="About us image"
          label="Hero banner image"
          className="rounded-none"
          sizes="100vw"
          fill
          priority
        />
        <div aria-hidden="true" className={`absolute inset-0 ${scrimFromLeft}`} />
        <div className={`${sectionClass} relative w-full`}>
          <Eyebrow onDark>About Us</Eyebrow>
          <h1 className="font-display mt-[var(--space-4)] max-w-2xl text-[20px] text-ondark sm:text-lg">
            Ancient wisdom, infused with modern aesthetic
          </h1>
        </div>
      </section>

      {/* Intro */}
      <section className="bg-surface-muted">
        <div className={`${sectionClass} grid gap-[var(--space-6)] lg:grid-cols-2 lg:gap-[var(--space-7)]`}>
          <div>
            <Eyebrow>About Us</Eyebrow>
            <h2 className="font-display mt-[var(--space-2)] text-[20px] text-primary">
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
            src="https://cdn.shopify.com/s/files/1/1005/3045/4892/files/WhatsApp_Image_2026-08-31_at_11.59.12.webp?v=1788262273"
            alt="Ground spices and herbs in terracotta bowls arranged in the shape of a tree on dark wood"
            label="Philosophy image"
            aspectClassName="aspect-[2/2]"
          />
          <div>
            <Eyebrow>Our Philosophy</Eyebrow>
            <h2 className="font-display mt-[var(--space-4)] text-lg text-primary">
              If you cannot eat it, do not use it on your skin
            </h2>
            <p className="mt-[var(--space-4)] max-w-md text-sm text-tertiary">
              This is the Ayurvedic standard we hold ourselves to ingredients pure enough to eat
              are ingredients good enough for your skin.
            </p>
            <ul className="mt-[var(--space-3)] space-y-3 text-sm text-tertiary max-w-md">
              <li className="flex gap-2">
                <span className="mt-0.5 shrink-0 text-primary">•</span>
                <span>
                  <strong className="text-primary">Pure, Sacred Botanicals</strong>{" "}
                  Caregiving should be clean, honest, and uncompromised. We honour your body using only pure botanical herbal extracts living plant intelligence, no fillers, no toxins, just raw nature.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="mt-0.5 shrink-0 text-primary">•</span>
                <span>
                  <strong className="text-primary">Intention in Every Drop</strong>{" "}
                  Every herb, root, and leaf is chosen with deep reverence. We blend our formulas with the same warmth and patience you would use to care for someone you love.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="mt-0.5 shrink-0 text-primary">•</span>
                <span>
                  <strong className="text-primary">Harmonising, Not Fixing</strong>{" "}
                  You are not broken. Your skin, mind, and body are constantly seeking harmony. Our products guide you gently back to your natural state of vitality.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="mt-0.5 shrink-0 text-primary">•</span>
                <span>
                  <strong className="text-primary">Sustainable Reverence</strong>{" "}
                  Nature gives unconditionally, and we owe her the same devotion. We source ethically and mindfully, ensuring that what brings you wellness also protects the earth that grew it.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Origin — full-bleed banner. Copy sits right because this image's
          subject occupies the left half. */}
      {/* <section className="relative flex min-h-[56vw] items-center lg:min-h-[40vw]">
        <MediaFrame
          src="/Image/banner-22.jpeg"
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
      </section> */}

      {/* Manufacturing — image left, copy right */}
      <section className="bg-surface-muted">
        <div className={`${sectionClass} grid items-center gap-[var(--space-6)] lg:grid-cols-2 lg:gap-[var(--space-7)]`}>
          <MediaFrame
            src="/Image/img-2.jpg"
            alt="Three dropper bottles of facial oil and serum on linen, surrounded by rosemary and blossoms"
            label="Manufacturing image"
            aspectClassName="aspect-[4/3]"
          />
          <div>
            <Eyebrow>Our Manufacturing Excellence</Eyebrow>
            <h2 className="font-display mt-[var(--space-4)] text-lg text-primary">
              Formulated With Pure Intention

            </h2>
            <p className="mt-[var(--space-4)] max-w-2xl text-sm text-tertiary">
              Crafted in pharmaceutical-grade facilities with a dedicated R&D team, our products are made through eco-conscious, green-by-design processes. We honor traditional, artisanal methods to infuse our formulations with organic, farm-grown Ayurvedic herbs, aromatic flowers, and pure essential oils sourced directly from our own fields and India's finest growing regions

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
              Tvaloka lives between the Himalayas and the modern city; between mythology and modernity. Within these bottles and boxes, experience the profound beauty and regenerative power of ancient Ayurveda.

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
              At the heart of our journey lies a simple, ancient truth: real healing is not created in a laboratory, but nurtured in the soil, whispered by the wind, and passed down through generations.
            </p>
            <p className="mt-[var(--space-3)] max-w-md text-sm text-tertiary">
              We returned to Ayurveda not just as a science, but as a love letter to the human
              spirit. In a world that constantly demands more, our formulations offer a sacred
              pause a quiet sanctuary to slow down, breathe deeply, and reconnect with your
              inner wisdom.
            </p>
            <KnowMoreLink href="/ingredients" label="Know more" />
          </div>
          <MediaFrame
            src="/Image/img-1.jpg"
            alt="A smiling woman patting skincare cream beneath her eye"
            label="Expertise image"
            aspectClassName="aspect-[4/3]"
            className="lg:order-2"
          />
        </div>
      </section>

      {/* Values — image left, copy right */}
      <section className="bg-surface-muted">
        <div className={`${sectionClass} grid items-center gap-[var(--space-6)] lg:grid-cols-2 lg:gap-[var(--space-7)]`}>
          <MediaFrame
            src="/Image/img-2.jpg"
            alt="Three dropper bottles of facial oil and serum on linen, surrounded by rosemary and blossoms"
            label="Manufacturing image"
            aspectClassName="aspect-[4/3]"
          />
          <div>
            <Eyebrow>Our Values</Eyebrow>
            <h2 className="font-display mt-[var(--space-4)] text-lg text-primary">
              Social Responsibility
            </h2>
            <p className="mt-[var(--space-4)] max-w-2xl text-sm text-tertiary">
              At Tvaloka Wellness, our responsibility begins with people. We work directly with
              rural farming communities and local growers, preserving traditional knowledge and
              sustaining livelihoods — not extracting them.
            </p>

            <p className="mt-[var(--space-3)] text-xs font-semibold uppercase tracking-wider text-primary">
              Caring for Every Stage of Life
            </p>
            <ul className="mt-[var(--space-2)] space-y-2 text-sm text-tertiary">
              <li className="flex gap-2">
                <span className="mt-0.5 shrink-0 text-primary">•</span>
                <span>
                  <strong className="text-primary">For Little Ones —</strong>{" "}
                  Gentle, protective formulations designed to comfort delicate skin and support healthy growth.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="mt-0.5 shrink-0 text-primary">•</span>
                <span>
                  <strong className="text-primary">For Young Adults &amp; Professionals —</strong>{" "}
                  Revitalising routines that combat daily stress, shield against environmental strain, and sustain energy.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="mt-0.5 shrink-0 text-primary">•</span>
                <span>
                  <strong className="text-primary">For Elders —</strong>{" "}
                  Deeply nourishing, grounding care crafted to support joint comfort, vitality, and graceful longevity.
                </span>
              </li>
            </ul>
            <KnowMoreLink href="/social-responsibility" label="Know more" />
          </div>
        </div>
      </section>
    </main>
  );
}
