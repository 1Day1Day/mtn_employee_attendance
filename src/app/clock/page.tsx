"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ClockButton from "@/components/ClockButton";

export default function ClockPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-mtn-black" />}>
      <ClockPageInner />
    </Suspense>
  );
}

function ClockPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [signedIn, setSignedIn] = useState(false);
  const [fullName, setFullName] = useState("");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.user) {
          setSignedIn(true);
          setFullName(data.user.fullName);
        }
        setCheckingAuth(false);
      });
  }, []);

  if (!token) {
    return (
      <Centered>
        <WelcomeIcon />
        <h2 className="text-center font-bold text-lg mt-4 mb-1">Welcome</h2>
        <p className="text-center text-mtn-grey text-sm mb-6">
          Scan today&apos;s QR code at the branch entrance to clock in or out.
        </p>
        <LiveClock />
        <div className="flex flex-col gap-2 mt-6">
          <a
            href="/login"
            className="text-center bg-mtn-yellow text-mtn-black font-semibold py-2.5 rounded-lg"
          >
            Sign in
          </a>
          <a
            href="/register"
            className="text-center bg-mtn-grey-light text-mtn-black font-medium py-2.5 rounded-lg"
          >
            Register
          </a>
        </div>
      </Centered>
    );
  }

  if (checkingAuth) {
    return (
      <Centered>
        <p className="text-mtn-grey">Loading…</p>
      </Centered>
    );
  }

  if (!signedIn) {
    // Not registered / not signed in yet: send them to login, preserving the token
    // so they land back here (with the QR still valid) after signing in.
    router.push(`/login?next=${encodeURIComponent(`/clock?token=${token}`)}`);
    return (
      <Centered>
        <p className="text-mtn-grey">Redirecting to sign in…</p>
      </Centered>
    );
  }

  return (
    <Centered>
      <p className="text-center font-medium mb-2">{fullName}</p>
      <ClockButton
        nextAction="IN"
        onSubmit={async (coords) => {
          if (!coords) return { ok: false, message: "Location is required to clock in or out." };
          const res = await fetch("/api/clock", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ method: "PHONE_QR", token, lat: coords.lat, lon: coords.lon }),
          });
          const data = await res.json();
          if (!res.ok) return { ok: false, message: data.error ?? "Something went wrong." };
          return { ok: data.ok, message: data.message };
        }}
      />
    </Centered>
  );
}

function LiveClock() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="text-center">
      <div className="text-2xl font-bold tabular-nums text-mtn-black">
        {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
      </div>
      <div className="text-xs text-mtn-grey mt-0.5">
        {now.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" })}
      </div>
    </div>
  );
}

function WelcomeIcon() {
  return (
    <div className="w-16 h-16 rounded-2xl bg-mtn-yellow flex items-center justify-center mx-auto">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#0A0A0A" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <path d="M14 14h3v3h-3zM19 14h2v2h-2zM14 19h2v2h-2zM19 19h2v2h-2z" />
      </svg>
    </div>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-mtn-black flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-xs bg-white rounded-2xl shadow-card p-6">
        <h1 className="text-center font-bold text-mtn-black mb-4">MTN Tarkwa</h1>
        {children}
      </div>
    </div>
  );
}