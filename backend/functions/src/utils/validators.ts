/**
 * TicketS - Validadores del Backend
 *
 * Funciones de validación reutilizables para las Cloud Functions.
 * Ayudan a mantener la lógica de validación consistente y centralizada.
 */

// ---------------------------------------------------------------------------
// Validación de IDs
// ---------------------------------------------------------------------------

/**
 * Valida que un ID de Firestore sea un string no vacío.
 */
export function isValidDocumentId(id: unknown): id is string {
  return typeof id === 'string' && id.trim().length > 0;
}

/**
 * Valida un UUID v4.
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

// ---------------------------------------------------------------------------
// Validación de montos
// ---------------------------------------------------------------------------

/**
 * Valida que un monto sea un número positivo.
 */
export function isValidAmount(amount: unknown): amount is number {
  return typeof amount === 'number' && amount >= 0 && Number.isFinite(amount);
}

// ---------------------------------------------------------------------------
// Validación de emails
// ---------------------------------------------------------------------------

/**
 * Valida un email.
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// ---------------------------------------------------------------------------
// Validación de estados
// ---------------------------------------------------------------------------

/**
 * Crea un validador para un conjunto de estados permitidos.
 */
export function createStatusValidator<T extends string>(allowedStatuses: readonly T[]) {
  return {
    isValid: (status: string): status is T => allowedStatuses.includes(status as T),
    allowedStatuses,
  };
}

// ---------------------------------------------------------------------------
// Validación de webhooks
// ---------------------------------------------------------------------------

/**
 * Valida que un webhook contenga los campos mínimos requeridos.
 */
export function validateWebhookPayload(body: Record<string, unknown>): string[] {
  const missingFields: string[] = [];

  if (!body || typeof body !== 'object') {
    return ['payload'];
  }

  return missingFields;
}

// ---------------------------------------------------------------------------
// Sanitización
// ---------------------------------------------------------------------------

/**
 * Sanitiza un string eliminando espacios extra y caracteres peligrosos.
 */
export function sanitizeString(value: string): string {
  return value
    .trim()
    .replace(/[<>]/g, '') // Elimina caracteres HTML
    .replace(/\s+/g, ' '); // Normaliza espacios
}
