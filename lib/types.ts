export type DietaryTag =
  | "vegan" | "vegetarian" | "halal" | "kosher"
  | "gluten_free" | "lactose_free" | "nut_free" | "egg_free"
  | "soy_free" | "sugar_free" | "organic"
  | "haram"; // explicitly not halal

export interface DietaryConfig {
  id: DietaryTag;
  label: string;
  emoji: string;
  color: string;
  bgColor: string; // for badge background
}

export const DIETARY_INFO: Record<DietaryTag, DietaryConfig> = {
  vegan:        { id:"vegan",        label:"Vegan",        emoji:"🌱", color:"#16a34a", bgColor:"#f0fdf4" },
  vegetarian:   { id:"vegetarian",   label:"Vegetarisch",  emoji:"🥦", color:"#65a30d", bgColor:"#f7fee7" },
  halal:        { id:"halal",        label:"Halal",        emoji:"☪",  color:"#d97706", bgColor:"#fffbeb" },
  kosher:       { id:"kosher",       label:"Kosher",       emoji:"✡",  color:"#7c3aed", bgColor:"#f5f3ff" },
  gluten_free:  { id:"gluten_free",  label:"Glutenfrei",   emoji:"🌾", color:"#ea580c", bgColor:"#fff7ed" },
  lactose_free: { id:"lactose_free", label:"Laktosefrei",  emoji:"🥛", color:"#2563eb", bgColor:"#eff6ff" },
  nut_free:     { id:"nut_free",     label:"Nussfrei",     emoji:"🥜", color:"#dc2626", bgColor:"#fef2f2" },
  egg_free:     { id:"egg_free",     label:"Eierfrei",     emoji:"🥚", color:"#ca8a04", bgColor:"#fefce8" },
  soy_free:     { id:"soy_free",     label:"Soyfrei",      emoji:"🫘", color:"#0d9488", bgColor:"#f0fdfa" },
  sugar_free:   { id:"sugar_free",   label:"Zuckerfrei",   emoji:"🚫", color:"#6b7280", bgColor:"#f9fafb" },
  organic:      { id:"organic",      label:"Bio",          emoji:"🌿", color:"#059669", bgColor:"#ecfdf5" },
  haram:        { id:"haram",        label:"Nicht halal",  emoji:"⚠",  color:"#dc2626", bgColor:"#fef2f2" },
};

export const DIETARY_FILTERS: DietaryTag[] = [
  "vegan","vegetarian","halal","kosher",
  "gluten_free","lactose_free","nut_free","egg_free","soy_free","sugar_free","organic",
];

export interface Meal {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  halal: boolean | null;
  dietaryTags: DietaryTag[];
  servingSize: number;
  timestamp: number;
  source: "manual" | "search" | "ai" | "barcode";
  photoUrl?: string;
  note?: string;
}

export interface DailyGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface AppSettings {
  name: string;
  plan: "free" | "pro";
  proToken: string;
  groqKey: string;
  aiScansToday: number;
  aiScansDate: string;
  goals: DailyGoals;
  dietaryProfile: DietaryTag[];
}

export const DEFAULT_GOALS: DailyGoals = {
  calories: 2000,
  protein: 150,
  carbs: 225,
  fat: 65,
};

export const DEFAULT_SETTINGS: AppSettings = {
  name: "",
  plan: "free",
  proToken: "",
  groqKey: "",
  aiScansToday: 0,
  aiScansDate: "",
  goals: DEFAULT_GOALS,
  dietaryProfile: [],
};

export const FREE_SCAN_LIMIT = 5;

export interface FoodSearchResult {
  id: string;
  name: string;
  brand?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  servingSize: number;
  imageUrl?: string;
  halal: boolean | null;
  dietaryTags: DietaryTag[];
}
