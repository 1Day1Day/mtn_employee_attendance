import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [approvedCount, pendingCount, clockedInTodayRecords] = await Promise.all([
    prisma.user.count({ where: { status: "APPROVED" } }),
    prisma.user.count({ where: { status: "PENDING" } }),
    prisma.clockRecord.findMany({
      where: { type: "IN", timestamp: { gte: startOfDay } },
      select: { userId: true },
      distinct: ["userId"],
    }),
  ]);

  return NextResponse.json({
    approvedCount,
    pendingCount,
    clockedInToday: clockedInTodayRecords.length,
  });
}