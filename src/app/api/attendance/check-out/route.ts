import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { AttendanceStatus } from "@prisma/client";
import { calculateDistance } from "@/lib/geolocation";
import { startOfDay, endOfDay, parse } from "date-fns";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { latitude, longitude } = body;

    if (latitude === undefined || longitude === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const now = new Date();

    // 1. Find today's schedule for this user
    const schedule = await prisma.schedule.findFirst({
      where: {
        userId: session.user.id,
        date: {
          gte: startOfDay(now),
          lte: endOfDay(now),
        },
        isActive: true,
      },
      include: {
        shift: true,
        location: true,
      },
    });

    if (!schedule) {
      return NextResponse.json(
        { error: "No active schedule found for you today" },
        { status: 404 }
      );
    }

    // 2. Check if checked in, but not yet checked out
    const attendance = await prisma.attendance.findFirst({
      where: { scheduleId: schedule.id },
    });

    if (!attendance || !attendance.checkInTime) {
      return NextResponse.json(
        { error: "You must check in first" },
        { status: 400 }
      );
    }

    if (attendance.checkOutTime) {
      return NextResponse.json(
        { error: "You have already checked out today" },
        { status: 400 }
      );
    }

    // 3. Geolocation Validation
    const locLongitude = schedule.location.longitude;
    const actualDistance = calculateDistance(latitude, longitude, schedule.location.latitude, locLongitude);

    if (actualDistance > schedule.location.radiusMeters) {
      return NextResponse.json(
        { error: "Check-out rejected: You are outside the allowed office area", distance: actualDistance, allowedRadius: schedule.location.radiusMeters },
        { status: 403 }
      );
    }

    // 4. Time Validation (Check for early leave)
    let status = attendance.status; // Persist "late" or "on_time" from check-in

    // If already rejected for some reason don't upgrade status
    if (status !== AttendanceStatus.rejected_outside_area) {
      const shiftEndTimeStr = schedule.shift.endTime; // e.g., "17:00"
      const shiftEndDate = parse(shiftEndTimeStr, "HH:mm", startOfDay(now));
      
      const earlyThresholdMillis = schedule.shift.earlyLeaveThreshold * 60 * 1000;
      const earliestOnTimeOut = new Date(shiftEndDate.getTime() - earlyThresholdMillis);

      if (now < earliestOnTimeOut) {
        status = AttendanceStatus.early_leave;
      }
    }

    const updatedAttendance = await prisma.attendance.update({
      where: { id: attendance.id },
      data: {
        checkOutTime: now,
        checkOutLat: latitude,
        checkOutLng: longitude,
        checkOutDistance: actualDistance,
        status,
      },
    });

    return NextResponse.json(updatedAttendance, { status: 200 });
  } catch (error) {
    console.error("POST Check-out Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
