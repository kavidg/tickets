import { getAuth, type Auth } from 'firebase/auth';
import app from './config';

/**
 * Firebase Authentication instance.
 *
 * Use this instance in services to perform auth operations.
 * Do NOT use getAuth() directly in components — always go through services layer.
 */
const auth: Auth = getAuth(app);

export default auth;
