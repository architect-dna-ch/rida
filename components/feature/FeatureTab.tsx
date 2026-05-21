"use client";
import { useState, useEffect, useRef } from "react";

type FastMode = "16:8" | "18:6" | "20:4" | "5:2" | "custom" | "sunnah";

const MODES: { id: FastMode; label: string; sub: string; hours: number }[] = [
  { id: "16:8",   label: "16 : 8",  sub: "Intermittent",  hours: 16 },
  { id: "18:6",   label: "18 : 6",  sub: "Extended",      hours: 18 },
  { id: "20:4",   label: "20 : 4",  sub: "Warrior",       hours: 20 },
  { id: "5:2",    label: "5 : 2",   sub: "Weekly",        hours: 24 },
  { id: "sunnah", label: "Sunnah",  sub: "Mon / Thu",     hours: 24 },
  { id: "custom", label: "Custom",  sub: "Set hours",     hours: 16 },
];

function fmt(ms: number) {
  if (ms <= 0) return "00:00:00";
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return [h, m, sec].map(n => String(n).padStart(2, "0")).join(":");
}

function todayKey() { return new Date().toISOString().slice(0, 10); }

export default function FeatureTab() {
  const [mode, setMode] = useState<FastMode>("16:8");
  const [customHours, setCustomHours] = useState(16);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());
  const [history, setHistory] = useState<{ date: string; hours: number; mode: string }[]>([]);
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
  const targetMs = targetHours * 3600 * 1000;
  const elapsed = startTime ? now - startTime : 0;
  const remaining = startTime ? Math.max(0, targetMs - elapsed) : 0;
  const pct = startTime ? Math.min(1, elapsed / targetMs) : 0;
  const done = startTime && elapsed >= targetMs;

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

  const r = 64;
  const circ = 2 * Math.PI * r;
  const dashOffset = circ * (1 - pct);
  const color = done ? "#22c55e" : "var(--green)";

  return (
    <div style={{ padding: "20px 16px", maxWidth: 480, margin: "0 auto" }}>

      <div style={{ marginBottom: 20 }}>
        <div style={{ color: "var(--text)", fontWeight: 700, fontSize: 18 }}>Fast</div>
        <div style={{ color: "var(--text3)", fontSize: 11, marginTop: 2 }}>Track your fasting window</div>
      </div>

      {/* mode picker */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 28 }}>
        {MODES.map(m2 => (
          <button key={m2.id} onClick={() => !startTime && setMode(m2.id)} style={{
            padding: "6px 12px", borderRadius: 20, border: "1px solid",
            borderColor: mode === m2.id ? "var(--green)" : "var(--border)",
            background: mode === m2.id ? "rgba(34,197,94,0.1)" : "var(--bg2)",
            color: mode === m2.id ? "var(--green)" : "var(--text3)",
            fontSize: 12, fontWeight: 600, cursor: startTime ? "default" : "pointer",
            opacity: startTime && mode !== m2.id ? 0.4 : 1,
          }}>
            {m2.label}
            <span style={{ fontWeight: 400, marginLeft: 4, fontSize: 10 }}>{m2.sub}</span>
          </button>
        ))}
      </div>

      {mode === "custom" && !startTime && (
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <span style={{ color: "var(--text3)", fontSize: 13 }}>Hours:</span>
          <input
            type="range" min={1} max={24} value={customHours}
            onChange={e => setCustomHours(Number(e.target.value))}
            style={{ flex: 1 }}
          />
          <span style={{ color: "var(--text)", fontWeight: 700, width: 28 }}>{customHours}h</span>
        </div>
      )}

      {/* ring timer */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 32 }}>
        <svg width={160} height={160} style={{ transform: "rotate(-90deg)" }}>
          <circle cx={80} cy={80} r={r} fill="none" stroke="var(--border)" strokeWidth={8} />
          <circle
            cx={80} cy={80} r={r} fill="none"
            stroke={color} strokeWidth={8}
            strokeDasharray={circ}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 1s linear" }}
          />
        </svg>
        <div style={{ marginTop: -100, textAlign: "center", marginBottom: 60 }}>
          {startTime ? (
            <>
              <div style={{ color: done ? "#22c55e" : "var(--text)", fontFamily: "monospace", fontSize: 26, fontWeight: 700 }}>
                {done ? "✓ Done" : fmt(remaining)}
              </div>
              <div style={{ color: "var(--text3)", fontSize: 11, marginTop: 4 }}>
                {done ? `${targetHours}h complete` : `of ${targetHours}h remaining`}
              </div>
              <div style={{ color: "var(--text3)", fontSize: 10, marginTop: 2 }}>
                fasting {fmt(elapsed)}
              </div>
            </>
          ) : (
            <>
              <div style={{ color: "var(--text3)", fontSize: 13 }}>Ready</div>
              <div style={{ color: "var(--text3)", fontSize: 11, marginTop: 4 }}>{targetHours}h window</div>
            </>
          )}
        </div>

        <button
          onClick={startTime ? stop : start}
          style={{
            padding: "12px 40px", borderRadius: 24, border: "none", fontWeight: 700, fontSize: 15,
            background: startTime ? (done ? "#22c55e" : "rgba(239,68,68,0.1)") : "var(--green)",
            color: startTime ? (done ? "#fff" : "#ef4444") : "#fff",
            cursor: "pointer",
          }}
        >
          {startTime ? (done ? "Complete" : "Stop Fast") : "Start Fast"}
        </button>
      </div>

      {/* history */}
      {history.length > 0 && (
        <div>
          <div style={{ color: "var(--text3)", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>
            History
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {history.slice(0, 7).map((h, i) => (
              <div key={i} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                background: "var(--bg2)", border: "1px solid var(--border)",
                borderRadius: 10, padding: "10px 14px",
              }}>
                <span style={{ color: "var(--text3)", fontSize: 12 }}>{h.date}</span>
                <span style={{ color: "var(--text3)", fontSize: 11 }}>{h.mode}</span>
                <span style={{ color: "var(--green)", fontWeight: 700, fontSize: 13 }}>{h.hours}h</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
