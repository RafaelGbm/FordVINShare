import { Redirect } from 'expo-router';
import { useAuthStore } from '../src/utils/store';
import LoginScreen from '../src/screens/LoginScreen';

export default function Index() {
  const user = useAuthStore((state) => state.user);
  const role = useAuthStore((state) => state.role);

  if (user && role === 'client') {
    return <Redirect href="/(client)/home" />;
  }
  if (user && role === 'analyst') {
    return <Redirect href="/(analyst)/dashboard" />;
  }

  return <LoginScreen />;
}
