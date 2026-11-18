import { NextRequest, NextResponse } from "next/server";
import { sendMetaCapiEvent } from "@/app/lib/meta-capi";
import { completeMagicCheckout, isMagicCheckoutConfigured } from "@/app/lib/razorpay-magic";

export const dynamic = "force-dynamic";

const PAYMENT_ID = /^pay_[A-Za-z0-9]{6,40}$/;
const ORDER_ID = /^order_[A-Za-z0-9]{6,40}$/;

function cookie(request: NextRequest, name: string): string | undefined {
  return request.cookies.get(name)?.value || undefined;
}

/**
 * Called by the page once the shopper has paid in the Magic Checkout modal.
 * Creates the order in Shopify, reports the Purchase to Meta from the server
 * (only here, after Razorpay has confirmed the order, so it can't be forged from
 * the browser), and returns where to send the shopper next.
 */
export async function POST(request: NextRequest) {
  if (!isMagicCheckoutConfigured()) {
    return NextResponse.json({ ok: false, error: "Magic Checkout is not enabled" }, { status: 404 });
  }

  let body: { paymentId?: unknown; orderId?: unknown; contentIds?: unknown; sourceUrl?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const paymentId = typeof body.paymentId === "string" ? body.paymentId : "";
  const orderId = typeof body.orderId === "string" ? body.orderId : "";
  if (!PAYMENT_ID.test(paymentId) || !ORDER_ID.test(orderId)) {
    return NextResponse.json({ ok: false, error: "Invalid payment details" }, { status: 400 });
  }

  try {
    const order = await completeMagicCheckout(paymentId, orderId);

    const contentIds = Array.isArray(body.contentIds)
      ? body.contentIds.filter((v): v is string => typeof v === "string").slice(0, 100)
      : [];
    const value = order.total_amount / 100;
    const currency = order.payment_currency?.toUpperCase() || "INR";
    // One Purchase per Razorpay order, so a repeated call can't double count.
    const purchaseEventId = `purchase-${orderId}`;

    const rawIp = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip");
    await sendMetaCapiEvent({
      eventName: "Purchase",
      eventId: purchaseEventId,
      sourceUrl: typeof body.sourceUrl === "string" ? body.sourceUrl.slice(0, 2000) : undefined,
      eventData: { content_ids: contentIds, content_type: "product", value, currency },
      userData: {
        clientIp: rawIp ? rawIp.split(",")[0].trim() : undefined,
        userAgent: request.headers.get("user-agent") ?? undefined,
        fbp: cookie(request, "_fbp"),
        fbc: cookie(request, "_fbc"),
        email: order.customer_details?.email,
        phone: order.customer_details?.contact,
      },
    });

    return NextResponse.json({
      ok: true,
      orderStatusUrl: order.order_status_url,
      orderName: order.order_id,
      value,
      currency,
      purchaseEventId,
    });
  } catch {
    return NextResponse.json({ ok: false, error: "Could not complete the order" }, { status: 502 });
  }
}
