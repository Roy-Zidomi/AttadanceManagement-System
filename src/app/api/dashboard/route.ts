import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { Role, AttendanceStatus } from "@prisma/client";
import { startOfDay, endOfDay, subDays } from "date-fns";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const dateQuery = searchParams.get("date");
    const today = dateQuery ? new Date(dateQuery) : new Date();

    const startToday = startOfDay(today);
    const endToday = endOfDay(today);

    if (session.user.role === Role.ADMIN) {
      // Admin stats
      const totalEmployeesCount = await prisma.user.count({
        where: { role: Role.EMPLOYEE, isActive: true },
      });

      const todaySchedulesCount = await prisma.schedule.count({
        where: {
          date: { gte: startToday, lte: endToday },
          isActive: true,
        },
      });

      const todayAttendances = await prisma.attendance.findMany({
        where: { createdAt: { gte: startToday, lte: endToday } },
        select: { status: true, checkInTime: true, checkOutTime: true },
      });

      const onTime = todayAttendances.filter((a) => a.status === AttendanceStatus.on_time).length;
      const late = todayAttendances.filter((a) => a.status === AttendanceStatus.late).length;
      const earlyLeave = todayAttendances.filter((a) => a.status === AttendanceStatus.early_leave).length;
      const rejected = todayAttendances.filter((a) => a.status === AttendanceStatus.rejected_outside_area).length;

      // Unhandled/absent estimation:
      const totalCheckedIn = todayAttendances.length;
      const absentEstimate = Math.max(0, todaySchedulesCount - totalCheckedIn);

      // Recent attendance records
      const recentAttendance = await prisma.attendance.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { name: true, employeeId: true } },
          schedule: {
            include: { shift: { select: { name: true } }, location: { select: { name: true } } },
          },
        },
      });

      return NextResponse.json({
        totalEmployees: totalEmployeesCount,
        totalScheduled: todaySchedulesCount,
        totalCheckedIn,
        onTime,
        late,
        earlyLeave,
        rejected,
        absentEstimate,
        recentAttendance,
      });
    } else {
      // Employee stats
      const totalSchedules = await prisma.schedule.count({
        where: { userId: session.user.id },
      });

      const userAttendances = await prisma.attendance.findMany({
        where: { userId: session.user.id },
        select: { status: true },
      });

      const onTime = userAttendances.filter((a) => a.status === AttendanceStatus.on_time).length;
      const late = userAttendances.filter((a) => a.status === AttendanceStatus.late).length;

      // Status for today
      const todaySchedule = await prisma.schedule.findFirst({
        where: {
          userId: session.user.id,
          date: { gte: startToday, lte: endToday },
          isActive: true,
        },
        include: { shift: true, location: true },
      });

      let todayStatus = "No Schedule";
      if (todaySchedule) {
        const todayAtt = await prisma.attendance.findFirst({
          where: { scheduleId: todaySchedule.id },
        });
        if (todayAtt) {
          if (todayAtt.checkOutTime) {
            todayStatus = `Completed (${todayAtt.status})`;
          } else {
            todayStatus = `Checked In (${todayAtt.status})`;
          }
        } else {
          todayStatus = "Not Checked In";
        }
      }

      // Recent attendance logic
      const recentAttendance = await prisma.attendance.findMany({
        where: { userId: session.user.id },
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          schedule: {
            include: { shift: { select: { name: true } }, location: { select: { name: true } } },
          },
        },
      });

      return NextResponse.json({
        totalSchedules,
        totalAttendances: userAttendances.length,
        onTime,
        late,
        todayStatus,
        recentAttendance,
        nextShift: todaySchedule ? {
          name: todaySchedule.shift.name,
          time: `${todaySchedule.shift.startTime} - ${todaySchedule.shift.endTime}`,
          location: todaySchedule.location.name,
        } : null,
      });
    }
  } catch (error) {
    console.error("GET Dashboard Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
