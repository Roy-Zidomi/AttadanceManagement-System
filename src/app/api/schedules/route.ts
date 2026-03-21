import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { Role } from "@prisma/client";
import { startOfDay, endOfDay } from "date-fns";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const dateQuery = searchParams.get("date");
    const startDateQuery = searchParams.get("startDate");
    const endDateQuery = searchParams.get("endDate");

    let dateFilter: any = {};

    if (dateQuery) {
      const date = new Date(dateQuery);
      dateFilter = {
        gte: startOfDay(date),
        lte: endOfDay(date),
      };
    } else if (startDateQuery && endDateQuery) {
      dateFilter = {
        gte: startOfDay(new Date(startDateQuery)),
        lte: endOfDay(new Date(endDateQuery)),
      };
    }

    const whereClause: any = {};

    if (Object.keys(dateFilter).length > 0) {
      whereClause.date = dateFilter;
    }

    // Role-based filtering: Employee can only see their own schedules
    if (session.user.role === Role.EMPLOYEE) {
      whereClause.userId = session.user.id;
    } else if (userId) {
      whereClause.userId = userId;
    }

    const schedules = await prisma.schedule.findMany({
      where: whereClause,
      include: {
        user: { select: { id: true, name: true, employeeId: true } },
        shift: true,
        location: true,
      },
      orderBy: { date: "asc" },
    });

    return NextResponse.json(schedules);
  } catch (error) {
    console.error("GET Schedules Error:", error);
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
    const { userId, shiftId, locationId, date } = body;

    if (!userId || !shiftId || !locationId || !date) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const scheduleDate = new Date(date);
    scheduleDate.setHours(0, 0, 0, 0); // Normalize to midnight

    // Check if user already has a schedule for this exact date
    const existingSchedule = await prisma.schedule.findFirst({
      where: {
        userId,
        date: {
          gte: startOfDay(scheduleDate),
          lte: endOfDay(scheduleDate),
        },
      },
    });

    if (existingSchedule) {
      return NextResponse.json(
        { error: "User already has a schedule on this date" },
        { status: 409 }
      );
    }

    const schedule = await prisma.schedule.create({
      data: {
        userId,
        shiftId,
        locationId,
        date: scheduleDate,
      },
      include: {
        user: { select: { name: true } },
        shift: { select: { name: true } },
        location: { select: { name: true } },
      },
    });

    return NextResponse.json(schedule, { status: 201 });
  } catch (error) {
    console.error("POST Schedules Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
