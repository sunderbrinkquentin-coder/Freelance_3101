import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';
import puppeteer from 'npm:puppeteer@21.6.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface GeneratePdfRequest {
  cvId: string;
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const generateSimplePdf = async (cvData: any, template: string = 'modern'): Promise<Uint8Array> => {
  const html = generateHtmlFromCvData(cvData, template);
  
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });
  const pdfBuffer = await page.pdf({ format: 'A4' });
  await browser.close();
  
  return pdfBuffer;
};

const generateHtmlFromCvData = (cvData: any, template: string): string => {
  const name = cvData.name || 'CV';
  const jobTitle = cvData.jobTitle || '';
  const email = cvData.email || '';
  const phone = cvData.phone || '';
  const location = cvData.location || '';
  const profile = cvData.profile || '';
  const experience = cvData.experience || [];
  const education = cvData.education || [];
  const skills = cvData.skills || [];

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Helvetica', sans-serif; font-size: 11pt; line-height: 1.4; color: #333; }
        .header { background: #89a7b2; color: white; padding: 30px; margin-bottom: 20px; }
        .header h1 { font-size: 28px; margin-bottom: 5px; }
        .header .title { font-size: 14px; opacity: 0.9; margin-bottom: 8px; }
        .header .contact { font-size: 11px; opacity: 0.85; }
        .content { padding: 0 40px; }
        .section { margin-bottom: 20px; }
        .section-title { font-size: 12px; font-weight: bold; text-transform: uppercase; border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-bottom: 10px; }
        .entry { margin-bottom: 12px; }
        .entry-title { font-weight: bold; }
        .entry-subtitle { color: #666; font-size: 10px; }
        .entry-period { font-size: 10px; color: #999; }
        .bullets { margin-top: 5px; margin-left: 20px; }
        .bullet { margin-bottom: 3px; }
        .skills-container { display: flex; flex-wrap: wrap; gap: 8px; }
        .skill-tag { border: 1px solid #ddd; padding: 5px 10px; border-radius: 4px; font-size: 10px; }
        @media print { body { margin: 0; padding: 0; } }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${name}</h1>
        <div class="title">${jobTitle}</div>
        <div class="contact">${location} · ${phone} · ${email}</div>
      </div>

      <div class="content">
        ${profile ? `<div class="section"><div class="section-title">Profil</div><p>${profile}</p></div>` : ''}

        ${experience.length > 0 ? `
          <div class="section">
            <div class="section-title">Berufserfahrung</div>
            ${experience.map((exp: any) => `
              <div class="entry">
                <div class="entry-title">${exp.position}</div>
                <div class="entry-subtitle">${exp.company}</div>
                <div class="entry-period">${exp.timeframe}</div>
                ${exp.bullets && exp.bullets.length > 0 ? `
                  <div class="bullets">
                    ${exp.bullets.map((b: string) => `<div class="bullet">• ${b}</div>`).join('')}
                  </div>
                ` : ''}
              </div>
            `).join('')}
          </div>
        ` : ''}

        ${education.length > 0 ? `
          <div class="section">
            <div class="section-title">Bildung</div>
            ${education.map((edu: any) => `
              <div class="entry">
                <div class="entry-title">${edu.degree}</div>
                <div class="entry-subtitle">${edu.institution}</div>
                <div class="entry-period">${edu.timeframe}</div>
              </div>
            `).join('')}
          </div>
        ` : ''}

        ${skills.length > 0 ? `
          <div class="section">
            <div class="section-title">Skills</div>
            <div class="skills-container">
              ${skills.map((skill: string) => `<div class="skill-tag">${skill}</div>`).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    </body>
    </html>
  `;
};

Deno.serve(async (req: Request) => {
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

    const { cvId }: GeneratePdfRequest = await req.json();

    if (!cvId) {
      return new Response(JSON.stringify({ error: 'Missing cvId' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Generating PDF for CV ${cvId}`);

    const { data: cvRow, error: cvError } = await supabase
      .from('stored_cvs')
      .select('id, user_id, cv_data, job_data, editor_data')
      .eq('id', cvId)
      .maybeSingle();

    if (cvError || !cvRow) {
      console.error(`Failed to fetch CV ${cvId}:`, cvError);
      return new Response(JSON.stringify({ error: 'CV not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const userId = cvRow.user_id;
    const cvData = cvRow.cv_data || {};
    const template = cvRow.editor_data?.template || 'modern';

    let pdfBuffer: Uint8Array;
    try {
      pdfBuffer = await generateSimplePdf(cvData, template);
    } catch (pdfError: any) {
      console.error(`PDF generation failed for CV ${cvId}:`, pdfError.message);
      
      const { error: errorUpdateError } = await supabase
        .from('stored_cvs')
        .update({
          error_message: `PDF generation failed: ${pdfError.message}`,
          updated_at: new Date().toISOString(),
        })
        .eq('id', cvId);

      if (errorUpdateError) {
        console.error('Failed to update error_message:', errorUpdateError);
      }

      return new Response(JSON.stringify({ error: 'PDF generation failed' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const fileName = `${userId}/${cvId}.pdf`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('cv-pdfs')
      .upload(fileName, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: true,
      });

    if (uploadError) {
      console.error(`Failed to upload PDF to storage:`, uploadError);

      const { error: errorUpdateError } = await supabase
        .from('stored_cvs')
        .update({
          error_message: `Failed to upload PDF: ${uploadError.message}`,
          updated_at: new Date().toISOString(),
        })
        .eq('id', cvId);

      if (errorUpdateError) {
        console.error('Failed to update error_message:', errorUpdateError);
      }

      return new Response(JSON.stringify({ error: 'PDF upload failed' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: signedUrlData, error: signError } = await supabase.storage
      .from('cv-pdfs')
      .createSignedUrl(fileName, 7 * 24 * 60 * 60);

    if (signError) {
      console.error(`Failed to create signed URL for PDF:`, signError);

      const { error: errorUpdateError } = await supabase
        .from('stored_cvs')
        .update({
          error_message: `Failed to create signed URL: ${signError.message}`,
          updated_at: new Date().toISOString(),
        })
        .eq('id', cvId);

      if (errorUpdateError) {
        console.error('Failed to update error_message:', errorUpdateError);
      }

      return new Response(JSON.stringify({ error: 'Failed to create signed URL' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const pdfUrl = signedUrlData.signedUrl;

    const { error: updateError } = await supabase
      .from('stored_cvs')
      .update({
        pdf_url: pdfUrl,
        error_message: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', cvId);

    if (updateError) {
      console.error(`Failed to update pdf_url for CV ${cvId}:`, updateError);
      return new Response(JSON.stringify({ error: 'Failed to update pdf_url' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Successfully generated and stored PDF for CV ${cvId}`);
    return new Response(JSON.stringify({ success: true, pdfUrl }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('PDF generation error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});