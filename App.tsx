import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect } from 'react';

import { useAuthStore } from './src/utils/store';
import { COLORS } from './src/constants';

// Screens
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/client/HomeScreen';
import SchedulingScreen from './src/screens/client/SchedulingScreen';
import LocatorScreen from './src/screens/client/LocatorScreen';
import PointsScreen from './src/screens/client/PointsScreen';
import ChatScreen from './src/screens/client/ChatScreen';
import ProfileScreen from './src/screens/client/ProfileScreen';
import DashboardScreen from './src/screens/analyst/DashboardScreen';
import LeadsScreen from './src/screens/analyst/LeadsScreen';
import SegmentationScreen from './src/screens/analyst/SegmentationScreen';

import { RootStackParamList, ClientTabParamList, AnalystTabParamList } from './src/navigation/types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const ClientTab = createBottomTabNavigator<ClientTabParamList>();
const AnalystTab = createBottomTabNavigator<AnalystTabParamList>();

function ClientTabs() {
  return (
    <ClientTab.Navigator
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.gray,
        headerShown: false,
      }}
    >
      <ClientTab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Início',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="home" size={24} color={color} />,
        }}
      />
      <ClientTab.Screen
        name="Scheduling"
        component={SchedulingScreen}
        options={{
          tabBarLabel: 'Agendar',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="calendar" size={24} color={color} />,
        }}
      />
      <ClientTab.Screen
        name="Locator"
        component={LocatorScreen}
        options={{
          tabBarLabel: 'Localizador',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="map" size={24} color={color} />,
        }}
      />
      <ClientTab.Screen
        name="Points"
        component={PointsScreen}
        options={{
          tabBarLabel: 'Pontos',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="gift" size={24} color={color} />,
        }}
      />
      <ClientTab.Screen
        name="Chat"
        component={ChatScreen}
        options={{
          tabBarLabel: 'Chat',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="chat" size={24} color={color} />,
        }}
      />
    </ClientTab.Navigator>
  );
}

function AnalystTabs() {
  return (
    <AnalystTab.Navigator
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.gray,
        headerShown: false,
      }}
    >
      <AnalystTab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="chart-line" size={24} color={color} />,
        }}
      />
      <AnalystTab.Screen
        name="Leads"
        component={LeadsScreen}
        options={{
          tabBarLabel: 'Leads',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="account-multiple" size={24} color={color} />,
        }}
      />
      <AnalystTab.Screen
        name="Segmentation"
        component={SegmentationScreen}
        options={{
          tabBarLabel: 'Segmentação',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="chart-pie" size={24} color={color} />,
        }}
      />
    </AnalystTab.Navigator>
  );
}

export default function App() {
  const { user, role, isLoading } = useAuthStore();

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        {!user || !role ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : role === 'client' ? (
          <Stack.Screen name="ClientApp" component={ClientTabs} />
        ) : (
          <Stack.Screen name="AnalystApp" component={AnalystTabs} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
