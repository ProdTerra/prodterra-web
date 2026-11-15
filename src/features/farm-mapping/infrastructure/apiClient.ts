const defaultApiUrl = "http://localhost:4000";

export function apiUrl(path: string): URL {
  return new URL(path, process.env.NEXT_PUBLIC_API_URL ?? defaultApiUrl);
}
