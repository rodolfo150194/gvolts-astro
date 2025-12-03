import { defineAction } from "astro:actions";
import { z } from "astro:schema";
import { saveSubcribe } from "../services/subcribe";

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
    })
}