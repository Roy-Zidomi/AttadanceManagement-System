import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { Role } from "@prisma/client";

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
    const { shiftId, locationId, isActive } = body;

    const dataToUpdate: any = {};
    if (shiftId) dataToUpdate.shiftId = shiftId;
    if (locationId) dataToUpdate.locationId = locationId;
    if (isActive !== undefined) dataToUpdate.isActive = isActive;

    const schedule = await prisma.schedule.update({
      where: { id: params.id },
      data: dataToUpdate,
      include: {
        user: { select: { name: true } },
        shift: { select: { name: true } },
        location: { select: { name: true } },
      },
    });

    return NextResponse.json(schedule);
  } catch (error) {
    console.error("PUT Schedule Error:", error);
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

    // Check if attendance exists for this schedule
    const attendanceCount = await prisma.attendance.count({
      where: { scheduleId: params.id },
    });

    if (attendanceCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete schedule because an attendance record already exists for it." },
        { status: 400 }
      );
    }

    await prisma.schedule.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Schedule deleted successfully" });
  } catch (error) {
    console.error("DELETE Schedule Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
