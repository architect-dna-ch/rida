"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { ArrowLeft, Search, Loader2, AlertCircle } from "lucide-react";
import { FoodSearchResult, DietaryTag, DIETARY_INFO, DIETARY_FILTERS } from "@/lib/types";
import { apiUrl } from "@/lib/api";

interface Props {
  onSelect: (food: FoodSearchResult, multiplier: number) => void;
  onClose: () => void;
  dietaryProfile?: DietaryTag[];
}

type Status = "idle" | "loading" | "done" | "error";

interface SelectedState {
  food: FoodSearchResult;
  multiplier: number;
}

// ─── helpers ────────────────────────────────────────────────────────────────

function MacroChip({
  label,
  value,
  unit = "g",
}: {
  label: string;
  value: number;
  unit?: string;
}) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 2,
        padding: "2px 6px",
        borderRadius: 4,
        backgroundColor: "var(--bg3)",
        border: "1px solid var(--border)",
        fontSize: 11,
        color: "var(--text2)",
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ color: "var(--text3)", fontSize: 10 }}>{label}</span>
      {value}
      {unit}
    </span>
  );
}

function DietaryBadge({ tag }: { tag: DietaryTag }) {
  const info = DIETARY_INFO[tag];
  if (!info) return null;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 2,
      padding: "2px 6px", borderRadius: 4, fontSize: 10, fontWeight: 500,
      color: info.color, backgroundColor: info.bgColor,
      border: `1px solid ${info.color}33`, whiteSpace: "nowrap",
    }}>
      {info.emoji} {info.label}
    </span>
  );
}

function HalalBadge({ halal }: { halal: boolean | null }) {
  if (halal === false) return null;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 3,
        padding: "2px 6px",
        borderRadius: 4,
        fontSize: 11,
        fontWeight: 500,
        color: halal === true ? "var(--green)" : "var(--amber)",
        backgroundColor:
          halal === true ? "rgba(34,197,94,0.1)" : "rgba(245,158,11,0.1)",
        border: `1px solid ${halal === true ? "rgba(34,197,94,0.25)" : "rgba(245,158,11,0.25)"}`,
        whiteSpace: "nowrap",
      }}
    >
      {halal === true ? "✓ Halal" : "⚠ Unklar"}
    </span>
  );
}

function Spinner() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "48px 0",
      }}
    >
      <Loader2
        size={28}
        style={{
          color: "var(--text3)",
          animation: "kaloriq-spin 0.8s linear infinite",
        }}
      />
    </div>
  );
}

// ─── main component ──────────────────────────────────────────────────────────

