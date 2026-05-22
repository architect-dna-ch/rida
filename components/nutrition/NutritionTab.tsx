"use client";
import { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { nanoid } from "nanoid";
import { getMealsForDay, deleteMeal, addMeal, sumMacros, getSettings, saveSettings, todayISO } from "@/lib/db";
import type { Meal, AppSettings, FoodSearchResult, DietaryTag } from "@/lib/types";
import { DEFAULT_SETTINGS, FREE_SCAN_LIMIT } from "@/lib/types";

const MacroRing  = dynamic(() => import("./MacroRing"),  { ssr: false });
const MealCard   = dynamic(() => import("./MealCard"),   { ssr: false });
const AIScanner  = dynamic(() => import("./AIScanner"),  { ssr: false });
const FoodSearch = dynamic(() => import("./FoodSearch"), { ssr: false });

type View = "dashboard" | "scan" | "search";

export default function NutritionTab() {
  const [meals, setMeals]       = useState<Meal[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [view, setView]         = useState<View>("dashboard");
  const [loading, setLoading]   = useState(true);

  const load = useCallback(async () => {
    const [m, s] = await Promise.all([getMealsForDay(new Date()), getSettings()]);
    setMeals(m);
    setSettings(s);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id: string) => {
    await deleteMeal(id);
    load();
  };

  const handleFoodSelect = async (food: FoodSearchResult, multiplier: number) => {
    const meal: Meal = {
      id: nanoid(),
      name: food.name + (food.brand ? ` (${food.brand})` : ""),
      calories: Math.round(food.calories * multiplier),
      protein: Math.round(food.protein * multiplier * 10) / 10,
      carbs: Math.round(food.carbs * multiplier * 10) / 10,
      fat: Math.round(food.fat * multiplier * 10) / 10,
      fiber: Math.round(food.fiber * multiplier * 10) / 10,
      servingSize: food.servingSize * multiplier,
      halal: food.halal,
      dietaryTags: food.dietaryTags ?? [],
      timestamp: Date.now(),
      source: "search",
      photoUrl: food.imageUrl,
    };
    await addMeal(meal);
    setView("dashboard");
    load();
  };

  const handleAIResult = async (items: { name: string; estimatedGrams: number; calories: number; protein: number; carbs: number; fat: number; fiber: number; halal: boolean | null; dietaryTags?: string[] }[]) => {
    const today = todayISO();
    const updated: AppSettings = {
      ...settings,
      aiScansToday: settings.aiScansDate === today ? settings.aiScansToday + 1 : 1,
      aiScansDate: today,
    };
    await saveSettings(updated);
    for (const item of items) {
      await addMeal({
        id: nanoid(),
        name: item.name,
        calories: Math.round(item.calories),
        protein: Math.round(item.protein * 10) / 10,
        carbs: Math.round(item.carbs * 10) / 10,
        fat: Math.round(item.fat * 10) / 10,
        fiber: Math.round(item.fiber * 10) / 10,
        servingSize: item.estimatedGrams,
        halal: item.halal,
        dietaryTags: (item.dietaryTags ?? []) as DietaryTag[],
        timestamp: Date.now(),
        source: "ai",
      });
    }
    setView("dashboard");
    load();
  };

  const todayScans  = settings.aiScansDate === todayISO() ? settings.aiScansToday : 0;
  const refillExp   = typeof window !== "undefined" ? Number(localStorage.getItem("rida_refill_expires") ?? 0) : 0;
  const hasRefill   = refillExp > Date.now();
  const isPro       = settings.plan === "pro" || hasRefill;
  const totals      = sumMacros(meals);
  const g          = settings.goals;
  const pctCal     = Math.min(100, Math.round((totals.calories / g.calories) * 100));

  if (view === "scan") return (
    <AIScanner
      proToken={settings.proToken}
      scansUsedToday={todayScans}
      scanLimit={FREE_SCAN_LIMIT}
      isPro={isPro}
      dietaryProfile={settings.dietaryProfile}
      onResult={handleAIResult}
      onClose={() => setView("dashboard")}
    />
  );

  if (view === "search") return (
    <FoodSearch
      dietaryProfile={settings.dietaryProfile}
      onSelect={handleFoodSelect}
      onClose={() => setView("dashboard")}
    />
  );

  return (
    <div style={{ padding: 16, maxWidth: 520, margin: "0 auto" }}>
      {/* Macro summary */}
      {!loading && (
        <div style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 8, padding: 16, marginBottom: 16 }}>
          <div style={{ display: "flex", gap: 16, alignItems: "flex-start", marginBottom: 10 }}>
            <MacroRing label="Kalorien" value={totals.calories} goal={g.calories} unit="kcal" color="var(--green)" size={72} />
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ color: "var(--text)", fontSize: 13, fontWeight: 700 }}>{totals.calories} kcal</span>
                <span style={{ color: "var(--text3)", fontSize: 11 }}>{pctCal}% Ziel</span>
              </div>
              {[
                { label: "Protein",        val: totals.protein, goal: g.protein, color: "#4f6fa8" },
                { label: "Kohlenhydrate",  val: totals.carbs,   goal: g.carbs,   color: "#e8a44a" },
                { label: "Fett",           val: totals.fat,     goal: g.fat,     color: "#9b4a82" },
              ].map(m => (
                <div key={m.label} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                  <span style={{ color: "var(--text3)", fontSize: 10, width: 100 }}>{m.label}</span>
                  <div style={{ flex: 1, height: 4, background: "var(--bg2)", borderRadius: 2 }}>
                    <div style={{ width: `${Math.min(100, (m.val / m.goal) * 100)}%`, height: "100%", background: m.color, borderRadius: 2 }} />
                  </div>
                  <span style={{ color: "var(--text3)", fontSize: 10, width: 60, textAlign: "right" }}>{m.val}g/{m.goal}g</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <button onClick={() => setView("scan")}
          style={{ flex: 1, background: "#14532d", border: "1px solid var(--green)", color: "var(--green)", padding: "10px 0", fontSize: 12, borderRadius: 4, cursor: "pointer", fontWeight: 700 }}>
          📸 AI-Scan
        </button>
        <button onClick={() => setView("search")}
          style={{ flex: 1, background: "var(--bg3)", border: "1px solid var(--border)", color: "var(--text2)", padding: "10px 0", fontSize: 12, borderRadius: 4, cursor: "pointer" }}>
          🔍 Suchen
        </button>
      </div>

      {/* Free plan nudge */}
      {settings.plan !== "pro" && !hasRefill && (
        <div style={{ background: "#1a1200", border: "1px solid #c4743a44", borderRadius: 4, padding: "8px 12px", marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ color: "#e8a44a", fontSize: 11 }}>
            Free: {todayScans}/{FREE_SCAN_LIMIT} AI-Scans heute
          </span>
          <a href="/upgrade" style={{ color: "var(--green)", fontSize: 11, textDecoration: "none", fontWeight: 700 }}>
            AI Refill CHF 1.49/Mo →
          </a>
        </div>
      )}
      {hasRefill && (
        <div style={{ background: "#001a0a", border: "1px solid #22c55e44", borderRadius: 4, padding: "8px 12px", marginBottom: 12 }}>
          <span style={{ color: "var(--green)", fontSize: 11 }}>✓ AI Refill aktiv · unbegrenzte Scans</span>
        </div>
      )}

      {/* Meal list */}
      {loading
        ? <div style={{ color: "var(--text3)", textAlign: "center", padding: 40, fontSize: 12 }}>Wird geladen…</div>
        : meals.length === 0
          ? <div style={{ color: "var(--text3)", textAlign: "center", padding: 40, fontSize: 12 }}>Noch keine Mahlzeiten heute.</div>
          : meals.map(m => <MealCard key={m.id} meal={m} onDelete={handleDelete} />)
      }
    </div>
  );
}
