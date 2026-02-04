-- Add missing DELETE policy for photos
-- Run this in your Supabase SQL Editor

-- Allow photo uploaders and group owners to delete photos
CREATE POLICY "Photo uploaders can delete photos" ON photos FOR DELETE
  USING (
    uploaded_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM groups
      WHERE groups.id = photos.group_id
      AND groups.created_by = auth.uid()
    )
  );








