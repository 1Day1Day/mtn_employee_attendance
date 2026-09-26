import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { requireAdmin } from "@/lib/auth";
import { generateDailyQrToken } from "@/lib/qrToken";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const token = generateDailyQrToken();
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/clock?token=${token}`;
  const dataUrl = await QRCode.toDataURL(url, { width: 400, margin: 2 });

  return NextResponse.json({ dataUrl, url });
}
