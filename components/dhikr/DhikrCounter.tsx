"use client";

import { useState } from "react";

const PRESETS = [
  { name: "SubhanAllah",   arabic: "سُبْحَانَ ٱللَّٰهِ",   goal: 33 },
  { name: "Alhamdulillah", arabic: "ٱلْحَمْدُ لِلَّٰهِ",  goal: 33 },
  { name: "Allahu Akbar",  arabic: "ٱللَّٰهُ أَكْبَرُ",   goal: 34 },
];

export default function DhikrCounter() {
  const [counts, setCounts] = useState<Record<string, number>>({});

  const total = PRESETS.reduce((a, p) => a + (counts[p.name] ?? 0), 0);
  const allDone = PRESETS.every((p) => (counts[p.name] ?? 0) >= p.goal);

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
          Dhikr Tracker
        </span>
        <span style={{ color: allDone ? "#22c55e" : "#525252", fontSize: "11px" }}>
          {total} / 100 {allDone && "✓ Tasbih komplett"}
        </span>
      </div>

      {PRESETS.map((p) => {
        const count = counts[p.name] ?? 0;
        const pct   = Math.min(100, (count / p.goal) * 100);
        const done  = count >= p.goal;

        return (
          <div key={p.name} style={{ marginBottom: "14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
              <span style={{ color: "#d4d4d4", fontSize: "12px" }}>{p.name}</span>
              <span style={{ color: "#737373", fontSize: "11px", direction: "rtl" }}>{p.arabic}</span>
            </div>

            {/* Progress bar */}
            <div style={{ background: "#1a1a1a", borderRadius: "2px", height: "4px", marginBottom: "6px" }}>
              <div style={{
                height: "100%",
                width: `${pct}%`,
                background: done ? "#22c55e" : "#4f6fa8",
                borderRadius: "2px",
                transition: "width 0.2s",
              }} />
            </div>

            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <button
                onClick={() => setCounts((c) => ({ ...c, [p.name]: Math.max(0, (c[p.name] ?? 0) - 1) }))}
                style={{ background: "#1a1a1a", border: "1px solid #333", color: "#737373", width: 28, height: 28, borderRadius: "3px", cursor: "pointer", fontSize: "14px" }}
              >−</button>

              <span style={{ color: done ? "#22c55e" : "#fafafa", fontSize: "15px", fontWeight: 700, minWidth: "40px", textAlign: "center" }}>
                {count}
              </span>

              <button
                onClick={() => setCounts((c) => ({ ...c, [p.name]: (c[p.name] ?? 0) + 1 }))}
                style={{ background: done ? "#14532d" : "#1e3a5f", border: `1px solid ${done ? "#22c55e" : "#4f6fa8"}`, color: done ? "#22c55e" : "#93c5fd", width: 28, height: 28, borderRadius: "3px", cursor: "pointer", fontSize: "14px" }}
              >+</button>

              <span style={{ color: "#525252", fontSize: "10px" }}>/ {p.goal}</span>

              {done && <span style={{ color: "#22c55e", fontSize: "12px" }}>✓</span>}
            </div>
          </div>
        );
      })}

      <button
        onClick={() => setCounts({})}
        style={{ marginTop: "8px", background: "none", border: "none", color: "#525252", fontSize: "10px", cursor: "pointer", letterSpacing: "0.1em" }}
      >
        RESET
      </button>
    </div>
  );
}
