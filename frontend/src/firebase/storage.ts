import { getStorage, type FirebaseStorage } from 'firebase/storage';
import app from './config';

/**
 * Firebase Storage instance for file uploads (images, logos, banners, etc.).
 *
 * Use this instance in services to perform upload / download operations.
 * Do NOT use getStorage() directly in components — always go through services layer.
 */
const storage: FirebaseStorage = getStorage(app);

export default storage;
