import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createHash } from "crypto";
import bcrypt from "bcryptjs";

export const runtime = "nodejs";

const MAX_ATTEMPTS = 5;

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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawEmail = body?.email;
    const rawOtp = body?.otp;
    const rawNewPassword = body?.newPassword;

    if (!rawEmail || typeof rawEmail !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }
    if (!rawOtp || typeof rawOtp !== "string") {
      return NextResponse.json({ error: "OTP is required" }, { status: 400 });
    }
    if (!rawNewPassword || typeof rawNewPassword !== "string") {
      return NextResponse.json({ error: "New password is required" }, { status: 400 });
    }

    const email = normalizeEmail(rawEmail);
    const otp = rawOtp.trim();
    const newPassword = rawNewPassword;

    if (!/^\d{6}$/.test(otp)) {
      return NextResponse.json({ error: "Invalid code or expired" }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, isActive: true },
    });
    if (!user || !user.isActive) {
      return NextResponse.json({ error: "Invalid code or expired" }, { status: 400 });
    }

    const now = new Date();
    const latestOtp = await prisma.passwordResetOtp.findFirst({
      where: {
        userId: user.id,
        consumedAt: null,
      },
      orderBy: { createdAt: "desc" },
    });

    if (!latestOtp) {
      return NextResponse.json({ error: "Invalid code or expired" }, { status: 400 });
    }

    // Expired?
    if (latestOtp.expiresAt.getTime() < now.getTime()) {
      return NextResponse.json({ error: "Invalid code or expired" }, { status: 400 });
    }

    if (latestOtp.attempts >= MAX_ATTEMPTS) {
      return NextResponse.json({ error: "Too many attempts. Request a new code." }, { status: 429 });
    }

    const secret = getOtpSecret();
    const expectedHash = hashOtp({ email: user.email, otp, secret });

    if (expectedHash !== latestOtp.otpHash) {
      await prisma.passwordResetOtp.update({
        where: { id: latestOtp.id },
        data: { attempts: { increment: 1 } },
      });
      return NextResponse.json({ error: "Invalid code or expired" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      }),
      prisma.passwordResetOtp.update({
        where: { id: latestOtp.id },
        data: { consumedAt: now },
      }),
    ]);

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error("POST Password Reset Confirm Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
