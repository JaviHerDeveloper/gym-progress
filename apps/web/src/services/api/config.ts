const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();

export const apiBaseUrl = configuredApiUrl || (import.meta.env.DEV ? 'http://localhost:3000' : '');

export function createApiUrl(path: string): string {
  if (!apiBaseUrl) {
    throw new Error('VITE_API_URL must be configured before making API requests in production.');
  }

  return new URL(path, `${apiBaseUrl.replace(/\/$/, '')}/`).toString();
}
