"use client";
import { useState } from "react";

export default function UpgradePage() {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    const email = prompt("Deine E-Mail-Adresse (für Abo-Verwaltung):");
    if (!email) { setLoading(false); return; }
    const res = await fetch("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
    const { url } = await res.json();
    if (url) window.location.href = url;
    else setLoading(false);
  };

  return (
    <div style={{ background: "var(--bg)", minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font)", padding: 24 }}>
      <div style={{ maxWidth: 400, width: "100%" }}>
        <a href="/" style={{ color: "var(--text3)", fontSize: 11, textDecoration: "none", display: "block", marginBottom: 24 }}>← Zurück zur App</a>

        <h1 style={{ color: "var(--text)", fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Rida Pro</h1>
        <p style={{ color: "var(--text3)", fontSize: 11, letterSpacing: "0.1em", marginBottom: 32 }}>MUSLIM ECOSYSTEM · VOLLVERSION</p>

        <div style={{ background: "var(--bg3)", border: "1px solid var(--green)", borderRadius: 8, padding: 24, marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 16 }}>
            <span style={{ color: "var(--text)", fontSize: 32, fontWeight: 700 }}>CHF 3.95</span>
            <span style={{ color: "var(--text3)", fontSize: 13 }}>/Monat</span>
          </div>
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              "Unbegrenzte AI-Scans (Halal-Lebensmittel erkennen)",
              "Vollständige Ernährungshistorie",
              "Salah-Planer für beliebige Städte",
              "Dhikr & Hifz Tracker",
              "Offline-fähig als App (PWA)",
              "Kein Tracking, keine Werbung",
            ].map(f => (
              <li key={f} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <span style={{ color: "var(--green)", marginTop: 1 }}>✓</span>
                <span style={{ color: "var(--text2)", fontSize: 13 }}>{f}</span>
              </li>
            ))}
          </ul>
        </div>

        <button onClick={handleCheckout} disabled={loading}
          style={{ width: "100%", background: "#14532d", border: "1px solid var(--green)", color: "var(--green)", padding: "14px 0", fontSize: 14, fontWeight: 700, borderRadius: 6, cursor: loading ? "wait" : "pointer", letterSpacing: "0.05em" }}>
          {loading ? "Wird geladen…" : "Jetzt abonnieren →"}
        </button>

        <p style={{ color: "var(--text3)", fontSize: 10, textAlign: "center", marginTop: 12, lineHeight: 1.6 }}>
          Zahlung über Stripe · SSL-verschlüsselt · Jederzeit kündbar
        </p>
      </div>
    </div>
  );
}
