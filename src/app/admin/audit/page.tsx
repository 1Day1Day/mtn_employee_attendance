"use client";

import { useEffect, useState } from "react";

type Flagged = {
  userId: string;
  fullName: string;
  staffId: string | null;
  department: string | null;
  missedCount: number;
  missedDates: string[];
};

function currentMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default function AuditPage() {
  const [month, setMonth] = useState(currentMonth());
  const [threshold, setThreshold] = useState<number | null>(null);
  const [flagged, setFlagged] = useState<Flagged[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/audit?month=${month}`)
      .then((r) => r.json())
      .then((d) => {
        setThreshold(d.threshold);
        setFlagged(d.flagged ?? []);
        setLoading(false);
      });
  }, [month]);

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold">Audit</h1>
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="rounded-lg border border-black/10 px-3 py-1.5 text-sm"
        />
      </div>

      {threshold !== null && (
        <p className="text-sm text-mtn-grey mb-4">
          Showing staff with {threshold} or more missed weekdays (excused days are not counted).
        </p>
      )}

      {loading ? (
        <p className="text-mtn-grey">Loading…</p>
      ) : flagged.length === 0 ? (
        <p className="text-mtn-grey">No one is over the threshold this month.</p>
      ) : (
        <div className="bg-white rounded-xl shadow-card divide-y divide-black/5">
          {flagged.map((f) => (
            <div key={f.userId} className="p-4">
              <button
                onClick={() => setExpanded(expanded === f.userId ? null : f.userId)}
                className="w-full flex items-center justify-between"
              >
                <div className="text-left">
                  <div className="font-medium">{f.fullName}</div>
                  <div className="text-xs text-mtn-grey">
                    {f.staffId ?? "Intern/NSP"} {f.department ? `· ${f.department}` : ""}
                  </div>
                </div>
                <div className="bg-status-error/10 text-status-error font-semibold text-sm px-3 py-1 rounded-full">
                  {f.missedCount} missed
                </div>
              </button>
              {expanded === f.userId && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {f.missedDates.map((d) => (
                    <span key={d} className="text-xs bg-mtn-grey-light rounded px-2 py-1">
                      {new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
