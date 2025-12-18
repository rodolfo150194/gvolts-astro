import { supabase } from "@/supabase";
import { sendContactNotification } from "@/services/mailer";

interface ContactData {
    name: string;
    email: string;
    phone: string;
    service: string;
    zip: string;
    company?: string;
    address?: string;
    subject: string;
    message: string;
}

export const saveContact = async (data: ContactData) => {
    try {
        // Guardar en Supabase
        const { error } = await supabase.from("contacts").insert({
            name: data.name,
            email: data.email,
            phone: data.phone,
            service: data.service,
            zip: data.zip,
            company: data.company || null,
            address: data.address || null,
            subject: data.subject,
            message: data.message,
        });

        if (error) {
            console.error("Error al guardar contacto:", error);
            return {
                success: false,
                error: "Error al enviar el mensaje",
                message: "Hubo un error al enviar tu mensaje. Por favor, intenta nuevamente."
            };
        }

        // Enviar notificación por email en segundo plano
        // No bloqueamos la respuesta si falla el envío del email
        sendContactNotification(data).catch((err) => {
            console.error("Error al enviar notificación de contacto (no crítico):", err);
        });

        return {
            success: true,
            error: null,
            message: "¡Mensaje enviado exitosamente! Nos pondremos en contacto contigo pronto."
        };
    } catch (error) {
        console.error("Error inesperado al guardar contacto:", error);
        return {
            success: false,
            error: "Error inesperado",
            message: "Ocurrió un error inesperado. Por favor, intenta nuevamente."
        };
    }
}
