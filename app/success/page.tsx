"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { getSettings, saveSettings } from "@/lib/db";

function SuccessContent() {
  const params = useSearchParams();
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");

  useEffect(() => {
    const sessionId = params.get("session_id");
    if (!sessionId) { setStatus("error"); return; }

    fetch("/api/verify-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    })
      .then(r => r.json())
      .then(async ({ token }) => {
        if (!token) throw new Error("no token");
        const s = await getSettings();
        await saveSettings({ ...s, plan: "pro", proToken: token });
        setStatus("ok");
      })
      .catch(() => setStatus("error"));
  }, [params]);

  return (
    <div style={{ background: "var(--bg)", minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font)", padding: 24, textAlign: "center" }}>
      {status === "loading" && <p style={{ color: "var(--text3)" }}>Abo wird aktiviert…</p>}
      {status === "ok" && (
        <div>
          <div style={{ fontSize: 48, marginBottom: 16 }}>✓</div>
          <h1 style={{ color: "var(--green)", fontSize: 20, marginBottom: 8 }}>Rida Pro freigeschaltet!</h1>
          <p style={{ color: "var(--text2)", fontSize: 13, marginBottom: 24 }}>Rida Pro ist jetzt aktiv. Alle Modi freigeschaltet.</p>
          <a href="/" style={{ background: "#14532d", border: "1px solid var(--green)", color: "var(--green)", padding: "10px 24px", borderRadius: 4, fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
            Zur App →
          </a>
        </div>
      )}
      {status === "error" && (
        <div>
          <p style={{ color: "var(--text2)", marginBottom: 16 }}>Etwas ist schiefgelaufen. Bitte kontaktiere uns.</p>
          <a href="/" style={{ color: "var(--green)", fontSize: 13 }}>← Zurück</a>
        </div>
      )}
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div style={{ color: "var(--text3)", padding: 40 }}>Laden…</div>}>
      <SuccessContent />
    </Suspense>
  );
}
