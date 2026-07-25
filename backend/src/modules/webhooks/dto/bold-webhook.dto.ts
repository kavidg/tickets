/**
 * TicketS - BoldWebhookDto
 *
 * DTO para el webhook de Bold — Botón de Pagos.
 *
 * Bold utiliza el formato CloudEvents. El payload varía ligeramente
 * según el método de pago, pero la estructura raíz es siempre la misma:
 *
 * Campos raíz:
 *   - id:       UUID único de la notificación.
 *   - type:     Tipo de evento (SALE_APPROVED, SALE_REJECTED, etc.).
 *   - subject:  ID de la transacción asignado por Bold.
 *   - source:   Recurso que generó el evento.
 *   - spec_version: "1.0"
 *   - time:     Timestamp POSIX en nanosegundos.
 *   - data:     Cuerpo con detalles de la transacción.
 *     - payment_id:      ID de la transacción en Bold.
 *     - merchant_id:     ID del comercio.
 *     - amount.total:    Monto total en la unidad más pequeña de la moneda.
 *     - amount.currency: Código de moneda (COP, USD).
 *     - metadata.reference: Referencia externa (nuestro checkoutReference).
 *     - payer_email:     Email del pagador (opcional).
 *     - payment_method:  Método de pago (CARD, CARD_WEB, PSE, NEQUI, etc.).
 *
 * @see https://developers.bold.co/webhook
 * @see PaymentWebhookEvent para el formato estandarizado interno.
 * @see WebhookService para el procesamiento de eventos.
 */

import {
  IsString,
  IsNumber,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

// ---------------------------------------------------------------------------
// DTOs anidados que reflejan la estructura real de Bold
// ---------------------------------------------------------------------------

/**
 * Monto de la transacción dentro de data.amount.
 */
class BoldAmountDataDto {
  @IsNumber()
  total!: number;

  @IsString()
  currency!: string;

  @IsOptional()
  taxes?: Array<{ base: number; type: string; value: number }>;

  @IsOptional()
  @IsNumber()
  tip?: number;
}

/**
 * Metadatos de la transacción dentro de data.metadata.
 */
class BoldMetadataDataDto {
  @IsOptional()
  reference?: string | null;
}

/**
 * Cuerpo de la notificación (data).
 */
class BoldEventDataDto {
  @IsString()
  payment_id!: string;

  @IsOptional()
  @IsString()
  merchant_id?: string;

  @IsOptional()
  @IsString()
  created_at?: string;

  @ValidateNested()
  @Type(() => BoldAmountDataDto)
  amount!: BoldAmountDataDto;

  @ValidateNested()
  @Type(() => BoldMetadataDataDto)
  metadata!: BoldMetadataDataDto;

  @IsOptional()
  @IsString()
  bold_code?: string;

  @IsOptional()
  @IsString()
  payer_email?: string;

  @IsOptional()
  @IsString()
  payment_method?: string;

  @IsOptional()
  @IsString()
  integration?: string;
}

// ---------------------------------------------------------------------------
// DTO raíz
// ---------------------------------------------------------------------------

/**
 * Payload completo del webhook de Bold (formato CloudEvents).
 *
 * @example
 * {
 *   "id": "e4f8c1b9-3d02-4a7c-8e51-f672a9b3d0e4",
 *   "type": "SALE_APPROVED",
 *   "subject": "F8A5D6B7G2H1",
 *   "source": "/payments/links",
 *   "spec_version": "1.0",
 *   "time": 1761063334000000000,
 *   "data": {
 *     "payment_id": "F8A5D6B7G2H1",
 *     "amount": { "total": 59900, "currency": "COP" },
 *     "metadata": { "reference": "CHK-2J9KF8-AB3XQ7" },
 *     "payer_email": "comprador@email.com"
 *   }
 * }
 */
export class BoldWebhookDto {
  /** UUID único de la notificación generado por Bold */
  @IsString()
  id!: string;

  /**
   * Tipo de evento CloudEvents.
   * Valores posibles:
   *   SALE_APPROVED  → Venta aprobada
   *   SALE_REJECTED  → Venta rechazada
   *   VOID_APPROVED  → Anulación aprobada
   *   VOID_REJECTED  → Anulación rechazada
   */
  @IsString()
  type!: string;

  /** ID de la transacción asignado por Bold */
  @IsString()
  subject!: string;

  /** Recurso que generó la notificación (ej: /payments/links) */
  @IsOptional()
  @IsString()
  source?: string;

  /** Versión de la especificación CloudEvents */
  @IsOptional()
  @IsString()
  spec_version?: string;

  /**
   * Hora de emisión de la notificación en formato POSIX (nanosegundos).
   * Para convertir a Date: new Date(time / 1_000_000)
   */
  @IsNumber()
  time!: number;

  /** Cuerpo de la notificación con detalles de la transacción */
  @ValidateNested()
  @Type(() => BoldEventDataDto)
  data!: BoldEventDataDto;

  /** Formato del contenido (application/json) */
  @IsOptional()
  @IsString()
  datacontenttype?: string;
}
