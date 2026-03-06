import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import { db } from '@/lib/db';

const isRedisAvailable = false;
const getRedisClient = async () => null;

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

const kvGetJson = async <T,>(key: string): Promise<T | undefined> => {
  if (!useKv || !kvBaseUrl || !kvToken) {
    return undefined;
  }
  try {
    const response = await fetch(`${kvBaseUrl}/get/${encodeURIComponent(key)}`, {
      headers: { Authorization: `Bearer ${kvToken}` },
    });
    if (!response.ok) {
      return undefined;
    }
    const data = await response.json();
    if (data?.result === null || data?.result === undefined) {
      return undefined;
    }
    return JSON.parse(data.result);
  } catch (error) {
    console.error('Error reading KV:', error);
    return undefined;
  }
};

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
    const body = await request.json();
    const { email, name, type } = body;

    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    if (!normalizedEmail) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }

    const users = await db.getUsers();
    
    const userExists = users.some(u => u.email.toLowerCase() === normalizedEmail);

    if (type === 'login') {
      if (!userExists) {
        return NextResponse.json({ message: "Email not registered" }, { status: 400 });
      }
    } else if (type === 'register') {
      if (userExists) {
        return NextResponse.json({ message: "User already exists" }, { status: 400 });
      }
    }

    // Check if we already sent a code recently (rate limiting)
    const now = Date.now();
    let existingOtp = global.otpStore.get(normalizedEmail);
    
    // Check file-based DB for existing OTP if not in memory
    if (!existingOtp) {
      existingOtp = await db.getOtp(normalizedEmail);
    }
    
    // Check KV/Redis for existing OTP if not in memory/file
    if (!existingOtp && useKv) {
      existingOtp = await kvGetJson<{ code: string; expires: number; name?: string }>(`otp:${normalizedEmail}`);
    }
    
    if (!existingOtp && useRedis) {
      const redisClient = await getRedisClient();
      if (redisClient) {
        const redisValue = await redisClient.get(`otp:${normalizedEmail}`);
        if (redisValue) {
          try {
            existingOtp = JSON.parse(redisValue);
          } catch (e) {
            console.error('Error parsing OTP from Redis:', e);
          }
        }
      }
    }

    if (existingOtp) {
      // expiryMinutes is 30, so created_at = expires - 30 * 60 * 1000
      const createdAt = existingOtp.expires - 30 * 60 * 1000;
      const timeSinceLastSend = now - createdAt;
      
      if (timeSinceLastSend < 60000) {
        console.log(`Rate limit hit for ${normalizedEmail}. Last sent ${Math.round(timeSinceLastSend/1000)}s ago.`);
        // If sent less than 60 seconds ago, return success but don't send another email
        return NextResponse.json({ 
          success: true, 
          message: "Code already sent recently. Please wait before requesting another." 
        });
      }
    }

    // Generate 4-digit code
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    const expiryMinutes = 30;
    const expirySeconds = expiryMinutes * 60;
    const expires = now + expiryMinutes * 60 * 1000;

    // Store OTP
    let stored = false;
    
    // Always store in file-based DB first (shared across PM2 instances)
    await db.saveOtp(normalizedEmail, { code, expires, name });
    stored = true; // File DB is our primary source now

    if (useKv) {
      await kvSetExJson(`otp:${normalizedEmail}`, expirySeconds, { code, expires, name });
    }
    if (useRedis) {
      const redisClient = await getRedisClient();
      if (redisClient) {
        await redisClient.set(`otp:${normalizedEmail}`, JSON.stringify({ code, expires, name }), { EX: expirySeconds });
      }
    }
    
    // Still set in memory for local rate limiting on this instance
    global.otpStore.set(normalizedEmail, { code, expires, name });

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
          
          <p style="font-size: 14px; color: #8C8279; margin-top: 25px;">Код действителен в течение 30 минут.</p>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
          <p style="font-size: 12px; color: #B0A9A2;">© ${new Date().getFullYear()} StaySee. Все права защищены.</p>
          <p style="font-size: 10px; color: #D1CDC7; margin-top: 10px;">Это автоматическое сообщение, на него не нужно отвечать.</p>
        </div>
      </div>
    `;

    // In development or if email sending fails, we can return the code in the response
    const isDev = process.env.NODE_ENV === 'development';
    const isDebug = process.env.DEBUG_AUTH === 'true';

    // Log the code to console so it's visible in server logs
    console.log(`[AUTH_DEBUG] Verification code for ${normalizedEmail}: ${code}`);

    try {
      // Add a timeout to the email sending promise
      const emailPromise = sendEmail(normalizedEmail, subject, html);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Email sending timed out after 15s')), 15000)
      );

      await Promise.race([emailPromise, timeoutPromise]);

      return NextResponse.json({ 
        success: true, 
        message: "Code sent successfully",
        debugCode: isDev || isDebug ? code : undefined 
      });
    } catch (emailError) {
      console.error("Email sending failed or timed out:", emailError);
      
      // STRICT: No more fallback to allowing login if email fails
      // unless we are in explicit development/debug mode
      if (isDev || isDebug) {
        return NextResponse.json({ 
          success: true, 
          message: "Code generated (email failed but debug allowed)",
          debugCode: code
        });
      }
      
      return NextResponse.json({ 
        message: "Не удалось отправить код на почту. Пожалуйста, попробуйте позже или проверьте правильность email.",
        error: String(emailError)
      }, { status: 500 });
    }

  } catch (error) {
    console.error("Error sending code:", error);
    return NextResponse.json({ message: "Failed to send code" }, { status: 500 });
  }
}
