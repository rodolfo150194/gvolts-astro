import { pool } from "@/db";
import type { Promotion, ServiceSlug, PromotionFilter, PromoValidationResult } from "@/types/promotion";

/**
 * Get all active promotions.
 * Active = is_active=1 AND NOW() is between start_date and end_date.
 * applicable_services is stored as JSON array in MySQL.
 */
export const getActivePromotions = async (filter?: PromotionFilter) => {
  try {
    let queryText = `
      SELECT * FROM promotions
      WHERE is_active = 1
        AND start_date <= NOW()
        AND end_date >= NOW()
    `;
    const params: any[] = [];

    if (filter?.service) {
      queryText += ` AND JSON_CONTAINS(applicable_services, ?)`;
      params.push(JSON.stringify(filter.service));
    }

    queryText += ` ORDER BY start_date DESC`;

    const [rows] = await pool.query(queryText, params);

    return {
      success: true,
      data: rows as Promotion[],
      error: null,
    };
  } catch (err) {
    console.error("Unexpected error in getActivePromotions:", err);
    return {
      success: false,
      data: null,
      error: "Error inesperado al obtener promociones",
    };
  }
};

/**
 * Get a specific promotion by ID.
 */
export const getPromotionById = async (id: string) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM promotions WHERE id = ?',
      [id]
    ) as [any[], any];

    if (rows.length === 0) {
      return { success: false, data: null, error: "Promoción no encontrada" };
    }

    return { success: true, data: rows[0] as Promotion, error: null };
  } catch (err) {
    console.error("Unexpected error in getPromotionById:", err);
    return { success: false, data: null, error: "Error al obtener la promoción" };
  }
};

/**
 * Validate a promo code and return the promotion if valid.
 */
export const validatePromoCode = async (
  promoCode: string,
  service?: ServiceSlug
): Promise<PromoValidationResult> => {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM promotions
       WHERE promo_code = ?
         AND is_active = 1
         AND start_date <= NOW()
         AND end_date >= NOW()
       LIMIT 1`,
      [promoCode.toUpperCase()]
    ) as [any[], any];

    if (rows.length === 0) {
      return { valid: false, error: "Código de promoción inválido o expirado" };
    }

    const promotion = rows[0] as Promotion;
    const services: ServiceSlug[] = typeof promotion.applicable_services === 'string'
      ? JSON.parse(promotion.applicable_services)
      : promotion.applicable_services;

    if (service && services.length > 0 && !services.includes(service)) {
      return { valid: false, error: "Este código no es válido para el servicio seleccionado" };
    }

    if (promotion.max_uses !== null && promotion.current_uses >= promotion.max_uses) {
      return { valid: false, error: "Este código ha alcanzado su límite de usos" };
    }

    return { valid: true, promotion };
  } catch (err) {
    console.error("Unexpected error in validatePromoCode:", err);
    return { valid: false, error: "Error al validar el código de promoción" };
  }
};

/**
 * Increment the usage counter for a promotion.
 */
export const incrementPromoUsage = async (promoId: string) => {
  try {
    await pool.query(
      'UPDATE promotions SET current_uses = current_uses + 1 WHERE id = ?',
      [promoId]
    );
    return { success: true, error: null };
  } catch (err) {
    console.error("Unexpected error in incrementPromoUsage:", err);
    return { success: false, error: "Error al actualizar el contador de usos" };
  }
};

/** Get promotions applicable to a specific service. */
export const getPromotionsForService = async (service: ServiceSlug) => {
  return getActivePromotions({ service });
};

/** Calculate days remaining for a promotion. */
export const getDaysRemaining = (endDate: string): number => {
  const diff = new Date(endDate).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

/** Calculate uses remaining for a promotion. */
export const getUsesRemaining = (promotion: Promotion): number | null => {
  if (promotion.max_uses === null) return null;
  return Math.max(0, promotion.max_uses - promotion.current_uses);
};

/** Format discount for display. */
export const formatDiscount = (promotion: Promotion): string => {
  if (promotion.discount_type === "percentage") return `${promotion.discount_value}%`;
  return `$${promotion.discount_value.toLocaleString("es-MX")}`;
};
