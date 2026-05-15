import 'react-native-gesture-handler';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(client)" />
        <Stack.Screen name="(analyst)" />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}
