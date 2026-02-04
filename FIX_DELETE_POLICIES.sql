-- Add missing DELETE policies for lists and categories
-- Run this in your Supabase SQL Editor

-- Allow list creators and group owners to delete lists
CREATE POLICY "List creators can delete lists" ON lists FOR DELETE
  USING (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM groups
      WHERE groups.id = lists.group_id
      AND groups.created_by = auth.uid()
    )
  );

-- Allow group owners to delete categories
CREATE POLICY "Group owners can delete categories" ON categories FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM groups
      WHERE groups.id = categories.group_id
      AND groups.created_by = auth.uid()
    )
  );








