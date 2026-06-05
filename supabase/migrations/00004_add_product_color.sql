-- ============================================================
-- Simplification du schéma pour le modèle "catalogue fixe"
-- Chaque produit a une couleur fixe liée à son design.
-- ============================================================

-- Couleur du t-shirt (hex) associée au design du produit
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS color text NOT NULL DEFAULT '#FFFFFF';

-- La personnalisation client n'existe plus :
-- custom_text et custom_image_url restent dans order_items
-- pour rétrocompatibilité mais ne seront plus utilisés.
-- On les rend optionnels (déjà nullable — rien à faire).

-- Mise à jour des produits de seed avec leur couleur
UPDATE products SET color = '#1A1A1A' WHERE name ILIKE '%noir%';
UPDATE products SET color = '#D1D5DB' WHERE name ILIKE '%gris%';
UPDATE products SET color = '#FFFFFF' WHERE name ILIKE '%blanc%';
