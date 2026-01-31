import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import Stripe from 'npm:stripe@17.7.0';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey, stripe-signature',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY')!;
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!;
const stripe = new Stripe(stripeSecret, {
  appInfo: {
    name: 'DYD CV Check',
    version: '1.0.0',
  },
});

Deno.serve(async (req) => {
  try {
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      console.error('Missing stripe-signature header');
      return new Response(JSON.stringify({ error: 'Missing signature' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.text();
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return new Response(JSON.stringify({ error: `Webhook Error: ${err.message}` }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Processing webhook event:', event.type);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log('Checkout session completed:', session.id);
      console.log('Full session object:', JSON.stringify(session, null, 2));

      const customerId = session.customer as string;
      const cvId = session.metadata?.cv_id;
      const source = session.metadata?.source;

      console.log('CRITICAL DEBUG - Metadata check:', {
        has_metadata: !!session.metadata,
        metadata_keys: session.metadata ? Object.keys(session.metadata) : [],
        cv_id_value: cvId,
        source_value: source,
        raw_metadata: session.metadata
      });

      // Expand line_items to get priceId
      const expandedSession = await stripe.checkout.sessions.retrieve(session.id, {
        expand: ['line_items'],
      });
      const priceId = expandedSession.line_items?.data[0]?.price?.id;

      console.log('Session metadata:', { cvId, source, priceId });

      const { data: customerData, error: customerError } = await supabase
        .from('stripe_customers')
        .select('user_id')
        .eq('customer_id', customerId)
        .maybeSingle();

      if (customerError || !customerData) {
        console.error('Failed to find user for customer:', customerId, customerError);
        return new Response(JSON.stringify({ error: 'User not found' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const userId = customerData.user_id;

      // Determine tokens from Stripe Price metadata
      let tokensToAdd = 0;

      // CV-Unlock purchase does not add tokens, it's a direct payment
      if (source !== 'cv_unlock' && priceId) {
        try {
          // Retrieve the price with product data to access metadata
          const price = await stripe.prices.retrieve(priceId, {
            expand: ['product'],
          });

          // Try to get tokens from price metadata first, then product metadata
          const priceMetadata = price.metadata?.tokens;
          const productMetadata = typeof price.product === 'object' ? price.product.metadata?.tokens : undefined;
          const tokensValue = priceMetadata || productMetadata;

          if (tokensValue) {
            tokensToAdd = Number(tokensValue);

            if (isNaN(tokensToAdd) || tokensToAdd < 0) {
              console.error(`[Stripe Webhook] Invalid tokens value in metadata: ${tokensValue}`);
              tokensToAdd = 0;
            }
          } else {
            console.warn(`[Stripe Webhook] No tokens metadata found for price ${priceId}`);
            tokensToAdd = 0;
          }

          if (tokensToAdd <= 0) {
            console.error(`[Stripe Webhook] No valid tokens found for price ${priceId}. Skipping token update.`);
          }
        } catch (err: any) {
          console.error(`[Stripe Webhook] Failed to retrieve price metadata:`, err.message);
          tokensToAdd = 0;
        }
      }

      // Update user tokens atomically
      if (tokensToAdd > 0) {
        // Try to insert new record - atomic operation
        const { error: insertError } = await supabase
          .from('user_tokens')
          .insert({ user_id: userId, credits: tokensToAdd });

        if (insertError && insertError.code === '23505') {
          // Unique constraint violation: user already exists, increment credits
          const { data: currentTokens } = await supabase
            .from('user_tokens')
            .select('credits')
            .eq('user_id', userId)
            .maybeSingle();

          const newBalance = (currentTokens?.credits || 0) + tokensToAdd;

          const { error: updateError } = await supabase
            .from('user_tokens')
            .update({ credits: newBalance })
            .eq('user_id', userId);

          if (updateError) {
            console.error('Failed to update tokens:', updateError);
            return new Response(JSON.stringify({ error: 'Failed to update tokens' }), {
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }

          console.log(`Added ${tokensToAdd} tokens to user ${userId}. New balance: ${newBalance}`);
        } else if (insertError) {
          console.error('Failed to insert tokens:', insertError);
          return new Response(JSON.stringify({ error: 'Failed to insert tokens' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } else {
          console.log(`Created new token record for user ${userId} with ${tokensToAdd} credits`);
        }
      }

      // Mark CV as paid if cvId is provided
      if (!cvId) {
        console.warn(`⚠️ WARNING: No cv_id in metadata. This might be a token purchase or metadata was not passed correctly.`);
      }

      if (cvId) {
        console.log(`🔥 CRITICAL: Marking CV ${cvId} as paid for user ${userId}`);

        const { data: updateResult, error: storedUpdateError } = await supabase
          .from('stored_cvs')
          .update({
            is_paid: true,
            download_unlocked: true,
            payment_date: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', cvId)
          .select();

        if (storedUpdateError) {
          console.error('❌ CRITICAL ERROR: Failed to mark CV as paid in stored_cvs:', storedUpdateError);
          console.error('Error details:', JSON.stringify(storedUpdateError, null, 2));
        } else {
          console.log(`✅ CRITICAL SUCCESS: Successfully marked CV ${cvId} as paid in stored_cvs`);
          console.log('Update result:', JSON.stringify(updateResult, null, 2));

          // Trigger PDF generation asynchronously
          try {
            console.log(`📄 Triggering PDF generation for CV ${cvId}`);
            const pdfGenerationUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/generate-cv-pdf`;

            fetch(pdfGenerationUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
              },
              body: JSON.stringify({ cvId }),
            })
              .then((res) => {
                console.log(`📄 PDF generation request sent, status: ${res.status}`);
                return res.json();
              })
              .then((pdfResult) => {
                console.log(`📄 PDF generation result:`, JSON.stringify(pdfResult, null, 2));
              })
              .catch((err) => {
                console.error(`❌ Error triggering PDF generation: ${err.message}`);
              });
          } catch (err) {
            console.error('❌ Error calling PDF generation function:', err);
          }
        }

        // For CV-Unlock purchases, save analysis to ats_analyses table
        if (source === 'cv_unlock') {
          console.log(`Saving ATS analysis to dashboard for CV ${cvId}`);

          try {
            // Fetch ATS data from stored_cvs with retry logic
            let cvData = null;
            let attempts = 0;
            const maxAttempts = 3;

            while (attempts < maxAttempts && !cvData?.ats_json) {
              attempts++;

              const { data, error: cvError } = await supabase
                .from('stored_cvs')
                .select('ats_json, vision_text, status')
                .eq('id', cvId)
                .maybeSingle();

              if (cvError) {
                console.error(`Attempt ${attempts}: Failed to fetch CV data:`, cvError);
                break;
              }

              if (data?.ats_json) {
                cvData = data;
                break;
              }

              // Warte 2 Sekunden bevor nächster Versuch
              if (attempts < maxAttempts) {
                console.log(`Attempt ${attempts}: ATS data not ready yet, waiting...`);
                await new Promise(resolve => setTimeout(resolve, 2000));
              }
            }

            if (!cvData?.ats_json) {
              console.error('Failed to fetch CV data for analysis save after all attempts');
            } else {
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

              const { error: analysisError } = await supabase
                .from('ats_analyses')
                .upsert({
                  user_id: userId,
                  upload_id: cvId,
                  ats_score: score,
                  category_scores: categoryScores,
                  feedback,
                  recommendations,
                  analysis_data: atsJson,
                  extracted_cv_data: {},
                }, {
                  onConflict: 'user_id,upload_id'
                });

              if (analysisError) {
                console.error('Failed to save analysis to dashboard:', analysisError);
              } else {
                console.log(`Successfully saved analysis for CV ${cvId} to dashboard`);
              }
            }
          } catch (analysisErr) {
            console.error('Error saving analysis to dashboard:', analysisErr);
          }
        }
      }

      // Create order record
      const { error: orderError } = await supabase.from('stripe_orders').insert({
        checkout_session_id: session.id,
        payment_intent_id: session.payment_intent as string,
        customer_id: customerId,
        amount_subtotal: session.amount_subtotal || 0,
        amount_total: session.amount_total || 0,
        currency: session.currency || 'eur',
        payment_status: session.payment_status || 'unpaid',
        status: 'completed',
      });

      if (orderError) {
        console.error('Failed to create order record:', orderError);
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
