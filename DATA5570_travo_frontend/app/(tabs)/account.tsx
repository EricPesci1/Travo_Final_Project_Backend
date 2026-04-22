import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { InputField } from '@/components/InputField';
import { PostCard } from '@/components/PostCard';
import { colors } from '@/constants/theme';
import { listReviews } from '@/services/travoApi';
import { TravelPost } from '@/types/models';

export default function AccountScreen() {
  const [username] = useState('traveler.jules');
  const [name] = useState('Jules Rivera');
  const [email] = useState('jules@example.com');
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [postsError, setPostsError] = useState<string | null>(null);
  const [userPosts, setUserPosts] = useState<TravelPost[]>([]);

  useEffect(() => {
    const run = async () => {
      try {
        setLoadingPosts(true);
        setPostsError(null);
        const reviews = await listReviews(username);
        const mapped: TravelPost[] = reviews.map((review) => ({
          id: review.id,
          user: username,
          userProfileImage: `https://i.pravatar.cc/120?u=${encodeURIComponent(username)}`,
          image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
          city: `City #${review.city}`,
          state: '',
          description: review.description,
          pros: (review.pros || '')
            .split('\n')
            .map((s) => s.trim())
            .filter(Boolean),
          cons: (review.cons || '')
            .split('\n')
            .map((s) => s.trim())
            .filter(Boolean),
          createdAt: review.created_at,
        }));
        mapped.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setUserPosts(mapped);
      } catch (e) {
        setPostsError(e instanceof Error ? e.message : String(e));
      } finally {
        setLoadingPosts(false);
      }
    };

    void run();
  }, [username]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Pressable style={styles.imageWrap}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=300&q=80' }}
          style={styles.image}
        />
        <View style={styles.cameraBadge}>
          <Ionicons name="camera" size={14} color={colors.white} />
        </View>
      </Pressable>

      <InputField label="Username" value={username} editable={false} />
      <InputField label="Name" value={name} editable={false} />
      <InputField label="Email" value={email} editable={false} />
      <InputField label="Password" value="************" editable={false} secureTextEntry />

      <Pressable style={styles.primaryButton}>
        <Text style={styles.primaryText}>Update Profile Picture</Text>
      </Pressable>
      <Pressable style={styles.secondaryButton}>
        <Text style={styles.secondaryText}>Change Password</Text>
      </Pressable>
      <Pressable style={styles.dangerButton}>
        <Text style={styles.dangerText}>Delete Account</Text>
      </Pressable>

      <Text style={styles.sectionTitle}>My Posts</Text>
      {loadingPosts ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>Loading posts…</Text>
        </View>
      ) : postsError ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>Failed to load posts: {postsError}</Text>
        </View>
      ) : userPosts.length > 0 ? (
        userPosts.map((post) => <PostCard key={post.id} post={post} />)
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>You have not posted yet.</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    alignItems: 'stretch',
    paddingBottom: 110,
  },
  imageWrap: {
    width: 108,
    height: 108,
    alignSelf: 'center',
    marginBottom: 18,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 54,
    borderWidth: 2,
    borderColor: colors.accentBlue,
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 4,
    right: 2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.accentBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: colors.accentBlue,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryText: { color: colors.white, fontWeight: '700' },
  secondaryButton: {
    backgroundColor: colors.accentSand,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  secondaryText: { color: colors.textPrimary, fontWeight: '700' },
  dangerButton: {
    borderWidth: 1,
    borderColor: colors.accentClay,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  dangerText: { color: colors.accentClay, fontWeight: '700' },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyState: {
    backgroundColor: colors.white,
    borderRadius: 10,
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  emptyStateText: {
    color: colors.textPrimary,
  },
});
