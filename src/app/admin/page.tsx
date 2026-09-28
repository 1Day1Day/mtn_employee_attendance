"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Stats = { approvedCount: number; pendingCount: number; clockedInToday: number };

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then(setStats);
  }, []);

  const cards = [
    { title: "Users", desc: "Approve staff and interns, promote to admin, reset passwords.", href: "/admin/users" },
    { title: "Location", desc: "Set the branch coordinates and the clock-in radius.", href: "/admin/location" },
    { title: "Excused Days", desc: "Mark public holidays and approved leave.", href: "/admin/excused-days" },
    { title: "Audit", desc: "See who has missed 5 or more working days this month.", href: "/admin/audit" },
    { title: "Today's QR", desc: "Display today's clock-in QR code at the branch.", href: "/admin/qr" },
  ];

  const cardStyle = "bg-white rounded-xl shadow-card p-5 hover:ring-2 hover:ring-mtn-yellow transition-all";

  return (
    <div>
      <h1 className="text-xl font-bold mb-5">Overview</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard label="Clocked in today" value={stats?.clockedInToday} accent="text-status-success" />
        <StatCard label="Approved staff" value={stats?.approvedCount} accent="text-mtn-black" />
        <StatCard label="Pending approval" value={stats?.pendingCount} accent="text-status-pending" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {cards.map((c) => (
          <Link key={c.href} href={c.href} className={cardStyle}>
            <div className="font-semibold mb-1">{c.title}</div>
            <div className="text-sm text-mtn-grey">{c.desc}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value?: number; accent: string }) {
  return (
    <div className="bg-white rounded-xl shadow-card p-5">
      <div className={`text-3xl font-bold ${accent}`}>{value ?? "—"}</div>
      <div className="text-sm text-mtn-grey mt-1">{label}</div>
    </div>
  );
}