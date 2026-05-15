import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useAuthStore } from '../../utils/store';
import { COLORS } from '../../constants';
import { ClientTabScreenProps } from '../../navigation/types';
import { getMockUser } from '../../utils/store';

type Props = ClientTabScreenProps<'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [mockData] = useState(() => getMockUser('client1'));

  const warranty = {
    status: 'Ativa',
    daysLeft: 245,
    expiryDate: '2025-12-15',
  };

  const vehicle = mockData.vehicle;
  const nextRevisionKm = Math.ceil(vehicle.km / 10000) * 10000;
  const kmToRevision = nextRevisionKm - vehicle.km;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Olá, {user?.name?.split(' ')[0]}</Text>
            <Text style={styles.date}>{new Date().toLocaleDateString('pt-BR')}</Text>
          </View>
          <TouchableOpacity onPress={() => logout()} style={styles.logoutBtn}>
            <MaterialCommunityIcons name="logout" size={24} color={COLORS.gray} />
          </TouchableOpacity>
        </View>

        {/* Warranty Card */}
        <View style={styles.warrantyCard}>
          <View style={styles.warrantyHeader}>
            <MaterialCommunityIcons name="shield-check" size={32} color={COLORS.success} />
            <View style={styles.warrantyInfo}>
              <Text style={styles.warrantyLabel}>Status da Garantia</Text>
              <Text style={styles.warrantyStatus}>{warranty.status}</Text>
            </View>
          </View>
          <View style={styles.warrantyDays}>
            <Text style={styles.warrantyDaysValue}>{warranty.daysLeft} dias</Text>
            <Text style={styles.warrantyDaysLabel}>até o vencimento</Text>
          </View>
          <TouchableOpacity style={styles.scheduleButton}>
            <Text style={styles.scheduleButtonText}>Agendar Revisão Gratuita</Text>
          </TouchableOpacity>
        </View>

        {/* Vehicle Info */}
        <View style={styles.vehicleCard}>
          <View style={styles.vehicleHeader}>
            <MaterialCommunityIcons name="car" size={28} color={COLORS.primary} />
            <View>
              <Text style={styles.vehicleModel}>{vehicle.model}</Text>
              <Text style={styles.vehicleInfo}>
                {vehicle.year} • {vehicle.km.toLocaleString('pt-BR')} km
              </Text>
            </View>
          </View>
        </View>

        {/* Maintenance Alert */}
        {kmToRevision <= 500 && (
          <View style={styles.alertCard}>
            <MaterialCommunityIcons
              name="alert-circle"
              size={24}
              color={COLORS.warning}
            />
            <View style={styles.alertContent}>
              <Text style={styles.alertTitle}>Revisão Próxima</Text>
              <Text style={styles.alertText}>
                Faltam {kmToRevision} km para a próxima revisão
              </Text>
            </View>
          </View>
        )}

        {/* Recent Services */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Últimos Serviços</Text>

          <View style={styles.serviceCard}>
            <View style={styles.serviceIcon}>
              <MaterialCommunityIcons name="wrench" size={20} color={COLORS.primary} />
            </View>
            <View style={styles.serviceDetails}>
              <Text style={styles.serviceName}>Revisão Completa</Text>
              <Text style={styles.serviceDate}>15 de março, 2025</Text>
              <Text style={styles.serviceStatus}>Concluído</Text>
            </View>
          </View>

          <View style={styles.serviceCard}>
            <View style={styles.serviceIcon}>
              <MaterialCommunityIcons
                name="water-opacity"
                size={20}
                color={COLORS.secondary}
              />
            </View>
            <View style={styles.serviceDetails}>
              <Text style={styles.serviceName}>Troca de Óleo</Text>
              <Text style={styles.serviceDate}>22 de fevereiro, 2025</Text>
              <Text style={styles.serviceStatus}>Concluído</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ações Rápidas</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity style={styles.actionButton}>
              <MaterialCommunityIcons name="calendar-plus" size={24} color={COLORS.primary} />
              <Text style={styles.actionLabel}>Agendar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <MaterialCommunityIcons name="map-marker" size={24} color={COLORS.primary} />
              <Text style={styles.actionLabel}>Concessionárias</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <MaterialCommunityIcons name="chat" size={24} color={COLORS.primary} />
              <Text style={styles.actionLabel}>Chat IA</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <MaterialCommunityIcons name="gift" size={24} color={COLORS.primary} />
              <Text style={styles.actionLabel}>Meus Pontos</Text>
            </TouchableOpacity>
          </View>
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
  date: {
    fontSize: 14,
    color: COLORS.gray,
    marginTop: 4,
  },
  logoutBtn: {
    padding: 8,
  },
  warrantyCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.success,
  },
  warrantyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  warrantyInfo: {
    marginLeft: 12,
  },
  warrantyLabel: {
    fontSize: 12,
    color: COLORS.gray,
  },
  warrantyStatus: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.dark,
  },
  warrantyDays: {
    alignItems: 'center',
    marginBottom: 12,
  },
  warrantyDaysValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  warrantyDaysLabel: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 4,
  },
  scheduleButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  scheduleButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  vehicleCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  vehicleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vehicleModel: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.dark,
  },
  vehicleInfo: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 4,
  },
  alertCard: {
    backgroundColor: '#fffaf0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warning,
  },
  alertContent: {
    marginLeft: 12,
    flex: 1,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.dark,
  },
  alertText: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 2,
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
  serviceCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  serviceIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f0f4ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviceDetails: {
    marginLeft: 12,
    flex: 1,
  },
  serviceName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.dark,
  },
  serviceDate: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 2,
  },
  serviceStatus: {
    fontSize: 11,
    color: COLORS.success,
    fontWeight: '600',
    marginTop: 4,
  },
  actionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  actionButton: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.dark,
    marginTop: 8,
  },
});
