import * as https from 'https';

export class ResendEmailSender {
  private readonly apiKey: string = 're_EbdcyFJU_FT1cA3XSz3hjTnzcqyK4yqeP'; // Resend API Key

  async sendResetPasswordEmail(toEmail: string, resetToken: string): Promise<void> {
    const emailData = {
      from: 'Oriéntate+ <onboarding@resend.dev>',
      to: [toEmail],
      subject: 'Recuperación de Contraseña - Oriéntate+',
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f6fc; padding: 40px 20px; text-align: center; color: #333333;">
          <div style="max-width: 550px; margin: 0 auto; background-color: #ffffff; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); overflow: hidden; border: 1px solid #e1e8f5;">
            
            <!-- Header Gradient -->
            <div style="background: linear-gradient(135deg, #4527A0 0%, #311B92 100%); padding: 35px 20px; text-align: center; color: #ffffff;">
              <h1 style="margin: 0; font-size: 26px; font-weight: 800; letter-spacing: 0.5px;">Oriéntate+</h1>
              <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;">Tu asistente inteligente de orientación vocacional</p>
            </div>

            <!-- Content Body -->
            <div style="padding: 40px 30px; text-align: left;">
              <h2 style="margin-top: 0; color: #311B92; font-size: 20px; font-weight: 700;">¿Olvidaste tu contraseña?</h2>
              <p style="font-size: 15px; line-height: 1.6; color: #555555; margin-bottom: 25px;">
                Hemos recibido una solicitud para restablecer la contraseña de tu cuenta asociada a este correo electrónico.
              </p>

              <!-- Token Display Box -->
              <div style="background-color: #f3e5f5; border-left: 4px solid #4527A0; padding: 20px; border-radius: 8px; margin-bottom: 25px; text-align: center;">
                <p style="margin: 0 0 8px 0; font-size: 13px; font-weight: 600; color: #4527A0; text-transform: uppercase; letter-spacing: 1px;">Token de Recuperación</p>
                <div style="font-family: monospace; font-size: 22px; font-weight: 800; color: #311B92; letter-spacing: 2px;">
                  ${resetToken}
                </div>
              </div>

              <p style="font-size: 13px; line-height: 1.5; color: #888888; margin-bottom: 25px;">
                * Copia y pega este token en tu aplicación para definir una nueva contraseña.<br>
                * Este token es de un solo uso y expirará automáticamente en <strong>1 hora</strong> por motivos de seguridad.
              </p>

              <hr style="border: 0; border-top: 1px solid #eaeaea; margin-bottom: 25px;" />

              <p style="font-size: 12px; line-height: 1.5; color: #aaaaaa; margin: 0;">
                Si tú no realizaste esta solicitud, puedes ignorar este correo de forma segura. Tu contraseña actual no sufrirá ningún cambio.
              </p>
            </div>

            <!-- Footer -->
            <div style="background-color: #fafbfc; padding: 20px; text-align: center; border-top: 1px solid #f0f2f5; font-size: 12px; color: #888888;">
              © 2026 Oriéntate+ Inc. Todos los derechos reservados.
            </div>

          </div>
        </div>
      `
    };

    const postData = JSON.stringify(emailData);

    const options = {
      hostname: 'api.resend.com',
      port: 443,
      path: '/emails',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    return new Promise<void>((resolve, reject) => {
      const req = https.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => body += chunk);
        res.on('end', () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            console.log(`[Resend] Correo enviado exitosamente a ${toEmail}`);
            resolve();
          } else {
            console.error(`[Resend Error] Código de estado ${res.statusCode}:`, body);
            reject(new Error(`Error al enviar correo vía Resend: ${body}`));
          }
        });
      });

      req.on('error', (e) => {
        console.error('[Resend Error Connection]:', e);
        reject(e);
      });

      req.write(postData);
      req.end();
    });
  }
}
