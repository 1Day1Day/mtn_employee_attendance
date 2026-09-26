"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

const links = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/location", label: "Location" },
  { href: "/admin/excused-days", label: "Excused Days" },
  { href: "/admin/audit", label: "Audit" },
  { href: "/admin/qr", label: "Today's QR" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data?.user || data.user.role !== "ADMIN") {
          router.push("/login");
        } else {
          setReady(true);
        }
      });
  }, [router]);

  if (!ready) {
    return <div className="min-h-screen flex items-center justify-center text-mtn-grey">Loading…</div>;
  }

  return (
    <div className="min-h-screen bg-mtn-grey-light">
      <Navbar
        title="MTN Tarkwa Admin"
        links={links}
        rightSlot={
          <button
            onClick={async () => {
              await fetch("/api/auth/logout", { method: "POST" });
              router.push("/login");
            }}
            className="text-sm font-medium text-white/90 hover:text-mtn-yellow"
          >
            Sign out
          </button>
        }
      />
      <main className="max-w-5xl mx-auto px-4 py-6 md:px-6">{children}</main>
    </div>
  );
}
