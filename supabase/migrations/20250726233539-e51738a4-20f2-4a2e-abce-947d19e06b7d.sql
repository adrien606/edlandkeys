-- Créer les tables pour la gestion des bâtiments
CREATE TABLE public.buildings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nom TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  date_creation TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Créer les tables pour les clients
CREATE TABLE public.clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nom TEXT NOT NULL,
  prenom TEXT NOT NULL,
  email TEXT NOT NULL,
  telephone TEXT NOT NULL,
  date_inscription TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Créer les tables pour les équipements
CREATE TABLE public.equipment (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('cle', 'badge', 'telecommande')),
  numero TEXT,
  description TEXT,
  statut TEXT NOT NULL CHECK (statut IN ('remis', 'restitue', 'perdu', 'non_rendu')),
  batiment_id UUID REFERENCES public.buildings(id) ON DELETE CASCADE,
  date_remise TIMESTAMP WITH TIME ZONE,
  date_restitution TIMESTAMP WITH TIME ZONE,
  validation_client JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Créer les tables pour le stock
CREATE TABLE public.stock_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('cle', 'badge', 'telecommande')),
  numero TEXT NOT NULL,
  description TEXT,
  statut TEXT NOT NULL CHECK (statut IN ('disponible', 'attribue', 'perdu')),
  client_actuel TEXT,
  batiment_id UUID REFERENCES public.buildings(id) ON DELETE CASCADE,
  quantite INTEGER NOT NULL DEFAULT 1,
  quantite_disponible INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Créer les tables pour les inspections
CREATE TABLE public.inspection_buildings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nom TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  adresse TEXT,
  description TEXT,
  date_creation TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.inspections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id TEXT NOT NULL,
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  building_id TEXT,
  building_code TEXT,
  type TEXT NOT NULL CHECK (type IN ('entry', 'exit')),
  entry_inspection_id TEXT,
  date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  items JSONB NOT NULL,
  signature TEXT,
  site_manager_name TEXT,
  site_manager_signature TEXT,
  completed BOOLEAN DEFAULT false,
  pdf_generated BOOLEAN DEFAULT false,
  email_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Activer RLS sur toutes les tables
ALTER TABLE public.buildings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inspection_buildings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inspections ENABLE ROW LEVEL SECURITY;

-- Créer des politiques publiques pour permettre toutes les opérations
CREATE POLICY "Allow all operations on buildings" ON public.buildings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on clients" ON public.clients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on equipment" ON public.equipment FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on stock_items" ON public.stock_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on inspection_buildings" ON public.inspection_buildings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on inspections" ON public.inspections FOR ALL USING (true) WITH CHECK (true);

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers pour updated_at
CREATE TRIGGER trigger_equipment_updated_at
  BEFORE UPDATE ON public.equipment
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trigger_stock_items_updated_at
  BEFORE UPDATE ON public.stock_items
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trigger_inspections_updated_at
  BEFORE UPDATE ON public.inspections
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Insérer des bâtiments par défaut
INSERT INTO public.buildings (nom, code, description) VALUES
('Bâtiment Principal', 'BAT-001', 'Bâtiment principal du complexe'),
('Annexe Nord', 'BAT-002', 'Bâtiment annexe côté nord'),
('Pavillon Sud', 'BAT-003', 'Pavillon résidentiel sud');

INSERT INTO public.inspection_buildings (nom, code, adresse, description) VALUES
('Bâtiment Principal', 'BAT-001', '123 Rue Principale', 'Bâtiment principal du complexe'),
('Annexe Nord', 'BAT-002', '125 Rue Principale', 'Bâtiment annexe côté nord'),
('Pavillon Sud', 'BAT-003', '127 Rue Principale', 'Pavillon résidentiel sud');