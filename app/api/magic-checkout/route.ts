import { NextRequest, NextResponse } from "next/server";
import { createCart } from "@/app/lib/shopify/queries/cart";
import {
  MagicCheckoutError,
  createMagicOrder,
  isMagicCheckoutConfigured,
} from "@/app/lib/razorpay-magic";

export const dynamic = "force-dynamic";

interface IncomingLine {
  variantId?: unknown;
  quantity?: unknown;
}

/**
 * Starts a Magic Checkout: builds the Shopify cart from the shopper's lines,
 * registers it with Razorpay and returns the Razorpay order ID for the modal.
 * `checkoutUrl` is the plain Shopify checkout for the same cart, so the page can
 * fall back to it if Magic Checkout can't be opened.
 */
export async function POST(request: NextRequest) {
  if (!isMagicCheckoutConfigured()) {
    return NextResponse.json({ ok: false, error: "Magic Checkout is not enabled" }, { status: 404 });
  }

  let body: { lines?: IncomingLine[]; fbp?: unknown; fbc?: unknown; sourceUrl?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const lines = (body.lines ?? [])
    .map((l) => ({
      merchandiseId: typeof l.variantId === "string" ? l.variantId : "",
      quantity: typeof l.quantity === "number" ? Math.floor(l.quantity) : 0,
    }))
    .filter((l) => l.merchandiseId.startsWith("gid://shopify/ProductVariant/") && l.quantity > 0)
    .slice(0, 100);
  if (lines.length === 0) {
    return NextResponse.json({ ok: false, error: "Cart is empty" }, { status: 400 });
  }

  try {
    const cart = await createCart(lines);
    if (!cart) throw new MagicCheckoutError("Could not create cart", 502);

    const str = (v: unknown) => (typeof v === "string" && v ? v.slice(0, 500) : undefined);
    const { orderId, checkoutId } = await createMagicOrder(
      cart.id,
      cart.lines.map((l) => ({
        variantId: l.merchandise.id,
        productId: l.merchandise.product.id,
        quantity: l.quantity,
      })),
      {
        fbp: str(body.fbp),
        fbc: str(body.fbc),
        sourceUrl: str(body.sourceUrl),
        userAgent: request.headers.get("user-agent") ?? undefined,
      },
    );

    return NextResponse.json({ ok: true, orderId, checkoutId, checkoutUrl: cart.checkoutUrl });
  } catch (error) {
    const status = error instanceof MagicCheckoutError ? error.status : 500;
    return NextResponse.json({ ok: false, error: "Could not start Magic Checkout" }, { status });
  }
}
