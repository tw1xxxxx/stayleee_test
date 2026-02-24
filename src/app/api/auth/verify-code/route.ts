import { NextResponse } from 'next/server';
import { db, getRedisClient, isRedisAvailable } from '@/lib/db';

declare global {
  var otpStore: Map<string, { code: string; expires: number; name?: string }>;
}

export async function POST(request: Request) {
  try {
    const { email, code, isRegistration, name } = await request.json();

    if (!email || !code) {
      return NextResponse.json({ message: "Email and code are required" }, { status: 400 });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const normalizedCode = String(code).trim();
    if (!normalizedEmail || !normalizedCode) {
      return NextResponse.json({ message: "Email and code are required" }, { status: 400 });
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

    const kvDel = async (key: string): Promise<void> => {
      if (!useKv || !kvBaseUrl || !kvToken) {
        return;
      }
      try {
        const response = await fetch(`${kvBaseUrl}/del/${encodeURIComponent(key)}`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${kvToken}` },
        });
        if (!response.ok) {
          throw new Error('KV delete failed');
        }
      } catch (error) {
        console.error('Error deleting KV:', error);
      }
    };

    let storedOtp = useKv
      ? await kvGetJson<{ code: string; expires: number; name?: string }>(`otp:${normalizedEmail}`)
      : undefined;
    if (!storedOtp && useRedis) {
      const redisClient = await getRedisClient();
      if (redisClient) {
        const redisValue = await redisClient.get(`otp:${normalizedEmail}`);
        if (redisValue) {
          try {
            storedOtp = JSON.parse(redisValue);
          } catch (error) {
            console.error('Error parsing OTP from Redis:', error);
          }
        }
      }
    }
    if (!storedOtp) {
      storedOtp = global.otpStore?.get(normalizedEmail);
    }

    if (!storedOtp) {
      return NextResponse.json({ message: "Code expired or not found" }, { status: 400 });
    }

    if (Date.now() > storedOtp.expires) {
      if (useKv) {
        await kvDel(`otp:${normalizedEmail}`);
      } else if (useRedis) {
        const redisClient = await getRedisClient();
        if (redisClient) {
          await redisClient.del(`otp:${normalizedEmail}`);
        } else {
          global.otpStore.delete(normalizedEmail);
        }
      } else {
        global.otpStore.delete(normalizedEmail);
      }
      return NextResponse.json({ message: "Code expired" }, { status: 400 });
    }

    if (storedOtp.code !== normalizedCode) {
      return NextResponse.json({ message: "Invalid code" }, { status: 400 });
    }

    // Code verified successfully
    if (useKv) {
      await kvDel(`otp:${normalizedEmail}`);
    } else if (useRedis) {
      const redisClient = await getRedisClient();
      if (redisClient) {
        await redisClient.del(`otp:${normalizedEmail}`);
      } else {
        global.otpStore.delete(normalizedEmail);
      }
    } else {
      global.otpStore.delete(normalizedEmail);
    }

    let user;
    
    // console.log(`Verifying code for ${normalizedEmail}, isRegistration: ${isRegistration}`);

    if (isRegistration) {
      // Get existing users to generate numeric ID
      const users = await db.getUsers();
      
      const maxId = users.reduce((max, u) => {
        const numId = parseInt(u.id);
        return !isNaN(numId) && numId > max ? numId : max;
      }, 0);
      
      const newId = (maxId + 1).toString();

      // Create new user
      user = {
        id: newId,
        email: normalizedEmail,
        name: name || storedOtp.name || "User",
        createdAt: new Date().toISOString(),
      };
      
      // console.log("Creating new user:", user);
      
      // Save to store
      await db.createUser(user);
    } else {
      // Find existing user
      user = await db.getUserByEmail(normalizedEmail);
      
      // Fallback if not found (should be handled by send-code, but just in case)
      if (!user) {
        return NextResponse.json({ message: "User not found" }, { status: 400 });
      }
    }

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("Error verifying code:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
