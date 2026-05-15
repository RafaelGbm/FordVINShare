import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { router } from 'expo-router';

import { COLORS } from '../../constants';
import { useAuthStore } from '../../utils/store';

export default function DashboardScreen() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    router.replace('/');
  };

  const kpis = [
    { label: 'Veículos em Garantia', value: '428', icon: 'car' },
    { label: 'Taxa VIN Share', value: '68%', icon: 'percent' },
    { label: 'Receita Estimada', value: 'R$ 142k', icon: 'currency-brl' },
    { label: 'Leads Ativos', value: '87', icon: 'account-multiple' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Olá, {user?.name?.split(' ')[0]}</Text>
            <Text style={styles.role}>Analista - São Paulo</Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
            <MaterialCommunityIcons name="logout" size={24} color={COLORS.gray} />
          </TouchableOpacity>
        </View>

        {/* KPIs */}
        <View style={styles.kpisGrid}>
          {kpis.map((kpi, index) => (
            <View key={index} style={styles.kpiCard}>
              <MaterialCommunityIcons
                name={kpi.icon as any}
                size={24}
                color={COLORS.primary}
                style={styles.kpiIcon}
              />
              <Text style={styles.kpiValue}>{kpi.value}</Text>
              <Text style={styles.kpiLabel}>{kpi.label}</Text>
            </View>
          ))}
        </View>

        {/* VIN Share Chart Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>VIN Share por Concessionária</Text>
          <View style={styles.chartPlaceholder}>
            <MaterialCommunityIcons name="chart-bar" size={48} color={COLORS.border} />
            <Text style={styles.chartText}>Gráfico em desenvolvimento</Text>
          </View>
        </View>

        {/* Monthly Evolution */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Evolução Mensal</Text>
          <View style={styles.chartPlaceholder}>
            <MaterialCommunityIcons name="chart-line" size={48} color={COLORS.border} />
            <Text style={styles.chartText}>Gráfico em desenvolvimento</Text>
          </View>
        </View>

        {/* Top Dealers */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top 5 Concessionárias</Text>
          {[
            { name: 'Ford SP Centro', share: 82, customers: 245 },
            { name: 'Ford SP Zona Leste', share: 76, customers: 198 },
            { name: 'Ford SP Zona Oeste', share: 71, customers: 187 },
            { name: 'Ford SP Zona Sul', share: 68, customers: 156 },
            { name: 'Ford SP Zona Norte', share: 64, customers: 142 },
          ].map((dealer, index) => (
            <View key={index} style={styles.dealerCard}>
              <View style={styles.dealerInfo}>
                <Text style={styles.dealerName}>{dealer.name}</Text>
                <Text style={styles.dealerCustomers}>{dealer.customers} clientes</Text>
              </View>
              <View style={styles.dealerShare}>
                <Text style={styles.shareValue}>{dealer.share}%</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.light,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 16,
    marginBottom: 24,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.dark,
  },
  role: {
    fontSize: 14,
    color: COLORS.gray,
    marginTop: 4,
  },
  logoutBtn: {
    padding: 8,
  },
  kpisGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    flexWrap: 'wrap',
  },
  kpiCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  kpiIcon: {
    marginBottom: 8,
  },
  kpiValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 4,
  },
  kpiLabel: {
    fontSize: 11,
    color: COLORS.gray,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 12,
  },
  chartPlaceholder: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartText: {
    fontSize: 14,
    color: COLORS.gray,
    marginTop: 12,
  },
  dealerCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dealerInfo: {
    flex: 1,
  },
  dealerName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.dark,
  },
  dealerCustomers: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 4,
  },
  dealerShare: {
    backgroundColor: '#f0f4ff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  shareValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
});
