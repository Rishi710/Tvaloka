import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

const JUDGEME_WIDGETS_BASE = "https://judge.me/api/v1/widgets";
const JUDGEME_REVIEWS_BASE  = "https://judge.me/api/v1/reviews";

const SHOP_DOMAIN   = process.env.JUDGEME_SHOP_DOMAIN   ?? "";
const PUBLIC_TOKEN  = process.env.JUDGEME_PUBLIC_TOKEN  ?? "";
const PRIVATE_TOKEN = process.env.JUDGEME_PRIVATE_TOKEN ?? "";

/* ─── Types ────────────────────────────────────────────────────────── */

export interface ParsedReview {
  id: string;
  rating: number;
  date: string;
  author: string;
  title: string;
  body: string;
  verifiedBuyer: boolean;
}

export interface ReviewData {
  averageRating: number;
  totalReviews: number;
  histogram: { rating: number; count: number; percentage: number }[];
  reviews: ParsedReview[];
}

/* ─── HTML Parser for Judge.me widget ──────────────────────────────── */

function parseJudgeMeHtml(rawHtml: string): ReviewData {
  if (!rawHtml) return { averageRating: 0, totalReviews: 0, histogram: [], reviews: [] };

  // 1. Total reviews & average rating
  const avgMatch = rawHtml.match(/data-average-rating=['"]([^'"]+)['"]/);
  const totalMatch = rawHtml.match(/data-number-of-reviews=['"]([^'"]+)['"]/);
  const averageRating = avgMatch ? parseFloat(avgMatch[1]) : 0;
  const totalReviews = totalMatch ? parseInt(totalMatch[1], 10) : 0;

  // 2. Histogram
  const histogram: { rating: number; count: number; percentage: number }[] = [];
  const histRegex = /<div class=['"]jdgm-histogram__row['"][^>]*data-rating=['"](\d+)['"][^>]*data-frequency=['"](\d+)['"][^>]*data-percentage=['"](\d+)['"][^>]*>/g;
  let hMatch: RegExpExecArray | null;
  while ((hMatch = histRegex.exec(rawHtml)) !== null) {
    histogram.push({
      rating: parseInt(hMatch[1], 10),
      count: parseInt(hMatch[2], 10),
      percentage: parseInt(hMatch[3], 10),
    });
  }

  // 3. Reviews list
  const reviews: ParsedReview[] = [];
  const revRegex = /<div class=['"][^'"]*jdgm-rev [^'"]*['"][^>]*data-review-id=['"]([^'"]+)['"][^>]*>([\s\S]*?)(?=(?:<div class=['"][^'"]*jdgm-rev [^'"]*['"])|(?:<\/div>\s*<div class=['"]jdgm-paginate)|$)/g;

  let rMatch: RegExpExecArray | null;
  while ((rMatch = revRegex.exec(rawHtml)) !== null) {
    const revId = rMatch[1];
    const revHtml = rMatch[2];

    const scoreMatch = revHtml.match(/data-score=['"](\d+)['"]/);
    const dateMatch = revHtml.match(/datetime=['"]([^'"]+)['"]/);
    const authorMatch = revHtml.match(/class=['"]jdgm-rev__author['"][^>]*>([^<]+)<\/span>/);
    const titleMatch = revHtml.match(/class=['"]jdgm-rev__title['"][^>]*>([^<]+)<\/b>/);
    const bodyMatch = revHtml.match(/class=['"]jdgm-rev__body['"][^>]*><p>([\s\S]*?)<\/p><\/div>/);
    const verifiedMatch = revHtml.match(/data-verified-buyer=['"]true['"]/);

    reviews.push({
      id: revId,
      rating: scoreMatch ? parseInt(scoreMatch[1], 10) : 5,
      date: dateMatch ? dateMatch[1] : "",
      author: authorMatch ? authorMatch[1].trim() : "Verified Customer",
      title: titleMatch ? titleMatch[1].trim() : "",
      body: bodyMatch ? bodyMatch[1].trim().replace(/<[^>]+>/g, "") : "",
      verifiedBuyer: !!verifiedMatch,
    });
  }

  return { averageRating, totalReviews, histogram, reviews };
}

/* ─── GET: fetch product reviews from Judge.me ─────────────────────── */

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const productId = searchParams.get("productId");

  if (!productId) {
    return Response.json({ error: "productId is required" }, { status: 400 });
  }

  if (!SHOP_DOMAIN || !PUBLIC_TOKEN) {
    console.error("[/api/reviews GET] Missing env vars.");
    return Response.json({ error: "Reviews service not configured" }, { status: 503 });
  }

  const url = new URL(`${JUDGEME_WIDGETS_BASE}/product_review`);
  url.searchParams.set("shop_domain", SHOP_DOMAIN);
  url.searchParams.set("api_token", PUBLIC_TOKEN);
  url.searchParams.set("external_id", productId);

  try {
    const res = await fetch(url.toString(), { cache: "no-store" });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error(`[/api/reviews GET] Judge.me ${res.status}: ${text}`);
      return Response.json({ error: `Judge.me error: ${res.status}` }, { status: res.status });
    }

    const data = (await res.json()) as { widget?: string; html?: string };
    const rawWidget = data.widget ?? data.html ?? "";
    const parsed = parseJudgeMeHtml(rawWidget);

    // Remove temporary hiding style if raw HTML is used
    const cleanHtml = rawWidget.replace(/<style class=['"]jdgm-temp-hiding-style['"]>[\s\S]*?<\/style>/gi, "");

    return Response.json({
      html: cleanHtml,
      ...parsed,
    });
  } catch (err) {
    console.error("[/api/reviews GET] Fetch failed:", err);
    return Response.json({ error: "Failed to fetch reviews" }, { status: 502 });
  }
}

/* ─── POST: submit a new review via the Judge.me Reviews API ─────── */

interface ReviewPayload {
  productId: string;
  name: string;
  email: string;
  rating: number;   // 1-5
  title?: string;
  body: string;
}

export async function POST(request: NextRequest) {
  const tokenToUse = PRIVATE_TOKEN || PUBLIC_TOKEN;
  if (!SHOP_DOMAIN || !tokenToUse) {
    console.error("[/api/reviews POST] Missing env vars.");
    return Response.json({ error: "Reviews service not configured" }, { status: 503 });
  }

  let payload: ReviewPayload;
  try {
    payload = (await request.json()) as ReviewPayload;
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { productId, name, email, rating, title, body } = payload;

  if (!productId || !name || !email || !rating || !body) {
    return Response.json(
      { error: "Missing required fields: productId, name, email, rating, body" },
      { status: 400 }
    );
  }

  if (rating < 1 || rating > 5) {
    return Response.json({ error: "rating must be between 1 and 5" }, { status: 400 });
  }

  const url = new URL(JUDGEME_REVIEWS_BASE);
  url.searchParams.set("shop_domain", SHOP_DOMAIN);
  url.searchParams.set("api_token", tokenToUse);

  const jdgmBody = {
    platform: "shopify",
    id: productId,
    name,
    email,
    rating,
    title: title ?? "",
    body,
  };

  try {
    const res = await fetch(url.toString(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(jdgmBody),
    });

    const responseText = await res.text();
    console.log(`[/api/reviews POST] Judge.me ${res.status}:`, responseText);

    if (!res.ok && res.status !== 201) {
      return Response.json(
        { error: `Judge.me error ${res.status}: ${responseText}` },
        { status: res.status }
      );
    }

    return Response.json({ success: true });
  } catch (err) {
    console.error("[/api/reviews POST] Fetch failed:", err);
    return Response.json({ error: "Failed to submit review" }, { status: 502 });
  }
}
