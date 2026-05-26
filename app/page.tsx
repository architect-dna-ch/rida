"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

const SalahTab     = dynamic(() => import("@/components/salah/SalahTab"),         { ssr: false });
const NutritionTab = dynamic(() => import("@/components/nutrition/NutritionTab"), { ssr: false });
const FeatureTab   = dynamic(() => import("@/components/feature/FeatureTab"),     { ssr: false });
const SettingsTab  = dynamic(() => import("@/components/SettingsTab"),             { ssr: false });
const YawmTab      = dynamic(() => import("@/components/yawm/YawmTab"),           { ssr: false });

type Tab = "salah" | "nutrition" | "feature" | "yawm" | "settings";

const TABS: { id: Tab; label: string; arabic: string; icon: string; color: string }[] = [
  { id: "salah",     label: "Salah",     arabic: "صلاة",    icon: "🕌", color: "#00c9a7" },
  { id: "nutrition", label: "Ernährung", arabic: "تغذية",   icon: "🥗", color: "#34d399" },
  { id: "feature",   label: "Fast",      arabic: "صيام",    icon: "⏱",  color: "#60a5fa" },
  { id: "yawm",      label: "Yawm",      arabic: "يوم",     icon: "✦",  color: "#a78bfa" },
  { id: "settings",  label: "Einst.",    arabic: "إعدادات", icon: "⚙",  color: "#f472b6" },
];

export default function RidaApp() {
  const [tab, setTab] = useState<Tab>("salah");
  const [light, setLight] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("rida_theme");
    if (saved === "light") { setLight(true); document.documentElement.classList.add("light"); }
  }, []);

  const toggleTheme = () => {
    const next = !light;
    setLight(next);
    if (next) { document.documentElement.classList.add("light"); localStorage.setItem("rida_theme", "light"); }
    else       { document.documentElement.classList.remove("light"); localStorage.setItem("rida_theme", "dark"); }
  };

  const activeTab = TABS.find(t => t.id === tab)!;

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100dvh", background: "var(--bg)" }}>

      {/* Glass header */}
      <header style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(8,11,20,.88)",
        backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid var(--border)",
        padding: "0 18px", height: 52,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexShrink: 0,
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: "linear-gradient(135deg, #00c9a7, #a78bfa)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 14, flexShrink: 0,
          }}>
            ✦
          </div>
          <div>
            <span style={{ color: "var(--text)", fontWeight: 900, fontSize: 15, letterSpacing: "-.03em" }}>Rida</span>
            <span style={{ color: "var(--teal)", fontSize: 11, marginLeft: 6, fontWeight: 700, opacity: .7 }}>رِضا</span>
          </div>
        </div>

        {/* Right side */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{
            fontFamily: "var(--mono)", fontSize: 9, letterSpacing: ".18em",
            textTransform: "uppercase", color: "var(--text3)",
          }}>
            {activeTab.arabic}
          </span>
          <button onClick={toggleTheme} style={{
            background: "var(--bg3)", border: "1px solid var(--border2)",
            color: "var(--text2)", fontSize: 14, borderRadius: 20,
            padding: "4px 10px", cursor: "pointer",
          }}>
            {light ? "🌙" : "☀️"}
          </button>
        </div>
      </header>

      {/* Content */}
      <main style={{ flex: 1, overflow: "auto", paddingBottom: 68 }}>
        {tab === "salah"     && <SalahTab />}
        {tab === "nutrition" && <NutritionTab />}
        {tab === "feature"   && <FeatureTab />}
        {tab === "yawm"      && <YawmTab />}
        {tab === "settings"  && <SettingsTab />}
      </main>

      {/* Glass bottom nav */}
      <nav style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        background: "rgba(8,11,20,.92)",
        backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
        borderTop: "1px solid var(--border)",
        display: "flex", height: 64,
        paddingBottom: "env(safe-area-inset-bottom)",
        zIndex: 100,
      }}>
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              flex: 1, display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              gap: 3, border: "none", background: "transparent", cursor: "pointer",
              position: "relative",
              transition: "opacity .15s",
              opacity: tab === t.id ? 1 : .55,
            }}
          >
            {/* Active glow dot */}
            {tab === t.id && (
              <div style={{
                position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
                width: 28, height: 2, borderRadius: 2,
                background: `linear-gradient(90deg, ${t.color}00, ${t.color}, ${t.color}00)`,
              }} />
            )}
            <span style={{ fontSize: 19, lineHeight: 1 }}>{t.icon}</span>
            <span style={{
              fontFamily: "var(--mono)", fontSize: 8, letterSpacing: ".1em",
              textTransform: "uppercase", fontWeight: 700,
              color: tab === t.id ? t.color : "var(--text3)",
              transition: "color .15s",
            }}>
              {t.label}
            </span>
          </button>
        ))}
      </nav>
    </div>
  );
}
