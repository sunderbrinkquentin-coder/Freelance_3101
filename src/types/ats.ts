// src/types/ats.ts

export type AtsCategory = {
  score: number;
  feedback: string;
  verbesserung?: string;
};

export type AtsResult = {
  ats_score: number;
  top_todos?: Record<string, string>;
  relevanz_fokus?: AtsCategory;
  erfolge_kpis?: AtsCategory;
  klarheit_sprache?: AtsCategory;
  formales?: AtsCategory;
  usp_skills?: AtsCategory;
};

/**
 * Fallback-Parser für den aktuellen Make-Output:
 * {"ats_score": 78, "erfahrungslevel": "...", "top_todos": { ... }, ...}
 * auch wenn der Rest der JSON kaputt ist.
 */
function fallbackExtractAtsResultFromText(text: string): AtsResult | null {
  console.log('[parseAtsJson] 🔄 Fallback-Extractor aktiv');

  const scoreMatch = text.match(/"ats_score"\s*:\s*(\d+)/);
  if (!scoreMatch) {
    console.warn('[parseAtsJson] ⚠️ Fallback: Kein ats_score gefunden');
    return null;
  }

  const score = Number(scoreMatch[1]);

  // top_todos-Block herausschneiden (robuster mit mehr Sonderzeichen)
  const todosMatch = text.match(/"top_todos"\s*:\s*\{([^}]*(?:\{[^}]*\}[^}]*)*)\}/);
  const topTodos: Record<string, string> = {};

  if (todosMatch) {
    const block = todosMatch[1];
    // Finde key-value Paare, auch wenn Werte spezielle Zeichen enthalten
    const pairRegex = /"([^"]+)"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"/g;
    let m: RegExpExecArray | null;

    while ((m = pairRegex.exec(block)) !== null) {
      const key = m[1];
      let value = m[2];
      // Unescape common escape sequences
      value = value
        .replace(/\\n/g, ' ')
        .replace(/\\t/g, ' ')
        .replace(/\\r/g, ' ')
        .replace(/\\\\/g, '\\')
        .replace(/\\"/g, '"');
      topTodos[key] = value;
    }
  }

  const result: AtsResult = {
    ats_score: score,
  };

  if (Object.keys(topTodos).length > 0) {
    result.top_todos = topTodos;
  }

  console.log('[parseAtsJson] ✅ Fallback parsed AtsResult:', result);
  return result;
}

/**
 * Make.com → internes AtsResult
 * Robust gegen kaputte JSON + verschiedene Formate
 */
