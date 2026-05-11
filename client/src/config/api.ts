/**
 * In development, leave empty so requests use the Vite dev server origin
 * and `/api` is proxied to the Express app (cookies stay same-site).
 * In production, set `VITE_API_ORIGIN` to your API origin (no trailing slash).
 */
export const API_ORIGIN = (
  import.meta.env.VITE_API_ORIGIN as string | undefined
)?.replace(/\/$/, "") ?? "";

export function apiUrl(path: string): string {
  if (import.meta.env.PROD && !API_ORIGIN) {
    console.error(
      "[api] VITE_API_ORIGIN is not set. Add it in the frontend Vercel project so API calls go to your server (e.g. https://noema-ai.vercel.app).",
    );
  }
  const p = path.startsWith("/") ? path : `/${path}`;
  return API_ORIGIN ? `${API_ORIGIN}${p}` : p;
}
