"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [personType, setPersonType] = useState<"STAFF" | "INTERN">("STAFF");
  const [fullName, setFullName] = useState("");
  const [staffId, setStaffId] = useState("");
  const [department, setDepartment] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const body =
      personType === "STAFF"
        ? { personType, fullName, staffId, department, phone, email, password }
        : { personType, fullName, department, phone, email, password };

    const res = await fetch("/api/auth/register", {
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
    setDone(true);
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-mtn-grey-light px-4">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-card p-6 text-center">
          <div className="w-14 h-14 rounded-full bg-status-pending/10 text-status-pending flex items-center justify-center text-2xl mx-auto mb-3">
            ⏳
          </div>
          <h1 className="font-bold text-lg mb-2">Registration received</h1>
          <p className="text-sm text-mtn-grey mb-5">
            An admin needs to approve your account before you can clock in or out. Please check back shortly.
          </p>
          <Link href="/login" className="text-sm font-medium underline">
            Go to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-mtn-grey-light px-4 py-10">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-card p-6">
        <h1 className="text-xl font-bold text-center mb-1">Register</h1>
        <p className="text-sm text-mtn-grey text-center mb-6">MTN Tarkwa branch attendance</p>

        <div className="flex rounded-lg bg-mtn-grey-light p-1 mb-5">
          <button
            type="button"
            onClick={() => setPersonType("STAFF")}
            className={`flex-1 py-2 text-sm font-medium rounded-md ${
              personType === "STAFF" ? "bg-mtn-yellow text-mtn-black" : "text-mtn-grey"
            }`}
          >
            Staff
          </button>
          <button
            type="button"
            onClick={() => setPersonType("INTERN")}
            className={`flex-1 py-2 text-sm font-medium rounded-md ${
              personType === "INTERN" ? "bg-mtn-yellow text-mtn-black" : "text-mtn-grey"
            }`}
          >
            Intern / NSP
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium">Full name</label>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2.5"
            />
          </div>

          {personType === "STAFF" && (
            <div>
              <label className="text-sm font-medium">Staff ID (5 digits)</label>
              <input
                value={staffId}
                onChange={(e) => setStaffId(e.target.value.replace(/\D/g, "").slice(0, 5))}
                inputMode="numeric"
                required
                className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2.5 tracking-widest"
              />
            </div>
          )}

          <div>
            <label className="text-sm font-medium">Department (optional)</label>
            <input
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2.5"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Phone (optional)</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2.5"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Email (optional)</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2.5"
            />
          </div>

          <div>
            <label className="text-sm font-medium">{personType === "STAFF" ? "Password" : "Set a PIN"}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2.5"
            />
          </div>

          {error && <p className="text-status-error text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-mtn-yellow text-mtn-black font-semibold py-3 rounded-lg disabled:opacity-60"
          >
            {loading ? "Registering…" : "Register"}
          </button>
        </form>

        <p className="text-center text-sm text-mtn-grey mt-5">
          Already registered?{" "}
          <Link href="/login" className="text-mtn-black font-medium underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
