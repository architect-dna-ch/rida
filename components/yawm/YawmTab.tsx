"use client";
import { useState, useEffect } from "react";

interface MorningBrief {
  focus: string;
  reach: string;
  ayah: { arabic: string; translation: string; reference: string };
}

interface EveningBrief {
  insight: string;
}

function getHour() { return new Date().getHours(); }
function isEvening() { const h = getHour(); return h >= 18; }

function getContext() {
  const city    = localStorage.getItem("rida_city") || "";
  const country = localStorage.getItem("rida_country") || "";
  const fasts   = JSON.parse(localStorage.getItem("rida_fast_history") || "[]");
  const settings = JSON.parse(localStorage.getItem("rida_settings") || "{}");
  return { city, country, recentFasts: fasts.slice(-7).length, settings };
}

function getWeekContext() {
  const fasts = JSON.parse(localStorage.getItem("rida_fast_history") || "[]");
  return { fastsThisWeek: fasts.slice(-7).length };
}

export default function YawmTab() {
  const [mode, setMode]               = useState<"morning" | "evening">(isEvening() ? "evening" : "morning");
  const [morning, setMorning]         = useState<MorningBrief | null>(null);
  const [evening, setEvening]         = useState<EveningBrief | null>(null);
  const [loading, setLoading]         = useState(false);
  const [wins, setWins]               = useState(["", "", ""]);
  const [winsSubmitted, setWinsSubmitted] = useState(false);
  const [error, setError]             = useState("");

  // load cached brief
  useEffect(() => {
    const today = new Date().toDateString();
    const cached = localStorage.getItem(`rida_brief_${mode}_${today}`);
    if (cached) {
      if (mode === "morning") setMorning(JSON.parse(cached));
      else setEvening(JSON.parse(cached));
    }
    const savedWins = localStorage.getItem(`rida_wins_${today}`);
    if (savedWins) { setWins(JSON.parse(savedWins)); setWinsSubmitted(true); }
  }, [mode]);

  async function fetchMorning() {
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "morning", context: getContext() }),
      });
      const data: MorningBrief = await res.json();
      setMorning(data);
      localStorage.setItem(`rida_brief_morning_${new Date().toDateString()}`, JSON.stringify(data));
    } catch { setError("Could not load brief. Try again."); }
    setLoading(false);
  }

  async function fetchEvening() {
    const filled = wins.filter(w => w.trim());
    if (filled.length < 1) return;
    setLoading(true); setError("");
    const today = new Date().toDateString();
    localStorage.setItem(`rida_wins_${today}`, JSON.stringify(wins));
    try {
      const res = await fetch("/api/brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "evening", context: { wins: filled, week: getWeekContext() } }),
      });
      const data: EveningBrief = await res.json();
      setEvening(data);
      setWinsSubmitted(true);
      localStorage.setItem(`rida_brief_evening_${today}`, JSON.stringify(data));
    } catch { setError("Could not load reflection. Try again."); }
    setLoading(false);
  }

  const teal   = "#00c9a7";
  const violet = "#a78bfa";

  return (
    <div style={{ padding: "16px 16px 32px", maxWidth: 520, margin: "0 auto" }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ color: "var(--text3)", fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 6 }}>
          Yawm · يوم
        </div>
        <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: "-.03em", color: "var(--text)" }}>
          {mode === "morning" ? "Sabah خير" : "Good Evening"}
        </div>
        <div style={{ fontSize: 13, color: "var(--text3)", marginTop: 2 }}>
          {mode === "morning" ? "Your day, grounded." : "Close your day with intention."}
        </div>
      </div>

      {/* Mode toggle */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {(["morning", "evening"] as const).map(m => (
          <button key={m} onClick={() => setMode(m)} style={{
            flex: 1, padding: "10px 0", borderRadius: 12, fontSize: 13, fontWeight: 700,
            background: mode === m ? (m === "morning" ? `${teal}22` : `${violet}22`) : "var(--bg2)",
            border: `1px solid ${mode === m ? (m === "morning" ? `${teal}55` : `${violet}55`) : "var(--border)"}`,
            color: mode === m ? (m === "morning" ? teal : violet) : "var(--text3)",
            cursor: "pointer",
          }}>
            {m === "morning" ? "☀️ Morning" : "🌙 Evening"}
          </button>
        ))}
      </div>

      {/* ── MORNING ── */}
      {mode === "morning" && (
        <>
          {!morning ? (
            <button onClick={fetchMorning} disabled={loading} style={{
              width: "100%", padding: "18px 0", borderRadius: 16, fontSize: 15, fontWeight: 800,
              background: `linear-gradient(135deg, ${teal}33, ${violet}22)`,
              border: `1px solid ${teal}44`, color: teal, cursor: "pointer",
            }}>
              {loading ? "Loading…" : "✦ Get my morning brief"}
            </button>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {/* Focus */}
              <div style={{ background: "var(--bg2)", border: `1px solid ${teal}33`, borderRadius: 16, padding: 18 }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".15em", textTransform: "uppercase", color: teal, marginBottom: 8 }}>Focus</div>
                <div style={{ fontSize: 15, color: "var(--text)", lineHeight: 1.6 }}>{morning.focus}</div>
              </div>
              {/* Reach */}
              <div style={{ background: "var(--bg2)", border: `1px solid ${violet}33`, borderRadius: 16, padding: 18 }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".15em", textTransform: "uppercase", color: violet, marginBottom: 8 }}>Reach out</div>
                <div style={{ fontSize: 15, color: "var(--text)", lineHeight: 1.6 }}>{morning.reach}</div>
              </div>
              {/* Ayah */}
              {morning.ayah && (
                <div style={{ background: "var(--bg2)", border: "1px solid var(--border2)", borderRadius: 16, padding: 18, textAlign: "center" }}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: "var(--text)", lineHeight: 1.7, marginBottom: 8, fontFamily: "serif", direction: "rtl" }}>
                    {morning.ayah.arabic}
                  </div>
                  <div style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.6, fontStyle: "italic", marginBottom: 6 }}>
                    "{morning.ayah.translation}"
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text3)", letterSpacing: ".1em" }}>— {morning.ayah.reference}</div>
                </div>
              )}
              <button onClick={() => { setMorning(null); localStorage.removeItem(`rida_brief_morning_${new Date().toDateString()}`); }}
                style={{ background: "none", border: "none", color: "var(--text3)", fontSize: 12, cursor: "pointer", padding: "4px 0" }}>
                Refresh ↺
              </button>
            </div>
          )}
        </>
      )}

      {/* ── EVENING ── */}
      {mode === "evening" && (
        <>
          {!winsSubmitted ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ fontSize: 13, color: "var(--text2)", marginBottom: 4 }}>3 wins from today — big or small:</div>
              {wins.map((w, i) => (
                <input key={i} value={w} onChange={e => { const n = [...wins]; n[i] = e.target.value; setWins(n); }}
                  placeholder={["Something you did", "Something you felt", "Something you noticed"][i]}
                  style={{ background: "var(--bg2)", border: "1px solid var(--border2)", borderRadius: 12, padding: "12px 14px", fontSize: 14, color: "var(--text)", width: "100%", outline: "none" }}
                />
              ))}
              <button onClick={fetchEvening} disabled={loading || wins.every(w => !w.trim())} style={{
                width: "100%", padding: "16px 0", borderRadius: 16, fontSize: 15, fontWeight: 800,
                background: `linear-gradient(135deg, ${violet}33, ${teal}22)`,
                border: `1px solid ${violet}44`, color: violet, cursor: "pointer", marginTop: 4,
              }}>
                {loading ? "Reflecting…" : "✦ Close my day"}
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {evening && (
                <div style={{ background: "var(--bg2)", border: `1px solid ${violet}33`, borderRadius: 16, padding: 20 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".15em", textTransform: "uppercase", color: violet, marginBottom: 10 }}>Your reflection</div>
                  <div style={{ fontSize: 15, color: "var(--text)", lineHeight: 1.75 }}>{evening.insight}</div>
                </div>
              )}
              <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 16, padding: 16 }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".15em", textTransform: "uppercase", color: "var(--text3)", marginBottom: 10 }}>Today's wins</div>
                {wins.filter(w => w.trim()).map((w, i) => (
                  <div key={i} style={{ fontSize: 14, color: "var(--text2)", padding: "6px 0", borderBottom: i < wins.filter(w=>w.trim()).length-1 ? "1px solid var(--border)" : "none" }}>
                    ✓ {w}
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 11, color: "var(--text3)", textAlign: "center", marginTop: 4 }}>
                Stored locally · never sent anywhere
              </div>
            </div>
          )}
        </>
      )}

      {error && <div style={{ color: "#e05050", fontSize: 13, marginTop: 12 }}>{error}</div>}
    </div>
  );
}
