import Stripe from "stripe";

/**
 * Server-side Stripe client. Do not import from client components.
 */
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2024-06-20",
  typescript: true,
  appInfo: {
    name: "Odyssée Advisory",
    version: "0.1.0",
  },
});

export const STRIPE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";
