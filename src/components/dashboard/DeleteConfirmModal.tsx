import { AlertCircle } from 'lucide-react';

interface DeleteConfirmModalProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteConfirmModal({
  title,
  message,
  onConfirm,
  onCancel,
}: DeleteConfirmModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75">
      <div className="bg-dark-card rounded-xl max-w-md w-full p-6">
        <div className="flex items-start gap-4 mb-6">
          <div className="p-3 bg-error bg-opacity-10 rounded-lg">
            <AlertCircle className="text-error" size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
            <p className="text-text-secondary">{message}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-6 py-3 bg-white bg-opacity-5 hover:bg-opacity-10 rounded-lg font-semibold text-white transition-colors"
          >
            Abbrechen
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-6 py-3 bg-error hover:bg-opacity-80 rounded-lg font-semibold text-white transition-colors"
          >
            Löschen
          </button>
        </div>
      </div>
    </div>
  );
}
