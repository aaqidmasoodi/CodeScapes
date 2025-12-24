-- Fix Python thumbnails that were saved without the data URL prefix
-- This migration adds 'data:image/png;base64,' prefix to thumbnails that are missing it

-- Fix scapes table
UPDATE scapes 
SET thumbnail = 'data:image/png;base64,' || thumbnail 
WHERE thumbnail IS NOT NULL 
  AND thumbnail NOT LIKE 'data:%'
  AND environment = 'python-script';

-- Fix deployments table (frozen thumbnails)
UPDATE deployments 
SET thumbnail = 'data:image/png;base64,' || thumbnail 
WHERE thumbnail IS NOT NULL 
  AND thumbnail NOT LIKE 'data:%';
