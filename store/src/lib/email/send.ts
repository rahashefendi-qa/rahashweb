import "server-only";
import nodemailer from "nodemailer";

export type EmailMessage = { to: string; subject: string; text: string; html: string; replyTo?: string | null };
export type EmailResult = { ok: true; id?: string } | { ok: false; error: string };

/**
 * Real email delivery. Configure ONE of:
 *   - Resend:  RESEND_API_KEY + EMAIL_FROM
 *   - SMTP:    SMTP_HOST + SMTP_PORT + SMTP_USER + SMTP_PASS + EMAIL_FROM
 * If neither is configured the send fails loudly (and the failure is stored on the order).
 */
export function emailProvider(): "resend" | "smtp" | null {
  if (process.env.RESEND_API_KEY) return "resend";
  if (process.env.SMTP_HOST) return "smtp";
  return null;
}

export async function sendEmail(msg: EmailMessage): Promise<EmailResult> {
  const from = process.env.EMAIL_FROM;
  const provider = emailProvider();
  if (!provider || !from) {
    const error = "Email is not configured (set RESEND_API_KEY or SMTP_* and EMAIL_FROM).";
    console.warn(`[email] ${error} Skipped: "${msg.subject}" → ${msg.to}`);
    return { ok: false, error };
  }

  try {
    if (provider === "resend") {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from,
          to: [msg.to],
          subject: msg.subject,
          text: msg.text,
          html: msg.html,
          ...(msg.replyTo ? { reply_to: msg.replyTo } : {}),
        }),
        signal: AbortSignal.timeout(15000),
      });
      const data = (await res.json().catch(() => ({}))) as { id?: string; message?: string };
      if (!res.ok) return { ok: false, error: `Resend ${res.status}: ${data.message ?? "unknown error"}` };
      return { ok: true, id: data.id };
    }

    const port = Number(process.env.SMTP_PORT || 587);
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465,
      auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
    });
    const info = await transporter.sendMail({
      from,
      to: msg.to,
      subject: msg.subject,
      text: msg.text,
      html: msg.html,
      replyTo: msg.replyTo ?? undefined,
    });
    return { ok: true, id: info.messageId };
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    console.error("[email] send failed", error);
    return { ok: false, error };
  }
}
