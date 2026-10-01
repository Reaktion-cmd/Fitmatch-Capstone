import { Stack } from 'expo-router';
import { ThemeProvider, useTheme } from '../lib/ThemeContext';

function RootNavigator() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,

        headerStyle: {
          backgroundColor: colors.card,
        },

        headerTintColor: colors.text,

        headerTitleStyle: {
          fontWeight: '600',
        },

        headerShadowVisible: false,

        contentStyle: {
          backgroundColor: colors.background,
        },
      }}
    >
      <Stack.Screen name="index" />

      <Stack.Screen
        name="login"
        options={{
          headerShown: true,
          title: 'Log In',
        }}
      />

      <Stack.Screen
        name="registro"
        options={{
          headerShown: true,
          title: 'Create Account',
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <RootNavigator />
    </ThemeProvider>
  );
}
