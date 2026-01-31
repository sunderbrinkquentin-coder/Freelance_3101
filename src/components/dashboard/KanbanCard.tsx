import { Calendar, User, Briefcase, MapPin } from 'lucide-react';
import { KanbanStatus } from './KanbanBoard';

interface KanbanCardProps {
  cv: any;
  status: KanbanStatus;
  onDragStart: () => void;
}

const STATUS_ACCENT = {
  draft: 'bg-gray-200 text-gray-900',
  applied: 'bg-blue-200 text-blue-900',
  in_progress: 'bg-yellow-200 text-yellow-900',
  interview: 'bg-purple-200 text-purple-900',
  offer: 'bg-green-200 text-green-900',
  rejected: 'bg-red-200 text-red-900',
};

export function KanbanCard({ cv, status, onDragStart }: KanbanCardProps) {
  const jobData = cv.job_data || {};
  const cvData = cv.cv_data || {};

  const jobTitle = jobData.positionTitle || jobData.jobTitle || cvData.targetJob || 'Unbenannte Position';
  const company = jobData.company || jobData.companyName || 'Unbekannte Firma';
  const applicationDate = jobData.applicationDate || cv.created_at;
  const contactPerson = jobData.contactPerson || jobData.contact_name || null;
  const expectedResponse = jobData.expectedResponseDate || null;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'offen';
    try {
      return new Date(dateString).toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
      });
    } catch {
      return 'offen';
    }
  };

  return (
    <div
      draggable
      onDragStart={onDragStart}
      className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing border border-gray-200"
    >
      <h4 className="font-semibold text-gray-900 text-sm leading-tight mb-2 line-clamp-2">
        {jobTitle}
      </h4>

      <div className="space-y-2 mb-3">
        <div className="flex items-start gap-2">
          <Briefcase className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
          <span className="text-xs text-gray-600 line-clamp-1">{company}</span>
        </div>

        {applicationDate && (
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            <span className="text-xs text-gray-600">{formatDate(applicationDate)}</span>
          </div>
        )}

        {contactPerson && (
          <div className="flex items-center gap-2">
            <User className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            <span className="text-xs text-gray-600 line-clamp-1">{contactPerson}</span>
          </div>
        )}

        {expectedResponse && (
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            <span className="text-xs text-gray-600">Rückmeldung: {formatDate(expectedResponse)}</span>
          </div>
        )}
      </div>

      <div className={`inline-block px-2 py-1 rounded text-xs font-medium ${STATUS_ACCENT[status]}`}>
        {status === 'draft' && 'Entwurf'}
        {status === 'applied' && 'Beworben'}
        {status === 'in_progress' && 'Im Prozess'}
        {status === 'interview' && 'Interview'}
        {status === 'offer' && 'Angebot'}
        {status === 'rejected' && 'Abgelehnt'}
      </div>
    </div>
  );
}
