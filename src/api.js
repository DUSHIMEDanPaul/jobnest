// Single source of truth for the backend URL.
// Set VITE_API_URL in .env (see .env.example) to point at a different server.
export const API_URL = (
    import.meta.env.VITE_API_URL || 'https://job-nest-server-zeta.vercel.app'
).replace(/\/+$/, '');
