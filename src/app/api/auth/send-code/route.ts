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
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Код подтверждения: <strong>${code}</strong></h2>
        <p>Используйте этот код для входа или регистрации в StaySee.</p>
        <p>Код действителен в течение 5 минут.</p>
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
