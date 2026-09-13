import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="login" options={{ headerShown: true, title: 'Log In' }} />
      <Stack.Screen name="registro" options={{ headerShown: true, title: 'Create Account' }} />
    </Stack>
  );
}