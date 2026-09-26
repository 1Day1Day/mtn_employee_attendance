"use client";

import { useEffect, useState } from "react";

type Props = {
  onSubmit: (coords: { lat: number; lon: number } | null) => Promise<{
    ok: boolean;
    message: string;
  }>;
  nextAction: "IN" | "OUT";
};

export default function ClockButton({ onSubmit, nextAction }: Props) {
  const [now, setNow] = useState(new Date());
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  async function handleClick() {
    setSubmitting(true);
    setLocationError(null);
    setResult(null);

    if (!("geolocation" in navigator)) {
      setLocationError("This browser can't share your location. Try a different browser.");
      setSubmitting(false);
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        setLocating(false);
        const outcome = await onSubmit({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
        setResult(outcome);
        setSubmitting(false);
      },
      (err) => {
        setLocating(false);
        setSubmitting(false);
        setLocationError(
          err.code === err.PERMISSION_DENIED
            ? "Please turn on location access to clock in or out."
            : "Couldn't get your location. Please try again."
        );
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  }

  if (result) {
    return (
      <div className="flex flex-col items-center gap-3 py-10">
        <div
          className={`w-16 h-16 rounded-full flex items-center justify-center text-white text-3xl ${
            result.ok ? "bg-status-success" : "bg-status-error"
          }`}
        >
          {result.ok ? "✓" : "!"}
        </div>
        <p className="text-center font-medium">{result.message}</p>
        <button
          onClick={() => setResult(null)}
          className="text-sm text-mtn-grey underline mt-2"
        >
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-4xl font-bold tabular-nums">
        {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
      </div>
      <div className="text-sm text-mtn-grey">
        {now.toLocaleDateString([], { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
      </div>

      {locationError && (
        <p className="text-status-error text-sm text-center max-w-xs">{locationError}</p>
      )}

      <button
        onClick={handleClick}
        disabled={submitting}
        className="w-48 h-48 rounded-full bg-mtn-yellow text-mtn-black text-2xl font-bold shadow-card
                   active:scale-95 transition-transform disabled:opacity-60"
      >
        {locating ? "Checking location…" : nextAction === "IN" ? "Clock In" : "Clock Out"}
      </button>
    </div>
  );
}
