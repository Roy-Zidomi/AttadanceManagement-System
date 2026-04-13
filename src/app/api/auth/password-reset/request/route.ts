import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { randomInt, createHash } from "crypto";
import { sendPasswordResetOtpEmail } from "@/lib/email";

export const runtime = "nodejs";

const OTP_TTL_MINUTES = 10;
const MAX_REQUESTS_PER_15_MIN = 3;
const MIN_SECONDS_BETWEEN_REQUESTS = 30;
const WINDOW_MINUTES = 15;

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function getOtpSecret() {
  const secret = process.env.OTP_SECRET || process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error("Missing OTP_SECRET (or NEXTAUTH_SECRET)");
  }
  return secret;
}

function hashOtp(args: { email: string; otp: string; secret: string }) {
  const { email, otp, secret } = args;
  return createHash("sha256").update(`${email}.${otp}.${secret}`).digest("hex");
}

function generateOtp() {
  return randomInt(0, 1000000).toString().padStart(6, "0");
}

export async function POST(req: NextRequest) {
  try {
    const isDev = process.env.NODE_ENV !== "production";
    const body = await req.json();
    const rawEmail = body?.email;

    if (!rawEmail || typeof rawEmail !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const email = normalizeEmail(rawEmail);
    const now = new Date();

    // Always return the same message to avoid user enumeration.
    const basePayload = {
      ok: true,
      message:
        "If an account exists, a code has been sent. If you don't receive it, check Spam/Promotions or try again in 15 minutes.",
    } as const;

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, isActive: true },
    });

    // If user doesn't exist or inactive, respond success but do nothing.
    if (!user || !user.isActive) {
      return NextResponse.json(basePayload);
    }

    const sinceWindow = new Date(now.getTime() - WINDOW_MINUTES * 60 * 1000);
    const recentCount = await prisma.passwordResetOtp.count({
      where: {
        userId: user.id,
        createdAt: { gte: sinceWindow },
      },
    });

    if (recentCount >= MAX_REQUESTS_PER_15_MIN) {
      if (process.env.NODE_ENV !== "production") {
        console.log(`[DEV] Password reset throttled for ${user.email}: max requests reached (15min count=${recentCount})`);
      }
      const last = await prisma.passwordResetOtp.findFirst({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        select: { createdAt: true },
      });
      const retryAt = last ? new Date(last.createdAt.getTime() + WINDOW_MINUTES * 60 * 1000) : null;
      return NextResponse.json({
        ...basePayload,
        ...(isDev
          ? {
              devThrottled: true,
              devRetryAt: retryAt?.toISOString() || null,
              devRecentCount: recentCount,
            }
          : {}),
      });
    }

    const last = await prisma.passwordResetOtp.findFirst({
      where: {
        userId: user.id,
        createdAt: { gte: sinceWindow },
      },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    });

    if (last) {
      const secondsSinceLast = (now.getTime() - last.createdAt.getTime()) / 1000;
      if (secondsSinceLast < MIN_SECONDS_BETWEEN_REQUESTS) {
        if (process.env.NODE_ENV !== "production") {
          console.log(`[DEV] Password reset throttled for ${user.email}: wait before requesting again`);
        }
        const retryAt = new Date(last.createdAt.getTime() + MIN_SECONDS_BETWEEN_REQUESTS * 1000);
        return NextResponse.json({
          ...basePayload,
          ...(isDev
            ? {
                devThrottled: true,
                devRetryAt: retryAt.toISOString(),
                devSecondsSinceLast: secondsSinceLast,
              }
            : {}),
        });
      }
    }

    const otp = generateOtp();
    if (process.env.NODE_ENV !== "production") {
      console.log(`[DEV] Password reset OTP for ${user.email}: ${otp} (expires in ${OTP_TTL_MINUTES} min)`);
    }
    const secret = getOtpSecret();
    const otpHash = hashOtp({ email: user.email, otp, secret });
    const expiresAt = new Date(now.getTime() + OTP_TTL_MINUTES * 60 * 1000);

    const otpRecord = await prisma.passwordResetOtp.create({
      data: {
        userId: user.id,
        email: user.email,
        otpHash,
        expiresAt,
        attempts: 0,
      },
    });

    try {
      await sendPasswordResetOtpEmail({ to: user.email, otp, ttlMinutes: OTP_TTL_MINUTES });
    } catch (e) {
      console.error("Password reset email send failed:", e);
      // Don't "burn" rate-limit quota if the provider fails.
      await prisma.passwordResetOtp.delete({ where: { id: otpRecord.id } });
      const devError =
        e instanceof Error ? e.message : "Email provider error";
      return NextResponse.json({
        ...basePayload,
        ...(isDev ? { devEmailError: devError } : {}),
      });
    }

    return NextResponse.json(basePayload);
  } catch (error) {
    console.error("POST Password Reset Request Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
