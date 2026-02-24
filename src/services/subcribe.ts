import { pool } from "@/db";
import { sendWelcomeEmail } from "@/services/mailer";

const MYSQL_ER_DUP_ENTRY = 1062;

export const saveSubcribe = async (email: string) => {
    try {
        await pool.query(
            'INSERT INTO subscriber (email) VALUES (?)',
            [email]
        );
    } catch (error: any) {
        if (error?.errno === MYSQL_ER_DUP_ENTRY) {
            return {
                success: false,
                error: "Correo electrónico ya registrado",
                message: "Correo electrónico ya registrado"
            };
        }
        console.error("Error al guardar el suscriptor:", error);
        return {
            success: false,
            error: "Error al guardar el suscriptor",
            message: "Error al guardar el suscriptor"
        };
    }

    // Enviar email de bienvenida en segundo plano
    sendWelcomeEmail({ to: 'rodolfogarciamaeso@gmail.com' }).catch((err) => {
        console.error("Error al enviar email de bienvenida:", err);
    });

    return {
        success: true,
        error: null,
        message: "¡Suscripción exitosa! Revisa tu correo para confirmar."
    };
}
