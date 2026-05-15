import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../src/constants';

export default function AnalystLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.gray,
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="chart-line" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="leads"
        options={{
          title: 'Leads',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="account-multiple" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="segmentation"
        options={{
          title: 'Segmentação',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="chart-pie" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
