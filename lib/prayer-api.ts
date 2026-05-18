/**
 * AlAdhan API — prayer times by city or coordinates
 * Docs: https://aladhan.com/prayer-times-api
 * Free, no key needed, returns all 5 daily prayers + sunrise/midnight
 */

export interface PrayerTimes {
  Fajr:    string;   // "05:23"
  Sunrise: string;
  Dhuhr:   string;
  Asr:     string;
  Maghrib: string;
  Isha:    string;
}

export interface PrayerSlot {
  name:   string;
  time:   string;   // "HH:MM"
  minutes: number;  // minutes since midnight — for timeline positioning
  color:  string;   // user-customizable
}

const DEFAULT_COLORS: Record<string, string> = {
  Fajr:    "#4f6fa8",  // deep blue — pre-dawn quiet
  Sunrise: "#e8a44a",  // golden
  Dhuhr:   "#5a9e6f",  // midday green
  Asr:     "#c4743a",  // afternoon amber
  Maghrib: "#9b4a82",  // sunset purple
  Isha:    "#2d3a5e",  // night blue
};

export const PRAYER_NAMES = ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"] as const;

function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

export async function fetchPrayerTimes(
  latitude: number,
  longitude: number,
  method = 3  // Muslim World League
): Promise<PrayerSlot[]> {
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, "-");
  const url = `https://api.aladhan.com/v1/timings/${today}?latitude=${latitude}&longitude=${longitude}&method=${method}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`AlAdhan API error: ${res.status}`);

  const data = await res.json();
  const timings: PrayerTimes = data.data.timings;

  return PRAYER_NAMES.map((name) => ({
    name,
    time:    timings[name as keyof PrayerTimes],
    minutes: timeToMinutes(timings[name as keyof PrayerTimes]),
    color:   DEFAULT_COLORS[name],
  }));
}

export async function fetchByCity(city: string, country: string): Promise<PrayerSlot[]> {
  const today = new Date().toISOString().slice(0, 10);
  const url = `https://api.aladhan.com/v1/timingsByCity/${today}?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&method=3`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`AlAdhan API error: ${res.status}`);

  const data = await res.json();
  const timings: PrayerTimes = data.data.timings;

  return PRAYER_NAMES.map((name) => ({
    name,
    time:    timings[name as keyof PrayerTimes],
    minutes: timeToMinutes(timings[name as keyof PrayerTimes]),
    color:   DEFAULT_COLORS[name],
  }));
}
