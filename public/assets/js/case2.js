import { ensureAuth } from './auth.js';

// Guard page: redirect to login if not authenticated
ensureAuth();

// No additional dynamic behavior needed currently