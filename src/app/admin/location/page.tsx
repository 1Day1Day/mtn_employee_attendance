"use client";

import { useEffect, useState } from "react";

type Settings = {
  branchLatitude: number;
  branchLongitude: number;
  radiusMeters: number;
  absenceThreshold: number;
};

export default function AdminLocationPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    fetch("/api/admin/location")
      .then((r) => r.json())
      .then((d) => setSettings(d.settings));
  }, []);

  async function save() {
    if (!settings) return;
    setSaving(true);
    setSaved(false);
    await fetch("/api/admin/location", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    setSaving(false);
    setSaved(true);
  }

  function useMyLocation() {
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setSettings((s) =>
          s ? { ...s, branchLatitude: pos.coords.latitude, branchLongitude: pos.coords.longitude } : s
        );
        setLocating(false);
      },
      () => setLocating(false)
    );
  }

  if (!settings) return <p className="text-mtn-grey">Loading…</p>;

  return (
    <div className="max-w-md">
      <h1 className="text-xl font-bold mb-5">Location &amp; Radius</h1>
      <div className="bg-white rounded-xl shadow-card p-5 flex flex-col gap-4">
        <button
          type="button"
          onClick={useMyLocation}
          className="text-sm font-medium bg-mtn-yellow text-mtn-black rounded-lg py-2.5"
        >
          {locating ? "Locating…" : "Use my current location for the branch"}
        </button>

        <Field label="Branch latitude">
          <input
            type="number"
            step="any"
            value={settings.branchLatitude}
            onChange={(e) => setSettings({ ...settings, branchLatitude: Number(e.target.value) })}
            className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2"
          />
        </Field>
        <Field label="Branch longitude">
          <input
            type="number"
            step="any"
            value={settings.branchLongitude}
            onChange={(e) => setSettings({ ...settings, branchLongitude: Number(e.target.value) })}
            className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2"
          />
        </Field>
        <Field label="Clock-in radius (metres)">
          <input
            type="number"
            value={settings.radiusMeters}
            onChange={(e) => setSettings({ ...settings, radiusMeters: Number(e.target.value) })}
            className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2"
          />
        </Field>
        <Field label="Missed-days threshold for the audit list">
          <input
            type="number"
            value={settings.absenceThreshold}
            onChange={(e) => setSettings({ ...settings, absenceThreshold: Number(e.target.value) })}
            className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2"
          />
        </Field>

        <button
          onClick={save}
          disabled={saving}
          className="bg-mtn-black text-white font-medium rounded-lg py-2.5 disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save settings"}
        </button>
        {saved && <p className="text-status-success text-sm text-center">Saved.</p>}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      {children}
    </div>
  );
}
