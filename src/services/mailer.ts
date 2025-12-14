import { Resend } from 'resend';
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { render } from '@maizzle/framework';

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

// Función para compilar el template con Maizzle
async function compileEmailTemplate(variables: Record<string, any>): Promise<string> {
  try {
    // Leer el template
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const templatePath = join(__dirname, '../emails/welcome.html');
    const template = await readFile(templatePath, 'utf-8');

    // Compilar con Maizzle
    const { html } = await render(template, {
      tailwind: {
        config: {
          content: [{ raw: template }],
          theme: {
            extend: {
              colors: {
                'indian-red': {
                  50: '#fef2f2',
                  100: '#fee2e2',
                  200: '#fecaca',
                  300: '#fca5a5',
                  400: '#f87171',
                  500: '#DC2626',
                  600: '#B91C1C',
                  700: '#991b1b',
                  800: '#7f1d1d',
                  900: '#7f1d1d',
                },
              },
            },
          },
        },
      },
      inlineCSS: true,
      removeUnusedCSS: true,
      prettify: false,
    });

    // Reemplazar variables
    let compiledHtml = html;
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      compiledHtml = compiledHtml.replace(regex, String(value));
    }

    return compiledHtml;
  } catch (error) {
    console.error('Error compilando template de email:', error);
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

    // Compilar el template con las variables
    const htmlContent = await compileEmailTemplate({
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
Web: https://gvoltscorp.com

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
