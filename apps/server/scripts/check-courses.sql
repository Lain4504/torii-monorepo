-- Check all courses and their deletedAt status
SELECT 
  id,
  title,
  status,
  deleted_at,
  CASE 
    WHEN deleted_at IS NULL THEN 'NOT DELETED'
    ELSE 'DELETED'
  END as deletion_status
FROM courses
ORDER BY created_at DESC;

-- Count courses by deletion status
SELECT 
  CASE 
    WHEN deleted_at IS NULL THEN 'NOT DELETED'
    ELSE 'DELETED'
  END as status,
  COUNT(*) as count
FROM courses
GROUP BY (deleted_at IS NULL);
