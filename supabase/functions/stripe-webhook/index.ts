import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from "npm:stripe@17.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const TOKEN_MAPPING: Record<string, number> = {
  price_1SZbVG3Sd9dZl64SLJPFwfk3: 1,
  price_1SZbVs3Sd9dZl64SpcjlM7vG: 5,
  price_1SZbWQ3Sd9dZl64SFdf1QsGm: 10,
  price_1SZc133Sd9dZl64SYr82cZcX: 1,
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

    if (!stripeKey) {
      throw new Error("STRIPE_SECRET_KEY not configured");
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2024-12-18.acacia",
    });

    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      return new Response(
        JSON.stringify({ error: "Missing stripe-signature header" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const body = await req.text();
    let event: Stripe.Event;

    if (webhookSecret) {
      try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      } catch (err: any) {
        console.error("[Stripe Webhook] Signature verification failed:", err.message);
        return new Response(
          JSON.stringify({ error: `Webhook signature verification failed: ${err.message}` }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    } else {
      console.warn("[Stripe Webhook] ⚠️ STRIPE_WEBHOOK_SECRET not configured - skipping signature verification");
      event = JSON.parse(body);
    }

    console.log("[Stripe Webhook] Received event:", event.type);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log("[Stripe Webhook] Checkout session completed:", session.id);

      const userId = session.client_reference_id || session.metadata?.user_id;
      if (!userId) {
        console.error("[Stripe Webhook] No user_id found in session");
        return new Response(
          JSON.stringify({ error: "No user_id found" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
      const priceId = lineItems.data[0]?.price?.id;

      if (!priceId) {
        console.error("[Stripe Webhook] No price_id found in line items");
        return new Response(
          JSON.stringify({ error: "No price_id found" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const tokensToAdd = TOKEN_MAPPING[priceId] || 0;
      console.log("[Stripe Webhook] Adding tokens:", tokensToAdd, "for price:", priceId);

      const supabaseUrl = Deno.env.get("SUPABASE_URL");
      const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

      if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error("Supabase configuration missing");
      }

      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      const { data: profile, error: fetchError } = await supabase
        .from("profiles")
        .select("tokens")
        .eq("id", userId)
        .maybeSingle();

      if (fetchError) {
        console.error("[Stripe Webhook] Error fetching profile:", fetchError);
        throw fetchError;
      }

      const currentTokens = profile?.tokens || 0;
      const newTokens = currentTokens + tokensToAdd;

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ tokens: newTokens })
        .eq("id", userId);

      if (updateError) {
        console.error("[Stripe Webhook] Error updating tokens:", updateError);
        throw updateError;
      }

      console.log("[Stripe Webhook] ✅ Tokens updated successfully:", {
        userId,
        previous: currentTokens,
        added: tokensToAdd,
        new: newTokens,
      });

      const { error: logError } = await supabase
        .from("token_purchases")
        .insert({
          user_id: userId,
          stripe_session_id: session.id,
          price_id: priceId,
          tokens_purchased: tokensToAdd,
          amount_paid: session.amount_total,
          currency: session.currency,
        });

      if (logError) {
        console.warn("[Stripe Webhook] Could not log purchase (table may not exist):", logError);
      }
    }

    return new Response(
      JSON.stringify({ received: true }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("[Stripe Webhook] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
