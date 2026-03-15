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

const FESTIVAL_TICKET_MAPPING: Record<string, { type: string; label: string }> = {
  price_1T9NSV3Sd9dZl64S39A2Rpl1: { type: "early_bird", label: "EARLY Bird Bundle" },
  price_1T9NPZ3Sd9dZl64SjF0ilg4Z: { type: "dj", label: "DJ Sets House / Techno" },
  price_1T9NPE3Sd9dZl64S5l8dCMJg: { type: "concert", label: "Live Konzert Zirkel.WTF" },
  price_1T9NLf3Sd9dZl64Sdp05jz2i: { type: "bierpong", label: "Bierpong" },
  price_1T9NKn3Sd9dZl64SsyJls5J3: { type: "standup", label: "Stand-Up Comedy" },
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
      const festivalTicket = FESTIVAL_TICKET_MAPPING[priceId];
      console.log("[Stripe Webhook] Price:", priceId, "| Tokens:", tokensToAdd, "| Festival:", festivalTicket?.label || "none");

      const supabaseUrl = Deno.env.get("SUPABASE_URL");
      const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

      if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error("Supabase configuration missing");
      }

      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      if (festivalTicket) {
        console.log("[Stripe Webhook] 🎟️ Festival ticket purchase detected:", festivalTicket.label);
        const { error: festivalError } = await supabase
          .from("festival_ticket_sales")
          .insert({
            stripe_session_id: session.id,
            stripe_payment_intent_id: session.payment_intent as string || null,
            ticket_type: festivalTicket.type,
            ticket_label: festivalTicket.label,
            amount_paid: session.amount_total,
            currency: session.currency,
            buyer_email: session.customer_details?.email || session.customer_email || null,
            buyer_name: session.customer_details?.name || null,
            payment_status: session.payment_status,
          });

        if (festivalError) {
          console.error("[Stripe Webhook] ❌ Error saving festival ticket sale:", festivalError);
        } else {
          console.log("[Stripe Webhook] ✅ Festival ticket sale recorded successfully");
        }

        return new Response(
          JSON.stringify({ received: true }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // ✅ Check if this payment is for a CV upload
      const cvId = session.metadata?.cvId || session.metadata?.cv_id;

      if (cvId) {
        console.log("[Stripe Webhook] 💳 Payment for CV upload detected:", cvId);

        // Update stored_cvs to mark as paid
        const { error: updateCvError } = await supabase
          .from("stored_cvs")
          .update({
            is_paid: true,
            download_unlocked: true,
            payment_date: new Date().toISOString()
          })
          .eq("id", cvId);

        if (updateCvError) {
          console.error("[Stripe Webhook] ❌ Error updating CV payment status:", updateCvError);
        } else {
          console.log("[Stripe Webhook] ✅ CV payment status updated");

          // Fetch the CV data to save analysis
          const { data: cvData, error: cvFetchError } = await supabase
            .from("stored_cvs")
            .select("ats_json, user_id")
            .eq("id", cvId)
            .maybeSingle();

          if (cvFetchError || !cvData) {
            console.error("[Stripe Webhook] ❌ Error fetching CV data:", cvFetchError);
          } else if (cvData.ats_json) {
            console.log("[Stripe Webhook] 💾 Saving analysis to ats_analyses table...");

            // Parse and save to ats_analyses
            const atsJson = cvData.ats_json;
            const score = Math.max(0, Math.min(100, atsJson.ats_score ?? 0));

            const categories = [
              { key: 'relevanz_fokus', data: atsJson.relevanz_fokus },
              { key: 'erfolge_kpis', data: atsJson.erfolge_kpis },
              { key: 'klarheit_sprache', data: atsJson.klarheit_sprache },
              { key: 'formales', data: atsJson.formales },
              { key: 'usp_skills', data: atsJson.usp_skills },
            ];

            const categoryScores: Record<string, number> = {};
            const feedback: Record<string, string> = {};
            const recommendations: Record<string, string> = {};

            categories.forEach((cat) => {
              if (cat.data) {
                categoryScores[cat.key] = cat.data.score ?? 0;
                if (cat.data.feedback) feedback[cat.key] = cat.data.feedback;
                if (cat.data.verbesserung) recommendations[cat.key] = cat.data.verbesserung;
              }
            });

            const { error: insertError } = await supabase
              .from('ats_analyses')
              .insert({
                user_id: cvData.user_id || userId,
                upload_id: cvId,
                ats_score: score,
                category_scores: categoryScores,
                feedback,
                recommendations,
                analysis_data: atsJson,
                extracted_cv_data: {},
              });

            if (insertError) {
              console.error("[Stripe Webhook] ❌ Error saving analysis:", insertError);
            } else {
              console.log("[Stripe Webhook] ✅ Analysis saved to dashboard successfully");
            }
          }
        }
      }

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
