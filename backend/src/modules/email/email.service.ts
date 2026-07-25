/**
 * TicketS - EmailService
 *
 * Servicio de envío de correos electrónicos transaccionales.
 * Utiliza Nodemailer con configuración vía ConfigService.
 *
 * Método principal:
 *   sendTicketsEmail(data) → Envía las entradas al comprador.
 *
 * La generación del QR se realiza en base64 para incrustarlo
 * directamente en el HTML del correo (sin depender de URLs externas).
 *
 * Variables de entorno requeridas:
 *   SMTP_HOST
 *   SMTP_PORT
 *   SMTP_USER
 *   SMTP_PASSWORD
 *   SMTP_FROM
 *
 * Si no están configuradas, el servicio funciona en modo simulación
 * (solo registra en log, no envía realmente).
 */

import {
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as QRCode from 'qrcode';

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

export interface TicketEmailData {
  buyerName: string;
  buyerEmail: string;
  eventTitle: string;
  eventDate: string;
  venueName: string;
  tickets: Array<{
    code: string;
    ticketTypeName: string;
  }>;
}

// ---------------------------------------------------------------------------
// Servicio
// ---------------------------------------------------------------------------

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly transporter: nodemailer.Transporter | null = null;
  private readonly from: string;
  private readonly isSimulation: boolean;

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.get<string>('SMTP_HOST');
    const port = this.configService.get<number>('SMTP_PORT');
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASSWORD');
    this.from = this.configService.get<string>('SMTP_FROM') || 'noreply@tickets.app';

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port: port || 587,
        secure: port === 465,
        auth: { user, pass },
      });
      this.isSimulation = false;
      this.logger.log(`Email transporter configured: ${host}:${port}`);
    } else {
      this.isSimulation = true;
      this.logger.warn(
        'SMTP not configured. Emails will be logged but NOT sent. ' +
        'Set SMTP_HOST, SMTP_USER, SMTP_PASSWORD in .env',
      );
    }
  }

  /**
   * Envía un correo con las entradas al comprador.
   *
   * @param data - Datos del comprador, evento y tickets.
   *
   * El método nunca lanza error — los fallos de envío se registran en log
   * para no interrumpir el flujo de pago.
   */
  async sendTicketsEmail(data: TicketEmailData): Promise<void> {
    try {
      // Generar QR para cada ticket
      const ticketsWithQR = await Promise.all(
        data.tickets.map(async (ticket) => ({
          ...ticket,
          qrDataUrl: await QRCode.toDataURL(ticket.code, {
            width: 200,
            margin: 2,
            color: {
              dark: '#ffffff',
              light: '#00000000',
            },
          }),
        })),
      );

      const html = this.buildHtmlTemplate(data, ticketsWithQR);

      if (this.isSimulation) {
        this.logger.log(
          `[SIMULATION] Would send email to ${data.buyerEmail}: ` +
          `Subject: "🎟️ Tus entradas para ${data.eventTitle}"`,
        );
        this.logger.log(
          `[SIMULATION] Tickets: ${data.tickets.map((t) => t.code).join(', ')}`,
        );
        return;
      }

      await this.transporter!.sendMail({
        from: this.from,
        to: data.buyerEmail,
        subject: `🎟️ Tus entradas para ${data.eventTitle} están listas`,
        html,
      });

      this.logger.log(
        `Email sent to ${data.buyerEmail} for event "${data.eventTitle}" ` +
        `(${data.tickets.length} tickets)`,
      );
    } catch (error) {
      // NO interrumpir el flujo si falla el correo
      // El pago y los tickets ya se procesaron correctamente
      this.logger.error(
        `Failed to send email to ${data.buyerEmail}: ${(error as Error).message}`,
      );
    }
  }

  // -------------------------------------------------------------------------
  // Plantilla HTML
  // -------------------------------------------------------------------------

  /**
   * Construye la plantilla HTML del correo con diseño oscuro profesional.
   */
  private buildHtmlTemplate(
    data: TicketEmailData,
    tickets: Array<{ code: string; ticketTypeName: string; qrDataUrl: string }>,
  ): string {
    const ticketsHtml = tickets
      .map(
        (ticket) => `
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.08);">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td width="120" style="padding-right: 16px;">
                  <img src="${ticket.qrDataUrl}" alt="QR" width="120" height="120" style="display:block; border-radius: 8px;" />
                </td>
                <td>
                  <p style="margin:0; font-size:12px; color:#f97316; font-weight:700; text-transform:uppercase; letter-spacing:1.2px;">
                    ${ticket.ticketTypeName}
                  </p>
                  <p style="margin:8px 0 0; font-size:16px; color:#ffffff; font-weight:700; font-family:monospace;">
                    ${ticket.code}
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      `,
      )
      .join('');

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        </head>
        <body style="margin:0; padding:0; background-color:#0a0a0a; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a0a; padding:40px 16px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px; width:100%;">

                  <!-- Header -->
                  <tr>
                    <td align="center" style="padding-bottom: 32px;">
                      <span style="font-size:48px;">🎟️</span>
                    </td>
                  </tr>

                  <!-- Card -->
                  <tr>
                    <td style="background: linear-gradient(135deg, rgba(255,255,255,0.055) 0%, rgba(255,255,255,0.03) 100%); border:1px solid rgba(255,255,255,0.1); border-radius:24px; padding:40px 32px;">

                      <!-- Título -->
                      <h1 style="margin:0; font-size:24px; color:#ffffff; font-weight:900; text-align:center; letter-spacing:-0.5px;">
                        Tus entradas están listas
                      </h1>
                      <p style="margin:12px 0 0; color:rgba(255,255,255,0.5); font-size:15px; text-align:center;">
                        Hola <strong style="color:#ffffff;">${data.buyerName}</strong>, aquí tienes tus entradas
                      </p>

                      <!-- Evento -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 28px; background: rgba(0,0,0,0.4); border-radius: 16px; padding: 20px;">
                        <tr>
                          <td style="padding-bottom: 12px;">
                            <p style="margin:0; font-size:11px; color:rgba(255,255,255,0.35); font-weight:700; text-transform:uppercase; letter-spacing:1.5px;">Evento</p>
                            <p style="margin:4px 0 0; font-size:16px; color:#ffffff; font-weight:700;">${data.eventTitle}</p>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding-bottom: 12px;">
                            <p style="margin:0; font-size:11px; color:rgba(255,255,255,0.35); font-weight:700; text-transform:uppercase; letter-spacing:1.5px;">Fecha</p>
                            <p style="margin:4px 0 0; font-size:14px; color:#f97316; font-weight:600;">${data.eventDate}</p>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <p style="margin:0; font-size:11px; color:rgba(255,255,255,0.35); font-weight:700; text-transform:uppercase; letter-spacing:1.5px;">Lugar</p>
                            <p style="margin:4px 0 0; font-size:14px; color:rgba(255,255,255,0.7);">${data.venueName}</p>
                          </td>
                        </tr>
                      </table>

                      <!-- Tickets -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 24px;">
                        ${ticketsHtml}
                      </table>

                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td align="center" style="padding-top: 32px;">
                      <p style="margin:0; font-size:12px; color:rgba(255,255,255,0.25);">
                        TicketS — Tu plataforma de entradas
                      </p>
                      <p style="margin:4px 0 0; font-size:11px; color:rgba(255,255,255,0.15);">
                        Este correo fue enviado automáticamente después de tu compra.
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;
  }
}
