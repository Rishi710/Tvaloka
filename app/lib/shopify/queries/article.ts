import { shopifyFetch, removeEdgesAndNodes, reshapeArticles } from "../index";
import { ShopifyArticle } from "../types";

const articleFragment = `
  fragment articleFields on Article {
    id
    handle
    title
    excerpt
    excerptHtml
    content
    contentHtml
    publishedAt
    tags
    authorV2 {
      name
    }
    blog {
      title
      handle
    }
    image {
      url
      altText
      width
      height
    }
  }
`;

export async function getArticles({
  first = 10,
  query,
  reverse = true,
  sortKey = "PUBLISHED_AT",
}: {
  first?: number;
  query?: string;
  reverse?: boolean;
  sortKey?: "PUBLISHED_AT" | "TITLE" | "AUTHOR" | "UPDATED_AT";
} = {}): Promise<ShopifyArticle[]> {
  const res = await shopifyFetch<{
    articles: { edges: Array<{ node: unknown }> };
  }>({
    query: `
      query getArticles($first: Int, $query: String, $reverse: Boolean, $sortKey: ArticleSortKeys) {
        articles(first: $first, query: $query, reverse: $reverse, sortKey: $sortKey) {
          edges {
            node {
              ...articleFields
            }
          }
        }
      }
      ${articleFragment}
    `,
    variables: { first, query, reverse, sortKey },
    next: { revalidate: 60, tags: ["articles"] },
  });

  return reshapeArticles(removeEdgesAndNodes(res.articles));
}

export async function getArticleByHandle(handle: string): Promise<ShopifyArticle | null> {
  const articles = await getArticles({ first: 20 });
  const article = articles.find((a) => a.handle === handle);
  if (article) return article;

  // Fallback direct query if needed
  const res = await shopifyFetch<{
    articles: { edges: Array<{ node: unknown }> };
  }>({
    query: `
      query getArticlesByHandle {
        articles(first: 50) {
          edges {
            node {
              ...articleFields
            }
          }
        }
      }
      ${articleFragment}
    `,
    next: { revalidate: 60, tags: [`article-${handle}`] },
  });

  const all = reshapeArticles(removeEdgesAndNodes(res.articles));
  return all.find((a) => a.handle === handle) || null;
}
