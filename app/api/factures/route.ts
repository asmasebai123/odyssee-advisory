import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";

/**
 * GET /api/factures — list invoices visible to the current user.
 */
export async function GET(_request: NextRequest): Promise<NextResponse> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("factures")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ factures: data });
}

/**
 * POST /api/factures — create a Stripe Checkout session for an invoice.
 * Body: { facture_id: string, amount_cents: number, description: string }
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    facture_id: string;
    amount_cents: number;
    description: string;
  };

  const origin = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "eur",
          product_data: { name: body.description },
          unit_amount: body.amount_cents,
        },
        quantity: 1,
      },
    ],
    metadata: { facture_id: body.facture_id, user_id: user.id },
    success_url: `${origin}/factures?paid=1`,
    cancel_url: `${origin}/factures?cancelled=1`,
  });

  return NextResponse.json({ url: session.url });
}
