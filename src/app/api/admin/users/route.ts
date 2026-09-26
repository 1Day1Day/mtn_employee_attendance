import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const users = await prisma.user.findMany({
    orderBy: [{ status: "asc" }, { fullName: "asc" }],
    select: {
      id: true,
      fullName: true,
      staffId: true,
      personType: true,
      department: true,
      role: true,
      status: true,
      phone: true,
      email: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ users });
}
