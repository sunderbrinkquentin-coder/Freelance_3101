import { ReactNode } from 'react';
import { KanbanStatus } from './KanbanBoard';

interface KanbanColumnProps {
  column: { id: KanbanStatus; label: string; color: string };
  cards: any[];
  children: ReactNode;
  onDragStart: (cv: any, status: KanbanStatus) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: () => void;
  isDragOver: boolean;
}

const STATUS_COLORS = {
  draft: { border: 'border-gray-300', bg: 'bg-gray-50', header: 'bg-gray-100' },
  applied: { border: 'border-blue-300', bg: 'bg-blue-50', header: 'bg-blue-100' },
  in_progress: { border: 'border-yellow-300', bg: 'bg-yellow-50', header: 'bg-yellow-100' },
  interview: { border: 'border-purple-300', bg: 'bg-purple-50', header: 'bg-purple-100' },
  offer: { border: 'border-green-300', bg: 'bg-green-50', header: 'bg-green-100' },
  rejected: { border: 'border-red-300', bg: 'bg-red-50', header: 'bg-red-100' },
};

export function KanbanColumn({
  column,
  cards,
  children,
  onDragOver,
  onDrop,
  isDragOver,
}: KanbanColumnProps) {
  const colors = STATUS_COLORS[column.id];

  return (
    <div className="flex flex-col w-80 flex-shrink-0">
      <div className={`${colors.header} px-4 py-3 rounded-lg mb-3`}>
        <h3 className="font-semibold text-gray-900 text-sm">
          {column.label}
        </h3>
        <p className="text-xs text-gray-600 mt-1">{cards.length} Bewerbung{cards.length !== 1 ? 'en' : ''}</p>
      </div>

      <div
        onDragOver={onDragOver}
        onDrop={onDrop}
        className={`flex-1 flex flex-col gap-3 p-3 rounded-lg border-2 border-dashed transition-colors ${
          isDragOver ? `${colors.border} bg-white` : colors.bg
        }`}
        style={{ minHeight: '400px' }}
      >
        {children}
      </div>
    </div>
  );
}