export default function FoodSearch({ onSelect, onClose, dietaryProfile = [] }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<FoodSearchResult[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [lastQuery, setLastQuery] = useState("");
  const [selected, setSelected] = useState<SelectedState | null>(null);
  const [activeDiet, setActiveDiet] = useState<DietaryTag[]>([]);

  const toggleDiet = (tag: DietaryTag) => {
    setActiveDiet(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // autofocus on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const fetchResults = useCallback(async (q: string, diet: DietaryTag[] = []) => {
    if (!q.trim()) {
      setResults([]);
      setStatus("idle");
      return;
    }

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setStatus("loading");
    setLastQuery(q);
    setSelected(null);

    try {
      let url = apiUrl("/api/food?q=" + encodeURIComponent(q.trim()));
      if (diet.length > 0) url += "&diet=" + encodeURIComponent(diet.join(","));
      const res = await fetch(url, { signal: abortRef.current.signal });
      if (!res.ok) throw new Error(`Fehler ${res.status}`);
      const data = await res.json();
      setResults(data.results ?? []);
      setStatus("done");
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      setErrorMsg((err as Error).message ?? "Unbekannter Fehler");
      setStatus("error");
    }
  }, []);

  const handleQueryChange = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchResults(value, activeDiet), 400);
  };

  const handleDietToggle = (tag: DietaryTag) => {
    const next = activeDiet.includes(tag)
      ? activeDiet.filter(t => t !== tag)
      : [...activeDiet, tag];
    toggleDiet(tag);
    if (query.trim()) {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => fetchResults(query, next), 200);
    }
  };

  // cleanup on unmount
  useEffect(() => {
    return () => {
      debounceRef.current && clearTimeout(debounceRef.current);
      abortRef.current?.abort();
    };
  }, []);

  const handleItemClick = (food: FoodSearchResult) => {
    setSelected((prev) =>
      prev?.food.id === food.id ? prev : { food, multiplier: 1.0 }
    );
  };

  const handleAdd = () => {
    if (!selected) return;
    onSelect(selected.food, selected.multiplier);
  };

  return (
    <>
      {/* Keyframe injection */}
      <style>{`
        @keyframes kaloriq-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>

      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 50,
          backgroundColor: "var(--bg)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* ── Header ── */}
        <header
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "16px 16px 0",
            flexShrink: 0,
          }}
        >
          <button
            onClick={onClose}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 10px",
              borderRadius: 8,
              border: "1px solid var(--border)",
              backgroundColor: "var(--bg2)",
              color: "var(--text2)",
              fontSize: 14,
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            <ArrowLeft size={16} />
            Zurück
          </button>
          <h1
            style={{
              fontSize: 17,
              fontWeight: 600,
              color: "var(--text)",
              margin: 0,
              flex: 1,
              textAlign: "center",
              paddingRight: 80, // balance button width
            }}
          >
            Lebensmittel suchen
          </h1>
        </header>

        {/* ── Search input ── */}
        <div style={{ padding: "16px 16px 12px", flexShrink: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              backgroundColor: "var(--bg2)",
              border: "1px solid var(--border2)",
              borderRadius: 10,
              padding: "0 14px",
            }}
          >
            <Search size={18} style={{ color: "var(--text3)", flexShrink: 0 }} />
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              placeholder="z.B. Haferflocken, Hähnchenbrust…"
              style={{
                flex: 1,
                background: "transparent",
                border: "none",
                outline: "none",
                color: "var(--text)",
                fontSize: 15,
                padding: "13px 0",
              }}
            />
            {status === "loading" && (
              <Loader2
                size={16}
                style={{
                  color: "var(--text3)",
                  flexShrink: 0,
                  animation: "kaloriq-spin 0.8s linear infinite",
                }}
              />
            )}
          </div>
        </div>

        {/* ── Dietary filter pills ── */}
        <div style={{
          padding: "0 16px 12px", flexShrink: 0,
          display: "flex", gap: 6, overflowX: "auto",
          scrollbarWidth: "none",
        }}>
          {DIETARY_FILTERS.map(tag => {
            const info = DIETARY_INFO[tag];
            const active = activeDiet.includes(tag);
            return (
              <button
                key={tag}
                onClick={() => handleDietToggle(tag)}
                style={{
                  flexShrink: 0,
                  display: "inline-flex", alignItems: "center", gap: 4,
                  padding: "5px 10px", borderRadius: 20, fontSize: 12,
                  fontWeight: active ? 600 : 400,
                  cursor: "pointer", whiteSpace: "nowrap",
                  border: `1px solid ${active ? info.color : "var(--border)"}`,
                  backgroundColor: active ? info.bgColor : "var(--bg2)",
                  color: active ? info.color : "var(--text2)",
                  transition: "all 0.15s",
                }}
              >
                {info.emoji} {info.label}
              </button>
            );
          })}
        </div>

        {/* ── Body ── */}
        <div style={{ flex: 1, overflowY: "auto", padding: "0 16px 24px" }}>
          {/* Loading */}
          {status === "loading" && <Spinner />}

          {/* Error */}
          {status === "error" && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 10,
                padding: "48px 0",
                color: "var(--red)",
                textAlign: "center",
              }}
            >
              <AlertCircle size={28} />
              <p style={{ margin: 0, fontSize: 14 }}>{errorMsg}</p>
              <button
                onClick={() => fetchResults(query)}
                style={{
                  marginTop: 4,
                  padding: "8px 18px",
                  borderRadius: 8,
                  border: "1px solid var(--border2)",
                  backgroundColor: "var(--bg2)",
                  color: "var(--text2)",
                  fontSize: 14,
                  cursor: "pointer",
                }}
              >
                Erneut versuchen
              </button>
            </div>
          )}

          {/* Empty state */}
          {status === "done" && results.length === 0 && (
            <p
              style={{
                textAlign: "center",
                padding: "48px 0",
                fontSize: 14,
                color: "var(--text3)",
                margin: 0,
              }}
            >
              Keine Ergebnisse für „{lastQuery}"
            </p>
          )}

          {/* Results list */}
          {status === "done" && results.length > 0 && (
            <ul
              style={{
                listStyle: "none",
                margin: 0,
                padding: 0,
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              {results.map((food) => {
                const isSelected = selected?.food.id === food.id;
                return (
                  <li key={food.id}>
                    <button
                      onClick={() => handleItemClick(food)}
                      style={{
                        width: "100%",
                        textAlign: "left",
                        background: "none",
                        border: `1px solid ${isSelected ? "var(--blue)" : "var(--border)"}`,
                        borderRadius: 10,
                        padding: "12px 14px",
                        cursor: "pointer",
                        backgroundColor: isSelected
                          ? "rgba(96,165,250,0.07)"
                          : "var(--bg2)",
                        transition: "border-color 0.15s, background-color 0.15s",
                      }}
                    >
                      {/* Name row */}
                      <div style={{ marginBottom: 6 }}>
                        <p style={{ margin: 0, fontSize: 15, fontWeight: 500, color: "var(--text)", lineHeight: 1.3 }}>
                          {food.name}
                        </p>
                        {food.brand && (
                          <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--text2)" }}>
                            {food.brand}
                          </p>
                        )}
                      </div>

                      {/* Macro chips */}
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 4,
                          alignItems: "center",
                        }}
                      >
                        <MacroChip
                          label="kcal "
                          value={food.calories}
                          unit=""
                        />
                        <MacroChip label="P " value={food.protein} />
                        <MacroChip label="K " value={food.carbs} />
                        <MacroChip label="F " value={food.fat} />
                        <span
                          style={{
                            fontSize: 11,
                            color: "var(--text3)",
                            marginLeft: 2,
                          }}
                        >
                          pro {food.servingSize}g
                        </span>
                      </div>
                      {/* Only show tags matching user's dietary profile */}
                      {dietaryProfile.length > 0 && food.dietaryTags && (
                        (() => {
                          const matching = food.dietaryTags.filter(t => dietaryProfile.includes(t as DietaryTag));
                          return matching.length > 0 ? (
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 4 }}>
                              {matching.map(tag => <DietaryBadge key={tag} tag={tag as DietaryTag} />)}
                            </div>
                          ) : null;
                        })()
                      )}
                    </button>

                    {/* Inline multiplier row — shown only when this item is selected */}
                    {isSelected && selected && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          padding: "10px 14px",
                          backgroundColor: "var(--bg3)",
                          border: "1px solid var(--blue)",
                          borderTop: "none",
                          borderRadius: "0 0 10px 10px",
                        }}
                      >
                        <label
                          style={{
                            fontSize: 13,
                            color: "var(--text2)",
                            whiteSpace: "nowrap",
                          }}
                        >
                          Portion
                        </label>
                        <input
                          type="number"
                          min={0.1}
                          step={0.1}
                          value={selected.multiplier}
                          onChange={(e) =>
                            setSelected((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    multiplier: Math.max(
                                      0.1,
                                      parseFloat(e.target.value) || 1
                                    ),
                                  }
                                : prev
                            )
                          }
                          style={{
                            width: 72,
                            padding: "6px 8px",
                            borderRadius: 7,
                            border: "1px solid var(--border2)",
                            backgroundColor: "var(--bg2)",
                            color: "var(--text)",
                            fontSize: 14,
                            outline: "none",
                          }}
                        />
                        <span
                          style={{ fontSize: 12, color: "var(--text3)" }}
                        >
                          ×{" "}
                          {food.servingSize}g ={" "}
                          {Math.round(food.servingSize * selected.multiplier)}g
                        </span>
                        <button
                          onClick={handleAdd}
                          style={{
                            marginLeft: "auto",
                            padding: "7px 18px",
                            borderRadius: 8,
                            border: "none",
                            backgroundColor: "var(--green)",
                            color: "#fff",
                            fontSize: 14,
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          Hinzufügen
                        </button>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
