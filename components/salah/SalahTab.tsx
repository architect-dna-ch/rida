"use client";
import { useEffect, useState, useCallback } from "react";
import PrayerGrid from "./PrayerGrid";
import { fetchByCity, type PrayerSlot } from "@/lib/prayer-api";
import { getBlocks, saveBlock, deleteBlock, type Block } from "@/lib/store";

const BLOCK_COLORS = ["#4f6fa8", "#5a9e6f", "#c4743a", "#9b4a82", "#e8a44a", "#22c55e"];
const CATEGORIES = ["work", "study", "sport", "rest", "ibadah", "other"] as const;

export default function SalahTab() {
  const [prayers, setPrayers]   = useState<PrayerSlot[]>([]);
  const [blocks, setBlocks]     = useState<Block[]>([]);
  const [loading, setLoading]   = useState(true);
  const [city, setCity]         = useState("Zürich");
  const [country, setCountry]   = useState("Switzerland");
  const [adding, setAdding]     = useState<{ startMin: number } | null>(null);
  const [newBlock, setNewBlock] = useState({ title: "", endMin: 0, color: BLOCK_COLORS[0], category: "work" as Block["category"] });

  useEffect(() => {
    const savedCity    = localStorage.getItem("rida_city");
    const savedCountry = localStorage.getItem("rida_country");
    if (savedCity)    setCity(savedCity);
    if (savedCountry) setCountry(savedCountry);
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchByCity(city, country), getBlocks()])
      .then(([p, b]) => { setPrayers(p); setBlocks(b); setLoading(false); })
      .catch(() => setLoading(false));
    localStorage.setItem("rida_city",    city);
    localStorage.setItem("rida_country", country);
  }, [city, country]);

  const handleAddBlock = useCallback((startMin: number) => {
    setAdding({ startMin });
    setNewBlock(b => ({ ...b, endMin: startMin + 60 }));
  }, []);

  const handleSaveBlock = async () => {
    if (!adding || !newBlock.title.trim()) return;
    const block: Block = {
      id: crypto.randomUUID(),
      title: newBlock.title,
      startMin: adding.startMin,
      endMin: newBlock.endMin,
      color: newBlock.color,
      category: newBlock.category,
      repeat: "daily",
    };
    await saveBlock(block);
    setBlocks(b => [...b, block]);
    setAdding(null);
  };

  const handleDeleteBlock = async (id: string) => {
    await deleteBlock(id);
    setBlocks(b => b.filter(x => x.id !== id));
  };

  const today = new Date().toLocaleDateString("de-CH", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div style={{ padding: "16px", maxWidth: 1200, margin: "0 auto" }}>
      {/* Controls row */}
      <div style={{ display: "flex", gap: 8, marginBottom: 14, alignItems: "center", flexWrap: "wrap" }}>
        <span style={{ color: "var(--text3)", fontSize: 10, letterSpacing: "0.1em" }}>STANDORT</span>
        <input value={city} onChange={e => setCity(e.target.value)} placeholder="Stadt"
          style={{ background: "var(--bg3)", border: "1px solid var(--border)", color: "var(--text)", padding: "4px 10px", fontSize: 11, borderRadius: 3, width: 110 }} />
        <input value={country} onChange={e => setCountry(e.target.value)} placeholder="Land"
          style={{ background: "var(--bg3)", border: "1px solid var(--border)", color: "var(--text)", padding: "4px 10px", fontSize: 11, borderRadius: 3, width: 110 }} />
        <span style={{ marginLeft: "auto", color: "var(--text3)", fontSize: 11 }}>{today}</span>
      </div>

      {/* Prayer time pills */}
      {!loading && (
        <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
          {prayers.map(p => (
            <div key={p.name} style={{ background: `${p.color}15`, border: `1px solid ${p.color}55`, borderRadius: 3, padding: "4px 10px", fontSize: 11 }}>
              <span style={{ color: p.color, fontWeight: 700 }}>{p.name}</span>
              <span style={{ color: "var(--text3)", marginLeft: 6 }}>{p.time}</span>
            </div>
          ))}
        </div>
      )}

      {loading
        ? <div style={{ color: "var(--text3)", textAlign: "center", padding: 40, fontSize: 12 }}>Gebetszeiten werden geladen…</div>
        : <PrayerGrid prayers={prayers} blocks={blocks} onAddBlock={handleAddBlock} onDeleteBlock={handleDeleteBlock} />
      }

      {/* Add block modal */}
      {adding && (
        <div style={{ position: "fixed", inset: 0, background: "#000a", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}>
          <div style={{ background: "var(--bg3)", border: "1px solid var(--border2)", borderRadius: 6, padding: 24, width: 320 }}>
            <div style={{ color: "var(--text)", fontSize: 13, fontWeight: 700, marginBottom: 16 }}>
              Block · {String(Math.floor(adding.startMin / 60)).padStart(2, "0")}:{String(adding.startMin % 60).padStart(2, "0")}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <input autoFocus placeholder="Titel (z.B. Arabisch lernen)"
                value={newBlock.title}
                onChange={e => setNewBlock(b => ({ ...b, title: e.target.value }))}
                onKeyDown={e => e.key === "Enter" && handleSaveBlock()}
                style={{ background: "var(--bg2)", border: "1px solid var(--border2)", color: "var(--text)", padding: "8px 12px", fontSize: 12, borderRadius: 3 }} />
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span style={{ color: "var(--text3)", fontSize: 10 }}>BIS</span>
                <input type="time"
                  value={`${String(Math.floor(newBlock.endMin / 60)).padStart(2, "0")}:${String(newBlock.endMin % 60).padStart(2, "0")}`}
                  onChange={e => { const [h, m] = e.target.value.split(":").map(Number); setNewBlock(b => ({ ...b, endMin: h * 60 + m })); }}
                  style={{ background: "var(--bg2)", border: "1px solid var(--border2)", color: "var(--text)", padding: "6px 10px", fontSize: 12, borderRadius: 3 }} />
              </div>
              <select value={newBlock.category}
                onChange={e => setNewBlock(b => ({ ...b, category: e.target.value as Block["category"] }))}
                style={{ background: "var(--bg2)", border: "1px solid var(--border2)", color: "var(--text)", padding: "6px 10px", fontSize: 12, borderRadius: 3 }}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <div style={{ display: "flex", gap: 6 }}>
                {BLOCK_COLORS.map(col => (
                  <div key={col} onClick={() => setNewBlock(b => ({ ...b, color: col }))}
                    style={{ width: 22, height: 22, borderRadius: 3, background: col, border: newBlock.color === col ? "2px solid #fff" : "2px solid transparent", cursor: "pointer" }} />
                ))}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
              <button onClick={handleSaveBlock}
                style={{ flex: 1, background: "#14532d", border: "1px solid var(--green)", color: "var(--green)", padding: 8, fontSize: 11, borderRadius: 3, cursor: "pointer" }}>
                SPEICHERN
              </button>
              <button onClick={() => setAdding(null)}
                style={{ background: "var(--bg2)", border: "1px solid var(--border)", color: "var(--text3)", padding: "8px 14px", fontSize: 11, borderRadius: 3, cursor: "pointer" }}>
                ×
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
