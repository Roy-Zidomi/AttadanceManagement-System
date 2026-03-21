import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { Role } from "@prisma/client";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const shift = await prisma.shift.findUnique({
      where: { id: params.id },
    });

    if (!shift) {
      return NextResponse.json({ error: "Shift not found" }, { status: 404 });
    }

    return NextResponse.json(shift);
  } catch (error) {
    console.error("GET Shift Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== Role.ADMIN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { name, startTime, endTime, lateThreshold, earlyLeaveThreshold, isActive } = body;

    const shift = await prisma.shift.update({
      where: { id: params.id },
      data: {
        name,
        startTime,
        endTime,
        lateThreshold: lateThreshold ? parseInt(lateThreshold) : undefined,
        earlyLeaveThreshold: earlyLeaveThreshold ? parseInt(earlyLeaveThreshold) : undefined,
        isActive,
      },
    });

    return NextResponse.json(shift);
  } catch (error) {
    console.error("PUT Shift Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== Role.ADMIN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Check if shift is used in schedules
    const schedulesCount = await prisma.schedule.count({
      where: { shiftId: params.id },
    });

    if (schedulesCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete shift because it is used in existing schedules. You can deactivate it instead." },
        { status: 400 }
      );
    }

    await prisma.shift.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Shift deleted successfully" });
  } catch (error) {
    console.error("DELETE Shift Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
