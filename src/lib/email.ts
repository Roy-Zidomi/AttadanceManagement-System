type ResendErrorResponse = {
  message?: string;
  name?: string;
};

type ResendSuccessResponse = {
  id?: string;
};

export async function sendPasswordResetOtpEmail(args: {
  to: string;
  otp: string;
  ttlMinutes: number;
}) {
  const { to, otp, ttlMinutes } = args;

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;

  // In dev, allow testing without an email provider.
  if (!apiKey || !from) {
    if (process.env.NODE_ENV !== "production") {
      console.log(`[DEV] Password reset OTP for ${to}: ${otp} (expires in ${ttlMinutes} min)`);
      return;
    }
    throw new Error("Email service not configured (RESEND_API_KEY / EMAIL_FROM missing)");
  }

  const subject = "Your password reset code";
  const html = `
    <div style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; line-height: 1.5;">
      <h2 style="margin: 0 0 12px;">Password reset</h2>
      <p style="margin: 0 0 12px;">Use this code to reset your password. It expires in ${ttlMinutes} minutes.</p>
      <div style="font-size: 28px; letter-spacing: 6px; font-weight: 700; padding: 12px 16px; background: #0b1220; color: #fff; display: inline-block; border-radius: 10px;">
        ${otp}
      </div>
      <p style="margin: 12px 0 0; color: #6b7280; font-size: 12px;">If you did not request this, you can ignore this email.</p>
    </div>
  `.trim();

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject,
      html,
    }),
  });

  if (!response.ok) {
    let details = "";
    try {
      const data = (await response.json()) as ResendErrorResponse;
      details = data?.message ? `: ${data.message}` : "";
    } catch {
      // ignore
    }
    throw new Error(`Failed to send email${details}`);
  }

  if (process.env.NODE_ENV !== "production") {
    try {
      const data = (await response.json()) as ResendSuccessResponse;
      console.log(`[DEV] Resend accepted email (id=${data?.id || "unknown"}) to=${to}`);
    } catch {
      console.log(`[DEV] Resend accepted email to=${to}`);
    }
  }
}
