/** Prefixes a public-folder path (e.g. "/profile.jpg") with Vite's base URL. */
export function getImagePath(src: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  return `${base}${src}`;
}
