import "jsr:@supabase/functions-js/edge-runtime.d.ts";

interface CVCheckPayload {
  upload_id: string;
  file_url: string;
  file_url_fallback: string | null;
  file_name: string;
  source: string;
  user_id: string | null;
  temp_id: string | null;
  callback_url: string;
  timestamp: string;
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
    const payload: CVCheckPayload = await req.json();

    const makeWebhookUrl =
      Deno.env.get("MAKE_WEBHOOK_CVCHECK") ||
      Deno.env.get("MAKE_CV_CHECK_WEBHOOK_URL") ||
      Deno.env.get("VITE_MAKE_WEBHOOK_URL");
    if (!makeWebhookUrl) {
      console.error("[trigger-cv-check] No CV check webhook URL found in env (tried MAKE_WEBHOOK_CVCHECK, MAKE_CV_CHECK_WEBHOOK_URL, VITE_MAKE_WEBHOOK_URL)");
      return new Response(
        JSON.stringify({
          error: "Server misconfiguration: webhook URL not set",
          upload_id: payload.upload_id,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`[trigger-cv-check] Fetching file for upload_id: ${payload.upload_id}`);

    const fileUrl = payload.file_url_fallback || payload.file_url;
    const fileResponse = await fetch(fileUrl);

    if (!fileResponse.ok) {
      console.error(`[trigger-cv-check] Failed to fetch file: ${fileResponse.status}`);
      return new Response(
        JSON.stringify({
          error: `Failed to fetch CV file: ${fileResponse.status}`,
          upload_id: payload.upload_id,
        }),
        {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const fileBlob = await fileResponse.blob();

    console.log(`[trigger-cv-check] Forwarding to Make for upload_id: ${payload.upload_id}`);

    const formData = new FormData();
    formData.append("file", fileBlob, payload.file_name);
    formData.append("upload_id", payload.upload_id);
    formData.append("file_url", payload.file_url);
    if (payload.file_url_fallback) formData.append("file_url_fallback", payload.file_url_fallback);
    formData.append("file_name", payload.file_name);
    formData.append("source", payload.source);
    if (payload.user_id) formData.append("user_id", payload.user_id);
    if (payload.temp_id) formData.append("temp_id", payload.temp_id);
    formData.append("callback_url", payload.callback_url);
    formData.append("timestamp", payload.timestamp);

    const forwardResponse = await fetch(makeWebhookUrl, {
      method: "POST",
      body: formData,
    });

    const forwardStatus = forwardResponse.status;
    let forwardBody: any = null;

    try {
      const text = await forwardResponse.text();
      if (text.trim()) {
        forwardBody = JSON.parse(text);
      }
    } catch {
      forwardBody = null;
    }

    if (!forwardResponse.ok) {
      console.error(
        `[trigger-cv-check] Make webhook error: ${forwardStatus}`,
        forwardBody
      );
    } else {
      console.log(
        `[trigger-cv-check] Make webhook success for upload_id: ${payload.upload_id}`
      );
    }

    return new Response(
      JSON.stringify({
        success: forwardResponse.ok,
        upload_id: payload.upload_id,
        make_status: forwardStatus,
        make_response: forwardBody,
      }),
      {
        status: forwardStatus,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("[trigger-cv-check] Error:", error);

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
