/**
 * 🔥 BULLETPOINT SERVICE - Generiert ATS-optimierte Bulletpoints via Make.com
 *
 * Sendet erweiterte Berufserfahrungsdaten an Make → OpenAI generiert 3-5 Bulletpoints
 * WICHTIG: Nutzt bestehenden Make-Webhook, erweitert nur den Body
 */

import { WorkExperience } from '../types/cvBuilder';

// Nutze bestehende env variable oder erweitere sie
const MAKE_BULLETPOINT_WEBHOOK = import.meta.env.VITE_MAKE_CV_SUGGESTION_WEBHOOK_URL;

export interface BulletpointRequest {
  experiences: Array<{
    jobTitle: string;
    company: string;
    industry?: string;
    roleLevel?: string;
    revenue?: string;
    budget?: string;
    teamSize?: string;
    customersMarket?: string;
    achievementsRaw?: string;
    kpis: string[];
  }>;
}

export interface BulletpointResponse {
  success: boolean;
  experiences?: Array<{
    jobTitle: string;
    bullets: string[]; // 3-5 generierte Bulletpoints
  }>;
  error?: string;
}

/**
 * 🚀 Generiere Bulletpoints für alle Berufserfahrungen
 * ANPASSUNG: Erweiterte Daten an Make senden
 */
export async function generateBulletpoints(
  experiences: WorkExperience[]
): Promise<BulletpointResponse> {
  console.log('[BULLETPOINTS] 🚀 Generating bulletpoints for', experiences.length, 'experiences');

  try {
    if (!MAKE_BULLETPOINT_WEBHOOK) {
      throw new Error('Make Webhook URL not configured');
    }

    // 🔥 MAPPING: Sende alle relevanten Felder an Make
    const request: BulletpointRequest = {
      experiences: experiences.map((exp) => ({
        jobTitle: exp.jobTitle,
        company: exp.company,
        industry: exp.industry,
        roleLevel: exp.roleLevel,
        revenue: exp.revenue,
        budget: exp.budget,
        teamSize: exp.teamSize,
        customersMarket: exp.customersMarket,
        achievementsRaw: exp.achievementsRaw,
        kpis: exp.kpis || [],
      })),
    };

    console.log('[BULLETPOINTS] 📤 Request:', JSON.stringify(request, null, 2));

    const response = await fetch(MAKE_BULLETPOINT_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Make returned ${response.status}`);
    }

    const data = await response.json();
    console.log('[BULLETPOINTS] ✅ Response:', data);

    return {
      success: true,
      experiences: data.experiences || [],
    };
  } catch (error: any) {
    console.error('[BULLETPOINTS] ❌ Error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}
