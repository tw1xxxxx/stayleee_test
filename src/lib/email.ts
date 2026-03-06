import nodemailer from 'nodemailer';
import { Resend } from 'resend';

// If RESEND_API_KEY is provided, we use the API to bypass VPS port blocking (SMTP ports 465/587)
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const transporter = nodemailer.createTransport({
  host: 'smtp.yandex.ru',
  port: 465,
  secure: true, // Port 465 requires secure: true
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    // Ensuring we don't reject valid certs, but trying to be standard
    rejectUnauthorized: true,
    minVersion: 'TLSv1.2'
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 20000,
  debug: true,
  logger: true,
});

export async function sendEmail(to: string, subject: string, html: string) {
  console.log(`[EMAIL_DEBUG] Attempting to send email to ${to} using ${resend ? 'Resend API' : 'SMTP'}`);

  if (resend) {
    try {
      const { data, error } = await resend.emails.send({
        from: 'StaySee <auth@staysee.shop>', // Updated to .shop domain
        to: [to],
        subject,
        html,
        headers: {
          'X-Priority': '1 (Highest)',
          'Importance': 'high',
        }
      });

      if (error) {
        console.error("Resend API error:", error);
        throw error;
      }

      console.log(`Email sent via Resend API: ${data?.id}`);
      return data;
    } catch (apiError) {
      console.error("Resend API failed, falling back to SMTP if configured:", apiError);
      // Fallback to SMTP if API fails
    }
  }

  // Fallback to SMTP if Resend is not configured or failed
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error("Email configuration missing (no Resend API Key and no SMTP credentials)");
  }

  try {
    const info = await transporter.sendMail({
      from: `"StaySee" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
      // Adding headers to prevent spam
      headers: {
        'X-Priority': '1 (Highest)',
        'X-Mailer': 'Nodemailer',
        'List-Unsubscribe': `<mailto:${process.env.EMAIL_USER}?subject=unsubscribe>`,
        'Reply-To': process.env.EMAIL_USER,
        'Importance': 'high',
        'Message-ID': `<${Date.now()}.${Math.random().toString(36).substring(2)}@staysee.shop>`,
      }
    });
    console.log(`Email sent to ${to} via SMTP: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error("Nodemailer detailed error:", error);
    throw error;
  }
}
