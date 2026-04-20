import { useLocalSearchParams } from 'expo-router';
import { Image, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/constants/theme';

export default function PublicUserProfileScreen() {
  const params = useLocalSearchParams<{ username?: string; image?: string }>();
  const username = params.username ?? 'traveler';
  const profileImage = params.image ?? 'https://i.pravatar.cc/120?img=5';

  return (
    <View style={styles.container}>
      <Image source={{ uri: profileImage }} style={styles.avatar} />
      <Text style={styles.username}>@{username}</Text>
      <Text style={styles.subtitle}>Traveler profile page</Text>
      <Text style={styles.helperText}>More public profile details can be connected once the API is available.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    marginBottom: 14,
    borderWidth: 2,
    borderColor: colors.accentBlue,
  },
  username: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: '700',
  },
  subtitle: {
    color: colors.textPrimary,
    marginTop: 4,
    fontWeight: '600',
  },
  helperText: {
    color: colors.textPrimary,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 20,
  },
});
