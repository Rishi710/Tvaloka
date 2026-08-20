import Image from "next/image";
import Link from "next/link";
import { getArticles } from "../lib/shopify/queries/article";
import { ShopifyArticle } from "../lib/shopify/types";

// Category tag mapping helper to display clean categories like the reference image
function getCategoryTag(article: ShopifyArticle): string {
  if (article.tags && article.tags.length > 0) {
    return article.tags[0];
  }
  if (article.blog?.title && article.blog.title !== "News") {
    return article.blog.title;
  }
  // Default clean categories if unspecified
  return "Wellness & Care";
}

export async function LatestReads() {
  let articles: ShopifyArticle[] = [];
  try {
    articles = await getArticles({ first: 6 });
  } catch (error) {
    console.error("Failed to load blog articles from Shopify:", error);
  }

  if (!articles || articles.length === 0) {
    return null;
  }

  return (
    <section className="w-full bg-white py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header section with Title & View All */}
        <div className="flex items-center justify-between pb-6 md:pb-8">
          <h2 className="font-display text-lg md:text-2xl font-normal text-neutral-800 uppercase">
            LATEST READS
          </h2>
          <Link
            href="/blogs"
            className="group flex items-center gap-1 text-[11px] font-bold tracking-[0.12em] text-neutral-800 uppercase hover:text-black transition-colors"
          >
            VIEW ALL
            <span aria-hidden="true" className="inline-block transition-transform group-hover:translate-x-1">
              →
            </span>
          </Link>
        </div>

        {/* Responsive Container: Horizontal Slider on mobile, Grid on desktop */}
        <div className="scrollbar-hide flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 md:grid md:grid-cols-3 md:gap-4 md:overflow-visible md:pb-0">
          {articles.map((article) => {
            const category = getCategoryTag(article);
            return (
              <article
                key={article.id}
                className="group flex w-[84%] shrink-0 snap-start flex-col overflow-hidden rounded-xl bg-[#f4f4f4] transition-all duration-300 hover:shadow-md sm:w-[48%] md:w-auto"
              >
                {/* Article Image Header */}
                <Link
                  href={`/blogs/${article.handle}`}
                  className="relative aspect-[1.5/1] w-full overflow-hidden bg-neutral-200"
                >
                  {article.image?.url ? (
                    <Image
                      src={article.image.url}
                      alt={article.image.altText || article.title}
                      fill
                      sizes="(max-width: 640px) 85vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-neutral-200 text-xs text-neutral-400">
                      Tvaloka Journal
                    </div>
                  )}
                </Link>

                {/* Article Info Container */}
                <div className="flex flex-1 flex-col justify-between p-5 md:p-6">
                  <div>
                    <p className="text-xs md:text-sm font-normal text-neutral-500">
                      {category}
                    </p>
                    <h3 className="mt-2 text-sm md:text-base font-display font-semibold tracking-wide text-neutral-900 uppercase line-clamp-2 leading-snug">
                      <Link href={`/blogs/${article.handle}`} className="hover:text-black transition-colors">
                        {article.title}
                      </Link>
                    </h3>
                  </div>

                  <div className="mt-2 pt-2">
                    <Link
                      href={`/blogs/${article.handle}`}
                      className="inline-flex items-center gap-1.5 text-xs md:text-sm font-normal tracking-[0.12em] text-neutral-900 transition-colors"
                    >
                      Read More
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
      </div>
    </section>
  );
}
