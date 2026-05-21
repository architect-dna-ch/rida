"use client";
import { useState, useEffect, useRef } from "react";

type FastMode = "16:8" | "18:6" | "20:4" | "5:2" | "custom" | "sunnah";

const MODES: { id: FastMode; label: string; sub: string; hours: number }[] = [
  { id: "16:8",   label: "16:8",   sub: "Intermittent", hours: 16 },
  { id: "18:6",   label: "18:6",   sub: "Extended",     hours: 18 },
  { id: "20:4",   label: "20:4",   sub: "Warrior",      hours: 20 },
  { id: "5:2",    label: "5:2",    sub: "Weekly",       hours: 24 },
  { id: "sunnah", label: "Sunnah", sub: "Mon & Thu",    hours: 24 },
  { id: "custom", label: "Custom", sub: "Set hours",    hours: 16 },
];

function getPhase(elapsedH: number): { label: string; color: string } {
  if (elapsedH < 4)  return { label: "Digesting",   color: "#a3a3a3" };
  if (elapsedH < 8)  return { label: "Sugar Burn",  color: "#e8a44a" };
  if (elapsedH < 12) return { label: "Fat Burn",    color: "#4f6fa8" };
  if (elapsedH < 16) return { label: "Ketosis",     color: "#9b4a82" };
  if (elapsedH < 18) return { label: "Autophagy",   color: "#2d9e9e" };
  return               { label: "Deep Fast",   color: "#22c55e" };
}

