import { pool } from "@/db";
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
        await pool.query(
            `INSERT INTO contacts (name, email, phone, service, zip, company, address, subject, message)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                data.name,
                data.email,
                data.phone,
                data.service,
                data.zip,
                data.company ?? null,
                data.address ?? null,
                data.subject,
                data.message,
            ]
        );

        // Enviar notificación por email en segundo plano
        sendContactNotification(data).catch((err) => {
            console.error("Error al enviar notificación de contacto (no crítico):", err);
        });

        return {
            success: true,
            error: null,
            message: "¡Mensaje enviado exitosamente! Nos pondremos en contacto contigo pronto."
        };
    } catch (error) {
        console.error("Error al guardar contacto:", error);
        return {
            success: false,
            error: "Error al enviar el mensaje",
            message: "Hubo un error al enviar tu mensaje. Por favor, intenta nuevamente."
        };
    }
}
