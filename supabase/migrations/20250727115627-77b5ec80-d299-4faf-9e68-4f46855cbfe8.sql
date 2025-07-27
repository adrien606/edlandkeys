-- Supprimer les anciens bâtiments BAT-001, BAT-002, BAT-003 de la table buildings
DELETE FROM buildings WHERE code IN ('BAT-001', 'BAT-002', 'BAT-003');

-- Ajouter les nouveaux bâtiments Bel Air
INSERT INTO buildings (nom, code, description) VALUES
('BEL AIR BUSINESS', 'BEL-BUS', 'Bâtiment dédié aux bureaux et espaces de travail'),
('BEL AIR INDUSTRY', 'BEL-IND', 'Bâtiment industriel et de production'),
('BEL AIR TEXTILE', 'BEL-TEX', 'Bâtiment spécialisé dans l''industrie textile'),
('BEL AIR SCHOOL', 'BEL-EDU', 'Bâtiment scolaire et de formation');

-- Supprimer complètement la table inspection_buildings qui fait doublon
DROP TABLE IF EXISTS inspection_buildings;