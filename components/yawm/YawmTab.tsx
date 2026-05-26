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

function isEvening() { const h = new Date().getHours(); return h >= 18; }

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
  const [mode, setMode]                   = useState<"morning" | "evening">(isEvening() ? "evening" : "morning");
  const [morning, setMorning]             = useState<MorningBrief | null>(null);
  const [evening, setEvening]             = useState<EveningBrief | null>(null);
  const [loading, setLoading]             = useState(false);
  const [wins, setWins]                   = useState(["", "", ""]);
  const [winsSubmitted, setWinsSubmitted] = useState(false);
  const [error, setError]                 = useState("");

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
      const data = await res.json();
      if (data.error) { setError(`API error: ${data.error}`); setLoading(false); return; }
      setMorning(data as MorningBrief);
      localStorage.setItem(`rida_brief_morning_${new Date().toDateString()}`, JSON.stringify(data));
    } catch (e) { setError(`Could not load brief: ${e}`); }
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
      const data = await res.json();
      if (data.error) { setError(`API error: ${data.error}`); setLoading(false); return; }
      setEvening(data as EveningBrief);
      setWinsSubmitted(true);
      localStorage.setItem(`rida_brief_evening_${today}`, JSON.stringify(data));
    } catch (e) { setError(`Could not load reflection: ${e}`); }
    setLoading(false);
  }

  return (
    <div style={{ padding: "20px 16px 40px", maxWidth: 520, margin: "0 auto" }}>

      {/* Hero header */}
      <div style={{ marginBottom: 28, position: "relative" }}>
        {/* Ambient glow */}
        <div style={{
          position: "absolute", top: -20, right: -20, width: 180, height: 180,
          background: mode === "morning"
            ? "radial-gradient(circle, rgba(0,201,167,.12) 0%, transparent 70%)"
            : "radial-gradient(circle, rgba(167,139,250,.12) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        <div style={{
          fontFamily: "var(--mono)", fontSize: 10, fontWeight: 700, letterSpacing: ".18em",
          textTransform: "uppercase", color: "var(--text3)", marginBottom: 10,
          display: "flex", alignItems: "center", gap: 10,
        }}>
          Yawm · يوم
          <span style={{ flex: 1, height: 1, background: "var(--border)", display: "block" }} />
        </div>
        <div style={{ fontSize: 26, fontWeight: 900, letterSpacing: "-.03em", color: "var(--text)", marginBottom: 4 }}>
          {mode === "morning" ? "Sabah خير" : "Good Evening"}
        </div>
        <div style={{ fontSize: 13, color: "var(--text2)" }}>
          {mode === "morning" ? "Your day, grounded." : "Close your day with intention."}
        </div>
      </div>

      {/* Mode toggle */}
      <div style={{ display: "flex", gap: 8, marginBottom: 28, background: "var(--bg2)", borderRadius: 14, padding: 4, border: "1px solid var(--border)" }}>
        {(["morning", "evening"] as const).map(m => (
          <button key={m} onClick={() => setMode(m)} style={{
            flex: 1, padding: "9px 0", borderRadius: 10, fontSize: 13, fontWeight: 700,
            background: mode === m
              ? (m === "morning" ? "rgba(0,201,167,.15)" : "rgba(167,139,250,.15)")
              : "transparent",
            border: mode === m
              ? `1px solid ${m === "morning" ? "rgba(0,201,167,.35)" : "rgba(167,139,250,.35)"}`
              : "1px solid transparent",
            color: mode === m
              ? (m === "morning" ? "var(--teal)" : "var(--violet)")
              : "var(--text3)",
            cursor: "pointer",
            transition: "all .2s",
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
              width: "100%", padding: "20px 0", borderRadius: 18, fontSize: 15, fontWeight: 800,
              background: "linear-gradient(135deg, rgba(0,201,167,.12), rgba(167,139,250,.08))",
              border: "1px solid rgba(0,201,167,.25)", color: "var(--teal)", cursor: "pointer",
              transition: "all .2s",
            }}>
              {loading ? (
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                  <span style={{ width: 14, height: 14, border: "2px solid rgba(0,201,167,.3)", borderTopColor: "var(--teal)", borderRadius: "50%", display: "inline-block", animation: "spin .7s linear infinite" }} />
                  Loading…
                </span>
              ) : "✦ Get my morning brief"}
            </button>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

              {/* Focus card */}
              <div style={{
                background: "linear-gradient(135deg, rgba(0,201,167,.06), rgba(0,201,167,.02))",
                border: "1px solid rgba(0,201,167,.2)", borderRadius: 18, padding: 20,
              }}>
                <div style={{ fontFamily: "var(--mono)", fontSize: 10, fontWeight: 700, letterSpacing: ".15em", textTransform: "uppercase", color: "var(--teal)", marginBottom: 10 }}>Focus</div>
                <div style={{ fontSize: 15, color: "var(--text)", lineHeight: 1.7 }}>{morning.focus}</div>
              </div>

              {/* Reach card */}
              <div style={{
                background: "linear-gradient(135deg, rgba(167,139,250,.06), rgba(167,139,250,.02))",
                border: "1px solid rgba(167,139,250,.2)", borderRadius: 18, padding: 20,
              }}>
                <div style={{ fontFamily: "var(--mono)", fontSize: 10, fontWeight: 700, letterSpacing: ".15em", textTransform: "uppercase", color: "var(--violet)", marginBottom: 10 }}>Reach out</div>
                <div style={{ fontSize: 15, color: "var(--text)", lineHeight: 1.7 }}>{morning.reach}</div>
              </div>

              {/* Ayah card */}
              {morning.ayah && (
                <div style={{
                  background: "var(--bg2)", border: "1px solid var(--border2)",
                  borderRadius: 18, padding: 22, textAlign: "center",
                  position: "relative", overflow: "hidden",
                }}>
                  {/* subtle radial glow */}
                  <div style={{
                    position: "absolute", inset: 0,
                    background: "radial-gradient(ellipse at center, rgba(251,191,36,.04) 0%, transparent 70%)",
                    pointerEvents: "none",
                  }} />
                  <div style={{ fontSize: 22, fontWeight: 700, color: "var(--text)", lineHeight: 1.8, marginBottom: 10, fontFamily: "Georgia, serif", direction: "rtl" }}>
                    {morning.ayah.arabic}
                  </div>
                  <div style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.65, fontStyle: "italic", marginBottom: 8 }}>
                    "{morning.ayah.translation}"
                  </div>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--amber)", letterSpacing: ".1em" }}>
                    — {morning.ayah.reference}
                  </div>
                </div>
              )}

              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => { setMorning(null); localStorage.removeItem(`rida_brief_morning_${new Date().toDateString()}`); }}
                  style={{ flex: 1, background: "none", border: "none", color: "var(--text3)", fontSize: 12, cursor: "pointer", padding: "4px 0", textAlign: "center" }}>
                  Refresh ↺
                </button>
                {morning.ayah && (
                  <button
                    onClick={async () => {
                      const text = `${morning.ayah.arabic}\n\n"${morning.ayah.translation}"\n— ${morning.ayah.reference}\n\nrida.architect-dna.ch`;
                      await fetch("/api/tweet", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text }) });
                      if (navigator.share) navigator.share({ text });
                      else { navigator.clipboard.writeText(text); alert("Posted & copied!"); }
                    }}
                    style={{
                      flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                      background: "none", border: "1px solid var(--border)", borderRadius: 10,
                      color: "var(--text3)", fontSize: 12, fontWeight: 700,
                      padding: "6px 0", cursor: "pointer", transition: "all .15s",
                    }}
                  >
                    ↑ Share ayah
                  </button>
                )}
              </div>
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
                <input
                  key={i} value={w}
                  onChange={e => { const n = [...wins]; n[i] = e.target.value; setWins(n); }}
                  placeholder={["Something you did", "Something you felt", "Something you noticed"][i]}
                  style={{
                    background: "var(--bg2)", border: "1px solid var(--border2)",
                    borderRadius: 12, padding: "13px 16px", fontSize: 14,
                    color: "var(--text)", width: "100%", outline: "none",
                    transition: "border-color .2s",
                  }}
                />
              ))}
              <button
                onClick={fetchEvening}
                disabled={loading || wins.every(w => !w.trim())}
                style={{
                  width: "100%", padding: "18px 0", borderRadius: 18, fontSize: 15, fontWeight: 800,
                  background: "linear-gradient(135deg, rgba(167,139,250,.12), rgba(0,201,167,.08))",
                  border: "1px solid rgba(167,139,250,.25)", color: "var(--violet)",
                  cursor: "pointer", marginTop: 4, transition: "all .2s",
                }}>
                {loading ? "Reflecting…" : "✦ Close my day"}
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {evening && (
                <div style={{
                  background: "linear-gradient(135deg, rgba(167,139,250,.08), rgba(0,201,167,.04))",
                  border: "1px solid rgba(167,139,250,.22)", borderRadius: 18, padding: 22,
                }}>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 10, fontWeight: 700, letterSpacing: ".15em", textTransform: "uppercase", color: "var(--violet)", marginBottom: 12 }}>Your reflection</div>
                  <div style={{ fontSize: 15, color: "var(--text)", lineHeight: 1.8 }}>{evening.insight}</div>
                </div>
              )}
              <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 16, padding: 16 }}>
                <div style={{ fontFamily: "var(--mono)", fontSize: 10, fontWeight: 700, letterSpacing: ".15em", textTransform: "uppercase", color: "var(--text3)", marginBottom: 10 }}>Today's wins</div>
                {wins.filter(w => w.trim()).map((w, i) => (
                  <div key={i} style={{
                    fontSize: 14, color: "var(--text2)", padding: "8px 0",
                    borderBottom: i < wins.filter(w => w.trim()).length - 1 ? "1px solid var(--border)" : "none",
                    display: "flex", gap: 10, alignItems: "flex-start",
                  }}>
                    <span style={{ color: "var(--teal)", marginTop: 1 }}>✓</span>
                    <span>{w}</span>
                  </div>
                ))}
              </div>
              <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--text3)", textAlign: "center", marginTop: 4, letterSpacing: ".1em" }}>
                STORED LOCALLY · NEVER SENT ANYWHERE
              </div>
            </div>
          )}
        </>
      )}

      {error && <div style={{ color: "#f87171", fontSize: 13, marginTop: 14 }}>{error}</div>}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
