import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { requireAdmin } from "@/lib/auth";
import { generateDailyQrToken } from "@/lib/qrToken";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const token = generateDailyQrToken();
}