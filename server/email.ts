// server/email.ts
import nodemailer from "nodemailer";

export type FulfillmentKind = "digital" | "physical";

type SendArgs = {
  to: string;
  orderId: string | number;
  productTitle: string;
  downloadUrl?: string | null;
  fulfillmentKind: FulfillmentKind;
};

function mkTransport() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE } = process.env;
  if (!SMTP_HOST) {
    return null; // dev/no-op
  }
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT || 587),
    secure: String(SMTP_SECURE || "false") === "true",
    auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
  });
}

function digitalTemplate(args: SendArgs) {
  const subject = `Your Pet PawtrAIt is ready – Order #${args.orderId}`;
  const body = `
    <div style="font-family:Inter,Arial,sans-serif;max-width:640px;margin:0 auto;padding:24px;color:#111">
      <h1 style="margin:0 0 8px 0;font-size:22px">Your digital pawtrait is ready</h1>
      <p style="margin:0 0 16px 0">Thanks for your purchase. Your upscaled, high-resolution pawtrait is ready to download.</p>
      ${
        args.downloadUrl
          ? `<p><a href="${args.downloadUrl}" style="display:inline-block;background:#F4953E;color:#111;text-decoration:none;padding:12px 16px;border-radius:999px;font-weight:600">Download digital copy</a></p>`
          : `<p>We’re preparing your download. You’ll receive another email when it’s ready.</p>`
      }
      <p style="margin-top:24px;font-size:12px;color:#666">Order #${args.orderId} • ${args.productTitle}</p>
    </div>
  `;
  return { subject, html: body };
}

function physicalTemplate(args: SendArgs) {
  const subject = `We’re preparing your print – Order #${args.orderId}`;
  const body = `
    <div style="font-family:Inter,Arial,sans-serif;max-width:640px;margin:0 auto;padding:24px;color:#111">
      <h1 style="margin:0 0 8px 0;font-size:22px">Thanks! We’re preparing your print.</h1>
      <p style="margin:0 0 16px 0">Your ${args.productTitle} will move to production shortly. In the meantime, enjoy your bonus digital copy.</p>
      ${
        args.downloadUrl
          ? `<p><a href="${args.downloadUrl}" style="display:inline-block;background:#F4953E;color:#111;text-decoration:none;padding:12px 16px;border-radius:999px;font-weight:600">Download bonus digital copy</a></p>`
          : `<p>Your bonus digital copy will be available shortly. We’ll email you a link as soon as it’s ready.</p>`
      }
      <p style="margin-top:24px;font-size:12px;color:#666">Order #${args.orderId} • ${args.productTitle}</p>
    </div>
  `;
  return { subject, html: body };
}

export async function sendOrderEmails(args: SendArgs) {
  const transporter = mkTransport();
  const { to, fulfillmentKind } = args;

  const tpl = fulfillmentKind === "digital" ? digitalTemplate(args) : physicalTemplate(args);

  if (!transporter) {
    console.log("[email] Would send:", { to, ...tpl });
    return { ok: true, noop: true };
  }
  await transporter.sendMail({
    from: process.env.FROM_EMAIL || "orders@petpawtrait.net",
    to,
    subject: tpl.subject,
    html: tpl.html,
  });
  return { ok: true };
}

/**
 * Sends a transactional email to the customer (e.g., "Your preview is ready").
 */
export async function sendCustomerEmail(to: string, type: string, data: any) {
  const transporter = mkTransport();
  
  if (!transporter) {
    console.log(`[email] Mock sendCustomerEmail (${type}) to ${to}`, data);
    return;
  }

  let subject = "Pet PawtrAIt Update";
  let html = "<p>Update regarding your order.</p>";

  if (type === "artwork_ready") {
    subject = "Your Pawtrait Preview is Ready! 🎨";
    html = `
      <div style="font-family:sans-serif;padding:20px;">
        <h1>Your preview is ready</h1>
        <p>We've finished generating your pet's portrait. Click the link below to see it!</p>
        <p><a href="${data.previewUrl}">View My Pawtrait</a></p>
      </div>
    `;
  }

  await transporter.sendMail({
    from: process.env.FROM_EMAIL || "no-reply@petpawtrait.net",
    to,
    subject,
    html,
  });
}

/**
 * Sends an error alert to the admin.
 */
export async function sendAdminErrorEmail(subject: string, errorData: any) {
  const transporter = mkTransport();
  const adminEmail = process.env.ADMIN_EMAIL;

  if (!transporter || !adminEmail) {
    console.error(`[Admin Email Alert] ${subject}`, errorData);
    return;
  }

  await transporter.sendMail({
    from: "system@petpawtrait.net",
    to: adminEmail,
    subject: `[ALERT] ${subject}`,
    text: JSON.stringify(errorData, null, 2),
  });
}