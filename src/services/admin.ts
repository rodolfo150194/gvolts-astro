import { pool } from "@/db";
import type { Promotion } from "@/types/promotion";

const PAGE_SIZE = 20;

// ─── STATS ───────────────────────────────────────────────────────────────────

export const getDashboardStats = async () => {
  try {
    const [[contacts], [subscribers], [promotions], [activePromos]] =
      await Promise.all([
        pool.query("SELECT COUNT(*) as count FROM contacts") as Promise<[any[], any]>,
        pool.query("SELECT COUNT(*) as count FROM subscriber") as Promise<[any[], any]>,
        pool.query("SELECT COUNT(*) as count FROM promotions") as Promise<[any[], any]>,
        pool.query(
          "SELECT COUNT(*) as count FROM promotions WHERE is_active = 1 AND start_date <= NOW() AND end_date >= NOW()"
        ) as Promise<[any[], any]>,
      ]);

    const [[recentContacts]] = await Promise.all([
      pool.query(
        "SELECT COUNT(*) as count FROM contacts WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)"
      ) as Promise<[any[], any]>,
    ]);

    return {
      success: true,
      data: {
        totalContacts: contacts[0].count as number,
        totalSubscribers: subscribers[0].count as number,
        totalPromotions: promotions[0].count as number,
        activePromotions: activePromos[0].count as number,
        recentContacts: recentContacts[0].count as number,
      },
    };
  } catch (err) {
    console.error("[admin] getDashboardStats:", err);
    return { success: false, data: null };
  }
};

// ─── CONTACTS ────────────────────────────────────────────────────────────────

export const getContacts = async (page = 1, search = "") => {
  try {
    const offset = (page - 1) * PAGE_SIZE;
    const searchParam = `%${search}%`;
    const whereClause = search
      ? "WHERE name LIKE ? OR email LIKE ? OR phone LIKE ? OR service LIKE ?"
      : "";
    const params = search
      ? [searchParam, searchParam, searchParam, searchParam]
      : [];

    const [[{ total }]] = (await pool.query(
      `SELECT COUNT(*) as total FROM contacts ${whereClause}`,
      params
    )) as [any[], any];

    const [rows] = (await pool.query(
      `SELECT * FROM contacts ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, PAGE_SIZE, offset]
    )) as [any[], any];

    return {
      success: true,
      data: rows,
      total: total as number,
      page,
      pages: Math.ceil(total / PAGE_SIZE),
    };
  } catch (err) {
    console.error("[admin] getContacts:", err);
    return { success: false, data: [], total: 0, page: 1, pages: 0 };
  }
};

export const deleteContact = async (id: number) => {
  try {
    await pool.query("DELETE FROM contacts WHERE id = ?", [id]);
    return { success: true };
  } catch (err) {
    console.error("[admin] deleteContact:", err);
    return { success: false };
  }
};

// ─── SUBSCRIBERS ─────────────────────────────────────────────────────────────

export const getSubscribers = async (page = 1, search = "") => {
  try {
    const offset = (page - 1) * PAGE_SIZE;
    const searchParam = `%${search}%`;
    const whereClause = search ? "WHERE email LIKE ?" : "";
    const params = search ? [searchParam] : [];

    const [[{ total }]] = (await pool.query(
      `SELECT COUNT(*) as total FROM subscriber ${whereClause}`,
      params
    )) as [any[], any];

    const [rows] = (await pool.query(
      `SELECT * FROM subscriber ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, PAGE_SIZE, offset]
    )) as [any[], any];

    return {
      success: true,
      data: rows,
      total: total as number,
      page,
      pages: Math.ceil(total / PAGE_SIZE),
    };
  } catch (err) {
    console.error("[admin] getSubscribers:", err);
    return { success: false, data: [], total: 0, page: 1, pages: 0 };
  }
};

export const deleteSubscriber = async (id: number) => {
  try {
    await pool.query("DELETE FROM subscriber WHERE id = ?", [id]);
    return { success: true };
  } catch (err) {
    console.error("[admin] deleteSubscriber:", err);
    return { success: false };
  }
};

// ─── PROMOTIONS ──────────────────────────────────────────────────────────────

