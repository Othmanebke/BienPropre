-- ============================================================
-- BienPropre — Seed: sample product catalogue
-- ============================================================
insert into products (id, name, description, base_price, is_customizable, image_url)
values
  (
    uuid_generate_v4(),
    'T-Shirt Classic Blanc',
    'T-shirt 100% coton bio, coupe régulière. Parfait pour l''impression personnalisée.',
    19.99,
    true,
    '/images/tshirt-white.png'
  ),
  (
    uuid_generate_v4(),
    'T-Shirt Premium Noir',
    'T-shirt premium, tissu épais 220g/m². Rendu d''impression exceptionnel sur fond sombre.',
    24.99,
    true,
    '/images/tshirt-black.png'
  ),
  (
    uuid_generate_v4(),
    'T-Shirt Oversize Gris',
    'Coupe oversize tendance, 100% coton recyclé. Éco-responsable et confortable.',
    22.99,
    true,
    '/images/tshirt-grey.png'
  );
