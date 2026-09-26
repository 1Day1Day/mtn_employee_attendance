"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

type Intern = { id: string; fullName: string };

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next");
  const [mode, setMode] = useState<"STAFF" | "INTERN">("STAFF");
  const [staffId, setStaffId] = useState("");
  const [internId, setInternId] = useState("");
  const [interns, setInterns] = useState<Intern[]>([]);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (mode === "INTERN") {
      fetch("/api/auth/interns")
        .then((r) => r.json())
        .then((d) => setInterns(d.interns ?? []));
    }
  }, [mode]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const body =
      mode === "STAFF"
        ? { mode: "STAFF", staffId, password }
        : { mode: "INTERN", userId: internId, password };

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Something went wrong.");
      return;
    }

    router.push(next ?? (data.user.role === "ADMIN" ? "/admin" : "/clock"));
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-mtn-grey-light px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-card p-6">
        <h1 className="text-xl font-bold text-center mb-1">MTN Tarkwa Attendance</h1>
        <p className="text-sm text-mtn-grey text-center mb-6">Sign in to clock in or out</p>

        <div className="flex rounded-lg bg-mtn-grey-light p-1 mb-5">
          <button
            type="button"
            onClick={() => setMode("STAFF")}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
              mode === "STAFF" ? "bg-mtn-yellow text-mtn-black" : "text-mtn-grey"
            }`}
          >
            Staff
          </button>
          <button
            type="button"
            onClick={() => setMode("INTERN")}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
              mode === "INTERN" ? "bg-mtn-yellow text-mtn-black" : "text-mtn-grey"
            }`}
          >
            Intern / NSP
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {mode === "STAFF" ? (
            <div>
              <label className="text-sm font-medium">Staff ID</label>
              <input
                value={staffId}
                onChange={(e) => setStaffId(e.target.value.replace(/\D/g, "").slice(0, 5))}
                inputMode="numeric"
                placeholder="12345"
                className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2.5 text-lg tracking-widest"
              />
            </div>
          ) : (
            <div>
              <label className="text-sm font-medium">Your name</label>
              <select
                value={internId}
                onChange={(e) => setInternId(e.target.value)}
                className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2.5"
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
            <label className="text-sm font-medium">{mode === "STAFF" ? "Password" : "PIN"}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2.5"
            />
          </div>

          {error && <p className="text-status-error text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-mtn-yellow text-mtn-black font-semibold py-3 rounded-lg disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="text-center text-sm text-mtn-grey mt-5">
          New here?{" "}
          <Link href="/register" className="text-mtn-black font-medium underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
