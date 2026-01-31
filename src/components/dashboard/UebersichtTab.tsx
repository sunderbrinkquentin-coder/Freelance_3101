import { useState, useEffect } from 'react';
import { PlusCircle, FileText, Download, Edit, Trash2 } from 'lucide-react';
import { dbService } from '../../services/databaseService';
import { JobApplication } from '../../types/database';
import CreateApplicationModal from './CreateApplicationModal';
import EditApplicationModal from './EditApplicationModal';
import DeleteConfirmModal from './DeleteConfirmModal';
import CVOptimizationsSection from './CVOptimizationsSection';

interface UebersichtTabProps {
  tokenBalance: number;
  onTokenUpdate: () => void;
}

const statusOptions = [
  { value: 'entwurf', label: 'Entwurf' },
  { value: 'versendet', label: 'Versendet' },
  { value: 'antwort', label: 'Antwort erhalten' },
  { value: 'interview', label: 'Interview' },
  { value: 'zusage', label: 'Zusage' },
  { value: 'absage', label: 'Absage' },
];

export default function UebersichtTab({ tokenBalance, onTokenUpdate }: UebersichtTabProps) {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingApp, setEditingApp] = useState<JobApplication | null>(null);
  const [deletingApp, setDeletingApp] = useState<JobApplication | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const apps = await dbService.getJobApplications();
      setApplications(apps);
    } catch (error) {
      console.error('Failed to load applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await dbService.updateJobApplication(id, { status: newStatus });
      setApplications(apps =>
        apps.map(app => (app.id === id ? { ...app, status: newStatus } : app))
      );
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await dbService.deleteJobApplication(id);
      setApplications(apps => apps.filter(app => app.id !== id));
      setDeletingApp(null);
    } catch (error) {
      console.error('Failed to delete application:', error);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`${selectedIds.size} Bewerbungen wirklich löschen?`)) return;

    try {
      for (const id of selectedIds) {
        await dbService.deleteJobApplication(id);
      }
      setApplications(apps => apps.filter(app => !selectedIds.has(app.id)));
      setSelectedIds(new Set());
    } catch (error) {
      console.error('Failed to delete applications:', error);
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === applications.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(applications.map(app => app.id)));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-text-secondary">Lade Bewerbungen...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-white">Deine Bewerbungen</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-hover rounded-lg font-semibold transition-colors"
        >
          <PlusCircle size={20} />
          <span>Neue Bewerbung erstellen</span>
        </button>
      </div>

      {/* Bulk Actions */}
      {selectedIds.size > 0 && (
        <div className="mb-4 p-4 bg-white bg-opacity-5 rounded-lg border border-primary flex items-center justify-between">
          <span className="text-white font-medium">
            {selectedIds.size} ausgewählt
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={handleBulkDelete}
              className="px-4 py-2 bg-error hover:bg-opacity-80 rounded-lg text-white font-medium transition-colors flex items-center gap-2"
            >
              <Trash2 size={16} />
              <span>Ausgewählte löschen</span>
            </button>
          </div>
        </div>
      )}

      {applications.length === 0 ? (
        /* Empty State */
        <div className="text-center py-16 bg-white bg-opacity-5 rounded-xl border border-white border-opacity-10">
          <FileText className="mx-auto mb-4 text-text-secondary" size={48} />
          <h3 className="text-xl font-semibold text-white mb-2">Noch keine Bewerbungen</h3>
          <p className="text-text-secondary mb-6">
            Erstelle deinen ersten optimierten CV mit KI in nur 10 Minuten!
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-hover rounded-lg font-semibold transition-colors"
          >
            <PlusCircle size={20} />
            <span>Erste Bewerbung erstellen</span>
          </button>
        </div>
      ) : (
        /* Table - Desktop */
        <>
          <div className="hidden md:block bg-white bg-opacity-5 rounded-xl border border-white border-opacity-10 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white border-opacity-10">
                  <th className="p-4 text-left">
                    <input
                      type="checkbox"
                      checked={selectedIds.size === applications.length}
                      onChange={toggleSelectAll}
                      className="w-5 h-5 accent-primary"
                    />
                  </th>
                  <th className="p-4 text-left text-sm font-semibold text-text-secondary">Stelle</th>
                  <th className="p-4 text-left text-sm font-semibold text-text-secondary">Firma</th>
                  <th className="p-4 text-left text-sm font-semibold text-text-secondary">Erstellt</th>
                  <th className="p-4 text-left text-sm font-semibold text-text-secondary">Status</th>
                  <th className="p-4 text-left text-sm font-semibold text-text-secondary">Aktionen</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr
                    key={app.id}
                    className="border-b border-white border-opacity-10 hover:bg-white hover:bg-opacity-5 transition-colors"
                  >
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(app.id)}
                        onChange={() => toggleSelect(app.id)}
                        className="w-5 h-5 accent-primary"
                      />
                    </td>
                    <td className="p-4 text-white font-medium">{app.rolle}</td>
                    <td className="p-4 text-text-secondary">{app.unternehmen}</td>
                    <td className="p-4 text-text-secondary">{formatDate(app.created_at)}</td>
                    <td className="p-4">
                      <select
                        value={app.status}
                        onChange={(e) => handleStatusChange(app.id, e.target.value)}
                        className="px-3 py-1.5 bg-white bg-opacity-5 border border-white border-opacity-10 rounded-lg text-white text-sm focus:outline-none focus:border-primary"
                      >
                        {statusOptions.map((opt) => (
                          <option key={opt.value} value={opt.value} className="bg-dark-card">
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="p-4">
                      <div className="relative">
                        <button
                          onClick={() => setOpenMenuId(openMenuId === app.id ? null : app.id)}
                          className="px-6 py-2 bg-primary hover:bg-primary-hover rounded-lg transition-colors text-white font-medium flex items-center gap-2 min-w-[140px]"
                          title="Herunterladen"
                        >
                          <Download size={18} />
                          <span>Download</span>
                        </button>
                        {openMenuId === app.id && (
                          <>
                            <div
                              className="fixed inset-0 z-40"
                              onClick={() => setOpenMenuId(null)}
                            />
                            <div className="absolute right-0 mt-2 w-48 bg-dark-card border border-white border-opacity-10 rounded-lg shadow-lg z-50">
                              <button
                                onClick={() => {
                                  setOpenMenuId(null);
                                }}
                                className="w-full px-4 py-3 text-left text-white hover:bg-white hover:bg-opacity-5 transition-colors flex items-center gap-2"
                              >
                                <Download size={16} />
                                <span>Als PDF herunterladen</span>
                              </button>
                              <button
                                onClick={() => {
                                  setOpenMenuId(null);
                                }}
                                className="w-full px-4 py-3 text-left text-white hover:bg-white hover:bg-opacity-5 transition-colors border-t border-white border-opacity-10 flex items-center gap-2"
                              >
                                <Download size={16} />
                                <span>Als DOCX herunterladen</span>
                              </button>
                              <button
                                onClick={() => {
                                  setOpenMenuId(null);
                                  setEditingApp(app);
                                }}
                                className="w-full px-4 py-3 text-left text-white hover:bg-white hover:bg-opacity-5 transition-colors border-t border-white border-opacity-10 flex items-center gap-2"
                              >
                                <Edit size={16} />
                                <span>Bearbeiten</span>
                              </button>
                              <button
                                onClick={() => {
                                  setOpenMenuId(null);
                                  setDeletingApp(app);
                                }}
                                className="w-full px-4 py-3 text-left text-error hover:bg-white hover:bg-opacity-5 transition-colors border-t border-white border-opacity-10 flex items-center gap-2"
                              >
                                <Trash2 size={16} />
                                <span>Löschen</span>
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Card View - Mobile */}
          <div className="md:hidden space-y-4">
            {applications.map((app) => (
              <div
                key={app.id}
                className="bg-white bg-opacity-5 rounded-xl border border-white border-opacity-10 p-4"
              >
                <div className="flex items-start gap-3 mb-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(app.id)}
                    onChange={() => toggleSelect(app.id)}
                    className="w-5 h-5 accent-primary mt-1"
                  />
                  <div className="flex-1">
                    <h3 className="text-white font-semibold mb-1">{app.rolle}</h3>
                    <p className="text-text-secondary text-sm mb-2">{app.unternehmen}</p>
                    <div className="flex items-center gap-4 text-xs text-text-secondary mb-3">
                      <span>{formatDate(app.created_at)}</span>
                      <select
                        value={app.status}
                        onChange={(e) => handleStatusChange(app.id, e.target.value)}
                        className="px-2 py-1 bg-white bg-opacity-5 border border-white border-opacity-10 rounded text-white focus:outline-none focus:border-primary"
                      >
                        {statusOptions.map((opt) => (
                          <option key={opt.value} value={opt.value} className="bg-dark-card">
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {}}
                        className="flex-1 px-3 py-2 bg-white bg-opacity-5 hover:bg-opacity-10 rounded-lg transition-colors text-sm text-white flex items-center justify-center gap-2"
                      >
                        <Download size={16} />
                        <span>Download</span>
                      </button>
                      <button
                        onClick={() => setEditingApp(app)}
                        className="flex-1 px-3 py-2 bg-white bg-opacity-5 hover:bg-opacity-10 rounded-lg transition-colors text-sm text-white flex items-center justify-center gap-2"
                      >
                        <Edit size={16} />
                        <span>Bearbeiten</span>
                      </button>
                      <button
                        onClick={() => setDeletingApp(app)}
                        className="px-3 py-2 bg-error bg-opacity-10 hover:bg-opacity-20 rounded-lg transition-colors text-sm text-error"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Modals */}
      {showCreateModal && (
        <CreateApplicationModal
          tokenBalance={tokenBalance}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            loadApplications();
            onTokenUpdate();
          }}
        />
      )}

      {editingApp && (
        <EditApplicationModal
          application={editingApp}
          onClose={() => setEditingApp(null)}
          onSuccess={() => {
            setEditingApp(null);
            loadApplications();
          }}
        />
      )}

      {deletingApp && (
        <DeleteConfirmModal
          title="Bewerbung löschen?"
          message="Diese Aktion kann nicht rückgängig gemacht werden."
          onConfirm={() => handleDelete(deletingApp.id)}
          onCancel={() => setDeletingApp(null)}
        />
      )}

      {/* CV Optimizations Section */}
      <CVOptimizationsSection />
    </div>
  );
}
