import { defineAction } from "astro:actions";
import { z } from "astro:schema";
import { saveSubcribe } from "@/services/subcribe";
import { saveContact } from "@/services/contact";

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
    })
}