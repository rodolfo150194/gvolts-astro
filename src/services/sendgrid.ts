import sgMail from '@sendgrid/mail';
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { render } from '@maizzle/framework';

// Inicializar SendGrid con la API key
// En Astro SSR, las variables de entorno se acceden desde import.meta.env
const SENDGRID_API_KEY = import.meta.env.SENDGRID_API_KEY || '';
const FROM_EMAIL = import.meta.env.FROM_EMAIL || 'noreply@gvolts.com';
const FROM_NAME = import.meta.env.FROM_NAME || 'GVolts';

if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

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
    // Validar que la API key esté configurada
    if (!SENDGRID_API_KEY) {
      console.warn('SENDGRID_API_KEY no está configurada. El email no se enviará.');
      return {
        success: false,
        error: 'SendGrid no está configurado',
        message: 'La funcionalidad de email no está disponible'
      };
    }

    // Compilar el template con las variables
    const htmlContent = await compileEmailTemplate({
      email: to,
      year: new Date().getFullYear(),
    });

    // Construir el mensaje
    const msg = {
      to,
      from: {
        email: FROM_EMAIL,
        name: FROM_NAME
      },
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
      // Categorías para estadísticas en SendGrid
      categories: ['newsletter', 'welcome'],
      // Tracking personalizado
      customArgs: {
        subscriber_email: to,
        signup_date: new Date().toISOString()
      }
    };

    // Enviar el email
    await sgMail.send(msg);

    console.log(`Email de bienvenida enviado exitosamente a: ${to}`);

    return {
      success: true,
      error: null,
      message: 'Email enviado exitosamente'
    };

  } catch (error: any) {
    console.error('Error al enviar email con SendGrid:', error);

    // Manejo específico de errores de SendGrid
    if (error.response) {
      console.error('SendGrid response error:', error.response.body);
    }

    return {
      success: false,
      error: 'Error al enviar email',
      message: 'No se pudo enviar el email de bienvenida'
    };
  }
};
