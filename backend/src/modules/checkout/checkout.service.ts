/**
 * TicketS - CheckoutService
 *
 * Servicio de checkout responsable de iniciar el proceso de pago.
 * Extiende FirestoreRepository para reutilizar la infraestructura de Firestore.
 *
 * Responsabilidades:
 *   1. Validar que la Purchase existe y está pending.
 *   2. Generar una referencia única para la compra.
 *   3. Generar la Integrity Signature SHA-256 (Bold).
 *   4. Guardar la referencia en la Purchase en Firestore.
 *   5. Devolver { purchaseId, reference, amount, currency, signature, publicKey }.
 *
 * @see BoldIntegrityService para el algoritmo de firma.
 * @see CheckoutController para el endpoint HTTP.
 */

import { Injectable, BadRequestException } from '@nestjs/common';
import { FirebaseAdminService } from '../../firebase/firebase.service';
import { COLLECTIONS } from '../../constants/collections';
import { FirestoreRepository } from '../../common/firestore/firestore.repository';
import { Timestamps } from '../../common/utils/timestamps';
import { BoldIntegrityService } from './bold-integrity.service';

import type { Purchase } from '../purchases/interfaces/purchase.interface';
import type { CreateCheckoutDto } from './dto/create-checkout.dto';
import type { CheckoutResponse } from './interfaces/checkout-response.interface';

// ---------------------------------------------------------------------------
// Helper: generar referencia única
// ---------------------------------------------------------------------------

/**
 * Genera una referencia única legible para la compra.
 * Formato: CHK-{timestamp_base36}-{random_6chars}
 *
 * Ejemplo: CHK-2J9KF8-AB3XQ7
 */
function generateReference(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomUUID().replace(/-/g, '').slice(0, 6).toUpperCase();
  return `CHK-${timestamp}-${random}`;
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

@Injectable()
export class CheckoutService extends FirestoreRepository<Purchase> {
  protected collectionName = COLLECTIONS.PURCHASES;

  constructor(
    firebase: FirebaseAdminService,
    private readonly integrityService: BoldIntegrityService,
  ) {
    super(firebase);
  }

  /**
   * Procesa el checkout de una compra.
   * Endpoint público — el purchaseId identifica la compra.
   *
   * @param dto - Datos del checkout (purchaseId).
   * @returns CheckoutResponse con reference, signature y publicKey.
   *
   * @throws BadRequestException si la compra no está pending o expiró.
   */
  async create(dto: CreateCheckoutDto): Promise<CheckoutResponse> {
    // 1. Validar que la compra existe
    const purchase = await this.findByIdOrFail(dto.purchaseId);

    // 2. Validar que la compra está en estado 'pending'
    if (purchase.status !== 'pending') {
      throw new BadRequestException(
        `La compra no puede ser procesada porque está en estado "${purchase.status}". ` +
          'Solo las compras pendientes pueden iniciar el pago.',
      );
    }

    // 3. Validar que la compra no ha expirado
    const expiresAt = purchase.expiresAt.toDate();
    if (expiresAt < new Date()) {
      throw new BadRequestException(
        'La compra ha expirado. Debes crear una nueva compra.',
      );
    }

    // 4. Generar referencia única
    const reference = generateReference();
    const amount = purchase.total;
    const currency = purchase.currency || 'COP';

    // 5. Generar Integrity Signature SHA-256 (Bold)
    const { signature, publicKey } =
      this.integrityService.generateSignature(reference, amount, currency);

    // 6. Guardar referencia en la Purchase
    await this.updateDoc(dto.purchaseId, {
      checkoutReference: reference,
      checkoutCompletedAt: Timestamps.now(),
      checkoutSignature: signature,
    });

    this.logger.log(
      `Checkout completed for purchase ${dto.purchaseId}: reference=${reference}, amount=${amount} ${currency}`,
    );

    // 7. Retornar respuesta con firma de integridad
    return {
      purchaseId: purchase.id,
      reference,
      amount,
      currency,
      signature,
      publicKey,
    };
  }
}
