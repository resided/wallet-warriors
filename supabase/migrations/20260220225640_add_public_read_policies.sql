-- Add public read policies for AI agents to fetch fighters

DROP POLICY IF EXISTS "Anyone can read fighters" ON fighters;
DROP POLICY IF EXISTS "Anyone can read fights" ON fights;

CREATE POLICY "Anyone can read fighters" ON fighters FOR SELECT USING (true);
CREATE POLICY "Anyone can read fights" ON fights FOR SELECT USING (true);
