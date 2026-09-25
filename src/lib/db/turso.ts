import { createClient } from '@libsql/client/web';

// Vite env vars — set these in .env.local (see README).
const url = import.meta.env.VITE_TURSO_URL as string;
const authToken = import.meta.env.VITE_TURSO_AUTH_TOKEN as string;

export const turso = createClient({ url, authToken });