function fmt(ms: number) {
  if (ms <= 0) return "00:00:00";
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}`;
}

function todayKey() { return new Date().toISOString().slice(0, 10); }

export default function FeatureTab() {
  const [mode, setMode]               = useState<FastMode>("16:8");
  const [customHours, setCustomHours] = useState(16);
  const [startTime, setStartTime]     = useState<number | null>(null);
  const [now, setNow]                 = useState(Date.now());
  const [history, setHistory]         = useState<{ date: string; hours: number; mode: string }[]>([]);
  const ticker = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const s = localStorage.getItem("rida_fast_start");
    const h = localStorage.getItem("rida_fast_history");
    if (s) setStartTime(parseInt(s));
    if (h) setHistory(JSON.parse(h));
    ticker.current = setInterval(() => setNow(Date.now()), 1000);
    return () => { if (ticker.current) clearInterval(ticker.current); };
  }, []);

  const targetHours = mode === "custom" ? customHours : MODES.find(m2 => m2.id === mode)!.hours;
  const targetMs    = targetHours * 3600 * 1000;
  const elapsed     = startTime ? now - startTime : 0;
  const remaining   = startTime ? Math.max(0, targetMs - elapsed) : 0;
  const pct         = startTime ? Math.min(1, elapsed / targetMs) : 0;
  const done        = !!(startTime && elapsed >= targetMs);
  const elapsedH    = elapsed / 3600000;
  const phase       = getPhase(startTime ? elapsedH : 0);

  function start() {
    const t = Date.now();
    setStartTime(t);
    localStorage.setItem("rida_fast_start", String(t));
  }

  function stop() {
    if (startTime) {
      const hrs = Math.round((Date.now() - startTime) / 36000) / 100;
      const entry = { date: todayKey(), hours: hrs, mode };
      const next = [entry, ...history].slice(0, 30);
      setHistory(next);
      localStorage.setItem("rida_fast_history", JSON.stringify(next));
    }
    setStartTime(null);
    localStorage.removeItem("rida_fast_start");
  }

  const R     = 90;
  const circ  = 2 * Math.PI * R;
  const dash  = circ * (1 - pct);
  const ringColor = done ? "#22c55e" : (startTime ? phase.color : "var(--border2)");

  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    const key = d.toISOString().slice(0, 10);
    const entry = history.find(h => h.date === key);
    return { key, day: d.toLocaleDateString("en", { weekday: "short" }).slice(0,1), entry };
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "calc(100dvh - 120px)", padding: "16px 16px 0", maxWidth: 480, margin: "0 auto" }}>

      {/* Mode chips */}
      <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4, scrollbarWidth: "none", marginBottom: 20 }}>
        {MODES.map(m2 => (
          <button key={m2.id} onClick={() => !startTime && setMode(m2.id)} style={{
            flexShrink: 0,
            padding: "5px 14px", borderRadius: 20, border: "1px solid",
            borderColor: mode === m2.id ? phase.color : "var(--border)",
            background: mode === m2.id ? `${phase.color}18` : "transparent",
            color: mode === m2.id ? phase.color : "var(--text3)",
            fontSize: 11, fontWeight: 700, cursor: startTime ? "default" : "pointer",
            opacity: startTime && mode !== m2.id ? 0.35 : 1,
            transition: "all 0.2s",
          }}>
            {m2.label}
          </button>
        ))}
      </div>

      {mode === "custom" && !startTime && (
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, background: "var(--bg2)", borderRadius: 10, padding: "10px 14px", border: "1px solid var(--border)" }}>
          <span style={{ color: "var(--text3)", fontSize: 12 }}>Hours</span>
          <input type="range" min={1} max={24} value={customHours} onChange={e => setCustomHours(Number(e.target.value))} style={{ flex: 1, accentColor: "var(--green)" }} />
          <span style={{ color: "var(--green)", fontWeight: 800, fontSize: 15, minWidth: 32 }}>{customHours}h</span>
        </div>
      )}

      {/* Ring */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative", marginBottom: 16 }}>

        {/* Glow */}
        {startTime && (
          <div style={{
            position: "absolute", width: 220, height: 220, borderRadius: "50%",
            background: `radial-gradient(circle, ${ringColor}20 0%, transparent 70%)`,
            pointerEvents: "none",
          }} />
        )}

        <svg width={220} height={220} style={{ transform: "rotate(-90deg)" }}>
          <circle cx={110} cy={110} r={R} fill="none" stroke="var(--border)" strokeWidth={10} />
          <circle
            cx={110} cy={110} r={R} fill="none"
            stroke={ringColor} strokeWidth={10}
            strokeDasharray={circ} strokeDashoffset={dash}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 1s linear, stroke 0.5s ease" }}
          />
        </svg>

        <div style={{ position: "absolute", textAlign: "center" }}>
          {startTime ? (
            <>
              <div style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: phase.color, marginBottom: 4, fontWeight: 700 }}>
                {phase.label}
              </div>
              <div style={{ fontFamily: "monospace", fontSize: 30, fontWeight: 800, color: done ? "#22c55e" : "var(--text)", letterSpacing: "-0.02em" }}>
                {done ? "✓ Done" : fmt(remaining)}
              </div>
              <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 4 }}>
                {done ? `${targetHours}h complete` : `of ${targetHours}h`}
              </div>
              <div style={{ fontSize: 10, color: "var(--text3)", marginTop: 2 }}>
                {fmt(elapsed)} elapsed
              </div>
            </>
          ) : (
            <>
              <div style={{ fontSize: 38, fontWeight: 800, color: "var(--text3)", letterSpacing: "-0.04em" }}>{targetHours}h</div>
              <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 2 }}>{MODES.find(m2 => m2.id === mode)?.sub}</div>
            </>
          )}
        </div>
      </div>

      {/* CTA */}
      <button onClick={startTime ? stop : start} style={{
        width: "100%", padding: "14px 0", borderRadius: 14, border: "none",
        fontWeight: 800, fontSize: 14, letterSpacing: "0.08em", textTransform: "uppercase",
        background: startTime ? (done ? "#22c55e" : "rgba(239,68,68,0.12)") : `linear-gradient(135deg, var(--green), #16a34a)`,
        color: startTime ? (done ? "#fff" : "#ef4444") : "#fff",
        cursor: "pointer",
        boxShadow: startTime ? "none" : "0 4px 20px rgba(34,197,94,0.25)",
        transition: "all 0.2s",
        marginBottom: 20,
      }}>
        {startTime ? (done ? "Complete ✓" : "Stop Fast") : `Start ${targetHours}h Fast`}
      </button>

      {/* 7-day strip */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 10, color: "var(--text3)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 10 }}>Last 7 Days</div>
        <div style={{ display: "flex", gap: 6 }}>
          {last7.map(({ key, day, entry }) => (
            <div key={key} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div style={{
                width: "100%", aspectRatio: "1", borderRadius: 8,
                background: entry ? `${phase.color}30` : "var(--bg2)",
                border: `1px solid ${entry ? phase.color + "60" : "var(--border)"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 10, color: entry ? phase.color : "var(--text3)", fontWeight: 700,
              }}>
                {entry ? `${Math.round(entry.hours)}h` : "·"}
              </div>
              <div style={{ fontSize: 9, color: "var(--text3)" }}>{day}</div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
