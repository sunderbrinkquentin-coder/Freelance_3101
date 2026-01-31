/*
  # Erweitere ats_analyses Tabelle

  1. Änderungen
    - Füge `analysis_data` (jsonb) hinzu - Speichert die komplette Analyse
    - Füge `upload_id` (uuid) hinzu - Verbindung zum ursprünglichen Upload
    - Beide Felder sind nullable für Abwärtskompatibilität

  2. Zweck
    - Ermöglicht das Speichern der vollständigen Analyse-Daten im Dashboard
    - Verbindung zwischen gespeicherter Analyse und ursprünglichem Upload
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ats_analyses' AND column_name = 'analysis_data'
  ) THEN
    ALTER TABLE ats_analyses ADD COLUMN analysis_data jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ats_analyses' AND column_name = 'upload_id'
  ) THEN
    ALTER TABLE ats_analyses ADD COLUMN upload_id uuid;
  END IF;
END $$;

-- Index für schnellere Abfragen
CREATE INDEX IF NOT EXISTS idx_ats_analyses_upload_id ON ats_analyses(upload_id);
CREATE INDEX IF NOT EXISTS idx_ats_analyses_user_created ON ats_analyses(user_id, created_at DESC);
