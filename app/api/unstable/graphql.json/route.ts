import { NextResponse } from "next/server";
import { Kind, parse } from "graphql";

export const dynamic = "force-dynamic";

/**
 * True only for a single read query whose only top-level field is
 * `consentManagement`. The query is parsed, so a mention of the word in a
 * comment or string can't smuggle another query through.
 */
function isConsentManagementQuery(query: unknown): boolean {
  if (typeof query !== "string") return false;
  try {
    const { definitions } = parse(query);
    if (definitions.length !== 1) return false;
    const [operation] = definitions;
    return (
      operation.kind === Kind.OPERATION_DEFINITION &&
      operation.operation === "query" &&
      operation.selectionSet.selections.length > 0 &&
      operation.selectionSet.selections.every(
        (selection) => selection.kind === Kind.FIELD && selection.name.value === "consentManagement",
      )
    );
  } catch {
    return false;
  }
}

/**
 * First-party proxy for Shopify's Customer Privacy API.
 *
 * Shopify's consent script (loaded by <ShopifyAnalytics />) asks the storefront
 * origin for the visitor's tracking cookies by POSTing to
 * `/api/unstable/graphql.json` — the same route Hydrogen storefronts provide.
 * Without it the script gets a 404, no visitor/session identity is created, and
 * Shopify Analytics stays empty.
 *
 * This forwards ONLY the `consentManagement` query to the Storefront API with
 * our public token, and passes Shopify's Set-Cookie headers back so the
 * cookies are stored on our own domain. Anything else is rejected, so this can't
 * be used as a general-purpose relay.
 */
const FORWARDED_REQUEST_HEADERS = [
  "content-type",
  "cookie",
  "user-agent",
  "accept-language",
  "x-shopify-visittoken",
  "x-shopify-uniquetoken",
];

export async function POST(req: Request) {
  const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
  const token = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN;
  if (!domain || !token) {
    return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
  }

  const rawBody = await req.text();
  let query: unknown;
  try {
    query = JSON.parse(rawBody)?.query;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!isConsentManagementQuery(query)) {
    return NextResponse.json({ error: "Operation not allowed" }, { status: 400 });
  }

  const headers: Record<string, string> = {
    "X-Shopify-Storefront-Access-Token": token,
  };
  for (const name of FORWARDED_REQUEST_HEADERS) {
    const value = req.headers.get(name);
    if (value) headers[name] = value;
  }

  try {
    const upstream = await fetch(`https://${domain}/api/unstable/graphql.json`, {
      method: "POST",
      headers,
      body: rawBody,
      cache: "no-store",
    });

    const response = new NextResponse(await upstream.text(), {
      status: upstream.status,
      headers: { "content-type": upstream.headers.get("content-type") || "application/json" },
    });

    // Shopify scopes these cookies to its own domain; drop that so the browser
    // keeps them on ours.
    for (const cookie of upstream.headers.getSetCookie()) {
      response.headers.append("set-cookie", cookie.replace(/;\s*domain=[^;]*/i, ""));
    }
    return response;
  } catch (error) {
    console.error("[Shopify consent proxy] Upstream request failed:", error);
    return NextResponse.json({ error: "Upstream error" }, { status: 502 });
  }
}
