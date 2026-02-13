-- Allow public read access
CREATE POLICY "Public Read Access"
ON inspecoes_cilindros
FOR SELECT
TO anon, authenticated
USING (true);

-- Allow public update access (to confirm)
CREATE POLICY "Public Update Access"
ON inspecoes_cilindros
FOR UPDATE
TO anon, authenticated
USING (true);
