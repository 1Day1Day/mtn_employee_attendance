import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET as string;

function todayKey(date = new Date()) {
  // Uses the server's local date. Deploy with TZ set appropriately (Africa/Accra).
  return date.toISOString().slice(0, 10); // YYYY-MM-DD
}

// The QR code encodes a link containing a token that is only valid for
// today's date. A photo of yesterday's code will fail this check.
export function generateDailyQrToken() {
  return jwt.sign({ day: todayKey() }, SECRET, { expiresIn: "18h" });
}

export function verifyDailyQrToken(token: string): boolean {
  try {
    const payload = jwt.verify(token, SECRET) as { day: string };
    return payload.day === todayKey();
  } catch {
    return false;
  }
}
