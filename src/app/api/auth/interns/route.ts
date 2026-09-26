import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const interns = await prisma.user.findMany({
    where: { personType: "INTERN", status: "APPROVED" },
    select: { id: true, fullName: true },
    orderBy: { fullName: "asc" },
  });
  return NextResponse.json({ interns });
}
