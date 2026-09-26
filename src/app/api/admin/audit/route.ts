import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

// Returns every Monday-Friday date in the given month, up to today if the
// month is the current one (no point flagging future days as "missed").
function weekdaysInMonth(year: number, monthIndex0: number): Date[] {
  const days: Date[] = [];
  const now = new Date();
  const isCurrentMonth = now.getFullYear() === year && now.getMonth() === monthIndex0;
  const lastDay = new Date(year, monthIndex0 + 1, 0).getDate();
  const cutoff = isCurrentMonth ? now.getDate() : lastDay;

  for (let d = 1; d <= cutoff; d++) {
    const date = new Date(year, monthIndex0, d);
    const day = date.getDay(); // 0 = Sun, 6 = Sat
    if (day !== 0 && day !== 6) days.push(date);
  }
  return days;
}

function dateKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

export async function GET(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month"); // "YYYY-MM"
  if (!month) return NextResponse.json({ error: "month is required, e.g. 2026-09" }, { status: 400 });

  const [yearStr, monthStr] = month.split("-");
  const year = Number(yearStr);
  const monthIndex0 = Number(monthStr) - 1;

  const settings = await prisma.settings.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton" },
  });

  const monthStart = new Date(year, monthIndex0, 1);
  const monthEnd = new Date(year, monthIndex0 + 1, 1);

  const [users, records, excusedDays] = await Promise.all([
    prisma.user.findMany({ where: { status: "APPROVED" } }),
    prisma.clockRecord.findMany({
      where: { timestamp: { gte: monthStart, lt: monthEnd }, type: "IN" },
      select: { userId: true, timestamp: true },
    }),
    prisma.excusedDay.findMany({
      where: { date: { gte: monthStart, lt: monthEnd } },
    }),
  ]);

  const workingDays = weekdaysInMonth(year, monthIndex0);

  // Which days are globally excused (public holidays, userId = null)
  const globalExcused = new Set(
    excusedDays.filter((e) => !e.userId).map((e) => dateKey(e.date))
  );

  // Per-user excused days (approved leave, sick)
  const perUserExcused = new Map<string, Set<string>>();
  for (const e of excusedDays) {
    if (!e.userId) continue;
    if (!perUserExcused.has(e.userId)) perUserExcused.set(e.userId, new Set());
    perUserExcused.get(e.userId)!.add(dateKey(e.date));
  }

  // Which days each user clocked in on
  const clockedDaysByUser = new Map<string, Set<string>>();
  for (const r of records) {
    const key = dateKey(r.timestamp);
    if (!clockedDaysByUser.has(r.userId)) clockedDaysByUser.set(r.userId, new Set());
    clockedDaysByUser.get(r.userId)!.add(key);
  }

  const results = users.map((user) => {
    const clocked = clockedDaysByUser.get(user.id) ?? new Set<string>();
    const excused = perUserExcused.get(user.id) ?? new Set<string>();

    const missedDates = workingDays
      .map(dateKey)
      .filter((key) => !clocked.has(key) && !globalExcused.has(key) && !excused.has(key));

    return {
      userId: user.id,
      fullName: user.fullName,
      staffId: user.staffId,
      department: user.department,
      missedCount: missedDates.length,
      missedDates,
    };
  });

  const flagged = results
    .filter((r) => r.missedCount >= settings.absenceThreshold)
    .sort((a, b) => b.missedCount - a.missedCount);

  return NextResponse.json({ month, threshold: settings.absenceThreshold, flagged });
}
