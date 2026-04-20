import { Tabs, useRouter } from 'expo-router';

import { BottomNavBar } from '@/components/BottomNavBar';
import { ProfileIcon } from '@/components/ProfileIcon';
import { colors } from '@/constants/theme';

export default function TabLayout() {
  const router = useRouter();

  return (
    <Tabs
      tabBar={(props) => <BottomNavBar {...props} />}
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTitleStyle: { color: colors.textPrimary, fontWeight: '700' },
        headerTintColor: colors.textPrimary,
        headerShadowVisible: false,
        headerLeft: () => <ProfileIcon onPress={() => router.push('/account')} />,
      }}>
      <Tabs.Screen
        name="friends"
        options={{
          title: 'Friends',
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: 'Create',
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: 'Map',
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'Account',
          href: null,
        }}
      />
      <Tabs.Screen
        name="user/[username]"
        options={{
          title: 'Traveler Profile',
          href: null,
        }}
      />
    </Tabs>
  );
}