export function parseAtsJson(raw: any): AtsResult | null {
  try {
    console.log('[parseAtsJson] 🔍 Input type:', typeof raw);
    console.log(
      '[parseAtsJson] 🔍 Input preview:',
      typeof raw === 'string'
        ? raw.substring(0, 200)
        : JSON.stringify(raw).substring(0, 200)
    );

    if (!raw) {
      console.warn('[parseAtsJson] ⚠️ Input is null/undefined');
      return null;
    }

    let first: any;

    // ---------- 1) String → objekt parsen ----------
    if (typeof raw === 'string') {
      let cleaned = raw.trim();
      if (!cleaned) {
        console.warn('[parseAtsJson] ⚠️ Input string is empty');
        return null;
      }

      // Falls vor/nach dem JSON noch Text steht → nur den JSON-Teil nehmen
      const firstBrace = cleaned.indexOf('{');
      const lastBrace = cleaned.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace > firstBrace) {
        cleaned = cleaned.slice(firstBrace, lastBrace + 1);
      }

      // Strategy 1: Direkt parsen
      try {
        first = JSON.parse(cleaned);
        console.log('[parseAtsJson] ✅ Parsed string (Strategy 1: direct)');

        // WICHTIG: Wenn das Ergebnis ein STRING ist, nochmal parsen (doppelt escaped)
        if (typeof first === 'string') {
          console.log('[parseAtsJson] 🔄 Result is string, parsing again (double-escaped)');
          first = JSON.parse(first);
          console.log('[parseAtsJson] ✅ Double-escaped string parsed');
        }
      } catch (parseError1) {
        console.log('[parseAtsJson] Strategy 1 failed, trying Strategy 2...');

        // Strategy 2: \n / \t entfernen + Control Characters
        try {
          const sanitized = cleaned
            .replace(/\\n/g, ' ')
            .replace(/\\t/g, ' ')
            .replace(/\n/g, ' ')
            .replace(/\t/g, ' ')
            .replace(/\r/g, ' ')
            .replace(/[\x00-\x1F\x7F]/g, ''); // Remove control characters
          first = JSON.parse(sanitized);
          console.log('[parseAtsJson] ✅ Parsed string (Strategy 2: sanitized)');

          // Prüfe ob doppelt escaped
          if (typeof first === 'string') {
            console.log('[parseAtsJson] 🔄 Result is string, parsing again (double-escaped)');
            first = JSON.parse(first);
            console.log('[parseAtsJson] ✅ Double-escaped string parsed');
          }
        } catch (parseError2) {
          console.log('[parseAtsJson] Strategy 2 failed, trying Strategy 3...');

          // Strategy 3: Aggressivere Bereinigung
          try {
            const aggressive = cleaned
              .replace(/\\n/g, ' ')
              .replace(/\\t/g, ' ')
              .replace(/\n/g, ' ')
              .replace(/\t/g, ' ')
              .replace(/\r/g, ' ')
              .replace(/[\x00-\x1F\x7F]/g, '')
              .replace(/\s+/g, ' ') // Multiple spaces to single space
              .replace(/,\s*}/g, '}') // Trailing commas
              .replace(/,\s*]/g, ']'); // Trailing commas in arrays
            first = JSON.parse(aggressive);
            console.log('[parseAtsJson] ✅ Parsed string (Strategy 3: aggressive)');

            // Prüfe ob doppelt escaped
            if (typeof first === 'string') {
              console.log('[parseAtsJson] 🔄 Result is string, parsing again (double-escaped)');
              first = JSON.parse(first);
              console.log('[parseAtsJson] ✅ Double-escaped string parsed');
            }
          } catch (parseError3) {
            console.log(
              '[parseAtsJson] Strategy 3 failed, trying Fallback-Extractor...'
            );
            console.error('Strategy 1 error:', parseError1);
            console.error('Strategy 2 error:', parseError2);
            console.error('Strategy 3 error:', parseError3);
            console.error(
              'Raw value (first 200 chars):',
              cleaned.substring(0, 200)
            );

            // Letzte Chance: mit Regex aus Text ziehen
            const fallback = fallbackExtractAtsResultFromText(cleaned);
            if (fallback) {
              console.log('[parseAtsJson] ✅ Fallback parsing succeeded');
              return fallback;
            }

            console.error('[parseAtsJson] ❌ All parse strategies failed');
            return null;
          }
        }
      }
    } else {
      first = raw;
      console.log('[parseAtsJson] ℹ️ Input already object');

      // Manchmal gibt Supabase JSONB als String-Objekt zurück
      if (first && typeof first === 'object' && Object.keys(first).length === 0) {
        console.log('[parseAtsJson] ⚠️ Empty object received');
      }
    }

    // ---------- 2) Altes ChatGPT-Format { role, content: "{...}" } ----------
    if (first && typeof first === 'object' && 'content' in first) {
      console.log('[parseAtsJson] 🔄 Detected ChatGPT content wrapper');
      const content = (first as any).content;

      if (typeof content === 'string') {
        const contentCleaned = content.trim();
        if (!contentCleaned) {
          console.warn('[parseAtsJson] ⚠️ Content string is empty');
          return null;
        }

        try {
          first = JSON.parse(contentCleaned);
          console.log('[parseAtsJson] ✅ Parsed content string');
        } catch (contentError) {
          console.error('[parseAtsJson] ❌ Failed to parse content:', contentError);
          console.error(
            'Content value (first 200 chars):',
            contentCleaned.substring(0, 200)
          );

          const fallback = fallbackExtractAtsResultFromText(contentCleaned);
          if (fallback) {
            console.log('[parseAtsJson] ✅ Fallback parsing from content succeeded');
            return fallback;
          }

          return null;
        }
      } else {
        first = content;
        console.log('[parseAtsJson] ℹ️ Content already object');
      }
    }

    if (!first || typeof first !== 'object') {
      console.error('[parseAtsJson] ❌ Result is not an object');
      return null;
    }

    console.log(
      '[parseAtsJson] ✅ Final raw keys:',
      Object.keys(first as Record<string, unknown>)
    );

    // ---------- 3) Make-Format (overallScore + categories) → AtsResult ----------
    if (!('ats_score' in first) && 'overallScore' in first) {
      console.log('[parseAtsJson] 🔍 Detected Make.com overallScore format');

      const categories = (first as any).categories || {};
      const improvements = (first as any).improvements || [];

      const topTodos: Record<string, string> = {};
      (improvements as string[]).slice(0, 5).forEach((item, index) => {
        topTodos[`To-do ${index + 1}`] = item;
      });

      const converted: AtsResult = {
        ats_score: (first as any).overallScore,
        top_todos: topTodos,
        relevanz_fokus: categories.content,
        erfolge_kpis: categories.content,
        klarheit_sprache: categories.structure,
        formales: categories.design,
        usp_skills: categories.atsCompatibility,
      };

      console.log('[parseAtsJson] ✅ Converted Make.com format:', converted);
      return converted;
    }

    // ---------- 4) Standard-Format validieren ----------
    if (!('ats_score' in first) || typeof (first as any).ats_score !== 'number') {
      console.error('[parseAtsJson] ❌ Missing or invalid ats_score field');
      console.error(
        '[parseAtsJson] 📊 Available fields:',
        Object.keys(first as Record<string, unknown>)
      );

      // Letzte Chance: Fallback aus Text, falls wir hier noch einen String hatten
      const rawString =
        typeof raw === 'string' ? raw : JSON.stringify(first, null, 2);
      const fallback = fallbackExtractAtsResultFromText(rawString);
      if (fallback) {
        console.log('[parseAtsJson] ✅ Fallback parsing from final object succeeded');
        return fallback;
      }

      return null;
    }

    // Hier ist already unser Ziel-Format (ats_score + optional Kategorien)
    return first as AtsResult;
  } catch (error) {
    console.error('[parseAtsJson] ❌ Unexpected error:', error);
    if (typeof raw === 'string') {
      console.error('Raw value (first 200 chars):', raw.substring(0, 200));
    }
    return null;
  }
}

// Helper Functions für UI
export function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-500';
  if (score >= 60) return 'text-[#66c0b6]';
  if (score >= 40) return 'text-yellow-500';
  return 'text-red-500';
}

export function getScoreBgColor(score: number): string {
  if (score >= 80) return 'bg-green-500/10';
  if (score >= 60) return 'bg-[#66c0b6]/10';
  if (score >= 40) return 'bg-yellow-500/10';
  return 'bg-red-500/10';
}

export function getScoreLabel(score: number): string {
  if (score >= 80) return 'Sehr gut';
  if (score >= 60) return 'Gut';
  if (score >= 40) return 'Verbesserungsfähig';
  return 'Dringend überarbeiten';
}

export function formatCategoryName(key: string): string {
  const names: Record<string, string> = {
    relevanz_fokus: 'Relevanz & Fokus',
    erfolge_kpis: 'Erfolge & KPIs',
    klarheit_sprache: 'Klarheit der Sprache',
    formales: 'Formales',
    usp_skills: 'USP & Skills',
  };

  return names[key] || key.replace(/_/g, ' ');
}
