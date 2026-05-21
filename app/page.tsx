"use client";
import { useState } from "react";
import dynamic from "next/dynamic";

const SalahTab     = dynamic(() => import("@/components/salah/SalahTab"),         { ssr: false });
const NutritionTab = dynamic(() => import("@/components/nutrition/NutritionTab"), { ssr: false });
const FeatureTab   = dynamic(() => import("@/components/feature/FeatureTab"),     { ssr: false });
const SettingsTab  = dynamic(() => import("@/components/SettingsTab"),             { ssr: false });

type Tab = "salah" | "nutrition" | "feature" | "settings";

const TABS: { id: Tab; label: string; arabic: string; icon: string }[] = [
  { id: "salah",     label: "Salah",     arabic: "صلاة",    icon: "🕌" },
  { id: "nutrition", label: "Ernährung", arabic: "تغذية",   icon: "🥗" },
  { id: "feature",   label: "Fast",      arabic: "صيام",    icon: "⏱" },
  { id: "settings",  label: "Einst.",    arabic: "إعدادات", icon: "⚙" },
];

export default function RidaApp() {
  const [tab, setTab] = useState<Tab>("salah");

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100dvh", background: "var(--bg)" }}>
      <header style={{ background: "var(--bg2)", borderBottom: "1px solid var(--border)", padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
        <div>
          <span style={{ color: "var(--text)", fontWeight: 700, fontSize: 15, letterSpacing: "-0.02em" }}>Rida</span>
          <span style={{ color: "var(--text3)", fontSize: 11, marginLeft: 10 }}>رِضا · Muslim Ecosystem</span>
        </div>
        <span style={{ color: "var(--text3)", fontSize: 10, letterSpacing: "0.1em" }}>
          {TABS.find(t => t.id === tab)?.arabic}
        </span>
      </header>

      <main style={{ flex: 1, overflow: "auto", paddingBottom: 64 }}>
        {tab === "salah"     && <SalahTab />}
        {tab === "nutrition" && <NutritionTab />}
        {tab === "feature"   && <FeatureTab />}
        {tab === "settings"  && <SettingsTab />}
      </main>

      <nav style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        background: "var(--bg2)", borderTop: "1px solid var(--border)",
        display: "flex", height: 60,
        zIndex: 100,
      }}>
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              gap: 2, border: "none", background: "transparent", cursor: "pointer",
              borderTop: tab === t.id ? "2px solid var(--green)" : "2px solid transparent",
              transition: "border-color 0.15s",
            }}
          >
            <span style={{ fontSize: 18 }}>{t.icon}</span>
            <span style={{ fontSize: 9, letterSpacing: "0.08em", color: tab === t.id ? "var(--green)" : "var(--text3)", textTransform: "uppercase" }}>
              {t.label}
            </span>
          </button>
        ))}
      </nav>
    </div>
  );
}
