import { Resend } from 'resend';
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Configuración de Resend desde variables de entorno
const RESEND_API_KEY = import.meta.env.RESEND_API_KEY || '';
const FROM_EMAIL = import.meta.env.FROM_EMAIL || 'noreply@gvolts.com';
const FROM_NAME = import.meta.env.FROM_NAME || 'GVolts';

// Crear cliente de Resend
const createResendClient = () => {
  if (!RESEND_API_KEY) {
    console.warn('Resend API Key no configurada.');
    return null;
  }

  return new Resend(RESEND_API_KEY);
};

interface SendWelcomeEmailParams {
  to: string;
}

// Función para cargar y procesar el template HTML
async function loadEmailTemplate(variables: Record<string, any>): Promise<string> {
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);

    // En producción, los templates están en dist/emails/
    // En desarrollo, están en src/emails/
    const isProduction = import.meta.env.PROD;
    const templatePath = isProduction
      ? join(process.cwd(), 'dist', 'emails', 'welcome.html')
      : join(__dirname, '../emails/welcome.html');

    // Leer el template HTML
    const template = await readFile(templatePath, 'utf-8');

    // Reemplazar variables en el formato {{variable}}
    let processedHtml = template;
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      processedHtml = processedHtml.replace(regex, String(value));
    }

    return processedHtml;
  } catch (error) {
    console.error('Error cargando template de email:', error);
    throw error;
  }
}

export const sendWelcomeEmail = async ({ to }: SendWelcomeEmailParams) => {
  try {
    // Crear cliente de Resend
    const resend = createResendClient();

    if (!resend) {
      console.warn('Resend no está configurado. El email no se enviará.');
      return {
        success: false,
        error: 'Resend no está configurado',
        message: 'La funcionalidad de email no está disponible'
      };
    }

    // Cargar el template con las variables
    const htmlContent = await loadEmailTemplate({
      email: to,
      year: new Date().getFullYear(),
    });

    // Enviar el email con Resend
    const { data, error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: [to],
      subject: '¡Bienvenido a GVolts! Tu suscripción ha sido confirmada',
      html: htmlContent,
      text: `¡Bienvenido a GVolts!

        Gracias por suscribirte a nuestro boletín. Estamos emocionados de tenerte en nuestra comunidad.

        Nuestros servicios:
        - Sistemas contra Incendios: Protección avanzada con tecnología de punta
        - Videovigilancia Profesional: Monitoreo 24/7 para tu seguridad
        - Servicios Eléctricos: Instalaciones profesionales certificadas

        Contáctanos:
        Teléfono: +1 (555) 123-4567
        Email: info@gvolts.com
        Web: https://gvolts.com

        ---
        © ${new Date().getFullYear()} GVolts. Todos los derechos reservados.
        Recibiste este email porque te suscribiste en gvolts.com
      `,
    });

    if (error) {
      console.error('Error al enviar email con Resend:', error);
      return {
        success: false,
        error: 'Error al enviar email',
        message: error.message || 'No se pudo enviar el email de bienvenida'
      };
    }

    console.log(`Email de bienvenida enviado exitosamente a: ${to}`);
    console.log('Message ID:', data?.id);

    return {
      success: true,
      error: null,
      message: 'Email enviado exitosamente'
    };

  } catch (error: any) {
    console.error('Error al enviar email con Resend:', error);

    return {
      success: false,
      error: 'Error al enviar email',
      message: 'No se pudo enviar el email de bienvenida'
    };
  }
};
