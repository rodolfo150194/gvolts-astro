-- Sample promotions for GVolts
-- Run this AFTER running promotions-schema.sql
-- These are example promotions you can modify or use as templates

-- Promotion 1: Fire Alarm System Discount
INSERT INTO promotions (
  title,
  description,
  discount_type,
  discount_value,
  promo_code,
  applicable_services,
  start_date,
  end_date,
  is_active,
  banner_image,
  terms,
  max_uses
) VALUES (
  '20% de Descuento en Sistemas de Alarma Contra Incendio',
  'Protege tu negocio con nuestros sistemas certificados de detección y alarma contra incendios. Instalación profesional incluida.',
  'percentage',
  20,
  'FUEGO20',
  ARRAY['fire-alarm'],
  NOW(),
  NOW() + INTERVAL '30 days',
  true,
  '/img/promos/fire-alarm-promo.webp',
  'Válido para instalaciones nuevas. No acumulable con otras promociones. Aplican términos y condiciones. Instalación sujeta a evaluación técnica previa.',
  50
);

-- Promotion 2: Security Package Deal
INSERT INTO promotions (
  title,
  description,
  discount_type,
  discount_value,
  promo_code,
  applicable_services,
  start_date,
  end_date,
  is_active,
  banner_image,
  terms,
  max_uses
) VALUES (
  'Paquete Completo de Seguridad - $5,000 de Descuento',
  'Sistema CCTV + Control de Acceso + Monitoreo 24/7. La solución integral para tu empresa.',
  'fixed',
  5000,
  'SEGURO5K',
  ARRAY['security'],
  NOW(),
  NOW() + INTERVAL '45 days',
  true,
  '/img/promos/security-package.webp',
  'Válido para paquetes de seguridad integral. Incluye 4 cámaras CCTV, 2 lectores de acceso y 3 meses de monitoreo gratis. No acumulable.',
  25
);

-- Promotion 3: Electrical Services Spring Special
INSERT INTO promotions (
  title,
  description,
  discount_type,
  discount_value,
  promo_code,
  applicable_services,
  start_date,
  end_date,
  is_active,
  banner_image,
  terms,
  max_uses
) VALUES (
  '15% de Descuento en Servicios Eléctricos',
  'Mantenimiento preventivo, instalaciones y reparaciones eléctricas para tu hogar o negocio.',
  'percentage',
  15,
  'ELECTRO15',
  ARRAY['electricity'],
  NOW(),
  NOW() + INTERVAL '60 days',
  true,
  '/img/promos/electrical-promo.webp',
  'Válido para servicios eléctricos residenciales y comerciales. Incluye diagnóstico gratuito. Materiales no incluidos en el descuento.',
  100
);

-- Promotion 4: Multi-Service Bundle (All Services)
INSERT INTO promotions (
  title,
  description,
  discount_type,
  discount_value,
  promo_code,
  applicable_services,
  start_date,
  end_date,
  is_active,
  banner_image,
  terms,
  max_uses
) VALUES (
  'Mega Descuento - 25% en Todos los Servicios',
  'Aprovecha nuestro descuento especial aplicable a cualquier servicio de GVolts. Oferta por tiempo limitado.',
  'percentage',
  25,
  'GVOLTS25',
  ARRAY['fire-alarm', 'security', 'electricity'],
  NOW(),
  NOW() + INTERVAL '15 days',
  true,
  '/img/promos/mega-deal.webp',
  'Válido para todos los servicios. Mínimo de contratación $10,000 MXN. Oferta limitada a los primeros 30 clientes. No acumulable.',
  30
);

-- Promotion 5: Security Camera Special (No promo code - auto-applied)
INSERT INTO promotions (
  title,
  description,
  discount_type,
  discount_value,
  promo_code,
  applicable_services,
  start_date,
  end_date,
  is_active,
  banner_image,
  terms,
  max_uses
) VALUES (
  'Cámaras CCTV con 30% de Descuento',
  'Adquiere tu sistema de vigilancia profesional con descuento especial. Cámaras 4K con visión nocturna.',
  'percentage',
  30,
  NULL, -- No promo code needed, auto-applied
  ARRAY['security'],
  NOW(),
  NOW() + INTERVAL '20 days',
  true,
  '/img/promos/cctv-sale.webp',
  'Descuento automático en paquetes de 4 o más cámaras. Instalación no incluida. Stock limitado.',
  NULL -- Unlimited uses
);

-- Promotion 6: Fire Alarm + Security Combo
INSERT INTO promotions (
  title,
  description,
  discount_type,
  discount_value,
  promo_code,
  applicable_services,
  start_date,
  end_date,
  is_active,
  banner_image,
  terms,
  max_uses
) VALUES (
  'Combo Protección Total - $8,000 OFF',
  'Sistema de Alarma Contra Incendio + Sistema de Seguridad CCTV. Protección completa para tu negocio.',
  'fixed',
  8000,
  'COMBO8K',
  ARRAY['fire-alarm', 'security'],
  NOW(),
  NOW() + INTERVAL '40 days',
  true,
  '/img/promos/protection-combo.webp',
  'Válido para contratación simultánea de ambos servicios. Incluye instalación y configuración inicial. Evaluación técnica previa requerida.',
  15
);

-- Promotion 7: Expired Promotion (for testing)
INSERT INTO promotions (
  title,
  description,
  discount_type,
  discount_value,
  promo_code,
  applicable_services,
  start_date,
  end_date,
  is_active,
  banner_image,
  terms,
  max_uses
) VALUES (
  'Promoción Expirada - Solo para Pruebas',
  'Esta promoción ya expiró y no debería aparecer en el sitio.',
  'percentage',
  50,
  'EXPIRED',
  ARRAY['fire-alarm'],
  NOW() - INTERVAL '60 days',
  NOW() - INTERVAL '30 days',
  true,
  NULL,
  'Esta es una promoción de prueba que ya expiró.',
  NULL
);

-- Promotion 8: Future Promotion (for testing)
INSERT INTO promotions (
  title,
  description,
  discount_type,
  discount_value,
  promo_code,
  applicable_services,
  start_date,
  end_date,
  is_active,
  banner_image,
  terms,
  max_uses
) VALUES (
  'Promoción Futura - Próximamente',
  'Esta promoción aún no ha comenzado. Aparecerá cuando llegue la fecha de inicio.',
  'percentage',
  35,
  'FUTURO35',
  ARRAY['electricity'],
  NOW() + INTERVAL '30 days',
  NOW() + INTERVAL '60 days',
  true,
  NULL,
  'Promoción programada para el futuro.',
  NULL
);

-- Verification query to see all promotions
-- SELECT
--   id,
--   title,
--   discount_type,
--   discount_value,
--   promo_code,
--   applicable_services,
--   start_date,
--   end_date,
--   is_active,
--   current_uses,
--   max_uses
-- FROM promotions
-- ORDER BY created_at DESC;

-- Query to see only active promotions (what users will see)
-- SELECT
--   id,
--   title,
--   promo_code,
--   discount_type,
--   discount_value
-- FROM promotions
-- WHERE is_active = true
--   AND NOW() BETWEEN start_date AND end_date
-- ORDER BY end_date ASC;
