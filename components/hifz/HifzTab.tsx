"use client";
import HifzTracker from "./HifzTracker";

export default function HifzTab() {
  return (
    <div style={{ padding: 16, maxWidth: 520, margin: "0 auto" }}>
      <div style={{ color: "var(--text3)", fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 12 }}>
        Hifz · حفظ القرآن
      </div>
      <HifzTracker />
    </div>
  );
}
