/**
 * TicketS - Variables de Entorno del Backend
 *
 * Centraliza la lectura y validación de variables de entorno
 * para la configuración del backend.
 *
 * Las variables se cargan desde:
 *   - Cloud Functions: Configuración de entorno de Firebase (functions:config)
 *   - Local: .env file o variables del sistema
 */

// ---------------------------------------------------------------------------
// Firebase
// ---------------------------------------------------------------------------

export const FIREBASE_CONFIG = {
  projectId: process.env.FIREBASE_PROJECT_ID || '',
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL || '',
  privateKey: process.env.FIREBASE_PRIVATE_KEY || '',
} as const;

// ---------------------------------------------------------------------------
// Bold Payment Gateway
// ---------------------------------------------------------------------------

export const BOLD_CONFIG = {
  apiKey: process.env.BOLD_API_KEY || '',
  apiSecret: process.env.BOLD_API_SECRET || '',
  publicKey: process.env.BOLD_PUBLIC_KEY || '',
  webhookSecret: process.env.BOLD_WEBHOOK_SECRET || '',
  environment: (process.env.BOLD_ENVIRONMENT || 'sandbox') as 'sandbox' | 'production',
} as const;

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------

export const APP_CONFIG = {
  url: process.env.APP_URL || 'http://localhost:5173',
  corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:5173').split(','),
} as const;
