import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createSessionToken, setSessionCookie, verifyPassword } from "@/lib/auth";

const schema = z.union([
  z.object({ mode: z.literal("STAFF"), staffId: z.string().regex(/^\d{5}$/), password: z.string() }),
  z.object({ mode: z.literal("INTERN"), userId: z.string(), password: z.string() }),
]);

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  const data = parsed.data;

  const user =
    data.mode === "STAFF"
      ? await prisma.user.findUnique({ where: { staffId: data.staffId } })
      : await prisma.user.findUnique({ where: { id: data.userId } });

  if (!user) {
    return NextResponse.json({ error: "Not found. Please register first." }, { status: 404 });
  }

  const validPassword = await verifyPassword(data.password, user.passwordHash);
  if (!validPassword) {
    return NextResponse.json({ error: "Incorrect password or PIN." }, { status: 401 });
  }

  if (user.status === "PENDING") {
    return NextResponse.json({ error: "Your account is waiting for admin approval." }, { status: 403 });
  }
  if (user.status === "DEACTIVATED") {
    return NextResponse.json({ error: "This account has been deactivated." }, { status: 403 });
  }

  const token = createSessionToken({ userId: user.id, role: user.role });
  setSessionCookie(token);

  return NextResponse.json({
    ok: true,
    user: { id: user.id, fullName: user.fullName, role: user.role },
  });
}
