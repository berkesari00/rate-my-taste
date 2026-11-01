import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { theme } from '../../constants/theme';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.ink,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopWidth: 0,
          height: 78,
          paddingTop: 10,
          ...theme.shadow.card,
        },
        tabBarLabelStyle: {
          fontFamily: theme.fonts.bodyBold,
          fontSize: 11,
          marginBottom: 6,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Ana Sayfa',
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size - 2} color={color} />,
        }}
      />
      <Tabs.Screen
        name="two"
        options={{
          title: 'Lobi',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="game-controller" size={size - 2} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}