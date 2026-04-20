import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/constants/theme';
import { TravelPost } from '@/types/models';

type PostCardProps = {
  post: TravelPost;
  onPressAuthor?: (post: TravelPost) => void;
};

export function PostCard({ post, onPressAuthor }: PostCardProps) {
  return (
    <View style={styles.card}>
      <Pressable style={styles.authorRow} onPress={() => onPressAuthor?.(post)}>
        <Image source={{ uri: post.userProfileImage }} style={styles.avatar} />
        <Text style={styles.username}>@{post.user}</Text>
      </Pressable>
      <Image source={{ uri: post.image }} style={styles.image} />
      <View style={styles.content}>
        <Text style={styles.location}>{post.city}, {post.state}</Text>
        <Text style={styles.description}>{post.description}</Text>
        <Text style={styles.meta}>Pros: {post.pros.join(' • ')}</Text>
        <Text style={styles.meta}>Cons: {post.cons.join(' • ')}</Text>
        {post.price ? <Text style={styles.price}>Approx. ${post.price}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 16,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 8,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
  },
  username: {
    color: colors.textPrimary,
    fontWeight: '700',
    fontSize: 14,
  },
  image: {
    width: '100%',
    height: 180,
  },
  content: {
    padding: 14,
    gap: 8,
  },
  location: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  description: {
    color: colors.textPrimary,
    fontSize: 14,
    lineHeight: 20,
  },
  meta: {
    color: colors.textPrimary,
    fontSize: 13,
  },
  price: {
    color: colors.accentClay,
    fontWeight: '700',
    fontSize: 13,
  },
});
