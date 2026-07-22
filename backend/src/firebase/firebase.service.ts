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
   */
  async onModuleInit() {
    try {
      // Reutilizar app existente o crear nueva
      this.app = admin.apps.length === 0
        ? admin.initializeApp()
        : admin.app();

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
