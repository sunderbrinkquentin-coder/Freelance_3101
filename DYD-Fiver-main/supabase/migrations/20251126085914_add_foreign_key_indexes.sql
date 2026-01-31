/*
  # Add Missing Foreign Key Indexes

  1. Performance Optimization
    - Add indexes for all foreign key columns to improve query performance
    - Covers all tables with unindexed foreign keys

  2. Tables Affected
    - applications: cv_id, user_id
    - cv_documents: user_id
    - cv_drafts: user_id
    - cv_education: cv_id, user_id
    - cv_experience: cv_id, user_id
    - cv_hard_skills: cv_id, user_id
    - cv_personal_data: cv_id, user_id
    - cv_projects: cv_id, user_id
    - cv_records: user_id
    - cv_soft_skills: cv_id, user_id
    - cv_versions: cv_id
    - cvs: user_id
    - job_targets: cv_id, user_id
    - user_profiles: user_id
*/

-- applications table
CREATE INDEX IF NOT EXISTS idx_applications_cv_id ON public.applications(cv_id);
CREATE INDEX IF NOT EXISTS idx_applications_user_id ON public.applications(user_id);

-- cv_documents table
CREATE INDEX IF NOT EXISTS idx_cv_documents_user_id ON public.cv_documents(user_id);

-- cv_drafts table
CREATE INDEX IF NOT EXISTS idx_cv_drafts_user_id ON public.cv_drafts(user_id);

-- cv_education table
CREATE INDEX IF NOT EXISTS idx_cv_education_cv_id ON public.cv_education(cv_id);
CREATE INDEX IF NOT EXISTS idx_cv_education_user_id ON public.cv_education(user_id);

-- cv_experience table
CREATE INDEX IF NOT EXISTS idx_cv_experience_cv_id ON public.cv_experience(cv_id);
CREATE INDEX IF NOT EXISTS idx_cv_experience_user_id ON public.cv_experience(user_id);

-- cv_hard_skills table
CREATE INDEX IF NOT EXISTS idx_cv_hard_skills_cv_id ON public.cv_hard_skills(cv_id);
CREATE INDEX IF NOT EXISTS idx_cv_hard_skills_user_id ON public.cv_hard_skills(user_id);

-- cv_personal_data table
CREATE INDEX IF NOT EXISTS idx_cv_personal_data_cv_id ON public.cv_personal_data(cv_id);
CREATE INDEX IF NOT EXISTS idx_cv_personal_data_user_id ON public.cv_personal_data(user_id);

-- cv_projects table
CREATE INDEX IF NOT EXISTS idx_cv_projects_cv_id ON public.cv_projects(cv_id);
CREATE INDEX IF NOT EXISTS idx_cv_projects_user_id ON public.cv_projects(user_id);

-- cv_records table
CREATE INDEX IF NOT EXISTS idx_cv_records_user_id ON public.cv_records(user_id);

-- cv_soft_skills table
CREATE INDEX IF NOT EXISTS idx_cv_soft_skills_cv_id ON public.cv_soft_skills(cv_id);
CREATE INDEX IF NOT EXISTS idx_cv_soft_skills_user_id ON public.cv_soft_skills(user_id);

-- cv_versions table
CREATE INDEX IF NOT EXISTS idx_cv_versions_cv_id ON public.cv_versions(cv_id);

-- cvs table
CREATE INDEX IF NOT EXISTS idx_cvs_user_id ON public.cvs(user_id);

-- job_targets table
CREATE INDEX IF NOT EXISTS idx_job_targets_cv_id ON public.job_targets(cv_id);
CREATE INDEX IF NOT EXISTS idx_job_targets_user_id ON public.job_targets(user_id);

-- user_profiles table
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);
