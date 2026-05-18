"use client";
import { useRef, useState } from "react";
import { ArrowLeft, Camera, Loader2, Plus, AlertTriangle } from "lucide-react";
import type { DietaryTag } from "@/lib/types";
import { DIETARY_INFO } from "@/lib/types";
import { apiUrl } from "@/lib/api";

export interface ScanItem {
  name: string;
  estimatedGrams: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  halal: boolean | null;
  dietaryTags?: string[];
}

interface Props {
  proToken: string;
  scansUsedToday: number;
  scanLimit: number;
  isPro: boolean;
  dietaryProfile?: DietaryTag[];
  onResult: (items: ScanItem[]) => void;
  onClose: () => void;
}

type State = "idle" | "preview" | "scanning" | "results" | "error";

export default function AIScanner({ proToken, scansUsedToday, scanLimit, isPro, dietaryProfile = [], onResult, onClose }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<State>("idle");
  const [preview, setPreview] = useState<string>("");
  const [imageBase64, setImageBase64] = useState<string>("");
  const [mimeType, setMimeType] = useState("image/jpeg");
  const [items, setItems] = useState<ScanItem[]>([]);
  const [error, setError] = useState("");
  const [notes, setNotes] = useState("");

  const hitLimit = !isPro && scansUsedToday >= scanLimit;

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    setMimeType(file.type);
    const reader = new FileReader();
    reader.onload = e => {
      const dataUrl = e.target?.result as string;
      const b64 = dataUrl.split(",")[1];
      setPreview(dataUrl);
      setImageBase64(b64);
      setState("preview");
    };
    reader.readAsDataURL(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const analyze = async () => {
    setState("scanning");
    setError("");
    try {
      const res = await fetch(apiUrl("/api/scan"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64, mimeType, proToken, scansToday: scansUsedToday }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      if (!data.items?.length) throw new Error("Keine Lebensmittel erkannt.");
      setItems(data.items);
      setNotes(data.notes ?? "");
      setState("results");
    } catch (e) {
      setError(String((e as Error).message));
      setState("error");
    }
  };

  const profileBadges = (tags: string[] = []) => {
    if (!dietaryProfile.length) return null;
    const matching = tags.filter(t => dietaryProfile.includes(t as DietaryTag));
    if (!matching.length) return null;
    return (
      <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 6 }}>
        {matching.map(tag => {
          const info = DIETARY_INFO[tag as DietaryTag];
          if (!info) return null;
          return (
            <span key={tag} style={{
              fontSize: 10, fontWeight: 500, padding: "1px 7px", borderRadius: 10,
              color: info.color, backgroundColor: info.bgColor, border: `1px solid ${info.color}44`,
            }}>{info.emoji} {info.label}</span>
          );
        })}
      </div>
    );
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "var(--bg)",
      zIndex: 100, overflowY: "auto",
    }}>
      <div style={{ maxWidth: 520, margin: "0 auto", padding: "20px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--text2)", cursor: "pointer", fontSize: 22, padding: 0, lineHeight: 1 }}>
            <ArrowLeft size={20} />
          </button>
          <h2 style={{ fontSize: 17, fontWeight: 600, color: "var(--text)", margin: 0 }}>AI Foto-Scan</h2>
          {!isPro && (
            <span style={{
              marginLeft: "auto", fontSize: 11,
              color: hitLimit ? "var(--red)" : "var(--text3)",
            }}>
              {scansUsedToday}/{scanLimit} heute
            </span>
          )}
        </div>

        {/* Paywall */}
        {hitLimit && (
          <div style={{
            background: "rgba(167,139,250,.08)", border: "1px solid var(--purple)",
            borderRadius: 12, padding: "24px 20px", textAlign: "center",
          }}>
            <p style={{ fontSize: 28, margin: "0 0 12px" }}>🔒</p>
            <p style={{ fontSize: 15, fontWeight: 600, color: "var(--text)", margin: "0 0 6px" }}>
              Tageslimit erreicht
            </p>
            <p style={{ fontSize: 13, color: "var(--text2)", margin: "0 0 18px" }}>
              {scanLimit} AI-Scans pro Tag im Free-Plan · Pro für unbegrenzte Scans
            </p>
            <a href="/upgrade" style={{
              display: "inline-block", padding: "11px 24px", borderRadius: 8,
              background: "var(--green)", color: "#000",
              fontSize: 13, fontWeight: 700, textDecoration: "none",
            }}>
              Pro — CHF 3.95/Monat →
            </a>
          </div>
        )}

        {/* Idle: pick image */}
        {!hitLimit && state === "idle" && (
          <div>
            <input ref={fileRef} type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={handleInputChange} />
            <input ref={galleryRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleInputChange} />
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div
                onClick={() => fileRef.current?.click()}
                style={{
                  border: "2px dashed var(--border2)", borderRadius: 14,
                  padding: "40px 20px", textAlign: "center", cursor: "pointer",
                  background: "var(--bg2)", transition: "border-color .15s",
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--blue)")}
                onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border2)")}
              >
                <Camera size={36} color="var(--text3)" style={{ margin: "0 auto 12px" }} />
                <p style={{ fontSize: 15, fontWeight: 600, color: "var(--text)", margin: "0 0 4px" }}>Foto aufnehmen</p>
                <p style={{ fontSize: 12, color: "var(--text3)", margin: 0 }}>Rückkamera · direkt scannen</p>
              </div>
              <button
                onClick={() => galleryRef.current?.click()}
                style={{
                  width: "100%", padding: "14px", borderRadius: 10,
                  border: "1px solid var(--border2)", background: "var(--bg3)",
                  color: "var(--text2)", fontSize: 14, cursor: "pointer",
                }}
              >
                📁 Aus Galerie wählen
              </button>
            </div>
          </div>
        )}

        {/* Preview */}
        {!hitLimit && state === "preview" && (
          <div>
            <img src={preview} alt="preview" style={{ width: "100%", borderRadius: 10, maxHeight: 320, objectFit: "cover", marginBottom: 16 }} />
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setState("idle")} style={{
                flex: 1, padding: "12px", borderRadius: 8,
                border: "1px solid var(--border2)", background: "transparent",
                color: "var(--text3)", cursor: "pointer", fontSize: 14,
              }}>
                Anderes Foto
              </button>
              <button onClick={analyze} style={{
                flex: 2, padding: "12px", borderRadius: 8, border: "none",
                background: "var(--blue)", color: "#fff",
                cursor: "pointer", fontSize: 14, fontWeight: 600,
              }}>
                Analysieren →
              </button>
            </div>
          </div>
        )}

        {/* Scanning */}
        {state === "scanning" && (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <Loader2 size={36} color="var(--blue)" style={{ margin: "0 auto 16px", animation: "spin 1s linear infinite" }} />
            <p style={{ fontSize: 15, color: "var(--text2)" }}>KI analysiert dein Essen…</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* Results */}
        {state === "results" && (
          <div>
            {preview && <img src={preview} alt="preview" style={{ width: "100%", borderRadius: 10, maxHeight: 200, objectFit: "cover", marginBottom: 16 }} />}
            <p style={{ fontSize: 11, letterSpacing: ".1em", color: "var(--text3)", textTransform: "uppercase", margin: "0 0 12px" }}>
              Erkannte Lebensmittel ({items.length})
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
              {items.map((item, i) => (
                <div key={i} style={{
                  background: "var(--bg2)", border: "1px solid var(--border)",
                  borderRadius: 10, padding: "14px 16px",
                }}>
                  <div style={{ marginBottom: 8 }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", margin: 0 }}>{item.name}</p>
                    <p style={{ fontSize: 11, color: "var(--text3)", margin: "2px 0 0" }}>~{item.estimatedGrams}g</p>
                    {profileBadges(item.dietaryTags)}
                  </div>
                  <div style={{ display: "flex", gap: 10 }}>
                    {[
                      { l: "kcal", v: item.calories, c: "var(--text)" },
                      { l: "P", v: item.protein + "g", c: "var(--blue)" },
                      { l: "KH", v: item.carbs + "g", c: "var(--amber)" },
                      { l: "F", v: item.fat + "g", c: "var(--purple)" },
                    ].map(({ l, v, c }) => (
                      <div key={l} style={{ textAlign: "center" }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: c, margin: 0 }}>{v}</p>
                        <p style={{ fontSize: 9, color: "var(--text3)", margin: 0, letterSpacing: ".05em" }}>{l}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            {notes && (
              <p style={{ fontSize: 11, color: "var(--text3)", marginBottom: 16, padding: "8px 12px", background: "var(--bg3)", borderRadius: 6 }}>
                ℹ️ {notes}
              </p>
            )}
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setState("idle")} style={{
                flex: 1, padding: "12px", borderRadius: 8,
                border: "1px solid var(--border2)", background: "transparent",
                color: "var(--text3)", cursor: "pointer", fontSize: 14,
              }}>
                Neu
              </button>
              <button onClick={() => onResult(items)} style={{
                flex: 2, padding: "12px", borderRadius: 8, border: "none",
                background: "var(--green)", color: "#000",
                cursor: "pointer", fontSize: 14, fontWeight: 600,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              }}>
                <Plus size={16} /> Alle hinzufügen
              </button>
            </div>
          </div>
        )}

        {/* Error */}
        {state === "error" && (
          <div style={{
            background: "rgba(239,68,68,.08)", border: "1px solid var(--red)",
            borderRadius: 10, padding: "20px", textAlign: "center",
          }}>
            <AlertTriangle size={28} color="var(--red)" style={{ margin: "0 auto 12px" }} />
            <p style={{ fontSize: 14, color: "var(--red)", margin: "0 0 6px", fontWeight: 600 }}>Fehler</p>
            <p style={{ fontSize: 12, color: "var(--text2)", margin: "0 0 16px" }}>{error}</p>
            <button onClick={() => setState("idle")} style={{
              padding: "9px 20px", borderRadius: 8, border: "1px solid var(--border2)",
              background: "var(--bg3)", color: "var(--text2)", cursor: "pointer", fontSize: 13,
            }}>
              Nochmal versuchen
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
