import { NextRequest, NextResponse } from "next/server";
import { TwitterApi } from "twitter-api-v2";

export async function POST(req: NextRequest) {
  const { text } = await req.json();
  if (!text) return NextResponse.json({ error: "No text" }, { status: 400 });
  try {
    const client = new TwitterApi({
      appKey:       process.env.X_API_KEY!,
      appSecret:    process.env.X_API_SECRET!,
      accessToken:  process.env.X_ACCESS_TOKEN!,
      accessSecret: process.env.X_ACCESS_SECRET!,
    });
    const tweet = await client.v2.tweet(text);
    return NextResponse.json({ id: tweet.data.id });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