export const getAllPromotions = async (page = 1) => {
  try {
    const offset = (page - 1) * PAGE_SIZE;

    const [[{ total }]] = (await pool.query(
      "SELECT COUNT(*) as total FROM promotions"
    )) as [any[], any];

    const [rows] = (await pool.query(
      "SELECT * FROM promotions ORDER BY created_at DESC LIMIT ? OFFSET ?",
      [PAGE_SIZE, offset]
    )) as [any[], any];

    const data = rows.map((row: any) => ({
      ...row,
      applicable_services:
        typeof row.applicable_services === "string"
          ? JSON.parse(row.applicable_services)
          : row.applicable_services,
      is_active: Boolean(row.is_active),
    }));

    return {
      success: true,
      data,
      total: total as number,
      page,
      pages: Math.ceil(total / PAGE_SIZE),
    };
  } catch (err) {
    console.error("[admin] getAllPromotions:", err);
    return { success: false, data: [], total: 0, page: 1, pages: 0 };
  }
};

export interface CreatePromotionInput {
  title: string;
  description: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  promo_code?: string;
  applicable_services: string[];
  start_date: string;
  end_date: string;
  is_active: boolean;
  banner_image?: string;
  terms?: string;
  max_uses?: number;
}

export const createPromotion = async (data: CreatePromotionInput) => {
  try {
    await pool.query(
      `INSERT INTO promotions
        (title, description, discount_type, discount_value, promo_code,
         applicable_services, start_date, end_date, is_active, banner_image, terms, max_uses)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.title,
        data.description,
        data.discount_type,
        data.discount_value,
        data.promo_code || null,
        JSON.stringify(data.applicable_services),
        data.start_date,
        data.end_date,
        data.is_active ? 1 : 0,
        data.banner_image || null,
        data.terms || null,
        data.max_uses || null,
      ]
    );
    return { success: true };
  } catch (err: any) {
    console.error("[admin] createPromotion:", err);
    const isDuplicate = err.code === "ER_DUP_ENTRY";
    return {
      success: false,
      error: isDuplicate ? "El código de promoción ya existe" : "Error al crear la promoción",
    };
  }
};

export const updatePromotion = async (id: string, data: CreatePromotionInput) => {
  try {
    await pool.query(
      `UPDATE promotions SET
        title = ?, description = ?, discount_type = ?, discount_value = ?,
        promo_code = ?, applicable_services = ?, start_date = ?, end_date = ?,
        is_active = ?, banner_image = ?, terms = ?, max_uses = ?
       WHERE id = ?`,
      [
        data.title,
        data.description,
        data.discount_type,
        data.discount_value,
        data.promo_code || null,
        JSON.stringify(data.applicable_services),
        data.start_date,
        data.end_date,
        data.is_active ? 1 : 0,
        data.banner_image || null,
        data.terms || null,
        data.max_uses || null,
        id,
      ]
    );
    return { success: true };
  } catch (err: any) {
    console.error("[admin] updatePromotion:", err);
    const isDuplicate = err.code === "ER_DUP_ENTRY";
    return {
      success: false,
      error: isDuplicate ? "El código de promoción ya existe" : "Error al actualizar la promoción",
    };
  }
};

export const deletePromotion = async (id: string) => {
  try {
    await pool.query("DELETE FROM promotions WHERE id = ?", [id]);
    return { success: true };
  } catch (err) {
    console.error("[admin] deletePromotion:", err);
    return { success: false };
  }
};

export const togglePromotionActive = async (id: string) => {
  try {
    await pool.query(
      "UPDATE promotions SET is_active = NOT is_active WHERE id = ?",
      [id]
    );
    return { success: true };
  } catch (err) {
    console.error("[admin] togglePromotionActive:", err);
    return { success: false };
  }
};

export const getPromotionByIdAdmin = async (id: string) => {
  try {
    const [rows] = (await pool.query(
      "SELECT * FROM promotions WHERE id = ?",
      [id]
    )) as [any[], any];

    if (rows.length === 0) return { success: false, data: null };

    const row = rows[0];
    return {
      success: true,
      data: {
        ...row,
        applicable_services:
          typeof row.applicable_services === "string"
            ? JSON.parse(row.applicable_services)
            : row.applicable_services,
        is_active: Boolean(row.is_active),
      } as Promotion,
    };
  } catch (err) {
    console.error("[admin] getPromotionByIdAdmin:", err);
    return { success: false, data: null };
  }
};
