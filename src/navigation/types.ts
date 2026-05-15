import { NavigatorScreenParams } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

export type RootStackParamList = {
  Login: undefined;
  ClientApp: NavigatorScreenParams<ClientTabParamList>;
  AnalystApp: NavigatorScreenParams<AnalystTabParamList>;
};

export type ClientTabParamList = {
  Home: undefined;
  Scheduling: undefined;
  Locator: undefined;
  Points: undefined;
  Chat: undefined;
  Profile: undefined;
  ServiceDetail: { serviceId: string };
  DealerDetail: { dealerId: string };
};

export type AnalystTabParamList = {
  Dashboard: undefined;
  Leads: undefined;
  Segmentation: undefined;
  Profile: undefined;
  Customer360: { customerId: string };
};

export type RootStackScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  T
>;

export type ClientTabScreenProps<T extends keyof ClientTabParamList> = BottomTabScreenProps<
  ClientTabParamList,
  T
>;

export type AnalystTabScreenProps<T extends keyof AnalystTabParamList> = BottomTabScreenProps<
  AnalystTabParamList,
  T
>;
