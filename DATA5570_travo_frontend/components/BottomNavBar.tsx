import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/constants/theme';

const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
  friends: 'people-outline',
  index: 'home-outline',
  create: 'add-circle-outline',
  map: 'map-outline',
};
const visibleRoutes = new Set(['friends', 'index', 'create', 'map']);

export function BottomNavBar({ state, descriptors, navigation }: BottomTabBarProps) {
  return (
    <View style={styles.container}>
      {state.routes
        .filter((route) => visibleRoutes.has(route.name))
        .map((route) => {
        const routeIndex = state.routes.findIndex((item) => item.key === route.key);
        const isFocused = state.index === routeIndex;
        const options = descriptors[route.key].options;
        const label = options.title ?? route.name;
        const iconName = iconMap[route.name] ?? 'ellipse-outline';

        return (
          <Pressable
            key={route.key}
            style={styles.tabItem}
            onPress={() => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            }}>
            <Ionicons
              name={iconName}
              size={24}
              color={isFocused ? colors.accentBlue : colors.textPrimary}
            />
            <Text style={[styles.label, isFocused && styles.labelFocused]}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 22,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  tabItem: {
    alignItems: 'center',
    minWidth: 64,
    gap: 2,
  },
  label: {
    fontSize: 12,
    color: colors.textPrimary,
  },
  labelFocused: {
    fontWeight: '700',
    color: colors.accentBlue,
  },
});
