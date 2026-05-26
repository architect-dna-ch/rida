"use client";
import { useState, useEffect, useCallback } from "react";

const PRESETS = [
  { name: "SubhanAllah",   arabic: "سُبْحَانَ ٱللَّٰهِ",  goal: 33, color: "#00c9a7" },
  { name: "Alhamdulillah", arabic: "ٱلْحَمْدُ لِلَّٰهِ", goal: 33, color: "#a78bfa" },
  { name: "Allahu Akbar",  arabic: "ٱللَّٰهُ أَكْبَرُ",  goal: 34, color: "#fbbf24" },
];

const ADHKAR = [
  { name: "Astaghfirullah", arabic: "أَسْتَغْفِرُ ٱللَّٰهَ", goal: 100, color: "#60a5fa" },
  { name: "La ilaha illallah", arabic: "لَا إِلٰهَ إِلَّا ٱللَّٰهُ", goal: 100, color: "#f472b6" },
  { name: "Salawat", arabic: "ٱللَّٰهُمَّ صَلِّ عَلَىٰ مُحَمَّدٍ", goal: 100, color: "#34d399" },
];

const STORAGE_KEY = "rida_dhikr_";

function todayKey() { return new Date().toISOString().slice(0, 10); }

export default function DhikrCounter() {
  const [activeSet, setActiveSet] = useState<"tasbih" | "adhkar">("tasbih");
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [activeIdx, setActiveIdx] = useState(0);
  const [pulse, setPulse] = useState(false);

  const presets = activeSet === "tasbih" ? PRESETS : ADHKAR;
  const active = presets[activeIdx];
  const count = counts[active.name] ?? 0;
  const done = count >= active.goal;
  const pct = Math.min(1, count / active.goal);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY + todayKey());
    if (saved) setCounts(JSON.parse(saved));
  }, []);

  const tap = useCallback(() => {
    setCounts(prev => {
      const next = { ...prev, [active.name]: (prev[active.name] ?? 0) + 1 };
      localStorage.setItem(STORAGE_KEY + todayKey(), JSON.stringify(next));
      return next;
    });
    setPulse(true);
    setTimeout(() => setPulse(false), 120);
    if (navigator.vibrate) navigator.vibrate(18);
    // auto-advance when complete
    if (count + 1 >= active.goal && activeIdx < presets.length - 1) {
      setTimeout(() => setActiveIdx(i => i + 1), 400);
    }
  }, [active, count, activeIdx, presets.length]);

  const allDone = presets.every(p => (counts[p.name] ?? 0) >= p.goal);
  const total = presets.reduce((a, p) => a + (counts[p.name] ?? 0), 0);
  const totalGoal = presets.reduce((a, p) => a + p.goal, 0);

  const R = 88;
  const circ = 2 * Math.PI * R;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>

      {/* Set toggle */}
      <div style={{ display: "flex", gap: 8, background: "var(--bg2)", borderRadius: 12, padding: 4, border: "1px solid var(--border)", width: "100%" }}>
        {(["tasbih", "adhkar"] as const).map(s => (
          <button key={s} onClick={() => { setActiveSet(s); setActiveIdx(0); }} style={{
            flex: 1, padding: "8px 0", borderRadius: 8, fontSize: 12, fontWeight: 700,
            background: activeSet === s ? "var(--bg3)" : "transparent",
            border: activeSet === s ? "1px solid var(--border2)" : "1px solid transparent",
            color: activeSet === s ? "var(--text)" : "var(--text3)",
            cursor: "pointer", transition: "all .2s",
          }}>
            {s === "tasbih" ? "📿 Tasbih" : "✦ Adhkar"}
          </button>
        ))}
      </div>

      {/* Preset pills */}
      <div style={{ display: "flex", gap: 8, width: "100%", justifyContent: "center" }}>
        {presets.map((p, i) => {
          const c = counts[p.name] ?? 0;
          const d = c >= p.goal;
          return (
            <button key={p.name} onClick={() => setActiveIdx(i)} style={{
              flex: 1, padding: "8px 4px", borderRadius: 10, fontSize: 10, fontWeight: 700,
              background: i === activeIdx ? `${p.color}18` : "var(--bg2)",
              border: `1px solid ${i === activeIdx ? p.color + "55" : "var(--border)"}`,
              color: d ? p.color : i === activeIdx ? p.color : "var(--text3)",
              cursor: "pointer", transition: "all .2s",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
            }}>
              <span>{d ? "✓" : c > 0 ? c : "·"}</span>
              <span style={{ fontSize: 8, letterSpacing: ".05em", textTransform: "uppercase" }}>{p.name.split(" ")[0]}</span>
            </button>
          );
        })}
      </div>

      {/* Big tap area */}
      <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {/* Glow */}
        <div style={{
          position: "absolute", width: 220, height: 220, borderRadius: "50%",
          background: `radial-gradient(circle, ${active.color}18 0%, transparent 70%)`,
          transition: "background .3s",
          transform: pulse ? "scale(1.08)" : "scale(1)",
          transitionDuration: pulse ? "0.05s" : "0.2s",
          pointerEvents: "none",
        }} />

        {/* Ring */}
        <svg width={220} height={220} style={{ transform: "rotate(-90deg)", position: "absolute" }}>
          <circle cx={110} cy={110} r={R} fill="none" stroke="var(--border)" strokeWidth={8} />
          <circle cx={110} cy={110} r={R} fill="none"
            stroke={done ? active.color : active.color}
            strokeWidth={8}
            strokeDasharray={circ}
            strokeDashoffset={circ * (1 - pct)}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset .3s ease, opacity .3s", opacity: done ? 1 : 0.7 }}
          />
        </svg>

        {/* Tap button */}
        <button
          onClick={tap}
          style={{
            width: 180, height: 180, borderRadius: "50%",
            background: done
              ? `radial-gradient(circle, ${active.color}22, ${active.color}08)`
              : "var(--bg2)",
            border: `1px solid ${active.color}33`,
            cursor: "pointer",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6,
            transform: pulse ? "scale(0.95)" : "scale(1)",
            transition: "transform .1s ease",
            zIndex: 1,
          }}
        >
          <div style={{ fontSize: 26, fontWeight: 700, color: "var(--text)", direction: "rtl", fontFamily: "Georgia, serif" }}>
            {active.arabic}
          </div>
          <div style={{ fontSize: 38, fontWeight: 900, color: done ? active.color : "var(--text)", letterSpacing: "-.04em", lineHeight: 1 }}>
            {done ? "✓" : count}
          </div>
          <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text3)", letterSpacing: ".1em" }}>
            / {active.goal}
          </div>
        </button>
      </div>

      {/* All done banner */}
      {allDone && (
        <div style={{
          width: "100%", padding: "14px 0", borderRadius: 14, textAlign: "center",
          background: `linear-gradient(135deg, ${presets[0].color}18, ${presets[presets.length-1].color}12)`,
          border: `1px solid ${presets[0].color}33`,
        }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: "var(--text)" }}>
            {activeSet === "tasbih" ? "Tasbih complete · الحمد لله" : "Adhkar complete · ماشاء الله"}
          </div>
          <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text3)", marginTop: 4, letterSpacing: ".1em" }}>
            {total} / {totalGoal} today
          </div>
        </div>
      )}

      {/* Reset */}
      <button
        onClick={() => {
          const cleared = Object.fromEntries(presets.map(p => [p.name, 0]));
          setCounts(prev => { const n = { ...prev, ...cleared }; localStorage.setItem(STORAGE_KEY + todayKey(), JSON.stringify(n)); return n; });
          setActiveIdx(0);
        }}
        style={{ background: "none", border: "none", color: "var(--text3)", fontFamily: "var(--mono)", fontSize: 10, letterSpacing: ".12em", cursor: "pointer", padding: "4px 0" }}>
        RESET
      </button>
    </div>
  );
}
