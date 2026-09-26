"use client";

import { useEffect, useState } from "react";

export default function DisplayPage() {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    function load() {
      fetch("/api/qr/today")
        .then((r) => r.json())
        .then((d) => setDataUrl(d.dataUrl));
    }
    load();
    const t = setInterval(load, 60 * 60 * 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-screen bg-mtn-black flex flex-col items-center justify-center px-4">
      <div className="text-mtn-yellow font-bold text-2xl mb-6">MTN Tarkwa — Scan to Clock In</div>
      <div className="bg-white rounded-2xl shadow-card p-10">
        {dataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={dataUrl} alt="Today's clock-in QR code" className="w-80 h-80" />
        ) : (
          <div className="w-80 h-80 flex items-center justify-center text-mtn-grey">Loading…</div>
        )}
      </div>
      <p className="text-white/60 text-sm mt-6 max-w-sm text-center">
        Open your phone&apos;s camera and point it at the code to clock in or out.
      </p>
    </div>
  );
}