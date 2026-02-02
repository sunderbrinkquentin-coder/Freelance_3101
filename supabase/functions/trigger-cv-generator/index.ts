import "jsr:@supabase/functions-js/edge-runtime.d.ts";

interface CVGeneratorPayload {
  cv_id: string;
  session_id: string | null;
  user_id: string | null;
  callback_url: string;
  cv_draft: Record<string, any>;
  job_data: Record<string, any>;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const payload: CVGeneratorPayload = await req.json();

    const makeWebhookUrl = Deno.env.get("MAKE_WEBHOOK_CVGENERATOR");
    if (!makeWebhookUrl) {
      console.error("[trigger-cv-generator] MAKE_WEBHOOK_CVGENERATOR not set in env");
      return new Response(
        JSON.stringify({
          error: "Server misconfiguration: webhook URL not set",
          cv_id: payload.cv_id,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`[trigger-cv-generator] Forwarding to Make for cv_id: ${payload.cv_id}`);

    const forwardResponse = await fetch(makeWebhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const forwardStatus = forwardResponse.status;
    let forwardBody: any = null;

    try {
      forwardBody = await forwardResponse.json();
    } catch {
      forwardBody = await forwardResponse.text();
    }

    if (!forwardResponse.ok) {
      console.error(
        `[trigger-cv-generator] Make webhook error: ${forwardStatus}`,
        forwardBody
      );
    } else {
      console.log(
        `[trigger-cv-generator] Make webhook success for cv_id: ${payload.cv_id}`
      );
    }

    return new Response(
      JSON.stringify({
        success: forwardResponse.ok,
        cv_id: payload.cv_id,
        make_status: forwardStatus,
        make_response: forwardBody,
      }),
      {
        status: forwardStatus,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("[trigger-cv-generator] Error:", error);

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
