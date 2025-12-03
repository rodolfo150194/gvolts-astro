import { supabase } from "../supabase";

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

    return {
        success: true,
        error: null,
        message: "Suscriptor guardado exitosamente"
    };
}