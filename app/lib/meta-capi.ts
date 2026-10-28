import { createHash } from "node:crypto";

/**
 * Server-side Meta Conversions API sender, used by the browser-event relay
 * (/api/meta-events). Events arrive from the browser with the same event_id the
 * Pixel used, so Meta counts each one once.
 *
 * Off until NEXT_PUBLIC_META_PIXEL_ID and META_ACCESS_TOKEN are both set.
 */

// Meta retires Graph API versions about two years after release. Check
// https://developers.facebook.com/docs/graph-api/changelog/versions when bumping.
const GRAPH_API_VERSION = "v26.0";

function sha256(value: string): string {
  return createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

export interface MetaCapiUserData {
  clientIp?: string;
  userAgent?: string;
  fbp?: string;
  fbc?: string;
  /** Raw email: hashed (SHA-256) here, so it never leaves the server in clear text. */
  email?: string;
  /** Raw phone: digits only, then hashed. */
  phone?: string;
}

export interface MetaCapiEventData {
  content_ids?: string[];
  content_type?: string;
  content_name?: string;
  content_category?: string;
  search_string?: string;
  value?: number;
  currency?: string;
  num_items?: number;
}

export interface MetaCapiEventInput {
  eventName: string;
  /** Must equal the eventID the browser Pixel sent for the same action. */
  eventId: string;
  eventData?: MetaCapiEventData;
  sourceUrl?: string;
  userData: MetaCapiUserData;
}

export interface MetaCapiResult {
  success: boolean;
  skipped?: boolean;
  error?: unknown;
}

export async function sendMetaCapiEvent(input: MetaCapiEventInput): Promise<MetaCapiResult> {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const accessToken = process.env.META_ACCESS_TOKEN;

  // Not configured: nothing to send, and not an error.
  if (!pixelId || !accessToken) return { success: true, skipped: true };

  const user_data: Record<string, unknown> = {};
  if (input.userData.clientIp) user_data.client_ip_address = input.userData.clientIp;
  if (input.userData.userAgent) user_data.client_user_agent = input.userData.userAgent;
  if (input.userData.fbp) user_data.fbp = input.userData.fbp;
  if (input.userData.fbc) user_data.fbc = input.userData.fbc;
  if (input.userData.email) user_data.em = [sha256(input.userData.email)];
  if (input.userData.phone) {
    const digits = input.userData.phone.replace(/\D/g, "");
    if (digits) user_data.ph = [sha256(digits)];
  }

  const event: Record<string, unknown> = {
    event_name: input.eventName,
    event_time: Math.floor(Date.now() / 1000),
    event_id: input.eventId,
    event_source_url: input.sourceUrl || undefined,
    action_source: "website",
    user_data,
  };

  if (input.eventData) {
    event.custom_data = { currency: "INR", ...input.eventData };
  }

  const body: Record<string, unknown> = { data: [event], access_token: accessToken };
  // Shows the event under Events Manager → Test events. Remove the env var once
  // testing is done: events sent with a test code are not used for ads.
  const testEventCode = process.env.META_TEST_EVENT_CODE;
  if (testEventCode) body.test_event_code = testEventCode;

  try {
    const response = await fetch(
      `https://graph.facebook.com/${GRAPH_API_VERSION}/${pixelId}/events`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        cache: "no-store",
      },
    );
    const result = await response.json().catch(() => null);

    if (!response.ok) {
      console.error(`[Meta CAPI] Graph API rejected ${input.eventName} (${input.eventId}):`, result);
      return { success: false, error: result };
    }
    return { success: true };
  } catch (error) {
    console.error(`[Meta CAPI] Request failed for ${input.eventName} (${input.eventId}):`, error);
    return { success: false, error };
  }
}
