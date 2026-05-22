"use client";
import { useEffect, useState } from "react";
import { getSettings, saveSettings } from "@/lib/db";
import type { AppSettings } from "@/lib/types";
import { DEFAULT_SETTINGS } from "@/lib/types";
import { apiUrl } from "@/lib/api";

export default function SettingsTab() {
  const [s, setS]           = useState<AppSettings>(DEFAULT_SETTINGS);
  const [saved, setSaved]   = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSettings().then(v => { setS(v); setLoading(false); });
  }, []);

  const save = async (patch: Partial<AppSettings>) => {
    const next = { ...s, ...patch };
    setS(next);
    await saveSettings(next);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const handleUpgrade = async () => {
    const email = s.name ? undefined : prompt("Deine E-Mail-Adresse?") ?? undefined;
    const res = await fetch(apiUrl("/api/checkout"), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
    const { url } = await res.json();
    if (url) window.location.href = url;
  };

  if (loading) return <div style={{ color: "var(--text3)", padding: 40, textAlign: "center", fontSize: 12 }}>Wird geladen…</div>;

  return (
    <div style={{ padding: 16, maxWidth: 480, margin: "0 auto" }}>
      <div style={{ color: "var(--text3)", fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 16 }}>Einstellungen</div>

      {/* Plan status */}
      <section style={{ background: "var(--bg3)", border: `1px solid ${s.plan === "pro" ? "#22c55e55" : "var(--border)"}`, borderRadius: 6, padding: 16, marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <span style={{ color: "var(--text3)", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase" }}>Abo</span>
          <span style={{ background: s.plan === "pro" ? "#14532d" : "var(--bg2)", border: `1px solid ${s.plan === "pro" ? "var(--green)" : "var(--border)"}`, color: s.plan === "pro" ? "var(--green)" : "var(--text3)", fontSize: 10, padding: "2px 8px", borderRadius: 3, letterSpacing: "0.1em" }}>
            {s.plan === "pro" ? "PRO" : "FREE"}
          </span>
        </div>
        {s.plan === "free" ? (
          <>
            <p style={{ color: "var(--text2)", fontSize: 12, marginBottom: 12, lineHeight: 1.6 }}>
              Upgrade für alle Fasten-Modi (20:4, 5:2, Sunnah, Custom) + History-Export.
            </p>
            <button onClick={handleUpgrade}
              style={{ width: "100%", background: "#14532d", border: "1px solid var(--green)", color: "var(--green)", padding: "10px 0", fontSize: 13, fontWeight: 700, borderRadius: 4, cursor: "pointer" }}>
              Pro für CHF 2.– (einmalig) →
            </button>
          </>
        ) : (
          <p style={{ color: "var(--green)", fontSize: 12 }}>✓ Alle Fasten-Modi freigeschaltet</p>
        )}
      </section>

      {/* Name */}
      <section style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 6, padding: 16, marginBottom: 12 }}>
        <label style={{ color: "var(--text3)", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: 8 }}>Name</label>
        <input value={s.name} onChange={e => setS(p => ({ ...p, name: e.target.value }))} onBlur={() => save({ name: s.name })}
          placeholder="Dein Name"
          style={{ width: "100%", background: "var(--bg2)", border: "1px solid var(--border2)", color: "var(--text)", padding: "8px 12px", fontSize: 12, borderRadius: 3 }} />
      </section>

      {/* Kalorienziel */}
      <section style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 6, padding: 16, marginBottom: 12 }}>
        <div style={{ color: "var(--text3)", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>Tägliche Ziele</div>
        {[
          { label: "Kalorien (kcal)", key: "calories" as const, color: "var(--green)" },
          { label: "Protein (g)",     key: "protein"  as const, color: "#4f6fa8" },
          { label: "Kohlenhydrate (g)", key: "carbs"  as const, color: "#e8a44a" },
          { label: "Fett (g)",        key: "fat"      as const, color: "#9b4a82" },
        ].map(({ label, key, color }) => (
          <div key={key} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <span style={{ color: "var(--text2)", fontSize: 11, width: 150 }}>{label}</span>
            <input type="number" value={s.goals[key]}
              onChange={e => setS(p => ({ ...p, goals: { ...p.goals, [key]: Number(e.target.value) } }))}
              onBlur={() => save({ goals: s.goals })}
              style={{ background: "var(--bg2)", border: `1px solid ${color}55`, color, padding: "4px 8px", fontSize: 12, borderRadius: 3, width: 80, textAlign: "right" }} />
          </div>
        ))}
      </section>

      {/* Pro token redemption */}
      {s.plan === "free" && (
        <section style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 6, padding: 16, marginBottom: 12 }}>
          <label style={{ color: "var(--text3)", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: 8 }}>Pro-Token eingeben</label>
          <input value={s.proToken} onChange={e => setS(p => ({ ...p, proToken: e.target.value }))} onBlur={() => save({ proToken: s.proToken })}
            placeholder="Token aus Bestätigungs-E-Mail"
            style={{ width: "100%", background: "var(--bg2)", border: "1px solid var(--border2)", color: "var(--text)", padding: "8px 12px", fontSize: 12, borderRadius: 3 }} />
        </section>
      )}

      {saved && (
        <div style={{ color: "var(--green)", fontSize: 11, textAlign: "center", marginTop: 8 }}>✓ Gespeichert</div>
      )}

      <div style={{ color: "var(--text3)", fontSize: 10, textAlign: "center", marginTop: 24 }}>
        Rida · rida.architect-dna.ch · © 2026
      </div>
    </div>
  );
}
