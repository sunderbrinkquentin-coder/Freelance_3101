import { useState, useEffect } from 'react';
import { Settings, AlertCircle } from 'lucide-react';
import { dbService } from '../../../services/databaseService';
import { authService } from '../../../services/authService';
import { useNavigate } from 'react-router-dom';
import DeleteConfirmModal from '../DeleteConfirmModal';

export default function AccountSettings() {
  const navigate = useNavigate();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [applicationReminders, setApplicationReminders] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await dbService.getUserSettings();
      if (settings) {
        setEmailNotifications(settings.email_notifications);
        setApplicationReminders(settings.application_reminders);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const updateSetting = async (key: string, value: boolean) => {
    try {
      await dbService.updateUserSettings({ [key]: value });
    } catch (error) {
      console.error('Failed to update setting:', error);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await authService.deleteAccount();
      navigate('/');
    } catch (error) {
      console.error('Failed to delete account:', error);
    }
  };

  return (
    <div id="account-settings" className="bg-white bg-opacity-5 rounded-xl border border-white border-opacity-10 p-6 mt-8">
      <h2 className="text-2xl font-bold text-white mb-6">Account-Einstellungen</h2>

      {/* Notifications */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-4">Benachrichtigungen</h3>
        <div className="space-y-3">
          <label className="flex items-center justify-between p-4 bg-white bg-opacity-5 rounded-lg cursor-pointer hover:bg-opacity-10 transition-colors">
            <span className="text-white">Email bei neuen Features</span>
            <input
              type="checkbox"
              checked={emailNotifications}
              onChange={(e) => {
                setEmailNotifications(e.target.checked);
                updateSetting('email_notifications', e.target.checked);
              }}
              className="w-12 h-6 accent-primary"
            />
          </label>

          <label className="flex items-center justify-between p-4 bg-white bg-opacity-5 rounded-lg cursor-pointer hover:bg-opacity-10 transition-colors">
            <span className="text-white">Bewerbungs-Erinnerungen</span>
            <input
              type="checkbox"
              checked={applicationReminders}
              onChange={(e) => {
                setApplicationReminders(e.target.checked);
                updateSetting('application_reminders', e.target.checked);
              }}
              className="w-12 h-6 accent-primary"
            />
          </label>
        </div>
      </div>

      {/* Payments */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-4">Zahlungen</h3>
        <button
          onClick={() => navigate('/dashboard/billing')}
          className="text-primary hover:underline flex items-center gap-2"
        >
          <span>Zahlungsmethode verwalten →</span>
        </button>
      </div>

      {/* Danger Zone */}
      <div className="border-t border-white border-opacity-10 pt-6">
        <h3 className="text-lg font-semibold text-white mb-4">Gefahrenzone</h3>
        <button
          onClick={() => setShowDeleteModal(true)}
          className="px-6 py-3 bg-error hover:bg-opacity-80 rounded-lg text-white font-semibold transition-colors"
        >
          Account löschen
        </button>
      </div>

      {showDeleteModal && (
        <DeleteConfirmModal
          title="Account wirklich löschen?"
          message="Alle deine Daten werden permanent gelöscht. Diese Aktion kann nicht rückgängig gemacht werden."
          onConfirm={handleDeleteAccount}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}
    </div>
  );
}
