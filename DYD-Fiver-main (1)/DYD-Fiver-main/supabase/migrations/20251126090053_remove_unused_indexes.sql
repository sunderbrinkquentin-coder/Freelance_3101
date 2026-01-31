/*
  # Remove Unused Indexes

  1. Performance Optimization
    - Remove indexes that are not being used
    - Reduces storage overhead and maintenance cost

  2. Indexes Affected
    - ats_analyses_user_id_idx (unused)
    - ats_analyses_cv_id_idx (unused)

  3. Note
    - These indexes were created but queries don't utilize them
    - Foreign key indexes are already covered by the previous migration
*/

-- Drop unused indexes on ats_analyses table
DROP INDEX IF EXISTS public.ats_analyses_user_id_idx;
DROP INDEX IF EXISTS public.ats_analyses_cv_id_idx;
