import Image from "next/image";
import Link from "next/link";
import { getArticles } from "../lib/shopify/queries/article";
import { ShopifyArticle } from "../lib/shopify/types";
import { MediaFrame } from "../components/MediaFrame";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Journal & Articles | Tvaloka",
  description: "Explore Ayurvedic wisdom, modern wellness insights, and holistic rituals.",
};

export default async function BlogsPage() {
  let articles: ShopifyArticle[] = [];
  try {
    articles = await getArticles({ first: 20 });
  } catch (error) {
    console.error("Failed to load blogs:", error);
  }

  return (
    <main className="flex-1 bg-white">
      {/* Hero banner — MediaFrame fills behind overlaid copy */}
      <section className="relative flex min-h-[44vw] items-center lg:min-h-[36vw]">
        <MediaFrame
          src="https://cdn.shopify.com/s/files/1/1005/3045/4892/files/WhatsApp_Image_2026-08-21_at_11.28.37.webp?v=1787314543"
          alt="Ayurvedic botanicals arranged on cream cloth"
          label="Journal hero banner"
          className="rounded-none"
          sizes="100vw"
          fill
          priority
        />
        {/* Scrim for legibility */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,.8),rgba(0,0,0,.52)_55%,rgba(0,0,0,.18))]"
        />
        <div className="relative mx-auto max-w-7xl w-full px-[var(--space-4)] py-[var(--space-7)] text-center sm:text-left">
          <p className="text-xs font-semibold tracking-[0.3em] text-ondark uppercase">
            TVALOKA JOURNAL
          </p>
          <h1 className="font-display mt-[var(--space-3)] text-lg text-ondark sm:text-xl">
            Articles &amp; Journal
          </h1>
          <p className="mt-[var(--space-4)] max-w-xl text-sm text-ondark/80">
            Discover timeless Ayurvedic rituals, pure ingredients, and science-backed holistic care.
          </p>
        </div>
      </section>

      {/* Main Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {articles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-neutral-500">No blog posts found at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {articles.map((article) => {
              const formattedDate = new Date(article.publishedAt).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              });
              const category = article.tags?.[0] || article.blog?.title || "Wellness";

              return (
                <article
                  key={article.id}
                  className="group flex flex-col overflow-hidden rounded-lg bg-[#f4f4f4] transition-all duration-300 hover:shadow-lg"
                >
                  <Link
                    href={`/blogs/${article.handle}`}
                    className="relative aspect-[1.5/1] w-full overflow-hidden bg-neutral-200"
                  >
                    {article.image?.url ? (
                      <Image
                        src={article.image.url}
                        alt={article.image.altText || article.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-neutral-200 text-xs text-neutral-400">
                        Tvaloka Journal
                      </div>
                    )}
                  </Link>

                  <div className="flex flex-1 flex-col justify-between p-6">
                    <div>
                      <div className="flex items-center justify-between text-xs text-neutral-500 mb-2">
                        <span>{category}</span>
                        <span>{formattedDate}</span>
                      </div>

                      <h2 className="text-base font-display font-semibold tracking-wide text-neutral-800 uppercase line-clamp-2 leading-snug">
                        <Link href={`/blogs/${article.handle}`} className="hover:text-neutral-400">
                          {article.title}
                        </Link>
                      </h2>

                      {article.excerpt && (
                        <p className="mt-3 text-xs md:text-sm text-neutral-600 line-clamp-3">
                          {article.excerpt}
                        </p>
                      )}
                    </div>

                    <div className="mt-1 pt-1">
                      <Link
                        href={`/blogs/${article.handle}`}
                        className="inline-flex items-center gap-1.5 text-xs md:text-sm font-semibold text-neutral-900 transition-colors group-hover:text-neutral-600"
                      >
                        Read Article
                        <span aria-hidden="true" className="inline-block transition-transform group-hover:translate-x-1">
                          →
                        </span>
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
