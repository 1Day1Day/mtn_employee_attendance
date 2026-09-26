"use client";

import { useEffect, useState } from "react";

export default function TodayQrPage() {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/qr/today")
      .then((r) => r.json())
      .then((d) => {
        setDataUrl(d.dataUrl);
        setUrl(d.url);
      });
  }, []);

  return (
    <div className="flex flex-col items-center text-center">
      <h1 className="text-xl font-bold mb-2">Today&apos;s Clock-In QR Code</h1>
      <p className="text-sm text-mtn-grey mb-6 max-w-sm">
        Display this on a screen at the branch entrance. It changes automatically every day, so
        yesterday&apos;s code (or a photo of it) won&apos;t work.
      </p>
      <div className="bg-white rounded-2xl shadow-card p-8">
        {dataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={dataUrl} alt="Today's clock-in QR code" className="w-72 h-72" />
        ) : (
          <div className="w-72 h-72 flex items-center justify-center text-mtn-grey">Loading…</div>
        )}
      </div>
      {url && <p className="text-xs text-mtn-grey mt-4 break-all max-w-sm">{url}</p>}
    </div>
  );
}
