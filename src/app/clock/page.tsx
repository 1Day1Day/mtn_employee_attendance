"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ClockButton from "@/components/ClockButton";

export default function ClockPage() {
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
        <p className="text-center text-mtn-grey">
          Please scan today&apos;s QR code at the branch to clock in or out.
        </p>
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
