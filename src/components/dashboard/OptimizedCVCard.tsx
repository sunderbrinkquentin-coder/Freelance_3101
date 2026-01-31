import { useState, useMemo } from 'react';
import { CheckCircle, ExternalLink, AlertCircle, CheckSquare } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { parseAtsJson, getScoreBadgeColor } from '../../utils/atsJsonParser';

type Props = {
  cv: any;
  onDownload: (cv: any) => void;
  onUpdate: () => void;
};

export function OptimizedCVCard({ cv, onDownload, onUpdate }: Props) {
  const [customDate, setCustomDate] = useState(
    cv.job_data?.applicationDate || new Date().toISOString().split('T')[0]
  );

  const atsAnalysis = useMemo(() => parseAtsJson(cv.ats_json), [cv.ats_json]);

  const handleFieldUpdate = async (field: string, value: string) => {
    try {
      const updatedJobData = {
        ...(cv.job_data || {}),
        [field]: value
      };

      const { error } = await supabase
        .from('stored_cvs')
        .update({ job_data: updatedJobData })
        .eq('id', cv.id);

      if (error) throw error;
      onUpdate();
    } catch (error) {
      console.error('Error updating field:', error);
      alert('Fehler beim Speichern');
    }
  };

  return (
    <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-lg p-3 sm:p-4">
      <div className="space-y-3">
        <div className="grid sm:grid-cols-[1fr,auto] gap-3">
          <div className="space-y-2">
            <div>
              <label className="text-xs text-white/50 mb-1 block">Job Titel</label>
              <input
                type="text"
                value={cv.job_data?.jobTitle || ''}
                onChange={(e) => handleFieldUpdate('jobTitle', e.target.value)}
                className="w-full px-2 py-1.5 text-sm rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-[#66c0b6] transition-all"
                placeholder="z.B. Senior Developer"
              />
            </div>

            <div>
              <label className="text-xs text-white/50 mb-1 block">Firma</label>
              <input
                type="text"
                value={cv.job_data?.company || ''}
                onChange={(e) => handleFieldUpdate('company', e.target.value)}
                className="w-full px-2 py-1.5 text-sm rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-[#66c0b6] transition-all"
                placeholder="z.B. Microsoft"
              />
            </div>

            <div>
              <label className="text-xs text-white/50 mb-1 block">Bewerbungsdatum</label>
              <input
                type="date"
                value={customDate}
                onChange={(e) => {
                  setCustomDate(e.target.value);
                  handleFieldUpdate('applicationDate', e.target.value);
                }}
                className="w-full px-2 py-1.5 text-sm rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#66c0b6] transition-all"
              />
            </div>
          </div>

          <div className="flex sm:flex-col gap-2 sm:justify-start">
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-[#66c0b6]/20 text-[#66c0b6] border border-[#66c0b6]/30 h-fit whitespace-nowrap">
              <CheckCircle size={12} />
              Freigeschaltet
            </span>
            {atsAnalysis.score !== undefined && (
              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold border h-fit whitespace-nowrap ${getScoreBadgeColor(atsAnalysis.score)}`}>
                Score: {atsAnalysis.score}%
              </span>
            )}
          </div>
        </div>

        {cv.pdf_url ? (
          <button
            onClick={() => onDownload(cv)}
            className="w-full px-3 py-2 rounded-lg bg-gradient-to-r from-[#66c0b6] to-[#30E3CA] text-black text-sm font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg"
          >
            <ExternalLink size={16} />
            <span>PDF herunterladen</span>
          </button>
        ) : (
          <div className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white/60 text-xs font-medium text-center">
            PDF not generated yet
          </div>
        )}

        {atsAnalysis.status === 'analyzing' && (
          <div className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white/60 text-xs text-center">
            <div className="flex items-center justify-center gap-2">
              <div className="w-3 h-3 border-2 border-white/30 border-t-[#66c0b6] rounded-full animate-spin" />
              Analyse läuft...
            </div>
          </div>
        )}

        {atsAnalysis.status === 'completed' && (
          <div className="space-y-2 p-2 rounded-lg bg-white/5 border border-white/10">
            {atsAnalysis.feedback && (
              <div className="text-xs text-white/70">
                <p className="font-medium text-white mb-1 flex items-center gap-1">
                  <AlertCircle size={14} className="text-[#66c0b6]" />
                  Feedback
                </p>
                <p className="line-clamp-2">{atsAnalysis.feedback}</p>
              </div>
            )}
            {atsAnalysis.todos && atsAnalysis.todos.length > 0 && (
              <div className="text-xs text-white/70">
                <p className="font-medium text-white mb-1 flex items-center gap-1">
                  <CheckSquare size={14} className="text-[#66c0b6]" />
                  Verbesserungen ({atsAnalysis.todos.length})
                </p>
                <ul className="space-y-1">
                  {atsAnalysis.todos.slice(0, 2).map((todo, i) => (
                    <li key={i} className="text-white/60 line-clamp-1">• {todo}</li>
                  ))}
                  {atsAnalysis.todos.length > 2 && (
                    <li className="text-white/50 text-xs italic">+{atsAnalysis.todos.length - 2} weitere</li>
                  )}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
