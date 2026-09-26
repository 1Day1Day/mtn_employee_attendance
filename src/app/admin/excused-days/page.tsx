"use client";

import { useEffect, useState } from "react";

type User = { id: string; fullName: string };
type ExcusedDay = {
  id: string;
  date: string;
  reason: string;
  userId: string | null;
  user: { fullName: string } | null;
};

export default function ExcusedDaysPage() {
  const [days, setDays] = useState<ExcusedDay[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [date, setDate] = useState("");
  const [scope, setScope] = useState<"EVERYONE" | "ONE_PERSON">("EVERYONE");
  const [userId, setUserId] = useState("");
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    const [d, u] = await Promise.all([
      fetch("/api/admin/excused-days").then((r) => r.json()),
      fetch("/api/admin/users").then((r) => r.json()),
    ]);
    setDays(d.excusedDays ?? []);
    setUsers((u.users ?? []).filter((x: any) => x.status === "APPROVED"));
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/admin/excused-days", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date,
        userId: scope === "EVERYONE" ? null : userId,
        reason,
      }),
    });
    setSaving(false);
    setDate("");
    setReason("");
    setUserId("");
    load();
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div>
        <h1 className="text-xl font-bold mb-5">Add an excused day</h1>
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-card p-5 flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium">Date</label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2"
            />
          </div>

          <div className="flex rounded-lg bg-mtn-grey-light p-1">
            <button
              type="button"
              onClick={() => setScope("EVERYONE")}
              className={`flex-1 py-2 text-sm rounded-md ${scope === "EVERYONE" ? "bg-mtn-yellow" : ""}`}
            >
              Everyone (holiday)
            </button>
            <button
              type="button"
              onClick={() => setScope("ONE_PERSON")}
              className={`flex-1 py-2 text-sm rounded-md ${scope === "ONE_PERSON" ? "bg-mtn-yellow" : ""}`}
            >
              One person (leave)
            </button>
          </div>

          {scope === "ONE_PERSON" && (
            <div>
              <label className="text-sm font-medium">Person</label>
              <select
                required
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2"
              >
                <option value="">Select…</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.fullName}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="text-sm font-medium">Reason</label>
            <input
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={scope === "EVERYONE" ? "e.g. Public holiday" : "e.g. Approved leave"}
              className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2"
            />
          </div>

          <button
            disabled={saving}
            className="bg-mtn-black text-white font-medium rounded-lg py-2.5 disabled:opacity-60"
          >
            {saving ? "Saving…" : "Add excused day"}
          </button>
        </form>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-5">Recent entries</h2>
        <div className="bg-white rounded-xl shadow-card divide-y divide-black/5">
          {days.length === 0 && <p className="p-5 text-mtn-grey text-sm">No excused days yet.</p>}
          {days.map((d) => (
            <div key={d.id} className="p-4 flex justify-between items-center">
              <div>
                <div className="font-medium text-sm">{new Date(d.date).toLocaleDateString()}</div>
                <div className="text-xs text-mtn-grey">{d.reason}</div>
              </div>
              <div className="text-xs font-medium">{d.user ? d.user.fullName : "Everyone"}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
