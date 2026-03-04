import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.yandex.ru',
  port: 465,
  secure: true, // true for 465, false for 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  connectionTimeout: 15000, // 15 seconds
  greetingTimeout: 15000,
  socketTimeout: 30000,
  debug: true,
  logger: true,
});

export async function sendEmail(to: string, subject: string, html: string) {
  // If RESEND_API_KEY is present, use Resend (HTTP API, not blocked by cloud providers)
  if (process.env.RESEND_API_KEY) {
    console.log(`Sending email to ${to} via Resend API...`);
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: process.env.RESEND_FROM || 'StaySee <onboarding@resend.dev>',
          to,
          subject,
          html,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Resend API error:", errorData);
        throw new Error(`Resend API failed: ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      console.log(`Email sent via Resend to ${to}: ${data.id}`);
      return;
    } catch (error) {
      console.error("Resend delivery failed:", error);
      // Fallback to SMTP if Resend fails, but if it was the primary choice, we should know
    }
  }

  // Fallback to Nodemailer/SMTP
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error("Email credentials (EMAIL_USER, EMAIL_PASS) are not set.");
    throw new Error("Email configuration missing");
  }

  try {
    console.log(`Sending email to ${to} via SMTP...`);
    const info = await transporter.sendMail({
      from: `"StaySee" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`Email sent to ${to} via SMTP: ${info.messageId}`);
  } catch (error) {
    console.error("Nodemailer detailed error:", error);
    throw new Error("Failed to send email via SMTP");
  }
}
