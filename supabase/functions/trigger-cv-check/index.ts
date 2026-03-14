import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

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

async function markFailed(supabase: ReturnType<typeof createClient>, uploadId: string, message: string) {
  try {
    await supabase
      .from("stored_cvs")
      .update({ status: "failed", error_message: message })
      .eq("id", uploadId);
  } catch (e) {
    console.error("[trigger-cv-check] Failed to update error status:", e);
  }
}

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

    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const makeWebhookUrl =
      Deno.env.get("MAKE_WEBHOOK_CVCHECK") ||
      Deno.env.get("MAKE_CV_CHECK_WEBHOOK_URL") ||
      Deno.env.get("VITE_MAKE_WEBHOOK_URL");

    if (!makeWebhookUrl) {
      console.error("[trigger-cv-check] No CV check webhook URL configured");
      await markFailed(supabase, payload.upload_id, "Server misconfiguration: webhook URL not set");
      return new Response(
        JSON.stringify({ error: "Server misconfiguration: webhook URL not set", upload_id: payload.upload_id }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const signedUrl = payload.file_url_fallback || null;
    const publicUrl = payload.file_url;
    const urlsToTry = [signedUrl, publicUrl].filter(Boolean) as string[];

    console.log(`[trigger-cv-check] Fetching file for upload_id: ${payload.upload_id}, trying ${urlsToTry.length} URLs`);

    let fileBlob: Blob | null = null;
    let lastError = "";

    for (const url of urlsToTry) {
      try {
        const resp = await fetch(url);
        if (resp.ok) {
          fileBlob = await resp.blob();
          console.log(`[trigger-cv-check] File fetched successfully, size: ${fileBlob.size}`);
          break;
        } else {
          lastError = `HTTP ${resp.status} from ${url.substring(0, 60)}`;
          console.warn(`[trigger-cv-check] URL failed (${resp.status}), trying next...`);
        }
      } catch (fetchErr) {
        lastError = String(fetchErr);
        console.warn(`[trigger-cv-check] Fetch error, trying next:`, fetchErr);
      }
    }

    if (!fileBlob) {
      const errMsg = `Failed to fetch CV file: ${lastError}`;
      console.error(`[trigger-cv-check] ${errMsg}`);
      await markFailed(supabase, payload.upload_id, errMsg);
      return new Response(
        JSON.stringify({ error: errMsg, upload_id: payload.upload_id }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[trigger-cv-check] Forwarding to Make for upload_id: ${payload.upload_id}`);

    const formData = new FormData();
    formData.append("file", fileBlob, payload.file_name);
    formData.append("upload_id", payload.upload_id);
    formData.append("file_url", publicUrl);
    if (signedUrl) formData.append("file_url_fallback", signedUrl);
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
        try {
          forwardBody = JSON.parse(text);
        } catch {
          forwardBody = text;
        }
      }
    } catch {
      forwardBody = null;
    }

    if (!forwardResponse.ok) {
      console.error(`[trigger-cv-check] Make webhook error: ${forwardStatus}`, forwardBody);
      await markFailed(supabase, payload.upload_id, `Make webhook returned ${forwardStatus}`);
    } else {
      console.log(`[trigger-cv-check] Make webhook success for upload_id: ${payload.upload_id}`);
      await supabase
        .from("stored_cvs")
        .update({ make_sent_at: new Date().toISOString() })
        .eq("id", payload.upload_id);
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
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
