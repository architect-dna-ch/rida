"use client";
import DhikrCounter from "./DhikrCounter";

export default function DhikrTab() {
  return (
    <div style={{ padding: "20px 16px 40px", maxWidth: 520, margin: "0 auto" }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontFamily: "var(--mono)", fontSize: 10, fontWeight: 700, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--text3)", marginBottom: 10, display: "flex", alignItems: "center", gap: 10 }}>
          Dhikr · ذكر
          <span style={{ flex: 1, height: 1, background: "var(--border)", display: "block" }} />
        </div>
        <div style={{ fontSize: 24, fontWeight: 900, letterSpacing: "-.03em", color: "var(--text)", marginBottom: 4 }}>
          ذِكْرُ ٱللَّٰهِ
        </div>
        <div style={{ fontSize: 13, color: "var(--text2)" }}>Tap to count. Resets at midnight.</div>
      </div>
      <DhikrCounter />
    </div>
  );
}
