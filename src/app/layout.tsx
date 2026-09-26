import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MTN Tarkwa Attendance",
  description: "Staff attendance system for MTN Ghana, Tarkwa branch",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
