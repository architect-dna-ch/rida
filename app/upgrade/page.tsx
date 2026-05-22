"use client";
import { useState } from "react";

export default function UpgradePage() {
  const [loading, setLoading] = useState<"pro" | "refill" | null>(null);

  const checkout = async (type: "pro" | "refill") => {
    setLoading(type);
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type }),
    });
    const { url } = await res.json();
    if (url) window.location.href = url;
    else setLoading(null);
  };

  return (
    <div style={{ background: "var(--bg)", minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font)", padding: 24 }}>
      <div style={{ maxWidth: 400, width: "100%" }}>
        <a href="/" style={{ color: "var(--text3)", fontSize: 11, textDecoration: "none", display: "block", marginBottom: 24 }}>← Zurück zur App</a>
        <h1 style={{ color: "var(--text)", fontSize: 22, fontWeight: 700, marginBottom: 32 }}>Rida Pro</h1>

        {/* Pro one-time */}
        <div style={{ background: "var(--bg3)", border: "1px solid var(--green)", borderRadius: 8, padding: 20, marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 12 }}>
            <span style={{ color: "var(--text)", fontSize: 28, fontWeight: 700 }}>CHF 2.–</span>
            <span style={{ color: "var(--text3)", fontSize: 12 }}>einmalig</span>
          </div>
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }}>
            {["Alle Fasten-Modi (20:4, 5:2, Sunnah, Custom)", "Fasten-History Export (CSV)", "Kein Abo, keine Verlängerung"].map(f => (
              <li key={f} style={{ display: "flex", gap: 8 }}>
                <span style={{ color: "var(--green)" }}>✓</span>
                <span style={{ color: "var(--text2)", fontSize: 12 }}>{f}</span>
              </li>
            ))}
          </ul>
          <button onClick={() => checkout("pro")} disabled={!!loading}
            style={{ width: "100%", background: "#14532d", border: "1px solid var(--green)", color: "var(--green)", padding: "12px 0", fontSize: 13, fontWeight: 700, borderRadius: 4, cursor: loading ? "wait" : "pointer" }}>
            {loading === "pro" ? "Wird geladen…" : "Einmalig freischalten → CHF 2.–"}
          </button>
        </div>

        {/* AI Refill monthly */}
        <div style={{ background: "var(--bg3)", border: "1px solid var(--border2)", borderRadius: 8, padding: 20, marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 12 }}>
            <span style={{ color: "var(--text)", fontSize: 28, fontWeight: 700 }}>CHF 1.49</span>
            <span style={{ color: "var(--text3)", fontSize: 12 }}>/Monat</span>
          </div>
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }}>
            {["Unbegrenzte AI-Scans (Halal-Lebensmittel)", "30 Tage gültig, jederzeit kündbar", "Ernährungshistorie ohne Limit"].map(f => (
              <li key={f} style={{ display: "flex", gap: 8 }}>
                <span style={{ color: "var(--amber)" }}>✓</span>
                <span style={{ color: "var(--text2)", fontSize: 12 }}>{f}</span>
              </li>
            ))}
          </ul>
          <button onClick={() => checkout("refill")} disabled={!!loading}
            style={{ width: "100%", background: "var(--bg2)", border: "1px solid var(--border2)", color: "var(--text)", padding: "12px 0", fontSize: 13, fontWeight: 700, borderRadius: 4, cursor: loading ? "wait" : "pointer" }}>
            {loading === "refill" ? "Wird geladen…" : "AI Refill abonnieren → CHF 1.49/Mo"}
          </button>
        </div>

        <p style={{ color: "var(--text3)", fontSize: 10, textAlign: "center", lineHeight: 1.6 }}>
          Zahlung über Stripe · SSL-verschlüsselt · Jederzeit kündbar
        </p>
      </div>
    </div>
  );
}
