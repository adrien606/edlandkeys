-- Drop existing restrictive policies and recreate as permissive
DROP POLICY IF EXISTS "Allow all operations on clients" ON clients;
DROP POLICY IF EXISTS "Allow all operations on equipment" ON equipment;
DROP POLICY IF EXISTS "Allow all operations on buildings" ON buildings;
DROP POLICY IF EXISTS "Allow all operations on stock_items" ON stock_items;
DROP POLICY IF EXISTS "Allow all operations on inspections" ON inspections;
DROP POLICY IF EXISTS "Allow all operations on notifications" ON notifications;

-- Recreate as PERMISSIVE policies (default)
CREATE POLICY "Allow all operations on clients" ON clients
FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on equipment" ON equipment
FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on buildings" ON buildings
FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on stock_items" ON stock_items
FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on inspections" ON inspections
FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on notifications" ON notifications
FOR ALL TO authenticated USING (true) WITH CHECK (true);