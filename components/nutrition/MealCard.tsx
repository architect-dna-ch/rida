"use client";

import { Trash2 } from "lucide-react";
import type { Meal } from "@/lib/types";

interface Props {
  meal: Meal;
  onDelete: (id: string) => void;
}

const SOURCE_STYLES: Record<
  Meal["source"],
  { label: string; color: string; bg: string }
> = {
  ai: {
    label: "AI",
    color: "var(--purple)",
    bg: "rgba(167,139,250,0.12)",
  },
  search: {
    label: "Suche",
    color: "var(--blue)",
    bg: "rgba(96,165,250,0.12)",
  },
  manual: {
    label: "Manuell",
    color: "var(--text2)",
    bg: "rgba(136,136,160,0.12)",
  },
  barcode: {
    label: "Barcode",
    color: "var(--amber)",
    bg: "rgba(245,158,11,0.12)",
  },
};

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString("de-CH", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

interface ChipProps {
  label: string;
  value: number;
  unit: string;
  color: string;
}

function MacroChip({ label, value, unit, color }: ChipProps) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "baseline",
        gap: "2px",
        fontSize: "11px",
        fontWeight: 500,
        color,
        backgroundColor: "var(--bg3)",
        border: "1px solid var(--border)",
        borderRadius: "6px",
        padding: "2px 7px",
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ color: "var(--text3)", fontWeight: 400 }}>{label} </span>
      {Math.round(value)}
      <span style={{ color: "var(--text3)", fontWeight: 400, fontSize: "10px" }}>
        {unit}
      </span>
    </span>
  );
}

export default function MealCard({ meal, onDelete }: Props) {
  const src = SOURCE_STYLES[meal.source] ?? SOURCE_STYLES.manual;

  return (
    <div
      style={{
        backgroundColor: "var(--bg2)",
        border: "1px solid var(--border)",
        borderRadius: "12px",
        padding: "12px 14px",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
      }}
    >
      {/* Top row: name + badges + time + delete */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          justifyContent: "space-between",
        }}
      >
        {/* Left: name + source badge + halal badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            minWidth: 0,
            flex: 1,
          }}
        >
          <span
            style={{
              fontWeight: 600,
              fontSize: "14px",
              color: "var(--text)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {meal.name}
          </span>

          {/* Source badge */}
          <span
            style={{
              fontSize: "10px",
              fontWeight: 600,
              letterSpacing: "0.04em",
              color: src.color,
              backgroundColor: src.bg,
              borderRadius: "5px",
              padding: "1px 6px",
              flexShrink: 0,
            }}
          >
            {src.label}
          </span>

          {/* Halal badge */}
          {meal.halal === true && (
            <span
              style={{
                fontSize: "10px",
                fontWeight: 600,
                letterSpacing: "0.04em",
                color: "var(--green)",
                backgroundColor: "rgba(34,197,94,0.12)",
                borderRadius: "5px",
                padding: "1px 6px",
                flexShrink: 0,
              }}
            >
              HALAL
            </span>
          )}
        </div>

        {/* Right: time + delete */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontSize: "12px",
              color: "var(--text3)",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {formatTime(meal.timestamp)}
          </span>

          <button
            onClick={() => onDelete(meal.id)}
            aria-label={`${meal.name} löschen`}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px",
              borderRadius: "6px",
              color: "var(--text3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "color 0.15s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color =
                "var(--red)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color =
                "var(--text3)";
            }}
          >
            <Trash2 size={15} strokeWidth={1.8} />
          </button>
        </div>
      </div>

      {/* Macro chips row */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
        <MacroChip label="kcal" value={meal.calories} unit="" color="var(--amber)" />
        <MacroChip label="P" value={meal.protein} unit="g" color="var(--blue)" />
        <MacroChip label="K" value={meal.carbs} unit="g" color="var(--green)" />
        <MacroChip label="F" value={meal.fat} unit="g" color="var(--red)" />
      </div>

    </div>
  );
}
