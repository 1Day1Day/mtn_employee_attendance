"use client";

import { useEffect, useState } from "react";

type Intern = { id: string; fullName: string };

export default function StationPage() {
  const [mode, setMode] = useState<"STAFF" | "INTERN">("STAFF");
  const [staffId, setStaffId] = useState("");
  const [internId, setInternId] = useState("");
  const [interns, setInterns] = useState<Intern[]>([]);
  const [password, setPassword] = useState("");
  const [now, setNow] = useState(new Date());
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (mode === "INTERN") {
      fetch("/api/auth/interns")
        .then((r) => r.json())
        .then((d) => setInterns(d.interns ?? []));
    }
  }, [mode]);

  // Clears the confirmation screen after a few seconds so the station is
  // ready for the next person.
  useEffect(() => {
    if (!result) return;
    const t = setTimeout(() => {
      setResult(null);
      setStaffId("");
      setInternId("");
      setPassword("");
    }, 4000);
    return () => clearTimeout(t);
  }, [result]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/clock", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-station-secret": process.env.NEXT_PUBLIC_STATION_DEVICE_SECRET ?? "",
      },
      body: JSON.stringify(
        mode === "STAFF"
          ? { method: "STATION", staffId, password }
          : { method: "STATION", userId: internId, password }
      ),
    });
    const data = await res.json();
    setLoading(false);
    setResult({ ok: !!data.ok, message: data.message ?? data.error ?? "Something went wrong." });
  }

  return (
    <div className="min-h-screen bg-mtn-black flex flex-col items-center justify-center px-4 py-10">
      <div className="text-white text-center mb-6">
        <div className="text-mtn-yellow font-bold text-lg">MTN Tarkwa — Attendance Station</div>
        <div className="text-4xl font-bold tabular-nums mt-2">
          {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
        </div>
        <div className="text-white/60 text-sm">
          {now.toLocaleDateString([], { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </div>
      </div>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-card p-8">
        {result ? (
          <div className="flex flex-col items-center gap-3 py-6">
            <div
              className={`w-20 h-20 rounded-full flex items-center justify-center text-white text-4xl ${
                result.ok ? "bg-status-success" : "bg-status-error"
              }`}
            >
              {result.ok ? "✓" : "!"}
            </div>
            <p className="text-center text-lg font-medium">{result.message}</p>
          </div>
        ) : (
          <>
            <div className="flex rounded-lg bg-mtn-grey-light p-1 mb-5">
              <button
                type="button"
                onClick={() => setMode("STAFF")}
                className={`flex-1 py-3 text-base font-medium rounded-md ${
                  mode === "STAFF" ? "bg-mtn-yellow text-mtn-black" : "text-mtn-grey"
                }`}
              >
                Staff
              </button>
              <button
                type="button"
                onClick={() => setMode("INTERN")}
                className={`flex-1 py-3 text-base font-medium rounded-md ${
                  mode === "INTERN" ? "bg-mtn-yellow text-mtn-black" : "text-mtn-grey"
                }`}
              >
                Intern / NSP
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {mode === "STAFF" ? (
                <div>
                  <label className="text-base font-medium">Staff ID</label>
                  <input
                    value={staffId}
                    onChange={(e) => setStaffId(e.target.value.replace(/\D/g, "").slice(0, 5))}
                    inputMode="numeric"
                    autoFocus
                    className="mt-1 w-full rounded-lg border border-black/10 px-4 py-4 text-2xl tracking-widest text-center"
                  />
                </div>
              ) : (
                <div>
                  <label className="text-base font-medium">Your name</label>
                  <select
                    value={internId}
                    onChange={(e) => setInternId(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-black/10 px-4 py-4 text-lg"
                  >
                    <option value="">Select your name…</option>
                    {interns.map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.fullName}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="text-base font-medium">{mode === "STAFF" ? "Password" : "PIN"}</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-black/10 px-4 py-4 text-2xl text-center tracking-widest"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-mtn-yellow text-mtn-black font-bold text-xl py-4 rounded-lg disabled:opacity-60"
              >
                {loading ? "Checking…" : "Clock In / Out"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
