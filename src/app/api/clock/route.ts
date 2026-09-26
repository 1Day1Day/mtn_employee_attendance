import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, requireAdmin, verifyPassword } from "@/lib/auth";
import { verifyDailyQrToken } from "@/lib/qrToken";
import { distanceInMeters } from "@/lib/geo";

const phoneSchema = z.object({
  method: z.literal("PHONE_QR"),
  token: z.string(),
  lat: z.number(),
  lon: z.number(),
});

const stationSchema = z.union([
  z.object({ method: z.literal("STATION"), staffId: z.string().regex(/^\d{5}$/), password: z.string() }),
  z.object({ method: z.literal("STATION"), userId: z.string(), password: z.string() }),
]);

const adminManualSchema = z.object({
  method: z.literal("ADMIN_MANUAL"),
  userId: z.string(),
  type: z.enum(["IN", "OUT"]),
  note: z.string().min(3),
});

const bodySchema = z.union([phoneSchema, stationSchema, adminManualSchema]);

// Whichever action (IN/OUT) is opposite of the person's most recent record today.
async function nextActionFor(userId: string): Promise<"IN" | "OUT"> {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const last = await prisma.clockRecord.findFirst({
    where: { userId, timestamp: { gte: startOfDay } },
    orderBy: { timestamp: "desc" },
  });

  return !last || last.type === "OUT" ? "IN" : "OUT";
}

export async function POST(req: Request) {
  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const data = parsed.data;

  if (data.method === "PHONE_QR") {
    if (!verifyDailyQrToken(data.token)) {
      return NextResponse.json({ error: "This QR code has expired. Please rescan today's code." }, { status: 400 });
    }

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
    }

    const settings = await prisma.settings.findUnique({ where: { id: "singleton" } });
    if (!settings) {
      return NextResponse.json({ error: "Branch location isn't set up yet. Contact an admin." }, { status: 500 });
    }

    const distance = distanceInMeters(settings.branchLatitude, settings.branchLongitude, data.lat, data.lon);
    const withinRange = distance <= settings.radiusMeters;

    if (!withinRange) {
      return NextResponse.json(
        { ok: false, message: `You're too far from the branch (about ${distance}m away). Move closer and try again.` },
        { status: 200 }
      );
    }

    const type = await nextActionFor(user.id);
    await prisma.clockRecord.create({
      data: { userId: user.id, type, method: "PHONE_QR", withinRange, distanceMeters: distance },
    });

    return NextResponse.json({ ok: true, message: `Clocked ${type === "IN" ? "in" : "out"} successfully.` });
  }

  if (data.method === "STATION") {
    // Only the registered branch station (which sends this header) may use
    // this mode, so the page can't be used the same way from someone's home.
    const deviceSecret = req.headers.get("x-station-secret");
    if (deviceSecret !== process.env.STATION_DEVICE_SECRET) {
      return NextResponse.json({ error: "This device isn't registered as the branch station." }, { status: 403 });
    }

    const user =
      "staffId" in data
        ? await prisma.user.findUnique({ where: { staffId: data.staffId } })
        : await prisma.user.findUnique({ where: { id: data.userId } });
    if (!user) return NextResponse.json({ ok: false, message: "User not found." });
    if (user.status !== "APPROVED") {
      return NextResponse.json({ ok: false, message: "Your account isn't approved yet." });
    }
    const valid = await verifyPassword(data.password, user.passwordHash);
    if (!valid) return NextResponse.json({ ok: false, message: "Incorrect password or PIN." });

    const type = await nextActionFor(user.id);
    await prisma.clockRecord.create({
      data: { userId: user.id, type, method: "STATION" },
    });

    return NextResponse.json({ ok: true, message: `${user.fullName}, clocked ${type === "IN" ? "in" : "out"} at ${new Date().toLocaleTimeString()}.` });
  }

  // ADMIN_MANUAL
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await prisma.clockRecord.create({
    data: {
      userId: data.userId,
      type: data.type,
      method: "ADMIN_MANUAL",
      note: data.note,
      enteredById: admin.id,
    },
  });

  return NextResponse.json({ ok: true, message: "Manual entry recorded." });
}
