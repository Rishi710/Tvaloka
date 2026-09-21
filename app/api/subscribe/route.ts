import { randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { shopifyFetch } from "@/app/lib/shopify";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface CustomerCreateResponse {
  customerCreate: {
    customer: { id: string } | null;
    customerUserErrors: { code: string; field: string[] | null; message: string }[];
  };
}

export async function POST(req: NextRequest) {
  let email = "";
  try {
    const body = await req.json();
    email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  } catch {
    // fall through to validation error
  }

  if (!EMAIL_PATTERN.test(email) || email.length > 254) {
    return NextResponse.json(
      { ok: false, error: "Enter a valid email address (e.g. name@example.com)." },
      { status: 400 },
    );
  }

  try {
    // Shopify has no public "newsletter signup" mutation, so we create a customer
    // with marketing consent. The random password is never shown or stored; the
    // customer can set their own later via "forgot password".
    const data = await shopifyFetch<CustomerCreateResponse>({
      query: `
        mutation subscribe($input: CustomerCreateInput!) {
          customerCreate(input: $input) {
            customer { id }
            customerUserErrors { code field message }
          }
        }
      `,
      variables: {
        input: {
          email,
          password: randomBytes(24).toString("base64url"),
          acceptsMarketing: true,
        },
      },
      cache: "no-store",
      retries: 0,
    });

    const errors = data.customerCreate.customerUserErrors;
    if (errors.length === 0) {
      return NextResponse.json({ ok: true });
    }

    if (errors.some((e) => e.code === "TAKEN")) {
      return NextResponse.json({ ok: true, alreadyRegistered: true });
    }
    if (errors.some((e) => e.code === "TOO_MANY_REQUESTS")) {
      return NextResponse.json(
        { ok: false, error: "Too many attempts. Please try again in a little while." },
        { status: 429 },
      );
    }
    if (errors.some((e) => e.code === "INVALID")) {
      return NextResponse.json(
        { ok: false, error: "Enter a valid email address (e.g. name@example.com)." },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { ok: false, error: "We couldn't subscribe you just now. Please try again." },
      { status: 502 },
    );
  } catch {
    return NextResponse.json(
      { ok: false, error: "We couldn't subscribe you just now. Please try again." },
      { status: 502 },
    );
  }
}
