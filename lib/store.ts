"use client";

/**
 * IndexedDB store — all data stays local, never leaves device unless user exports
 * Schema: blocks, settings, dhikr, hifz
 */

import { openDB, type DBSchema, type IDBPDatabase } from "idb";

export interface Block {
  id:       string;
  title:    string;
  startMin: number;   // minutes since midnight
  endMin:   number;
  color:    string;
  category: "work" | "study" | "sport" | "rest" | "ibadah" | "other";
  repeat:   "none" | "daily" | "weekdays";
}

export interface DhikrEntry {
  id:    string;
  name:  string;      // "SubhanAllah", "Alhamdulillah", custom
  count: number;
  goal:  number;
  date:  string;      // YYYY-MM-DD
}

export interface HifzEntry {
  id:     string;
  surah:  number;
  ayahFrom: number;
  ayahTo:   number;
  status: "new" | "review" | "mastered";
  date:   string;
}

export interface Settings {
  city:        string;
  country:     string;
  latitude:    number | null;
  longitude:   number | null;
  method:      number;    // calculation method 1-23
  prayerColors: Record<string, string>;
  theme:       "dark" | "light";
  accentColor: string;
}

interface StriveBoardDB extends DBSchema {
  blocks:   { key: string; value: Block };
  dhikr:    { key: string; value: DhikrEntry };
  hifz:     { key: string; value: HifzEntry };
  settings: { key: string; value: Settings };
}

let db: IDBPDatabase<StriveBoardDB> | null = null;

async function getDB() {
  if (db) return db;
  db = await openDB<StriveBoardDB>("striveboard", 1, {
    upgrade(d) {
      d.createObjectStore("blocks",   { keyPath: "id" });
      d.createObjectStore("dhikr",    { keyPath: "id" });
      d.createObjectStore("hifz",     { keyPath: "id" });
      d.createObjectStore("settings", { keyPath: "id" });
    },
  });
  return db;
}

// ─── Blocks ──────────────────────────────────────────────────

export async function getBlocks(): Promise<Block[]> {
  return (await getDB()).getAll("blocks");
}

export async function saveBlock(block: Block): Promise<void> {
  await (await getDB()).put("blocks", block);
}

export async function deleteBlock(id: string): Promise<void> {
  await (await getDB()).delete("blocks", id);
}

// ─── Settings ────────────────────────────────────────────────

const SETTINGS_KEY = "user";

export async function getSettings(): Promise<Settings> {
  const s = await (await getDB()).get("settings", SETTINGS_KEY);
  return s ?? {
    city:         "Zürich",
    country:      "Switzerland",
    latitude:     null,
    longitude:    null,
    method:       3,
    prayerColors: {},
    theme:        "dark",
    accentColor:  "#22c55e",
  };
}

export async function saveSettings(s: Partial<Settings>): Promise<void> {
  const current = await getSettings();
  await (await getDB()).put("settings", { ...current, ...s, id: SETTINGS_KEY } as Settings & { id: string });
}

// ─── Dhikr ───────────────────────────────────────────────────

export async function getDhikrToday(): Promise<DhikrEntry[]> {
  const today = new Date().toISOString().slice(0, 10);
  const all = await (await getDB()).getAll("dhikr");
  return all.filter((d) => d.date === today);
}

export async function saveDhikr(entry: DhikrEntry): Promise<void> {
  await (await getDB()).put("dhikr", entry);
}

// ─── Hifz ────────────────────────────────────────────────────

export async function getHifz(): Promise<HifzEntry[]> {
  return (await getDB()).getAll("hifz");
}

export async function saveHifz(entry: HifzEntry): Promise<void> {
  await (await getDB()).put("hifz", entry);
}

// ─── Export as shareable template ────────────────────────────

export async function exportTemplate(): Promise<string> {
  const [blocks, settings] = await Promise.all([getBlocks(), getSettings()]);
  const template = {
    version:  1,
    exported: new Date().toISOString(),
    city:     settings.city,
    blocks:   blocks.filter((b) => b.repeat !== "none").map((b) => ({
      title:    b.title,
      startMin: b.startMin,
      endMin:   b.endMin,
      color:    b.color,
      category: b.category,
      repeat:   b.repeat,
    })),
  };
  return JSON.stringify(template, null, 2);
}
