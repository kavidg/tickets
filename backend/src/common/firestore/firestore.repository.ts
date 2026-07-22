/**
 * TicketS - FirestoreRepository
 *
 * Repositorio genérico abstracto que encapsula las operaciones CRUD
 * sobre cualquier colección de Firestore.
 *
 * Todos los servicios de negocio deben extender esta clase para:
 * - Eliminar código duplicado de Firestore.
 * - Mantener manejo consistente de errores.
 * - Centralizar la creación de timestamps.
 * - Unificar el mapeo documento → entidad.
 *
 * Los métodos CRUD internos se prefijan con `createDoc`, `updateDoc`, `deleteDoc`
 * para NO colisionar con los métodos públicos de los servicios hijos,
 * que pueden tener firmas distintas (ej: `create(dto, user)`).
 *
 * @example
 * @Injectable()
 * export class CategoriesService extends FirestoreRepository<Category> {
 *   protected collectionName = COLLECTIONS.CATEGORIES;
 *   constructor(firebase: FirebaseAdminService) { super(firebase); }
 *
 *   async create(dto: CreateCategoryDto): Promise<Category> {
 *     await this.ensureUnique('slug', dto.slug);
 *     const data = { ...dto, active: true, ...Timestamps.forCreate() };
 *     return this.createDoc(data);
 *   }
 * }
 *
 * @template T - Tipo de la entidad (interfaz del documento Firestore).
 */

import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { FirebaseAdminService } from '../../firebase/firebase.service';
import { Timestamps } from '../utils/timestamps';
import type { DocumentSnapshot, QuerySnapshot, CollectionReference, Query } from 'firebase-admin/firestore';

/**
 * Tipo base que toda entidad Firestore debe tener.
 */
export interface FirestoreEntity {
  id: string;
}

@Injectable()
export abstract class FirestoreRepository<T extends FirestoreEntity> {
  protected readonly logger = new Logger(this.constructor.name);

  /**
   * Nombre de la colección en Firestore.
   * Cada servicio concreto debe definir esta propiedad.
   */
  protected abstract collectionName: string;

  constructor(protected readonly firebase: FirebaseAdminService) {}

  // ---------------------------------------------------------------------------
  // Acceso a la colección
  // ---------------------------------------------------------------------------

  /**
   * Referencia a la colección de Firestore.
   */
  protected get collection(): CollectionReference {
    return this.firebase.db.collection(this.collectionName);
  }

  // ---------------------------------------------------------------------------
  // Operaciones CRUD internas (prefijadas para evitar colisión de nombres)
  // ---------------------------------------------------------------------------

  /**
   * Crea un nuevo documento en la colección.
   *
   * @param data - Datos del documento a crear.
   * @returns La entidad creada con su id de Firestore.
   */
  protected async createDoc(data: Record<string, unknown>): Promise<T> {
    const docRef = await this.collection.add(data);
    const docSnap = await docRef.get();
    return this.docToEntity(docSnap);
  }

  /**
   * Actualiza un documento existente.
   * Asigna automáticamente updatedAt mediante serverTimestamp().
   *
   * @param id - ID del documento a actualizar.
   * @param data - Datos parciales a actualizar.
   * @returns La entidad actualizada.
   */
  protected async updateDoc(id: string, data: Record<string, unknown>): Promise<T> {
    const updateData = {
      ...data,
      updatedAt: Timestamps.serverTimestamp(),
    };

    await this.collection.doc(id).update(updateData);
    return (await this.findById(id)) as T;
  }

  /**
   * Elimina un documento.
   *
   * @param id - ID del documento a eliminar.
   */
  protected async deleteDoc(id: string): Promise<void> {
    await this.collection.doc(id).delete();
  }

  // ---------------------------------------------------------------------------
  // Consultas públicas / protegidas
  // ---------------------------------------------------------------------------

  /**
   * Obtiene un documento por su ID.
   *
   * @param id - ID del documento.
   * @returns La entidad encontrada o null si no existe.
   */
  async findById(id: string): Promise<T | null> {
    const docSnap = await this.collection.doc(id).get();

    if (!docSnap.exists) {
      return null;
    }

    return this.docToEntity(docSnap);
  }

