import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ImageBackground,
  Dimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useAuthStore } from '../../utils/store';
import { COLORS } from '../../constants';
import { ClientTabScreenProps } from '../../navigation/types';
import { getMockUser } from '../../utils/store';

type Props = ClientTabScreenProps<'Home'>;

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }: Props) {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [mockData] = useState(() => getMockUser('client1'));

  const vehicle = mockData.vehicle;
  const nextRevisionKm = Math.ceil(vehicle.km / 10000) * 10000;
  const kmToRevision = nextRevisionKm - vehicle.km;
  const warrantyDaysLeft = 245;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header com Logout */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Olá, {user?.name?.split(' ')[0]} 👋</Text>
            <Text style={styles.subtitle}>Bem-vindo ao Ford Connect</Text>
          </View>
          <TouchableOpacity onPress={() => logout()} style={styles.logoutBtn}>
            <MaterialCommunityIcons name="logout-variant" size={24} color={COLORS.gray} />
          </TouchableOpacity>
        </View>

        {/* Vehicle Card Principal */}
        <View style={styles.vehicleCardMain}>
          <ImageBackground
            source={{ uri: 'https://via.placeholder.com/400x200/003087/ffffff?text=Ford+Fiesta' }}
            style={styles.vehicleImage}
            imageStyle={{ borderRadius: 16 }}
          >
            <View style={styles.vehicleOverlay}>
              <View>
                <Text style={styles.vehicleYear}>{vehicle.year}</Text>
                <Text style={styles.vehicleModelName}>{vehicle.model}</Text>
              </View>
              <View style={styles.vehicleStatus}>
                <MaterialCommunityIcons name="car-info" size={20} color="#fff" />
              </View>
            </View>
          </ImageBackground>

          <View style={styles.vehicleStats}>
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="speedometer" size={20} color={COLORS.primary} />
              <Text style={styles.statValue}>{(vehicle.km / 1000).toFixed(0)}k km</Text>
              <Text style={styles.statLabel}>Quilometragem</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="shield-check" size={20} color={COLORS.success} />
              <Text style={styles.statValue}>Ativa</Text>
              <Text style={styles.statLabel}>Garantia</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="calendar-check" size={20} color={COLORS.secondary} />
              <Text style={styles.statValue}>{warrantyDaysLeft}d</Text>
              <Text style={styles.statLabel}>até vencer</Text>
            </View>
          </View>
        </View>

        {/* Alert Banner */}
        {kmToRevision <= 1000 && (
          <View style={styles.alertBanner}>
            <View style={styles.alertIcon}>
              <MaterialCommunityIcons name="alert" size={24} color="#fff" />
            </View>
            <View style={styles.alertContent}>
              <Text style={styles.alertTitle}>Revisão Programada</Text>
              <Text style={styles.alertText}>Faltam {kmToRevision} km para sua próxima revisão gratuita</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#fff" />
          </View>
        )}

        {/* CTA Button - Agendar Revisão */}
        <TouchableOpacity style={styles.ctaButton}>
          <MaterialCommunityIcons name="calendar-plus" size={20} color="#fff" />
          <Text style={styles.ctaButtonText}>Agendar Revisão Gratuita</Text>
          <MaterialCommunityIcons name="chevron-right" size={20} color="#fff" />
        </TouchableOpacity>

        {/* Quick Actions Grid */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Ações Rápidas</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity style={styles.actionCard}>
              <View style={[styles.actionIcon, { backgroundColor: '#e3f2fd' }]}>
                <MaterialCommunityIcons name="calendar-outline" size={24} color={COLORS.primary} />
              </View>
              <Text style={styles.actionCardLabel}>Agendar</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard}>
              <View style={[styles.actionIcon, { backgroundColor: '#f3e5f5' }]}>
                <MaterialCommunityIcons name="map-marker-outline" size={24} color="#9c27b0" />
              </View>
              <Text style={styles.actionCardLabel}>Locais</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard}>
              <View style={[styles.actionIcon, { backgroundColor: '#fff3e0' }]}>
                <MaterialCommunityIcons name="robot-happy-outline" size={24} color="#ff9800" />
              </View>
              <Text style={styles.actionCardLabel}>Chat IA</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard}>
              <View style={[styles.actionIcon, { backgroundColor: '#f0f4ff' }]}>
                <MaterialCommunityIcons name="gift-outline" size={24} color={COLORS.secondary} />
              </View>
              <Text style={styles.actionCardLabel}>Pontos</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Service History */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Histórico de Serviços</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllLink}>Ver Tudo</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.serviceItem}>
            <View style={[styles.serviceIcon, { backgroundColor: '#e8f5e9' }]}>
              <MaterialCommunityIcons name="wrench" size={20} color={COLORS.success} />
            </View>
            <View style={styles.serviceInfo}>
              <Text style={styles.serviceName}>Revisão Preventiva</Text>
              <Text style={styles.serviceDate}>15 de março de 2025</Text>
              <View style={styles.serviceTag}>
                <Text style={styles.serviceTagText}>✓ Concluído</Text>
              </View>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color={COLORS.gray} />
          </View>

          <View style={styles.serviceItem}>
            <View style={[styles.serviceIcon, { backgroundColor: '#e1f5fe' }]}>
              <MaterialCommunityIcons name="water-opacity" size={20} color={COLORS.secondary} />
            </View>
            <View style={styles.serviceInfo}>
              <Text style={styles.serviceName}>Troca de Óleo e Filtro</Text>
              <Text style={styles.serviceDate}>22 de fevereiro de 2025</Text>
              <View style={styles.serviceTag}>
                <Text style={styles.serviceTagText}>✓ Concluído</Text>
              </View>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color={COLORS.gray} />
          </View>

          <View style={styles.serviceItem}>
            <View style={[styles.serviceIcon, { backgroundColor: '#fce4ec' }]}>
              <MaterialCommunityIcons name="tire" size={20} color="#e91e63" />
            </View>
            <View style={styles.serviceInfo}>
              <Text style={styles.serviceName}>Revisão de Pneus</Text>
              <Text style={styles.serviceDate}>10 de janeiro de 2025</Text>
              <View style={styles.serviceTag}>
                <Text style={styles.serviceTagText}>✓ Concluído</Text>
              </View>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color={COLORS.gray} />
          </View>
        </View>

        {/* Benefits Card */}
        <View style={styles.benefitsCard}>
          <View style={styles.benefitHeader}>
            <MaterialCommunityIcons name="star" size={24} color="#ffd700" />
            <Text style={styles.benefitTitle}>Você tem benefícios!</Text>
          </View>
          <Text style={styles.benefitText}>
            Com sua garantia ativa, você tem acesso a revisões gratuitas na rede Ford oficial
          </Text>
          <TouchableOpacity style={styles.benefitButton}>
            <Text style={styles.benefitButtonText}>Saiba Mais →</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 12,
    marginBottom: 24,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.dark,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.gray,
    marginTop: 4,
    fontWeight: '500',
  },
  logoutBtn: {
    padding: 8,
  },

  /* Vehicle Card Principal */
  vehicleCardMain: {
    marginBottom: 20,
    overflow: 'hidden',
    borderRadius: 16,
    backgroundColor: '#fff',
  },
  vehicleImage: {
    width: '100%',
    height: 200,
    justifyContent: 'space-between',
    padding: 16,
  },
  vehicleOverlay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  vehicleYear: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    opacity: 0.9,
  },
  vehicleModelName: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 4,
  },
  vehicleStatus: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  vehicleStats: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginTop: 4,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.gray,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.border,
  },

  /* Alert Banner */
  alertBanner: {
    backgroundColor: COLORS.warning,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  alertText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 4,
    opacity: 0.95,
  },

  /* CTA Button */
  ctaButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  ctaButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginHorizontal: 12,
    flex: 1,
  },

  /* Quick Actions */
  quickActionsSection: {
    marginBottom: 24,
  },
  actionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionCardLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.dark,
    textAlign: 'center',
  },

  /* Service History */
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.dark,
  },
  seeAllLink: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
  },
  serviceItem: {
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
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  serviceInfo: {
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
  serviceTag: {
    marginTop: 4,
    backgroundColor: '#f0f4ff',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  serviceTagText: {
    fontSize: 10,
    color: COLORS.primary,
    fontWeight: '600',
  },

  /* Benefits Card */
  benefitsCard: {
    backgroundColor: '#fff3e0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#ff9800',
  },
  benefitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e65100',
    marginLeft: 8,
  },
  benefitText: {
    fontSize: 13,
    color: '#bf360c',
    lineHeight: 18,
    marginBottom: 12,
  },
  benefitButton: {
    paddingVertical: 10,
  },
  benefitButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ff6f00',
  },
});
