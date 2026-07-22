import { getFirestore, type Firestore } from 'firebase/firestore';
import app from './config';

/**
 * Cloud Firestore database instance.
 *
 * Use this instance in services to perform CRUD operations.
 * Do NOT use getFirestore() directly in components — always go through services layer.
 */
const db: Firestore = getFirestore(app);

export default db;
