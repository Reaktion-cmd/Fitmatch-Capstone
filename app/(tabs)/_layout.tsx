import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../lib/ThemeContext';

export default function TabsLayout() {
  const { isDark, colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#FFFFFF',
        tabBarInactiveTintColor: isDark ? '#94A3B8' : '#D9DFFD',
        tabBarStyle: {
          height: 65,
          paddingBottom: 9,
          paddingTop: 7,
          backgroundColor: isDark ? '#1E293B' : '#5064EF',
          borderTopWidth: isDark ? 1 : 0,
          borderTopColor: colors.border,
          maxWidth: 480,
          width: '100%',
          alignSelf: 'center',
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
      }}
    >
      <Tabs.Screen
        name="deslizar"
        options={{
          title: 'Deslizar',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="index"
        options={{
          title: 'Explorar',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="person-circle-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="eventos"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}