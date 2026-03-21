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
      whereClause.createdAt = dateFilter; // Check-in records typically created that day
    }

    // Role-based filtering: Employee can only see their own attendance
    if (session.user.role === Role.EMPLOYEE) {
      whereClause.userId = session.user.id;
    } else if (userId) {
      whereClause.userId = userId;
    }

    const attendances = await prisma.attendance.findMany({
      where: whereClause,
      include: {
        user: { select: { id: true, name: true, employeeId: true, department: true } },
        schedule: { 
          include: { 
            shift: { select: { name: true, startTime: true, endTime: true } },
            location: { select: { name: true } }
          }
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(attendances);
  } catch (error) {
    console.error("GET Attendance Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
