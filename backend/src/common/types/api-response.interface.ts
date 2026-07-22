/**
 * TicketS - API Response Interface
 *
 * Define el formato estándar de respuesta de la API.
 * Utilizado por el ResponseInterceptor para envolver respuestas exitosas.
 *
 * @example
 * // Respuesta exitosa (single)
 * {
 *   success: true,
 *   data: { id: 'abc', name: 'Concierto' },
 *   timestamp: '2024-01-01T00:00:00.000Z',
 *   path: '/api/v1/events/abc'
 * }
 *
 * @example
 * // Respuesta exitosa (lista)
 * {
 *   success: true,
 *   data: [{ id: 'abc', name: 'Concierto' }],
 *   timestamp: '2024-01-01T00:00:00.000Z',
 *   path: '/api/v1/events'
 * }
 *
 * @see ResponseInterceptor para la implementación del interceptor.
 * @see AllExceptionsFilter para el formato de errores.
 */

/**
 * Respuesta estándar de la API para operaciones exitosas.
 *
 * @template T - Tipo de los datos devueltos.
 */
export interface ApiResponse<T> {
  /** Indica si la operación fue exitosa */
  success: boolean;
  /** Datos de la respuesta (objeto, array, o página) */
  data: T;
  /** Timestamp ISO 8601 de cuando se generó la respuesta */
  timestamp: string;
  /** Ruta del endpoint que generó la respuesta */
  path: string;
}
