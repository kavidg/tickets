/**
 * TicketS - Slug Utility
 *
 * Utilidades centralizadas para manejo de slugs.
 * Evita repetir lógica de validación y generación de slugs
 * por todo el proyecto.
 *
 * @example
 * import { Slug } from '../../common/utils/slug';
 *
 * // Validar slug
 * if (!Slug.isValid(dto.slug)) {
 *   throw new BadRequestException('Slug inválido');
 * }
 *
 * // Generar slug desde un título
 * const slug = Slug.generate('Mi Evento Increíble!');
 * // → 'mi-evento-increible'
 *
 * // Normalizar slug ingresado por usuario
 * const slug = Slug.normalize('Mi Evento 2024');
 * // → 'mi-evento-2024'
 */

/**
 * Patrón regex para slugs válidos.
 * Solo letras minúsculas, números y guiones.
 */
const SLUG_PATTERN = /^[a-z0-9-]+$/;

export const Slug = {
  /**
   * Normaliza un texto a formato slug.
   * Convierte a minúsculas, reemplaza espacios por guiones,
   * elimina caracteres especiales.
   *
   * @param text - Texto a normalizar.
   * @returns Slug normalizado.
   *
   * @example
   * Slug.normalize('Mi Evento #2024');
   * // → 'mi-evento-2024'
   */
  normalize: (text: string): string => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')    // Eliminar caracteres especiales
      .replace(/\s+/g, '-')        // Reemplazar espacios por guiones
      .replace(/-+/g, '-')         // Colapsar guiones múltiples
      .replace(/^-+|-+$/g, '');    // Eliminar guiones al inicio/final
  },

  /**
   * Valida que un slug tenga el formato correcto.
   * Solo permite letras minúsculas, números y guiones.
   *
   * @param slug - Slug a validar.
   * @returns true si el slug es válido.
   *
   * @example
   * Slug.isValid('mi-evento');     // → true
   * Slug.isValid('Mi Evento');     // → false
   * Slug.isValid('evento-2024');   // → true
   * Slug.isValid('evento_2024');   // → false
   */
  isValid: (slug: string): boolean => SLUG_PATTERN.test(slug),

  /**
   * Genera un slug a partir de un texto.
   * Similar a normalize pero más agresivo en limpieza.
   *
   * @param text - Texto del cual generar el slug.
   * @returns Slug generado.
   *
   * @example
   * Slug.generate('¡Bienvenido a mi Evento 2024!');
   * // → 'bienvenido-a-mi-evento-2024'
   */
  generate: (text: string): string => {
    return Slug.normalize(text);
  },

  /**
   * Mensaje estándar de error para slugs inválidos.
   */
  get INVALID_FORMAT_MESSAGE(): string {
    return 'El slug solo puede contener letras minúsculas, números y guiones (ej: "mi-evento-2024").';
  },
} as const;
