"use client";

import { useState } from "react";

const SURAH_NAMES: Record<number, string> = {
  1: "Al-Fatiha", 2: "Al-Baqarah", 3: "Al-Imran", 4: "An-Nisa", 5: "Al-Maidah",
  36: "Ya-Sin", 55: "Ar-Rahman", 67: "Al-Mulk", 78: "An-Naba", 112: "Al-Ikhlas",
  113: "Al-Falaq", 114: "An-Nas",
};

interface HifzEntry { surah: number; ayahFrom: number; ayahTo: number; status: "new" | "review" | "mastered" }

const STATUS_COLOR = { new: "#4f6fa8", review: "#c4743a", mastered: "#22c55e" };
const STATUS_LABEL = { new: "Neu", review: "Wiederholen", mastered: "✓ Fest" };

export default function HifzTracker() {
  const [entries, setEntries] = useState<HifzEntry[]>([
    { surah: 112, ayahFrom: 1, ayahTo: 4, status: "mastered" },
    { surah: 1,   ayahFrom: 1, ayahTo: 7, status: "review"   },
  ]);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ surah: 1, ayahFrom: 1, ayahTo: 1 });

  const mastered = entries.filter((e) => e.status === "mastered").length;

  return (
    <div style={{
      background: "#111",
      border: "1px solid #1f1f1f",
      borderRadius: "6px",
      padding: "20px",
      fontFamily: "ui-monospace, monospace",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <span style={{ color: "#737373", fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase" }}>
          Hifz Tracker
        </span>
        <span style={{ color: "#22c55e", fontSize: "11px" }}>
          {mastered}/{entries.length} fest memoriert
        </span>
      </div>

      {entries.map((e, i) => (
        <div key={i} style={{
          display: "grid",
          gridTemplateColumns: "1fr auto auto",
          gap: "8px",
          alignItems: "center",
          padding: "8px 0",
          borderBottom: "1px solid #1a1a1a",
        }}>
          <div>
            <span style={{ color: "#fafafa", fontSize: "12px" }}>
              {SURAH_NAMES[e.surah] ?? `Surah ${e.surah}`}
            </span>
            <span style={{ color: "#525252", fontSize: "10px", marginLeft: "8px" }}>
              {e.ayahFrom}:{e.ayahTo}
            </span>
          </div>

          <select
            value={e.status}
            onChange={(ev) => {
              const updated = [...entries];
              updated[i] = { ...e, status: ev.target.value as HifzEntry["status"] };
              setEntries(updated);
            }}
            style={{
              background: "#0d0d0d",
              border: `1px solid ${STATUS_COLOR[e.status]}`,
              color: STATUS_COLOR[e.status],
              fontSize: "10px",
              padding: "2px 6px",
              borderRadius: "2px",
              cursor: "pointer",
            }}
          >
            {(["new", "review", "mastered"] as const).map((s) => (
              <option key={s} value={s}>{STATUS_LABEL[s]}</option>
            ))}
          </select>

          <button
            onClick={() => setEntries(entries.filter((_, j) => j !== i))}
            style={{ background: "none", border: "none", color: "#525252", cursor: "pointer", fontSize: "12px" }}
          >×</button>
        </div>
      ))}

      {adding ? (
        <div style={{ marginTop: "12px", display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ color: "#737373", fontSize: "10px" }}>Surah</span>
          <input
            type="number" min={1} max={114}
            value={form.surah}
            onChange={(e) => setForm((f) => ({ ...f, surah: +e.target.value }))}
            style={{ width: "50px", background: "#0d0d0d", border: "1px solid #333", color: "#fafafa", padding: "2px 6px", fontSize: "11px", borderRadius: "2px" }}
          />
          <span style={{ color: "#737373", fontSize: "10px" }}>Ayah</span>
          <input type="number" min={1} value={form.ayahFrom}
            onChange={(e) => setForm((f) => ({ ...f, ayahFrom: +e.target.value }))}
            style={{ width: "44px", background: "#0d0d0d", border: "1px solid #333", color: "#fafafa", padding: "2px 6px", fontSize: "11px", borderRadius: "2px" }}
          />
          <span style={{ color: "#525252", fontSize: "10px" }}>–</span>
          <input type="number" min={1} value={form.ayahTo}
            onChange={(e) => setForm((f) => ({ ...f, ayahTo: +e.target.value }))}
            style={{ width: "44px", background: "#0d0d0d", border: "1px solid #333", color: "#fafafa", padding: "2px 6px", fontSize: "11px", borderRadius: "2px" }}
          />
          <button
            onClick={() => { setEntries([...entries, { ...form, status: "new" }]); setAdding(false); }}
            style={{ background: "#14532d", border: "1px solid #22c55e", color: "#22c55e", padding: "2px 10px", fontSize: "10px", borderRadius: "2px", cursor: "pointer" }}
          >+ Add</button>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          style={{ marginTop: "12px", background: "none", border: "1px solid #333", color: "#737373", padding: "4px 12px", fontSize: "10px", borderRadius: "2px", cursor: "pointer", letterSpacing: "0.1em" }}
        >
          + SURAH HINZUFÜGEN
        </button>
      )}
    </div>
  );
}
