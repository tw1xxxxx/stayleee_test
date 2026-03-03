import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import { db, getRedisClient, isRedisAvailable } from '@/lib/db';

// In-memory store for OTPs (for demo purposes only)
// In a real app, use Redis or a database
declare global {
  var otpStore: Map<string, { code: string; expires: number; name?: string }>;
}

if (!global.otpStore) {
  global.otpStore = new Map();
}

const kvBaseUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const kvToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const useKv = !!kvBaseUrl && !!kvToken;
const useRedis = isRedisAvailable;

const kvSetExJson = async (key: string, seconds: number, value: unknown): Promise<boolean> => {
  if (!useKv || !kvBaseUrl || !kvToken) {
    return false;
  }
  try {
    const encoded = encodeURIComponent(JSON.stringify(value));
    const response = await fetch(
      `${kvBaseUrl}/setex/${encodeURIComponent(key)}/${seconds}/${encoded}`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${kvToken}` },
      }
    );
    if (!response.ok) {
      throw new Error('KV write failed');
    }
    return true;
  } catch (error) {
    console.error('Error writing KV:', error);
    return false;
  }
};

export async function POST(request: Request) {
  try {
    const { email, name, type } = await request.json();

    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    if (!normalizedEmail) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }

    const userExists = await db.userExists(normalizedEmail);

    if (type === 'login') {
      if (!userExists) {
        return NextResponse.json({ message: "Email not registered" }, { status: 400 });
      }
    } else if (type === 'register') {
      if (userExists) {
        return NextResponse.json({ message: "User already exists" }, { status: 400 });
      }
    }

    // Generate 4-digit code
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    const expires = Date.now() + 5 * 60 * 1000; // 5 minutes

    // Store OTP
    let stored = false;
    if (useKv) {
      stored = await kvSetExJson(`otp:${normalizedEmail}`, 300, { code, expires, name });
    }
    if (!stored && useRedis) {
      const redisClient = await getRedisClient();
      if (redisClient) {
        await redisClient.set(`otp:${normalizedEmail}`, JSON.stringify({ code, expires, name }), { EX: 300 });
        stored = true;
      } else {
        global.otpStore.set(normalizedEmail, { code, expires, name });
        stored = true;
      }
    }
    if (!stored) {
      global.otpStore.set(normalizedEmail, { code, expires, name });
    }

    // Send email
    const subject = "Ваш код подтверждения StaySee";
    const html = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #4A3E3E; background-color: #FDFCF8; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="font-size: 24px; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; margin: 0;">StaySee</h1>
        </div>
        
        <div style="background-color: #FFFFFF; padding: 40px; border-radius: 12px; box-shadow: 0 4px 12px rgba(74, 62, 62, 0.05); text-align: center;">
          <p style="font-size: 16px; margin-bottom: 25px; line-height: 1.6;">Используйте этот код для входа или регистрации в личном кабинете:</p>
          
          <div style="background-color: #FDFCF8; border: 1px solid #E5E1D8; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <span style="font-size: 36px; font-weight: 600; letter-spacing: 0.2em; color: #4A3E3E;">${code}</span>
          </div>
          
          <p style="font-size: 14px; color: #8C8279; margin-top: 25px;">Код действителен в течение 5 минут.</p>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
          <p style="font-size: 12px; color: #B0A9A2;">© ${new Date().getFullYear()} StaySee. Все права защищены.</p>
        </div>
      </div>
    `;

    // Send email asynchronously without blocking the response
    // This dramatically speeds up the UI for the user
    try {
      await sendEmail(normalizedEmail, subject, html);
      return NextResponse.json({ success: true, message: "Code sent to email" });
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      const message = emailError instanceof Error ? emailError.message : "";
      if (message === "Email configuration missing") {
        return NextResponse.json({ message: "Server configuration error: Email settings missing" }, { status: 500 });
      }
      throw emailError;
    }

  } catch (error) {
    console.error("Error sending code:", error);
    return NextResponse.json({ message: "Failed to send code" }, { status: 500 });
  }
}
