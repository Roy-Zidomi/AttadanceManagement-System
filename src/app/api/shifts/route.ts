import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { Role } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const activeOnly = searchParams.get("activeOnly") === "true";

    const whereClause = activeOnly ? { isActive: true } : {};

    const shifts = await prisma.shift.findMany({
      where: whereClause,
      orderBy: { startTime: "asc" },
    });

    return NextResponse.json(shifts);
  } catch (error) {
    console.error("GET Shifts Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== Role.ADMIN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { name, startTime, endTime, lateThreshold, earlyLeaveThreshold } = body;

    if (!name || !startTime || !endTime) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const shift = await prisma.shift.create({
      data: {
        name,
        startTime,
        endTime,
        lateThreshold: lateThreshold ? parseInt(lateThreshold) : 15,
        earlyLeaveThreshold: earlyLeaveThreshold ? parseInt(earlyLeaveThreshold) : 15,
      },
    });

    return NextResponse.json(shift, { status: 201 });
  } catch (error) {
    console.error("POST Shifts Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
