import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { getApiBaseUrl } from '@/constants/api';
import { colors } from '@/constants/theme';
import { getCities, type ApiCity } from '@/services/travoApi';

export default function MapScreen() {
  const [cities, setCities] = useState<ApiCity[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCities();
      setCities(data);
    } catch (e) {
      setCities(null);
      setError(e instanceof Error ? e.message : 'Failed to load cities');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const preview = cities?.slice(0, 5) ?? [];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Backend connection</Text>
      <Text style={styles.subtitle}>
        API: {getApiBaseUrl()}
      </Text>

      {loading ? (
        <ActivityIndicator size="large" color={colors.textPrimary} />
      ) : null}

      {error ? (
        <View style={styles.card}>
          <Text style={styles.errorTitle}>Could not reach the API</Text>
          <Text style={styles.errorBody}>{error}</Text>
          <Text style={styles.hint}>
            Start Django:{' '}
            <Text style={styles.mono}>cd TravoBackend && python manage.py runserver</Text>
          </Text>
          <Text style={styles.hint}>
            On a physical device, set EXPO_PUBLIC_API_BASE_URL to your computer&apos;s LAN IP
            (see .env.example).
          </Text>
          <Pressable style={styles.button} onPress={() => void load()}>
            <Text style={styles.buttonText}>Retry</Text>
          </Pressable>
        </View>
      ) : null}

      {!loading && !error && cities ? (
        <View style={styles.card}>
          <Text style={styles.success}>
            Loaded {cities.length} cities from the backend.
          </Text>
          {preview.map((c) => (
            <Text key={c.id} style={styles.row}>
              {c.city}, {c.state_name}
            </Text>
          ))}
          {cities.length > preview.length ? (
            <Text style={styles.more}>
              … and {cities.length - preview.length} more
            </Text>
          ) : null}
        </View>
      ) : null}

      <Text style={styles.footer}>Map / Mapbox can plug into this data next.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: colors.background,
    padding: 24,
    paddingTop: 48,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    color: colors.textPrimary,
    fontSize: 13,
    marginBottom: 20,
    opacity: 0.85,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  success: {
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: 12,
  },
  row: {
    color: colors.textPrimary,
    marginBottom: 6,
  },
  more: {
    color: colors.textPrimary,
    marginTop: 8,
    opacity: 0.8,
    fontStyle: 'italic',
  },
  errorTitle: {
    color: '#f87171',
    fontWeight: '700',
    marginBottom: 8,
  },
  errorBody: {
    color: colors.textPrimary,
    marginBottom: 12,
  },
  hint: {
    color: colors.textPrimary,
    fontSize: 13,
    marginBottom: 8,
    opacity: 0.9,
  },
  mono: {
    fontFamily: 'monospace',
    fontSize: 12,
  },
  button: {
    marginTop: 12,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonText: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  footer: {
    color: colors.textPrimary,
    opacity: 0.65,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 8,
  },
});
