import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

interface MakeCVCallbackRequest {
  cv_id: string;
  cv_data?: Record<string, any>;
  status?: string;
  error?: string;
  [key: string]: any;
}

Deno.serve(async (req: Request) => {
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

  try {
    const payload: MakeCVCallbackRequest = await req.json();
    console.log('[MAKE CV CALLBACK] Received payload:', {
      cv_id: payload.cv_id,
      has_cv_data: !!payload.cv_data,
      status: payload.status,
      error: payload.error,
    });

    const { cv_id, cv_data, status, error } = payload;

    if (!cv_id) {
      return new Response(
        JSON.stringify({ error: 'Missing cv_id' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Prepare update object
    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (error) {
      console.error(`[MAKE CV CALLBACK] Error from Make: ${error}`);
      updateData.status = 'failed';
      updateData.error_message = error;
    } else if (cv_data) {
      console.log('[MAKE CV CALLBACK] Storing CV data...');
      updateData.cv_data = cv_data;
      updateData.status = status || 'completed';
      updateData.error_message = null;
    } else if (status) {
      console.log(`[MAKE CV CALLBACK] Updating status to: ${status}`);
      updateData.status = status;
    } else {
      return new Response(
        JSON.stringify({ error: 'No cv_data, status, or error provided' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Update stored_cvs
    const { error: updateError, data } = await supabase
      .from('stored_cvs')
      .update(updateData)
      .eq('id', cv_id)
      .select();

    if (updateError) {
      console.error('[MAKE CV CALLBACK] Database update error:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update CV data', details: updateError.message }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('[MAKE CV CALLBACK] Successfully updated CV:', cv_id);

    // Trigger PDF generation asynchronously (if cv_data was provided)
    if (cv_data && !error) {
      console.log('[MAKE CV CALLBACK] Triggering PDF generation for CV:', cv_id);
      const pdfFunctionUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/generate-cv-pdf`;

      // Fire and forget - don't await
      fetch(pdfFunctionUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cvId: cv_id }),
      })
        .then(() => console.log('[MAKE CV CALLBACK] PDF generation triggered successfully'))
        .catch(err => console.error('[MAKE CV CALLBACK] Failed to trigger PDF generation:', err.message));
    }

    return new Response(
      JSON.stringify({
        success: true,
        cv_id,
        message: 'CV data stored successfully',
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('[MAKE CV CALLBACK] Error:', error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
