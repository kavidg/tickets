/**
 * TicketS - CheckoutService
 *
 * Servicio de checkout responsable de iniciar el proceso de pago.
 * Extiende FirestoreRepository para reutilizar la infraestructura de Firestore.
 *
 * Responsabilidades:
 *   1. Validar que la Purchase existe, pertenece al usuario y está pending.
 *   2. Guardar paymentReference y paymentUrl en la Purchase (antes de llamar al provider).
 *   3. Llamar a PaymentFactory.createCheckout() para obtener URL de pago.
 *
 * NO conoce detalles de Bold — delega en PaymentFactory y PaymentProvider.
 * NO modifica el status de la Purchase (sigue siendo 'pending').
 *
 * @see PaymentFactory para la selección del proveedor de pago.
 * @see CheckoutController para el endpoint HTTP.
 */

import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { FirebaseAdminService } from '../../firebase/firebase.service';
import { COLLECTIONS } from '../../constants/collections';
import { FirestoreRepository } from '../../common/firestore/firestore.repository';
import { Timestamps } from '../../common/utils/timestamps';
import { PaymentFactory } from '../../payments/payment-factory.service';
import type { CurrentUser } from '../auth/interfaces/current-user.interface';
import type { Purchase } from '../purchases/interfaces/purchase.interface';
import type { CreateCheckoutDto } from './dto/create-checkout.dto';
import type { CheckoutResponse } from './interfaces/checkout-response.interface';

@Injectable()
export class CheckoutService extends FirestoreRepository<Purchase> {
  protected collectionName = COLLECTIONS.PURCHASES;

  constructor(
    firebase: FirebaseAdminService,
    private readonly paymentFactory: PaymentFactory,
  ) {
    super(firebase);
  }

  /**
   * Inicia el proceso de checkout para una compra.
   *
   * @param dto - Datos del checkout (purchaseId).
   * @param user - Usuario autenticado (comprador).
   * @returns CheckoutResponse con paymentUrl para redirigir al usuario.
   *
   * @throws NotFoundException si la compra no existe.
   * @throws ForbiddenException si la compra no pertenece al usuario.
   * @throws BadRequestException si la compra no está en estado pending o está expirada.
   */
  async create(
    dto: CreateCheckoutDto,
    user: CurrentUser,
  ): Promise<CheckoutResponse> {
    // 1. Validar que la compra existe (usa findByIdOrFail del repositorio)
    const purchase = await this.findByIdOrFail(dto.purchaseId);

    // 2. Validar que la compra pertenece al usuario autenticado
    if (purchase.userId !== user.uid) {
      throw new ForbiddenException('Esta compra no te pertenece.');
    }

    // 3. Validar que la compra está en estado 'pending'
    if (purchase.status !== 'pending') {
      throw new BadRequestException(
        `La compra no puede ser procesada porque está en estado "${purchase.status}". ` +
          'Solo las compras pendientes pueden iniciar el pago.',
      );
    }

    // 4. Validar que la compra no ha expirado
    const expiresAt = purchase.expiresAt.toDate();
    if (expiresAt < new Date()) {
      throw new BadRequestException(
        'La compra ha expirado. Debes crear una nueva compra.',
      );
    }

    // 5. Determinar proveedor de pago
    const providerName = purchase.paymentProvider || 'bold';

    // 6. Crear checkout en la pasarela de pagos
    // CheckoutService NO conoce Bold — solo usa PaymentFactory
    const checkoutResult = await this.paymentFactory.createCheckout(
      {
        purchaseId: purchase.id,
        total: purchase.total,
        currency: purchase.currency || 'COP',
        description: `Compra ${purchase.id} — ${purchase.items.length} item(s)`,
        customerEmail: user.email || '',
      },
      providerName,
    );

    // 7. Guardar datos del pago en la Purchase (después de crear checkout exitoso)
    await this.updateDoc(dto.purchaseId, {
      paymentReference: checkoutResult.paymentReference,
      paymentUrl: checkoutResult.paymentUrl,
      paymentProvider: checkoutResult.provider,
    });

    this.logger.log(
      `Checkout created for purchase ${dto.purchaseId} via ${checkoutResult.provider}`,
    );

    // 8. Retornar respuesta estandarizada
    return {
      purchaseId: purchase.id,
      paymentReference: checkoutResult.paymentReference,
      paymentUrl: checkoutResult.paymentUrl,
      provider: checkoutResult.provider,
      expiresAt: checkoutResult.expiresAt,
    };
  }
}
