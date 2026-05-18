"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { PrayerSlot } from "@/lib/prayer-api";
import type { Block } from "@/lib/store";

// Day runs Fajr → Isha+2h (visible window)
const DAY_START = 3 * 60;   // 03:00
const DAY_END   = 24 * 60;  // 24:00
const TOTAL_MIN = DAY_END - DAY_START;

function pct(minutes: number) {
  return ((minutes - DAY_START) / TOTAL_MIN) * 100;
}

function fmtTime(minutes: number) {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

const CATEGORY_ICONS: Record<string, string> = {
  work: "💼", study: "📚", sport: "🏃", rest: "😴", ibadah: "🤲", other: "✦",
};

interface Props {
  prayers:  PrayerSlot[];
  blocks:   Block[];
  onAddBlock?: (startMin: number) => void;
  onDeleteBlock?: (id: string) => void;
}

export default function PrayerGrid({ prayers, blocks, onAddBlock, onDeleteBlock }: Props) {
  const gridRef   = useRef<HTMLDivElement>(null);
  const [now, setNow] = useState(0);
  const [tooltip, setTooltip] = useState<{ text: string; y: number } | null>(null);

  // Live "now" marker
  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setNow(d.getHours() * 60 + d.getMinutes());
    };
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, []);

  const handleGridClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!gridRef.current || !onAddBlock) return;
    const rect = gridRef.current.getBoundingClientRect();
    const clickPct = (e.clientY - rect.top) / rect.height;
    const clickMin = Math.round(DAY_START + clickPct * TOTAL_MIN);
    onAddBlock(Math.max(DAY_START, Math.min(DAY_END - 30, clickMin)));
  }, [onAddBlock]);

  const nowPct = pct(now);

  return (
    <div style={{ position: "relative", width: "100%", userSelect: "none", fontFamily: "ui-monospace, monospace" }}>

      {/* Time axis labels */}
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "48px", pointerEvents: "none", zIndex: 10 }}>
        {[3, 6, 9, 12, 15, 18, 21, 24].map((h) => (
          <span key={h} style={{
            position: "absolute",
            top: `${pct(h * 60)}%`,
            fontSize: "10px",
            color: "#525252",
            lineHeight: 1,
            transform: "translateY(-50%)",
          }}>
            {String(h % 24).padStart(2, "0")}:00
          </span>
        ))}
      </div>

      {/* Main grid */}
      <div
        ref={gridRef}
        onClick={handleGridClick}
        style={{
          marginLeft: "56px",
          cursor: "crosshair",
          position: "relative",
          height: "800px",
          background: "#0d0d0d",
          border: "1px solid #1f1f1f",
          borderRadius: "6px",
          overflow: "hidden",
        }}
      >
        {/* Hour grid lines */}
        {[3, 6, 9, 12, 15, 18, 21].map((h) => (
          <div key={h} style={{
            position: "absolute",
            top: `${pct(h * 60)}%`,
            left: 0, right: 0,
            height: "1px",
            background: "#1a1a1a",
          }} />
        ))}

        {/* Prayer bands */}
        {prayers.map((p, i) => {
          const next = prayers[i + 1];
          const bandEnd = next ? next.minutes : DAY_END;
          const top    = pct(p.minutes);
          const height = pct(bandEnd) - top;

          return (
            <div key={p.name} style={{
              position: "absolute",
              top:    `${top}%`,
              height: `${height}%`,
              left: 0, right: 0,
              background: `${p.color}10`,
              borderTop: `2px solid ${p.color}`,
            }}>
              {/* Prayer label */}
              <div style={{
                position:   "absolute",
                top:        "4px",
                right:      "10px",
                display:    "flex",
                alignItems: "center",
                gap:        "6px",
              }}>
                <span style={{
                  background:   p.color,
                  color:        "#000",
                  fontSize:     "10px",
                  fontWeight:   700,
                  padding:      "2px 8px",
                  borderRadius: "2px",
                  letterSpacing: "0.1em",
                }}>
                  {p.name.toUpperCase()}
                </span>
                <span style={{ color: p.color, fontSize: "11px", opacity: 0.9 }}>
                  {p.time}
                </span>
              </div>
            </div>
          );
        })}

        {/* User blocks */}
        {blocks.map((block) => {
          const top    = pct(block.startMin);
          const height = Math.max(0.8, pct(block.endMin) - top);
          const dur    = block.endMin - block.startMin;

          return (
            <div
              key={block.id}
              onMouseEnter={(e) => setTooltip({
                text: `${block.title} · ${fmtTime(block.startMin)}–${fmtTime(block.endMin)} (${dur}min)`,
                y: e.clientY,
              })}
              onMouseLeave={() => setTooltip(null)}
              onClick={(e) => { e.stopPropagation(); onDeleteBlock?.(block.id); }}
              style={{
                position:     "absolute",
                top:          `${top}%`,
                height:       `${height}%`,
                left:         "8px",
                right:        "8px",
                background:   `${block.color}22`,
                border:       `1px solid ${block.color}88`,
                borderLeft:   `3px solid ${block.color}`,
                borderRadius: "3px",
                padding:      "3px 8px",
                cursor:       "pointer",
                overflow:     "hidden",
                zIndex:       5,
                transition:   "opacity 0.1s",
              }}
            >
              <span style={{ fontSize: "11px", color: block.color, fontWeight: 600 }}>
                {CATEGORY_ICONS[block.category]} {block.title}
              </span>
            </div>
          );
        })}

        {/* Now marker */}
        {nowPct > 0 && nowPct < 100 && (
          <div style={{
            position:  "absolute",
            top:       `${nowPct}%`,
            left:      0,
            right:     0,
            height:    "1px",
            background: "#22c55e",
            zIndex:    20,
            boxShadow: "0 0 6px #22c55e88",
          }}>
            <span style={{
              position:   "absolute",
              left:       "6px",
              top:        "-9px",
              fontSize:   "9px",
              color:      "#22c55e",
              fontWeight: 700,
            }}>
              ▶ {fmtTime(now)}
            </span>
          </div>
        )}
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div style={{
          position:   "fixed",
          top:        tooltip.y - 30,
          left:       "50%",
          transform:  "translateX(-50%)",
          background: "#111",
          border:     "1px solid #333",
          borderRadius: "4px",
          padding:    "4px 10px",
          fontSize:   "11px",
          color:      "#d4d4d4",
          zIndex:     100,
          pointerEvents: "none",
        }}>
          {tooltip.text}
        </div>
      )}

      <p style={{
        marginTop: "8px",
        fontSize:  "10px",
        color:     "#525252",
        textAlign: "center",
      }}>
        Klick ins Grid = neuen Block hinzufügen · Klick auf Block = löschen
      </p>
    </div>
  );
}
