import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const excusedDays = await prisma.excusedDay.findMany({
    orderBy: { date: "desc" },
    include: { user: { select: { fullName: true } } },
    take: 200,
  });

  return NextResponse.json({ excusedDays });
}

const schema = z.object({
  date: z.string(), // YYYY-MM-DD
  userId: z.string().nullable(), // null = applies to everyone (public holiday)
  reason: z.string().min(2),
});

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const excusedDay = await prisma.excusedDay.create({
    data: {
      date: new Date(parsed.data.date),
      userId: parsed.data.userId,
      reason: parsed.data.reason,
    },
  });

  return NextResponse.json({ ok: true, excusedDay });
}
