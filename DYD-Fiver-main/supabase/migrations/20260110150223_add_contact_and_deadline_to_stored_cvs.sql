/*
  # Add contact_person and application_deadline to stored_cvs

  1. New Columns
    - `contact_person` (text) - Name des Ansprechpartners bei der Firma (von Nutzer hinzufügbar)
    - `application_deadline` (date) - Bewerbungsfrist (von Nutzer hinzufügbar)

  2. Changes
    - Added two optional columns to stored_cvs table
    - Both columns allow NULL (optional beim Erstellen)
    - contact_person und application_deadline können später vom Nutzer im Dashboard hinzugefügt oder bearbeitet werden
*/

ALTER TABLE IF EXISTS stored_cvs
ADD COLUMN IF NOT EXISTS contact_person text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS application_deadline date DEFAULT NULL;
