-- Migration complète vers Supabase
-- Tables principales : clients, buildings, equipment, stock_items, inspections

-- Création de la table buildings (mise à jour si elle existe déjà)
ALTER TABLE public.buildings 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Création du trigger pour updated_at sur buildings
DROP TRIGGER IF EXISTS update_buildings_updated_at ON public.buildings;
CREATE TRIGGER update_buildings_updated_at
  BEFORE UPDATE ON public.buildings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Création de la table clients (mise à jour si elle existe déjà)
ALTER TABLE public.clients 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Création du trigger pour updated_at sur clients
DROP TRIGGER IF EXISTS update_clients_updated_at ON public.clients;
CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Création de la table equipment (mise à jour si elle existe déjà)
ALTER TABLE public.equipment 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Création du trigger pour updated_at sur equipment
DROP TRIGGER IF EXISTS update_equipment_updated_at ON public.equipment;
CREATE TRIGGER update_equipment_updated_at
  BEFORE UPDATE ON public.equipment
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Création de la table stock_items (mise à jour si elle existe déjà)
ALTER TABLE public.stock_items 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Création du trigger pour updated_at sur stock_items
DROP TRIGGER IF EXISTS update_stock_items_updated_at ON public.stock_items;
CREATE TRIGGER update_stock_items_updated_at
  BEFORE UPDATE ON public.stock_items
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Création de la table inspections (mise à jour si elle existe déjà)
ALTER TABLE public.inspections 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Création du trigger pour updated_at sur inspections
DROP TRIGGER IF EXISTS update_inspections_updated_at ON public.inspections;
CREATE TRIGGER update_inspections_updated_at
  BEFORE UPDATE ON public.inspections
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Ajout des données initiales des bâtiments BEL AIR si elles n'existent pas
INSERT INTO public.buildings (nom, code, description, date_creation)
SELECT 'BEL AIR BUSINESS', 'BEL-BUS', 'Bâtiment dédié aux bureaux et espaces de travail', now()
WHERE NOT EXISTS (SELECT 1 FROM public.buildings WHERE code = 'BEL-BUS');

INSERT INTO public.buildings (nom, code, description, date_creation)
SELECT 'BEL AIR INDUSTRY', 'BEL-IND', 'Bâtiment industriel et de production', now()
WHERE NOT EXISTS (SELECT 1 FROM public.buildings WHERE code = 'BEL-IND');

INSERT INTO public.buildings (nom, code, description, date_creation)
SELECT 'BEL AIR TEXTILE', 'BEL-TEX', 'Bâtiment spécialisé dans l''industrie textile', now()
WHERE NOT EXISTS (SELECT 1 FROM public.buildings WHERE code = 'BEL-TEX');

INSERT INTO public.buildings (nom, code, description, date_creation)
SELECT 'BEL AIR SCHOOL', 'BEL-EDU', 'Bâtiment scolaire et de formation', now()
WHERE NOT EXISTS (SELECT 1 FROM public.buildings WHERE code = 'BEL-EDU');