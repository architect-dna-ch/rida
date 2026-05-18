"use client";
import { openDB, type IDBPDatabase } from "idb";
import type { Meal, AppSettings } from "./types";
import { DEFAULT_SETTINGS } from "./types";

const DB_NAME = "rida";
const DB_VERSION = 1;

let _db: IDBPDatabase | null = null;

async function getDB() {
  if (_db) return _db;
  _db = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains("meals")) {
        const store = db.createObjectStore("meals", { keyPath: "id" });
        store.createIndex("timestamp", "timestamp");
      }
      if (!db.objectStoreNames.contains("settings")) {
        db.createObjectStore("settings", { keyPath: "key" });
      }
    },
  });
  return _db;
}

// ── MEALS ──────────────────────────────────────────────────────────────────────
export async function addMeal(meal: Meal) {
  const db = await getDB();
  await db.put("meals", meal);
}

export async function deleteMeal(id: string) {
  const db = await getDB();
  await db.delete("meals", id);
}

export async function getMealsForDay(date: Date): Promise<Meal[]> {
  const db = await getDB();
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  const all = await db.getAllFromIndex("meals", "timestamp", IDBKeyRange.bound(start.getTime(), end.getTime()));
  return all.sort((a, b) => b.timestamp - a.timestamp);
}

export async function getMealsForRange(from: Date, to: Date): Promise<Meal[]> {
  const db = await getDB();
  const start = new Date(from); start.setHours(0, 0, 0, 0);
  const end = new Date(to); end.setHours(23, 59, 59, 999);
  const all = await db.getAllFromIndex("meals", "timestamp", IDBKeyRange.bound(start.getTime(), end.getTime()));
  return all.sort((a, b) => a.timestamp - b.timestamp);
}

// ── SETTINGS ──────────────────────────────────────────────────────────────────
export async function getSettings(): Promise<AppSettings> {
  const db = await getDB();
  const row = await db.get("settings", "main");
  return row?.value ?? DEFAULT_SETTINGS;
}

export async function saveSettings(s: AppSettings) {
  const db = await getDB();
  await db.put("settings", { key: "main", value: s });
}

// ── HELPERS ──────────────────────────────────────────────────────────────────
export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function sumMacros(meals: Meal[]) {
  return meals.reduce(
    (acc, m) => ({
      calories: acc.calories + m.calories,
      protein: acc.protein + m.protein,
      carbs: acc.carbs + m.carbs,
      fat: acc.fat + m.fat,
      fiber: acc.fiber + m.fiber,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
  );
}
