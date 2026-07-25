/**
 * TicketS - FirebaseAdminService
 *
 * Servicio que expone las instancias de Firebase Admin para ser
 * inyectadas en los módulos de negocio de NestJS.
 *
 * Proporciona acceso a:
 *   - Firestore (db)
 *   - Firebase Auth (auth)
 *   - Firebase Storage (storage) — cuando se requiera
 *
 * @example
 * constructor(private readonly firebase: FirebaseAdminService) {}
 * const users = await this.firebase.db.collection('users').get();
 */

import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { getStorage, type Storage } from 'firebase-admin/storage';

@Injectable()
export class FirebaseAdminService implements OnModuleInit {
  private readonly logger = new Logger(FirebaseAdminService.name);

  private app: admin.app.App;
  private firestoreDb: Firestore;
  private authInstance: Auth;
  private storageInstance: Storage;

  /**
   * Inicializa Firebase Admin.
   * Si ya existe una app inicializada, la reutiliza.
   *
   * Lee las credenciales desde variables de entorno:
   *   - FIREBASE_PROJECT_ID
   *   - FIREBASE_CLIENT_EMAIL
   *   - FIREBASE_PRIVATE_KEY
   *
   * O, si no están configuradas, usa Application Default Credentials.
   */
  async onModuleInit() {
    try {
      // Reutilizar app existente o crear nueva
      if (admin.apps.length === 0) {
        const projectId = process.env.FIREBASE_PROJECT_ID;
        const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
        const privateKey = process.env.FIREBASE_PRIVATE_KEY;

        if (projectId && clientEmail && privateKey) {
          this.app = admin.initializeApp({
            credential: admin.credential.cert({
              projectId,
              clientEmail,
              privateKey: privateKey.replace(/\\n/g, '\n'),
            }),
          });
        } else {
          // Fallback a Application Default Credentials
          this.app = admin.initializeApp();
        }
      } else {
        this.app = admin.app();
      }

      this.firestoreDb = getFirestore(this.app);
      this.authInstance = getAuth(this.app);
      this.storageInstance = getStorage(this.app);

      this.logger.log('Firebase Admin initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Firebase Admin', error);
      throw error;
    }
  }

  /** Instancia de Firestore Admin */
  get db(): Firestore {
    return this.firestoreDb;
  }

  /** Instancia de Firebase Auth Admin */
  get auth(): Auth {
    return this.authInstance;
  }

  /** Instancia de Firebase Storage Admin */
  get storage(): Storage {
    return this.storageInstance;
  }

  /** Instancia de la aplicación Firebase Admin */
  get firebaseApp(): admin.app.App {
    return this.app;
  }
}
