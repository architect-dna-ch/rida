import { NextRequest, NextResponse } from "next/server";
import type { DietaryTag } from "@/lib/types";

const OFF_BASE = "https://world.openfoodfacts.org";

function parseDietaryTags(p: Record<string, unknown>): DietaryTag[] {
  const labels = String(p.labels_tags ?? p.labels ?? "").toLowerCase();
  const allergens = String(p.allergens_tags ?? p.allergens ?? "").toLowerCase();
  const ingredients = String(p.ingredients_text ?? "").toLowerCase();
  const tags: DietaryTag[] = [];

  if (labels.includes("en:vegan") || labels.includes("vegan")) tags.push("vegan");
  if (tags.includes("vegan") || labels.includes("en:vegetarian") || labels.includes("vegetarian")) {
    if (!tags.includes("vegetarian")) tags.push("vegetarian");
  }
  if (labels.includes("halal")) tags.push("halal");
  if (labels.includes("haram") || allergens.includes("pork") || ingredients.includes("alcool") || ingredients.includes("wein") || ingredients.includes("bier")) tags.push("haram");
  if (labels.includes("kosher") || labels.includes("kasher")) tags.push("kosher");
  if (labels.includes("gluten-free") || labels.includes("sans-gluten") || labels.includes("glutenfrei") || labels.includes("en:no-gluten")) tags.push("gluten_free");
  if (labels.includes("lactose-free") || labels.includes("sans-lactose") || labels.includes("laktosefrei") || labels.includes("en:no-lactose")) tags.push("lactose_free");
  if (!allergens.includes("en:nuts") && !allergens.includes("en:peanuts") && !ingredients.includes("nuss") && !ingredients.includes("mandel") && !ingredients.includes("cashew")) {
    // Only tag nut_free if explicitly labelled
    if (labels.includes("nut-free") || labels.includes("nussfrei") || labels.includes("sans-noix")) tags.push("nut_free");
  }
  if (labels.includes("egg-free") || labels.includes("sans-oeuf") || labels.includes("eierfrei")) tags.push("egg_free");
  if (labels.includes("soy-free") || labels.includes("sans-soja") || labels.includes("soyfrei")) tags.push("soy_free");
  if (labels.includes("sugar-free") || labels.includes("sans-sucre") || labels.includes("zuckerfrei") || labels.includes("en:no-added-sugar")) tags.push("sugar_free");
  if (labels.includes("en:organic") || labels.includes("bio") || labels.includes("organic") || labels.includes("biologique")) tags.push("organic");

  return [...new Set(tags)];
}

function parseProduct(p: Record<string, unknown>) {
  const n = (p.nutriments as Record<string, number>) ?? {};
  const serving = Number(p.serving_quantity ?? p.product_quantity ?? 100) || 100;
  const per100 = (val: number) => Math.round((val / 100) * serving * 10) / 10;

  const name =
    (p.product_name_de as string) ||
    (p.product_name_fr as string) ||
    (p.product_name_en as string) ||
    (p.product_name as string) ||
    "Unbekannt";

  const dietaryTags = parseDietaryTags(p);
  const halal = dietaryTags.includes("halal") ? true : dietaryTags.includes("haram") ? false : null;

  return {
    id: String(p.code ?? p._id ?? Math.random()),
    name,
    brand: (p.brands as string) ?? "",
    calories: per100(n["energy-kcal_100g"] ?? n["energy-kcal"] ?? 0),
    protein: per100(n["proteins_100g"] ?? n["proteins"] ?? 0),
    carbs: per100(n["carbohydrates_100g"] ?? n["carbohydrates"] ?? 0),
    fat: per100(n["fat_100g"] ?? n["fat"] ?? 0),
    fiber: per100(n["fiber_100g"] ?? n["fiber"] ?? 0),
    servingSize: serving,
    imageUrl: (p.image_front_small_url as string) ?? "",
    halal,
    dietaryTags,
  };
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q");
  const barcode = req.nextUrl.searchParams.get("barcode");
  const diet = req.nextUrl.searchParams.get("diet"); // comma-separated DietaryTag filter

  const fields = "product_name,product_name_de,product_name_fr,product_name_en,brands,nutriments,serving_quantity,labels_tags,labels,allergens_tags,allergens,ingredients_text,image_front_small_url,code";

  try {
    if (barcode) {
      const res = await fetch(`${OFF_BASE}/api/v2/product/${barcode}.json?fields=${fields}`, { next: { revalidate: 3600 } });
      const data = await res.json();
      if (data.status !== 1) return NextResponse.json({ results: [] });
      return NextResponse.json({ results: [parseProduct(data.product)] });
    }

    if (!q) return NextResponse.json({ results: [] });

    const url = `${OFF_BASE}/cgi/search.pl?search_terms=${encodeURIComponent(q)}&search_simple=1&action=process&json=1&page_size=16&fields=${fields}&lc=de&cc=ch`;
    const res = await fetch(url, { next: { revalidate: 300 } });
    const data = await res.json();

    let results = (data.products ?? []).map(parseProduct).filter((p: { calories: number }) => p.calories > 0);

    // Apply dietary filter if requested
    if (diet) {
      const required = diet.split(",").map(d => d.trim()) as DietaryTag[];
      results = results.filter((r: { dietaryTags: DietaryTag[] }) =>
        required.every(tag => r.dietaryTags.includes(tag))
      );
    }

    return NextResponse.json({ results });
  } catch {
    return NextResponse.json({ results: [], error: "Fetch failed" }, { status: 500 });
  }
}
