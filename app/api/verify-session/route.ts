import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { SignJWT } from "jose";

export async function POST(req: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const { sessionId } = await req.json();
  if (!sessionId) return NextResponse.json({ error: "Missing session_id" }, { status: 400 });

  const session = await stripe.checkout.sessions.retrieve(sessionId);
  if (session.payment_status !== "paid" && session.status !== "complete") {
    return NextResponse.json({ error: "Not paid" }, { status: 402 });
  }

  const secret = new TextEncoder().encode(process.env.PRO_JWT_SECRET!);
  const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 35; // 35 days

  const token = await new SignJWT({ plan: "pro", email: session.customer_email ?? "" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(session.customer ?? sessionId)
    .setExpirationTime(exp)
    .setIssuedAt()
    .sign(secret);

  return NextResponse.json({ token, exp });
}
