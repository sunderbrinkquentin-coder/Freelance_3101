import { parseAtsJson as parseAtsJsonRaw } from './parseAtsJson';

export interface ParsedAtsAnalysis {
  score?: number;
  feedback?: string;
  todos?: string[];
  status: 'analyzing' | 'completed' | 'error';
  rawData?: any;
}

export function parseAtsJson(atsJson: any): ParsedAtsAnalysis {
  const data = parseAtsJsonRaw(atsJson);

  if (!data) {
    return {
      status: 'analyzing',
    };
  }

  const score = data.score || data.overall_score || data.totalScore || undefined;
  const feedback = data.feedback || data.summary || data.message || '';
  const todos = Array.isArray(data.todos) ? data.todos :
                Array.isArray(data.suggestions) ? data.suggestions :
                Array.isArray(data.improvements) ? data.improvements : [];

  return {
    score,
    feedback,
    todos,
    status: 'completed',
    rawData: data,
  };
}

export function getScoreBadgeColor(score?: number): string {
  if (!score) return 'bg-white/10 text-white/60';
  if (score >= 80) return 'bg-green-500/20 text-green-400';
  if (score >= 60) return 'bg-yellow-500/20 text-yellow-400';
  return 'bg-red-500/20 text-red-400';
}
