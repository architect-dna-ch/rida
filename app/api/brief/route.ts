import { NextRequest, NextResponse } from "next/server";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

export async function POST(req: NextRequest) {
  const { type, context } = await req.json();

  const systemPrompt = type === "morning"
    ? `You are a gentle, faith-aware morning companion for a Muslim.
       Respond in the user's language (German or English based on context).
       Be warm, grounded, concise. Never preachy.
       Return ONLY valid JSON: { "focus": "one sentence on what to focus on today", "reach": "one person or type of person to reach out to and why (one sentence)", "ayah": { "arabic": "short ayah text", "translation": "translation", "reference": "Surah:Ayah" } }`
    : `You are a gentle, faith-aware evening companion for a Muslim.
       Respond in the user's language (German or English based on context).
       Be warm, reflective, honest. One short paragraph max.
       Return ONLY valid JSON: { "insight": "a private weekly insight in 2-3 sentences connecting their wins, patterns and spiritual state" }`;

  const userPrompt = type === "morning"
    ? `My context: ${JSON.stringify(context)}`
    : `My 3 wins today: ${context.wins.join(", ")}. My week: ${JSON.stringify(context.week)}`;

  try {
    const res = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 400,
        temperature: 0.7,
      }),
    });
    const data = await res.json();
    const text = data.choices?.[0]?.message?.content || "{}";
    const clean = text.replace(/```json|```/g, "").trim();
    return NextResponse.json(JSON.parse(clean));
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
