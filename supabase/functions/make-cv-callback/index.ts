import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface MakeCallbackPayload {
  upload_id: string;
  status: string;
  ats_json?: any;
  vision_text?: string;
  error_message?: string;
  file_url?: string;
  original_file_url?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    console.log("[make-cv-callback] Request received:", {
      method: req.method,
      url: req.url,
    });

    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        {
          status: 405,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const webhookSecret = Deno.env.get("MAKE_WEBHOOK_SECRET");
    let payload: MakeCallbackPayload;

    if (webhookSecret) {
      const signature = req.headers.get("x-webhook-signature");

      if (!signature) {
        console.error("[make-cv-callback] Missing webhook signature");
        return new Response(
          JSON.stringify({ error: "Unauthorized - Missing signature" }),
          {
            status: 401,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          }
        );
      }

      const body = await req.text();

      const encoder = new TextEncoder();
      const data = encoder.encode(body + webhookSecret);
      const hashBuffer = await crypto.subtle.digest("SHA-256", data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const expectedSignature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      if (signature !== expectedSignature) {
        console.error("[make-cv-callback] Invalid webhook signature");
        return new Response(
          JSON.stringify({ error: "Unauthorized - Invalid signature" }),
          {
            status: 401,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          }
        );
      }

      console.log("[make-cv-callback] Webhook signature verified");
      payload = JSON.parse(body);
    } else {
      console.warn("[make-cv-callback] MAKE_WEBHOOK_SECRET not configured - skipping signature verification");
      payload = await req.json();
    }

    console.log("[make-cv-callback] Payload received:", {
      upload_id: payload.upload_id,
      status: payload.status,
      has_ats_json: !!payload.ats_json,
      has_vision_text: !!payload.vision_text,
      ats_json_type: payload.ats_json ? typeof payload.ats_json : 'undefined',
      ats_json_preview: payload.ats_json ? JSON.stringify(payload.ats_json).substring(0, 100) : 'none',
    });

    if (!payload.upload_id) {
      return new Response(
        JSON.stringify({ error: "Missing upload_id" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Initialize Supabase client with SERVICE_ROLE_KEY (bypasses RLS)
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("[make-cv-callback] Missing environment variables");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    console.log("[make-cv-callback] Upserting stored_cvs record...");

    // Build upsert payload (insert if not exists, update if exists)
    const upsertData: any = {
      id: payload.upload_id,
      status: payload.status,
      source: "check",
      updated_at: new Date().toISOString(),
    };

    // Add optional fields if provided
    if (payload.ats_json !== undefined) {
      upsertData.ats_json = payload.ats_json;
    }

    if (payload.vision_text !== undefined) {
      upsertData.vision_text = payload.vision_text;
    }

    if (payload.error_message !== undefined) {
      upsertData.error_message = payload.error_message;
    }

    if (payload.file_url !== undefined) {
      upsertData.file_url = payload.file_url;
      upsertData.original_file_url = payload.file_url;
    }

    if (payload.original_file_url !== undefined) {
      upsertData.original_file_url = payload.original_file_url;
    }

    if (payload.status === "completed") {
      upsertData.processed_at = new Date().toISOString();
      console.log("[make-cv-callback] Setting processed_at timestamp:", upsertData.processed_at);
    }

    // Upsert database with service role (bypasses RLS)
    // Uses onConflict on 'id' to update existing records or insert new ones
    const { data, error } = await supabase
      .from("stored_cvs")
      .upsert(upsertData, { onConflict: "id" })
      .select();

    if (error) {
      console.error("[make-cv-callback] Database update error:", error);
      return new Response(
        JSON.stringify({
          error: "Failed to update CV record",
          details: error.message,
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    console.log("[make-cv-callback] Successfully updated record:", {
      upload_id: payload.upload_id,
      status: payload.status,
      rowsAffected: data?.length || 0,
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: "CV record updated successfully",
        upload_id: payload.upload_id,
        status: payload.status,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error: any) {
    console.error("[make-cv-callback] Error:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error.message,
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
