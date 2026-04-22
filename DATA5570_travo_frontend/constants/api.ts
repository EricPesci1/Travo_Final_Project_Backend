/**
 * Django API base URL without trailing slash.
 * Override per machine: EXPO_PUBLIC_API_BASE_URL=http://192.168.x.x:8000/api
 * (physical devices cannot use 127.0.0.1 to reach your computer.)
 */
import Constants from 'expo-constants';

export function getApiBaseUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();
  if (fromEnv) {
    return fromEnv.replace(/\/$/, '');
  }

  // Expo dev server host, e.g. "192.168.1.10:8081"
  const hostUri =
    Constants.expoConfig?.hostUri ??
    (Constants as any).manifest2?.extra?.expoClient?.hostUri ??
    (Constants as any).manifest?.debuggerHost;

  const host = typeof hostUri === 'string' ? hostUri.split(':')[0] : undefined;
  if (host) {
    return `http://${host}:8000/api`;
  }

  return 'http://127.0.0.1:8000/api';
}
