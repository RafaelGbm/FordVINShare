import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../src/constants';

export default function ClientLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.gray,
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Início',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="home" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="scheduling"
        options={{
          title: 'Agendar',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="calendar" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="locator"
        options={{
          title: 'Localizador',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="map" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="points"
        options={{
          title: 'Pontos',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="gift" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="chat" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="account-circle" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
