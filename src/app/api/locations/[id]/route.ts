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

    const location = await prisma.workLocation.findUnique({
      where: { id: params.id },
    });

    if (!location) {
      return NextResponse.json({ error: "Location not found" }, { status: 404 });
    }

    return NextResponse.json(location);
  } catch (error) {
    console.error("GET Location Error:", error);
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
    const { name, address, latitude, longitude, radiusMeters, isActive } = body;

    const location = await prisma.workLocation.update({
      where: { id: params.id },
      data: {
        name,
        address,
        latitude: latitude !== undefined ? parseFloat(latitude) : undefined,
        longitude: longitude !== undefined ? parseFloat(longitude) : undefined,
        radiusMeters: radiusMeters !== undefined ? parseInt(radiusMeters) : undefined,
        isActive,
      },
    });

    return NextResponse.json(location);
  } catch (error) {
    console.error("PUT Location Error:", error);
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

    // Check if location is used in schedules
    const schedulesCount = await prisma.schedule.count({
      where: { locationId: params.id },
    });

    if (schedulesCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete location because it is used in existing schedules. You can deactivate it instead." },
        { status: 400 }
      );
    }

    await prisma.workLocation.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Location deleted successfully" });
  } catch (error) {
    console.error("DELETE Location Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
