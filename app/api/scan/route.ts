import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const FREE_DAILY_LIMIT = 3;
const PRO_DAILY_LIMIT  = 50; // cost control: ~50 scans/day max even for pro users

const SYSTEM = `You are a nutrition and dietary expert. The user sends a photo of food.
Identify all visible food items and estimate their macros and dietary properties.
Respond ONLY with valid JSON in this exact format (no markdown):
{
  "items": [
    {
      "name": "Food name",
      "estimatedGrams": 150,
      "calories": 320,
      "protein": 12.5,
      "carbs": 45.0,
      "fat": 8.0,
      "fiber": 2.5,
      "halal": true,
      "dietaryTags": ["vegan", "gluten_free"]
    }
  ],
  "totalCalories": 320,
  "confidence": "medium",
  "notes": "Optional notes"
}

dietaryTags is an array — include any that apply from:
"vegan", "vegetarian", "halal", "haram", "kosher",
"gluten_free", "lactose_free", "nut_free", "egg_free",
"soy_free", "sugar_free", "organic"

Rules:
- halal: true if clearly halal (vegetarian/vegan/fish/certified), false if pork/alcohol visible, null if uncertain
- vegan: no animal products whatsoever
- vegetarian: no meat or fish (eggs/dairy ok)
- haram: if pork, alcohol, or blood clearly present
- Be conservative with estimates. List each dish/component separately.`;

async function verifyProToken(token: string): Promise<boolean> {
  try {
    const secret = new TextEncoder().encode(process.env.PRO_JWT_SECRET!);
    const { payload } = await jwtVerify(token, secret);
    return payload.plan === "pro";
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  const { imageBase64, mimeType = "image/jpeg", proToken, scansToday = 0 } = await req.json();
  if (!imageBase64) return NextResponse.json({ error: "No image" }, { status: 400 });

  const isPro = proToken ? await verifyProToken(proToken) : false;

  const limit = isPro ? PRO_DAILY_LIMIT : FREE_DAILY_LIMIT;
  if (scansToday >= limit) {
    return NextResponse.json({
      error: isPro
        ? `Tageslimit erreicht (${PRO_DAILY_LIMIT} Scans/Tag).`
        : `Tageslimit erreicht (${FREE_DAILY_LIMIT} Scans/Tag). Upgrade auf Pro für mehr Scans.`,
      limitReached: true,
    }, { status: 429 });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "Service not configured" }, { status: 500 });

  try {
    const res = await fetch(GROQ_URL, {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "meta-llama/llama-4-scout-17b-16e-instruct",
        messages: [{
          role: "user",
          content: [
            { type: "text", text: SYSTEM },
            { type: "image_url", image_url: { url: `data:${mimeType};base64,${imageBase64}` } },
          ],
        }],
        max_tokens: 900,
        temperature: 0.1,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return NextResponse.json({ error: (err as { error?: { message?: string } }).error?.message ?? `HTTP ${res.status}` }, { status: res.status });
    }

    const data = await res.json();
    const raw = data.choices?.[0]?.message?.content ?? "";
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) return NextResponse.json({ error: "Invalid model response" }, { status: 500 });

    return NextResponse.json({ ...JSON.parse(match[0]), isPro });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
