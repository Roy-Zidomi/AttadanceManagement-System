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
    const { latitude, longitude, photoUrl } = body;

    if (latitude === undefined || longitude === undefined || !photoUrl) {
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

    // 2. Check if already checked in
    const existingAttendance = await prisma.attendance.findFirst({
      where: { scheduleId: schedule.id },
    });

    if (existingAttendance && existingAttendance.checkInTime) {
      return NextResponse.json(
        { error: "You have already checked in today" },
        { status: 400 }
      );
    }

    // 3. Geolocation Validation
    const actualDistance = calculateDistance(
      latitude,
      longitude,
      schedule.location.latitude,
      schedule.location.longitude
    );

    if (actualDistance > schedule.location.radiusMeters) {
      // Create a rejected attendance record explicitly to track attempts? 
      // Or just return error. The requirements say: "If outside allowed radius, attendance must be rejected"
      // and "status: rejected_outside_area"
      
      const rejectedAtt = await prisma.attendance.create({
        data: {
          userId: session.user.id,
          scheduleId: schedule.id,
          checkInTime: now,
          checkInLat: latitude,
          checkInLng: longitude,
          checkInDistance: actualDistance,
          photoUrl,
          status: AttendanceStatus.rejected_outside_area,
        },
      });

      return NextResponse.json({
        error: "Check-in rejected: You are outside the allowed office area",
        distance: actualDistance,
        allowedRadius: schedule.location.radiusMeters,
        attendance: rejectedAtt
      }, { status: 403 });
    }

    // 4. Time Validation
    const shiftStartTimeStr = schedule.shift.startTime; // e.g., "08:00"
    const shiftStartDate = parse(shiftStartTimeStr, "HH:mm", startOfDay(now));
    
    // Add late threshold in minutes
    const thresholdMillis = schedule.shift.lateThreshold * 60 * 1000;
    const latestOnTime = new Date(shiftStartDate.getTime() + thresholdMillis);

    let status = AttendanceStatus.on_time;
    if (now > latestOnTime) {
      status = AttendanceStatus.late;
    }

    const attendance = await prisma.attendance.create({
      data: {
        userId: session.user.id,
        scheduleId: schedule.id,
        checkInTime: now,
        checkInLat: latitude,
        checkInLng: longitude,
        checkInDistance: actualDistance,
        photoUrl,
        status,
      },
    });

    return NextResponse.json(attendance, { status: 201 });
  } catch (error) {
    console.error("POST Check-in Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
