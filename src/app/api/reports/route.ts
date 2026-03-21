import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const month = searchParams.get("month"); // e.g., "2024-03"
    const employeeId = searchParams.get("employeeId"); // user UUID or ""

    if (!month) {
      return NextResponse.json({ error: "Month parameter is required." }, { status: 400 });
    }

    const [yearStr, monthStr] = month.split("-");
    const yearNum = parseInt(yearStr);
    const monthNum = parseInt(monthStr) - 1; // 0-indexed in JS dates

    const startDate = new Date(yearNum, monthNum, 1);
    const endDate = new Date(yearNum, monthNum + 1, 0, 23, 59, 59, 999);

    const whereClause: any = {
      // Use the schedule date for attendance rather than strictly createdAt
      schedule: {
        date: {
          gte: startDate,
          lte: endDate,
        }
      }
    };

    if (employeeId && employeeId !== "all") {
      whereClause.userId = employeeId;
    }

    const attendances = await prisma.attendance.findMany({
      where: whereClause,
      include: {
        user: { select: { name: true, employeeId: true, department: true } },
        schedule: {
          include: {
            shift: { select: { name: true, startTime: true, endTime: true } },
            location: { select: { name: true } }
          }
        }
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(attendances);
  } catch (error: any) {
    console.error("Reports API Error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
