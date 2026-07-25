/**
 * TicketS - BoldIntegrityService
 *
 * Servicio para generar la Integrity Signature (Firma de Integridad)
 * del Botón de Pagos de Bold, exactamente como indica la documentación oficial.
 *
 * Algoritmo:
 *   1. Concatenar: {reference}{amount}{currency}{secretKey}
 *      Sin separadores ni delimitadores.
 *   2. Aplicar SHA-256 a la cadena concatenada.
 *   3. Convertir el hash a hexadecimal (minúsculas).
 *
 * Documentación oficial:
 *   https://developers.bold.co/pagos-en-linea/boton-de-pagos/integracion-manual/integracion-manual
 *
 * Variables de entorno REQUERIDAS:
 *   BOLD_PUBLIC_KEY  → Llave pública de Bold (se envía al frontend)
 *   BOLD_SECRET_KEY  → Llave secreta de Bold (para generar la firma)
 *
 * Si alguna de las dos falta, el constructor lanza un error de
 * configuración para evitar que la aplicación funcione con datos mock.
 *
 * @see CheckoutService para el consumo de esta firma.
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class BoldIntegrityService {
  private readonly logger = new Logger(BoldIntegrityService.name);
  private readonly secretKey: string;
  private readonly publicKey: string;

  constructor(private readonly configService: ConfigService) {
    this.publicKey = this.configService.get<string>('BOLD_PUBLIC_KEY') || '';
    this.secretKey = this.configService.get<string>('BOLD_SECRET_KEY') || '';

    if (!this.publicKey) {
      throw new Error(
        'BOLD_PUBLIC_KEY no está configurada. ' +
        'Debes configurar esta variable de entorno con la llave pública de Bold. ' +
        'Consíguela en https://app.bold.co en Integraciones > Llaves de integración.',
      );
    }

    if (!this.secretKey) {
      throw new Error(
        'BOLD_SECRET_KEY no está configurada. ' +
        'Debes configurar esta variable de entorno con la llave secreta de Bold. ' +
        'Consíguela en https://app.bold.co en Integraciones > Llaves de integración.',
      );
    }

    this.logger.log(
      `BoldIntegrityService inicializado correctamente. PublicKey: ${this.publicKey.slice(0, 12)}...`,
    );
  }

  /**
   * Genera la firma de integridad SHA-256 para el Botón de Pagos de Bold.
   *
   * @param reference - Identificador único de la orden (checkout reference)
   * @param amount    - Monto de la transacción (entero, sin decimales)
   * @param currency  - Moneda (COP, USD, etc.)
   * @returns Objeto con signature (hex SHA-256) y publicKey
   */
  generateSignature(
    reference: string,
    amount: number,
    currency: string,
  ): { signature: string; publicKey: string } {
    const amountInt = Math.round(amount);

    // 1. Concatenar sin separadores: {reference}{amount}{currency}{secretKey}
    const rawString = `${reference}${amountInt}${currency}${this.secretKey}`;

    // 2. SHA-256
    const hash = crypto.createHash('sha256').update(rawString).digest('hex');

    this.logger.log(
      `Integrity signature generated for ${reference}: ${hash.slice(0, 16)}...`,
    );

    return {
      signature: hash,
      publicKey: this.publicKey,
    };
  }
}
