// When bundled as a Capacitor app (static export), API calls must use the
// absolute production URL because there is no local server.
export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ?? "";

export function apiUrl(path: string) {
  return `${API_BASE}${path}`;
}
