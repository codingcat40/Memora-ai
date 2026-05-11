/**
 * In development, leave empty so requests use the Vite dev server origin
 * and `/api` is proxied to the Express app (cookies stay same-site).
 * In production, set `VITE_API_ORIGIN` to your API origin (no trailing slash).
 */
export const API_ORIGIN = (
  import.meta.env.VITE_API_ORIGIN as string | undefined
)?.replace(/\/$/, "") ?? "";

export function apiUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return API_ORIGIN ? `${API_ORIGIN}${p}` : p;
}
