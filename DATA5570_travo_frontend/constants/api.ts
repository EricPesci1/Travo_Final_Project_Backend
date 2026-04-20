/**
 * Django API base URL without trailing slash.
 * Override per machine: EXPO_PUBLIC_API_BASE_URL=http://192.168.x.x:8000/api
 * (physical devices cannot use 127.0.0.1 to reach your computer.)
 */
export function getApiBaseUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();
  if (fromEnv) {
    return fromEnv.replace(/\/$/, '');
  }
  return 'http://127.0.0.1:8000/api';
}
