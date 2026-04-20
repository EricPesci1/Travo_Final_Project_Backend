import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { PostCard } from '@/components/PostCard';
import { colors } from '@/constants/theme';
import { mockPosts } from '@/data/mockPosts';

export default function HomeScreen() {
  const router = useRouter();
  const [refreshTick, setRefreshTick] = useState(0);

  const posts = useMemo(
    () =>
      [...mockPosts].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [refreshTick],
  );

  return (
    <View style={styles.container}>
      <Text style={styles.motto}>Sharing Travel Experiences with the World</Text>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            onPressAuthor={(post) =>
              router.push({
                pathname: '/user/[username]',
                params: { username: post.user, image: post.userProfileImage },
              })
            }
          />
        )}
      />

      <Pressable style={styles.refreshButton} onPress={() => setRefreshTick((value) => value + 1)}>
        <Ionicons name="refresh" size={22} color={colors.white} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  motto: {
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: 12,
  },
  listContent: {
    paddingBottom: 120,
  },
  refreshButton: {
    position: 'absolute',
    bottom: 110,
    right: 20,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.accentBlue,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
});
