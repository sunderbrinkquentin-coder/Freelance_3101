export type ApplicationStatus =
  | 'ENTWURF'
  | 'VERSCHICKT'
  | 'INTERVIEW'
  | 'ANGEBOT'
  | 'TRAUMJOB';

export interface Application {
  id: string;
  user_id?: string;
  cv_id?: string;
  job_title: string;
  company: string;
  job_link?: string;
  created_at: string;
  updated_at?: string;
  status: ApplicationStatus;
  contact_name?: string;
  contact_role?: string;
  contact_email?: string;
  contact_phone?: string;
  notes?: string;
}

export interface ApplicationStats {
  total: number;
  entwurf: number;
  verschickt: number;
  interview: number;
  angebot: number;
  traumjob: number;
}
