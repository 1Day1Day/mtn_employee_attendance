import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";

const staffSchema = z.object({
  personType: z.literal("STAFF"),
  fullName: z.string().min(2),
  staffId: z.string().regex(/^\d{5}$/, "Staff ID must be exactly 5 digits"),
  password: z.string().min(4),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  department: z.string().optional(),
});

const internSchema = z.object({
  personType: z.literal("INTERN"),
  fullName: z.string().min(2),
  password: z.string().min(4), // used as their PIN
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  department: z.string().optional(),
});

const bodySchema = z.union([staffSchema, internSchema]);

export async function POST(req: Request) {
  const json = await req.json();
  const parsed = bodySchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const data = parsed.data;

  if (data.personType === "STAFF") {
    const existing = await prisma.user.findUnique({ where: { staffId: data.staffId } });
    if (existing) {
      return NextResponse.json({ error: "That staff ID is already registered." }, { status: 409 });
    }
  }

  const passwordHash = await hashPassword(data.password);

  const user = await prisma.user.create({
    data: {
      fullName: data.fullName,
      staffId: data.personType === "STAFF" ? data.staffId : null,
      personType: data.personType,
      passwordHash,
      phone: data.phone || null,
      email: data.email || null,
      department: data.department || null,
      status: "PENDING",
      role: "STAFF",
    },
  });

  return NextResponse.json({
    ok: true,
    message: "Registered. An admin needs to approve your account before you can clock in.",
    userId: user.id,
  });
}
