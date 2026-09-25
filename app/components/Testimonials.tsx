import Image from "next/image";
import Link from "next/link";

type Testimonial = {
  name: string;
  /** Short product name shown under the author, linking to its page. */
  product: string;
  productHandle: string;
  /** Pull-quote shown above the body, when the customer gave one. */
  headline?: string;
  body: string;
  image: string;
};

const testimonials: Testimonial[] = [
  {
    name: "Tanvee Tiwari",
    product: "Sheetala Aloe Vera Gel",
    productHandle: "sheetala-ayurvedic-aloe-vera-gel-pure-aloe",
    headline: "My skin feels fresh, calm and beautifully hydrated",
    body: "I’ve been using SHEETALA Aloe Vera Gel regularly, and I really enjoy how fresh and soothing it feels. It absorbs quickly, leaves my skin soft and hydrated, and feels especially comforting when my skin feels dry, tired, or overheated.",
    image:
      "https://cdn.shopify.com/s/files/1/1005/3045/4892/files/Sheetla_Testimonial.webp?v=1790324611",
  },
  {
    name: "Jayati Shrivastava",
    product: "Sanjeevani Hair Mask",
    productHandle: "sanjeevani-hair-mask-amla-bhringraj-neem-aloe-vera",
    headline: "My hair feels softer, smoother and much easier to manage.",
    body: "I’ve been using SANJEEVANI Ayurvedic Hair Masque for a while, and it has really helped my dry, rough hair. It leaves my hair feeling softer, smoother and nourished, with less tugging while combing and a healthy-looking shine.",
    image:
      "https://cdn.shopify.com/s/files/1/1005/3045/4892/files/Sanjeevni_Testimonial.webp?v=1790324611",
  },
  {
    name: "Guneet B.",
    product: "Castor Cold Pressed Oil",
    productHandle: "castor-cold-pressed-oil-for-hair-skin-100-pure",
    headline: "A simple beauty staple I keep coming back to.",
    body: "I never expected castor oil to become such a regular part of my self-care routine. It’s rich and thick, but after using it consistently, I’ve come to really appreciate how nourishing and versatile it feels.",
    image:
      "https://cdn.shopify.com/s/files/1/1005/3045/4892/files/Castor_Testimonial.webp?v=1790324612",
  },
  {
    name: "Alambusha K.",
    product: "Navya Baby Massage Oil",
    productHandle: "navya-baby-massage-oil-almond-sandalwood-oil",
    headline: "A gentle favourite for my little one’s daily routine.",
    body: "As a mom, I’m always careful about what I use on my baby’s delicate skin. Navya Baby Oil feels nourishing yet lightweight, absorbs easily, and doesn’t leave that uncomfortable greasy feeling.",
    image:
      "https://cdn.shopify.com/s/files/1/1005/3045/4892/files/Navya_Testimonial.webp?v=1790324611",
  },
];

export function Testimonials({ className = "" }: { className?: string }) {
  return (
    <section className={`bg-[#FBF5E6] py-10 lg:py-[var(--space-7)] ${className}`}>
      <div className="mx-auto max-w-7xl px-[var(--space-4)]">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold tracking-[0.25em] text-tertiary uppercase">
            Testimonials
          </p>
          <h2 className="font-display mt-1 text-lg text-primary sm:text-xl">
            Loved by Our Community
          </h2>
          <span aria-hidden="true" className="mx-auto mt-[var(--space-3)] block h-px w-10 bg-[#D9B45A]" />
        </div>

        <ul
          aria-label="Customer testimonials"
          className="scrollbar-hide -mx-[var(--space-4)] mt-[var(--space-6)] flex snap-x snap-mandatory gap-[var(--space-4)] overflow-x-auto px-[var(--space-4)] pb-[var(--space-2)] md:mx-0 md:grid md:grid-cols-2 md:overflow-visible md:px-0 lg:grid-cols-4"
        >
          {testimonials.map((t) => (
            <li
              key={t.name}
              className="w-[82%] shrink-0 snap-center sm:w-[60%] md:w-auto md:shrink"
            >
              <figure className="flex h-full flex-col overflow-hidden rounded-[var(--radius-xs)] bg-white shadow-sm">
                <div className="relative aspect-[4/5] w-full overflow-hidden bg-black">
                  <Image
                    src={t.image}
                    alt={`${t.product} — customer testimonial photo`}
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 82vw"
                    className="object-cover"
                  />
                </div>

                <div className="flex flex-1 flex-col p-[var(--space-5)]">
                  <span
                    aria-hidden="true"
                    className="font-display -mb-2 block h-8 text-[44px] leading-none text-[#D9B45A]"
                  >
                    &ldquo;
                  </span>

                  <blockquote className="flex-1">
                    {t.headline && (
                      <p className="font-display text-md leading-snug text-primary">
                        {t.headline}
                      </p>
                    )}
                    <p
                      className={`text-sm leading-relaxed text-tertiary ${
                        t.headline ? "mt-[var(--space-3)]" : ""
                      }`}
                    >
                      {t.body}
                    </p>
                  </blockquote>

                  <figcaption className="mt-[var(--space-5)]">
                    <p className="text-sm font-semibold text-primary">{t.name}</p>
                    <Link
                      href={`/products/${t.productHandle}`}
                      className="mt-0.5 inline-block text-xs text-tertiary underline underline-offset-4 hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
                    >
                      {t.product} <span aria-hidden="true">→</span>
                    </Link>
                  </figcaption>
                </div>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
