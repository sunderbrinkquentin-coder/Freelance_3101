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

    const payload: MakeCallbackPayload = await req.json();

    console.log("[make-cv-callback] Payload received:", {
      upload_id: payload.upload_id,
      status: payload.status,
      has_ats_json: !!payload.ats_json,
      has_vision_text: !!payload.vision_text,
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

    console.log("[make-cv-callback] Updating stored_cvs record...");

    // Build update payload
    const updateData: any = {
      status: payload.status,
      updated_at: new Date().toISOString(),
    };

    // Add optional fields if provided
    if (payload.ats_json !== undefined) {
      updateData.ats_json = payload.ats_json;
    }

    if (payload.vision_text !== undefined) {
      updateData.vision_text = payload.vision_text;
    }

    if (payload.error_message !== undefined) {
      updateData.error_message = payload.error_message;
    }

    if (payload.status === "completed") {
      updateData.processed_at = new Date().toISOString();
    }

    // Update database with service role (bypasses RLS)
    const { data, error } = await supabase
      .from("stored_cvs")
      .update(updateData)
      .eq("id", payload.upload_id)
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
