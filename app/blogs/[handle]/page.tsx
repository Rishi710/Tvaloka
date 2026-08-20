import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getArticleByHandle } from "../../lib/shopify/queries/article";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ handle: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { handle } = await params;
  const article = await getArticleByHandle(handle);

  if (!article) {
    return {
      title: "Article Not Found | Tvaloka",
    };
  }

  return {
    title: `${article.title} | Tvaloka Journal`,
    description: article.excerpt || `Read ${article.title} on Tvaloka Journal`,
  };
}

export default async function ArticlePage({ params }: PageProps) {
  const { handle } = await params;
  const article = await getArticleByHandle(handle);

  if (!article) {
    notFound();
  }

  const formattedDate = new Date(article.publishedAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const category = article.tags?.[0] || article.blog?.title || "Wellness";

  return (
    <main className="flex-1 bg-white">
      {/* Header & Meta */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <nav className="mb-6">
          <Link
            href="/blogs"
            className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider text-neutral-600 hover:text-black uppercase"
          >
            ← Back to Journal
          </Link>
        </nav>

        <header className="mb-8 border-b border-neutral-200 pb-8">
          <p className="text-xs font-semibold tracking-[0.2em] text-neutral-500 uppercase">
            {category}
          </p>
          <h1 className="font-display text-2xl md:text-4xl font-normal tracking-wide text-neutral-900 uppercase mt-2 leading-tight">
            {article.title}
          </h1>

          <div className="mt-4 flex items-center gap-4 text-xs text-neutral-500">
            {article.authorV2?.name && (
              <span>By {article.authorV2.name}</span>
            )}
            <span>•</span>
            <time dateTime={article.publishedAt}>{formattedDate}</time>
          </div>
        </header>

        {/* Featured Image */}
        {article.image?.url && (
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-neutral-100 mb-10 shadow-sm">
            <Image
              src={article.image.url}
              alt={article.image.altText || article.title}
              fill
              priority
              className="object-cover"
            />
          </div>
        )}

        {/* Article Body */}
        {article.contentHtml ? (
          <div
            className="prose prose-neutral max-w-none prose-img:rounded-xl text-neutral-800 leading-relaxed space-y-4"
            dangerouslySetInnerHTML={{ __html: article.contentHtml }}
          />
        ) : (
          <div className="text-neutral-700 leading-relaxed whitespace-pre-line space-y-4">
            {article.content || article.excerpt}
          </div>
        )}

        {/* Footer Navigation */}
        <div className="mt-12 pt-8 border-t border-neutral-200 flex justify-between items-center">
          <Link
            href="/blogs"
            className="text-xs md:text-sm font-bold tracking-wider text-neutral-900 uppercase hover:underline"
          >
            ← View All Reads
          </Link>
        </div>
      </article>
    </main>
  );
}