  /**
   * Obtiene un documento por su ID, lanzando error si no existe.
   *
   * @param id - ID del documento.
   * @returns La entidad encontrada.
   *
   * @throws NotFoundException si el documento no existe.
   */
  async findByIdOrFail(id: string): Promise<T> {
    const entity = await this.findById(id);

    if (!entity) {
      throw new NotFoundException(
        `El recurso no fue encontrado en ${this.collectionName}.`,
      );
    }

    return entity;
  }

  /**
   * Ejecuta una consulta personalizada sobre la colección.
   *
   * @param queryBuilder - Función que recibe la referencia de la colección y retorna una Query.
   * @returns Lista de entidades que coinciden con la consulta.
   *
   * @example
   * const activeEvents = await this.findMany(
   *   (col) => col.where('active', '==', true).orderBy('name', 'asc')
   * );
   */
  async findMany(queryBuilder: (collection: CollectionReference) => Query): Promise<T[]> {
    const query = queryBuilder(this.collection);
    const snapshot = await query.get();
    return this.snapshotToEntities(snapshot);
  }

  /**
   * Obtiene todos los documentos de la colección.
   */
  async findAll(): Promise<T[]> {
    return this.findMany((col) => col);
  }

  // ---------------------------------------------------------------------------
  // Consultas cross-collection (acceso seguro sin exponer this.firebase.db)
  // ---------------------------------------------------------------------------

  /**
   * Obtiene un documento de cualquier colección de Firestore como objeto plano.
   * Útil para validaciones entre colecciones (ej: verificar existencia de una organización).
   *
   * @param collectionName - Nombre de la colección objetivo.
   * @param docId - ID del documento.
   * @returns Los datos del documento como Record, o null si no existe.
   */
  async getRawDoc(
    collectionName: string,
    docId: string,
  ): Promise<Record<string, unknown> | null> {
    const docSnap = await this.firebase.db
      .collection(collectionName)
      .doc(docId)
      .get();

    if (!docSnap.exists) {
      return null;
    }

    return { id: docSnap.id, ...docSnap.data() };
  }

  /**
   * Ejecuta una consulta sobre una colección externa y retorna los documentos
   * como objetos planos. Útil para consultas entre colecciones.
   *
   * @param collectionName - Nombre de la colección objetivo.
   * @param queryBuilder - Función que recibe la referencia de la colección y retorna una Query.
   * @returns Lista de documentos como objetos planos.
   */
  async findRawInCollection(
    collectionName: string,
    queryBuilder: (collection: CollectionReference) => Query,
  ): Promise<Record<string, unknown>[]> {
    const query = queryBuilder(this.firebase.db.collection(collectionName));
    const snapshot = await query.get();

    if (snapshot.empty) {
      return [];
    }

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  }

  // ---------------------------------------------------------------------------
  // Utilidades de validación
  // ---------------------------------------------------------------------------

  /**
   * Verifica que un valor sea único en un campo específico.
   *
   * @param field - Campo a verificar (ej: 'slug', 'email').
   * @param value - Valor a verificar.
   * @param message - Mensaje de error personalizado (opcional).
   *
   * @throws ConflictException si ya existe un documento con ese valor.
   */
  async ensureUnique(field: string, value: string, message?: string): Promise<void> {
    const snapshot = await this.collection
      .where(field, '==', value)
      .limit(1)
      .get();

    if (!snapshot.empty) {
      throw new ConflictException(
        message || `El valor "${value}" para "${field}" ya está en uso.`,
      );
    }
  }

  /**
   * Verifica si existe un documento con un valor específico en un campo.
   */
  async exists(field: string, value: unknown): Promise<boolean> {
    const snapshot = await this.collection
      .where(field, '==', value)
      .limit(1)
      .get();

    return !snapshot.empty;
  }

  // ---------------------------------------------------------------------------
  // Mapeo documento ↔ entidad
  // ---------------------------------------------------------------------------

  /**
   * Convierte un DocumentSnapshot de Firestore a una entidad T.
   */
  protected docToEntity(doc: DocumentSnapshot): T {
    return { id: doc.id, ...doc.data() } as T;
  }

  /**
   * Convierte un QuerySnapshot de Firestore a una lista de entidades T.
   */
  protected snapshotToEntities(snapshot: QuerySnapshot): T[] {
    if (snapshot.empty) {
      return [];
    }
    return snapshot.docs.map((doc) => this.docToEntity(doc));
  }
}
