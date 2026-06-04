// Fire-and-forget admin alert dispatcher. Used inside webhook handlers and
// other server flows that need to notify Line of Judah ops about anomalies
// (failed payments, disputes, refunds). Never throws — failures are logged
// so they can't break the calling handler.

export interface AdminAlertPayload {
  subject: string;
  html: string;
  /** Optional structured context for logging only. */
  context?: Record<string, unknown>;
  /** Idempotency key (typically the Stripe event id) to dedupe retries. */
  idempotencyKey?: string;
}

export async function sendAdminAlert(payload: AdminAlertPayload): Promise<void> {
  try {
    const url = `${Deno.env.get("SUPABASE_URL")}/functions/v1/send-admin-alert`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Service role used so the alert function can be invoked without
        // a session — the function still validates its own input.
        "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      console.error(
        "admin-alert: send-admin-alert returned non-2xx",
        res.status,
        await res.text().catch(() => ""),
      );
    }
  } catch (e) {
    console.error("admin-alert: failed to dispatch", e);
  }
}
