import { defineAction } from "astro:actions";
import { z } from "astro:schema";
import { saveSubcribe } from "@/services/subcribe";
import { saveContact } from "@/services/contact";
import {
    getActivePromotions,
    validatePromoCode,
    getPromotionsForService
} from "@/services/promotions";

export const server = {
    newsletter: defineAction({
        input: z.object({
            email: z.string().email({ message: "Correo electrónico inválido" }),
        }),
        handler: async ({ email }) => {
            const { success, error, message } = await saveSubcribe(email);

            if (!success) {
                throw new Error(error ?? "Error al suscribirse");
            }

            return { success: true, message };
        }
    }),

    contact: defineAction({
        input: z.object({
            name: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres" }),
            email: z.string().email({ message: "Correo electrónico inválido" }),
            phone: z.string().min(10, { message: "Número de teléfono inválido" }),
            service: z.enum([
                "fire-alarm",
                "security",
                "electricity",
                "access-control",
                "monitoring",
                "maintenance",
                "other"
            ], { message: "Servicio inválido" }),
            zip: z.string().min(5, { message: "Código postal inválido" }),
            company: z.string().optional(),
            address: z.string().optional(),
            subject: z.string().min(5, { message: "El asunto debe tener al menos 5 caracteres" }),
            message: z.string().min(10, { message: "El mensaje debe tener al menos 10 caracteres" }),
        }),
        handler: async (data) => {
            const { success, error, message } = await saveContact(data);

            if (!success) {
                throw new Error(error ?? "Error al enviar el mensaje");
            }

            return { success: true, message };
        }
    }),

    getActivePromotions: defineAction({
        input: z.object({
            service: z.enum(["fire-alarm", "security", "electricity"]).optional(),
        }).optional(),
        handler: async (input) => {
            const { success, data, error } = await getActivePromotions(input);

            if (!success || !data) {
                throw new Error(error ?? "Error al obtener promociones");
            }

            return { success: true, promotions: data };
        }
    }),

    validatePromoCode: defineAction({
        input: z.object({
            promoCode: z.string().min(1, { message: "El código de promoción es requerido" }),
            service: z.enum(["fire-alarm", "security", "electricity"]).optional(),
        }),
        handler: async ({ promoCode, service }) => {
            const result = await validatePromoCode(promoCode, service);

            if (!result.valid) {
                throw new Error(result.error ?? "Código de promoción inválido");
            }

            return {
                valid: true,
                promotion: result.promotion!,
            };
        }
    }),

    getPromotionsForService: defineAction({
        input: z.object({
            service: z.enum(["fire-alarm", "security", "electricity"]),
        }),
        handler: async ({ service }) => {
            const { success, data, error } = await getPromotionsForService(service);

            if (!success || !data) {
                throw new Error(error ?? "Error al obtener promociones");
            }

            return { success: true, promotions: data };
        }
    })
}