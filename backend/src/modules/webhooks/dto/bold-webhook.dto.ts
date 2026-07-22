/**
 * TicketS - BoldWebhookDto
 *
 * DTO para el webhook de Bold.
 * Estructura compatible con el payload real que Bold envía cuando
 * una transacción cambia de estado.
 *
 * Bold envía eventos como:
 *   - payment.reference: string
 *   - payment.status: 'approved' | 'declined' | 'expired' | 'cancelled'
 *   - payment.transaction.id: string
 *   - payment.amount.total: number
 *   - payment.amount.currency: string
 *
 * @see PaymentWebhookEvent para el formato estandarizado.
 * @see WebhookService para el procesamiento de eventos.
 */

import {
  IsString,
  IsNumber,
  IsOptional,
  IsIn,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Monto de la transacción Bold.
 */
class BoldAmountDto {
  @IsNumber()
  total!: number;

  @IsString()
  currency!: string;
}

/**
 * Transacción Bold.
 */
class BoldTransactionDto {
  @IsString()
  id!: string;
}

/**
 * Pago Bold.
 */
class BoldPaymentDto {
  @IsString()
  reference!: string;

  @IsString()
  @IsIn(['approved', 'declined', 'expired', 'cancelled'])
  status!: string;
}

/**
 * Payload completo del webhook de Bold.
 *
 * @example
 * {
 *   event: 'payment.updated',
 *   timestamp: '2024-01-15T10:30:00Z',
 *   payment: {
 *     reference: 'bold_abc123_1705312200000',
 *     status: 'approved'
 *   },
 *   transaction: {
 *     id: 'txn_987654'
 *   },
 *   amount: {
 *     total: 150000,
 *     currency: 'COP'
 *   }
 * }
 */
export class BoldWebhookDto {
  @IsOptional()
  @IsString()
  event?: string;

  @IsOptional()
  @IsString()
  timestamp?: string;

  @ValidateNested()
  @Type(() => BoldPaymentDto)
  payment!: BoldPaymentDto;

  @ValidateNested()
  @Type(() => BoldTransactionDto)
  transaction!: BoldTransactionDto;

  @ValidateNested()
  @Type(() => BoldAmountDto)
  amount!: BoldAmountDto;

  /** Metadatos adicionales opcionales */
  @IsOptional()
  metadata?: Record<string, unknown>;
}
