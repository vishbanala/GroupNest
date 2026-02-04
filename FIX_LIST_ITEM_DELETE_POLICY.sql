-- Add missing DELETE policy for list_items
-- Run this in your Supabase SQL Editor

-- Allow item creators and group owners to delete list items
CREATE POLICY "Item creators can delete list items" ON list_items FOR DELETE
  USING (
    added_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM lists
      JOIN groups ON groups.id = lists.group_id
      WHERE lists.id = list_items.list_id
      AND groups.created_by = auth.uid()
    )
  );








