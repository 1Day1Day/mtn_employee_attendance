import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin, hashPassword } from "@/lib/auth";

const schema = z.union([
  z.object({ action: z.literal("SET_STATUS"), status: z.enum(["APPROVED", "PENDING", "DEACTIVATED"]) }),
  z.object({ action: z.literal("SET_ROLE"), role: z.enum(["STAFF", "ADMIN"]) }),
  z.object({ action: z.literal("RESET_PASSWORD"), newPassword: z.string().min(4) }),
]);

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const data = parsed.data;
  const targetId = params.id;

  if (data.action === "SET_STATUS") {
    await prisma.user.update({ where: { id: targetId }, data: { status: data.status } });
  } else if (data.action === "SET_ROLE") {
    // Prevent an admin from demoting themselves and locking everyone out.
    if (targetId === admin.id && data.role !== "ADMIN") {
      return NextResponse.json({ error: "You can't remove your own admin access." }, { status: 400 });
    }
    await prisma.user.update({ where: { id: targetId }, data: { role: data.role } });
  } else if (data.action === "RESET_PASSWORD") {
    const passwordHash = await hashPassword(data.newPassword);
    await prisma.user.update({ where: { id: targetId }, data: { passwordHash } });
  }

  return NextResponse.json({ ok: true });
}
