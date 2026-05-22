import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const { type } = await req.json();
  const origin = req.headers.get("origin") ?? process.env.NEXT_PUBLIC_APP_URL!;

  const isRefill = type === "refill";

  const session = await stripe.checkout.sessions.create({
    mode: isRefill ? "subscription" : "payment",
    payment_method_types: ["card"],
    line_items: [{
      price: isRefill ? process.env.STRIPE_REFILL_PRICE_ID! : process.env.STRIPE_PRICE_ID!,
      quantity: 1,
    }],
    success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}&type=${isRefill ? "refill" : "pro"}`,
    cancel_url: `${origin}/`,
    metadata: { plan: isRefill ? "refill" : "pro" },
  });

  return NextResponse.json({ url: session.url });
}
