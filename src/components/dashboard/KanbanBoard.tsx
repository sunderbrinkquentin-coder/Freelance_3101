import { useState, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { KanbanColumn } from './KanbanColumn';
import { KanbanCard } from './KanbanCard';

export type KanbanStatus = 'draft' | 'applied' | 'in_progress' | 'interview' | 'offer' | 'rejected';

interface KanbanBoardProps {
  cvs: any[];
  onCVUpdate: () => void;
}

const COLUMNS: { id: KanbanStatus; label: string; color: string }[] = [
  { id: 'draft', label: 'Entwurf', color: 'bg-gray-100' },
  { id: 'applied', label: 'Beworben', color: 'bg-blue-100' },
  { id: 'in_progress', label: 'Im Prozess', color: 'bg-yellow-100' },
  { id: 'interview', label: 'Interview', color: 'bg-purple-100' },
  { id: 'offer', label: 'Angebot', color: 'bg-green-100' },
  { id: 'rejected', label: 'Abgelehnt', color: 'bg-red-100' },
];

export function KanbanBoard({ cvs, onCVUpdate }: KanbanBoardProps) {
  const [draggedCard, setDraggedCard] = useState<any | null>(null);
  const [dragSource, setDragSource] = useState<KanbanStatus | null>(null);

  const groupedCVs = COLUMNS.reduce(
    (acc, col) => {
      acc[col.id] = cvs.filter((cv) => (cv.status || 'draft') === col.id);
      return acc;
    },
    {} as Record<KanbanStatus, any[]>
  );

  const handleDragStart = useCallback((cv: any, sourceStatus: KanbanStatus) => {
    setDraggedCard(cv);
    setDragSource(sourceStatus);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDropOnColumn = useCallback(
    async (targetStatus: KanbanStatus) => {
      if (!draggedCard || !dragSource) return;

      if (dragSource === targetStatus) {
        setDraggedCard(null);
        setDragSource(null);
        return;
      }

      try {
        const { error } = await supabase
          .from('stored_cvs')
          .update({ status: targetStatus })
          .eq('id', draggedCard.id);

        if (error) {
          console.error('Error updating CV status:', error);
        } else {
          onCVUpdate();
        }
      } catch (error) {
        console.error('Error during drag drop:', error);
      } finally {
        setDraggedCard(null);
        setDragSource(null);
      }
    },
    [draggedCard, dragSource, onCVUpdate]
  );

  return (
    <div className="flex gap-6 overflow-x-auto pb-6">
      {COLUMNS.map((column) => (
        <KanbanColumn
          key={column.id}
          column={column}
          cards={groupedCVs[column.id]}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDrop={() => handleDropOnColumn(column.id)}
          isDragOver={dragSource !== null && dragSource !== column.id}
        >
          {groupedCVs[column.id].map((cv) => (
            <KanbanCard
              key={cv.id}
              cv={cv}
              status={column.id}
              onDragStart={() => handleDragStart(cv, column.id)}
            />
          ))}
        </KanbanColumn>
      ))}
    </div>
  );
}
