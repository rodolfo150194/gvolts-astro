import { supabase } from "@/supabase";
import { sendWelcomeEmail } from "@/services/sendgrid";

const ERROR_CODE_ALREADY_EXISTS = "23505";

export const saveSubcribe = async (email: string) => {
    const { error } = await supabase.from("subscriber").insert({ email });

    if (error) {
        if (error?.code === ERROR_CODE_ALREADY_EXISTS) {
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
    // No bloqueamos la respuesta si falla el envío del email
    sendWelcomeEmail({ to: 'rodolfogarciamaeso@gmail.com' }).catch((err) => {
        console.error("Error al enviar email de bienvenida:", err);
    });
    // sendWelcomeEmail({ to: email }).catch((err) => {
    //     console.error("Error al enviar email de bienvenida (no crítico):", err);
    // });

    return {
        success: true,
        error: null,
        message: "¡Suscripción exitosa! Revisa tu correo para confirmar."
    };
}