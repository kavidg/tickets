/**
 * TicketS - Tipos de Pagos (Backend)
 *
 * Define los tipos para la integración con pasarelas de pago.
 * Soporta múltiples proveedores (Bold, MercadoPago, Stripe, etc.)
 * mediante una interfaz común.
 */

import type { Timestamp } from 'firebase-admin/firestore';

// ---------------------------------------------------------------------------
// Proveedores de pago soportados
// ---------------------------------------------------------------------------

export type PaymentProvider = 'bold' | 'mercadopago' | 'stripe';

// ---------------------------------------------------------------------------
// Estados del pago
// ---------------------------------------------------------------------------

export type PaymentStatus =
  | 'pending'
  | 'processing'
  | 'approved'
  | 'rejected'
  | 'refunded'
  | 'error';

// ---------------------------------------------------------------------------
// Interfaces compartidas
// ---------------------------------------------------------------------------

/**
 * Respuesta estandarizada de todas las pasarelas de pago.
 * Cada proveedor debe transformar su respuesta nativa a este formato.
 */
export interface PaymentResult {
  /** Indica si la transacción fue exitosa */
  success: boolean;
  /** ID de la transacción en la pasarela */
  transactionId: string;
  /** Estado del pago normalizado */
  status: PaymentStatus;
  /** Proveedor que procesó el pago */
  provider: PaymentProvider;
  /** URL de redirección para completar el pago (pago en dos pasos) */
  redirectUrl?: string;
  /** Mensaje legible del resultado */
  message?: string;
  /** Datos adicionales específicos del proveedor */
  raw?: Record<string, unknown>;
}

/**
 * Datos requeridos para iniciar un pago.
 */
export interface PaymentRequest {
  /** Monto total a cobrar */
  amount: number;
  /** Moneda (COP, USD, etc.) */
  currency: string;
  /** Descripción de la transacción */
  description: string;
  /** ID de referencia interna (purchaseId) */
  referenceId: string;
  /** Email del pagador */
  payerEmail: string;
  /** Nombre del pagador */
  payerName: string;
  /** URL a la que redirigir después del pago */
  returnUrl: string;
  /** URL para recibir notificaciones del webhook */
  webhookUrl: string;
  /** Metadatos adicionales */
  metadata?: Record<string, string>;
}

/**
 * Datos de un webhook entrante desde una pasarela de pago.
 * Cada proveedor tiene su propio formato, este es el normalizado.
 */
export interface WebhookPayload {
  /** Proveedor que envió el webhook */
  provider: PaymentProvider;
  /** ID de la transacción en la pasarela */
  transactionId: string;
  /** Estado del pago */
  status: PaymentStatus;
  /** ID de referencia interna (purchaseId) */
  referenceId: string;
  /** Firma del webhook para verificación */
  signature: string;
  /** Datos crudos del webhook */
  raw: Record<string, unknown>;
}

/**
 * Registro de pago almacenado en Firestore (colección 'payments').
 */
export interface PaymentRecord {
  id: string;
  purchaseId: string;
  provider: PaymentProvider;
  transactionId: string;
  status: PaymentStatus;
  amount: number;
  currency: string;
  rawResponse: Record<string, unknown>;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Configuración dinámica para un proveedor de pago.
 * Se pasa al constructor del provider.
 */
export interface ProviderConfig {
  apiKey: string;
  apiSecret: string;
  publicKey?: string;
  webhookSecret: string;
  environment: 'sandbox' | 'production';
}
