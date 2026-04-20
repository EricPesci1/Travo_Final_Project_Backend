import { Image, Pressable, StyleSheet } from 'react-native';

type ProfileIconProps = {
  onPress: () => void;
  size?: number;
};

export function ProfileIcon({ onPress, size = 36 }: ProfileIconProps) {
  return (
    <Pressable onPress={onPress} style={styles.container}>
      <Image
        source={{ uri: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=200&q=80' }}
        style={[styles.image, { width: size, height: size, borderRadius: size / 2 }]}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    marginLeft: 14,
  },
  image: {
    borderWidth: 2,
    borderColor: '#216e82',
  },
});
