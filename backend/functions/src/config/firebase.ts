/**
 * TicketS - Configuración de Firebase Admin SDK
 *
 * Inicializa la instancia de Firebase Admin para ser utilizada
 * por todos los servicios del backend (Cloud Functions).
 *
 * NOTA: En Cloud Functions, Firebase Admin se inicializa automáticamente
 * con las credenciales del proyecto. Solo necesitamos configurar
 * manualmente si trabajamos con emuladores o entornos externos.
 */

import * as admin from 'firebase-admin';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { getAuth, type Auth } from 'firebase-admin/auth';

// ---------------------------------------------------------------------------
// Inicialización
// ---------------------------------------------------------------------------

/**
 * Instancia de Firebase Admin.
 * Se inicializa una sola vez reutilizando la existente si ya fue creada.
 */
const app = admin.apps.length === 0
  ? admin.initializeApp()
  : admin.app();

// ---------------------------------------------------------------------------
// Servicios exportados
// ---------------------------------------------------------------------------

/** Instancia de Firestore Admin para operaciones de backend */
export const db: Firestore = getFirestore(app);

/** Instancia de Firebase Auth Admin para gestión de usuarios */
export const auth: Auth = getAuth(app);

export default app;
