import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { useAuthStore } from '../../utils/store';
import { COLORS } from '../../constants';
import FordLogo from '../../components/FordLogo';
import { authService } from '../../services/auth.service';
import { useMe } from '../../hooks/useAuth';
import { useMyVehicles, useVehicleWarranty, useMaintenanceAlerts } from '../../hooks/useVehicles';
import { useMyServices } from '../../hooks/useServices';
import { ServiceType } from '../../services/services.service';
import { WarrantyStatus } from '../../services/vehicles.service';

const { width } = Dimensions.get('window');

const SERVICE_TYPE_LABEL: Record<ServiceType, string> = {
  REVIEW: 'Revisão Preventiva',
  OIL_CHANGE: 'Troca de Óleo',
  WARRANTY: 'Serviço em garantia',
  REPAIR: 'Reparo',
};

const SERVICE_TYPE_ICON: Record<ServiceType, string> = {
  REVIEW: 'wrench',
  OIL_CHANGE: 'oil',
  WARRANTY: 'shield-check',
  REPAIR: 'cog',
};

const SERVICE_TYPE_COLOR: Record<ServiceType, string> = {
  REVIEW: COLORS.success,
  OIL_CHANGE: COLORS.secondary,
  WARRANTY: COLORS.primary,
  REPAIR: '#9c27b0',
};

const WARRANTY_LABEL: Record<WarrantyStatus, string> = {
  ACTIVE: 'Ativa',
  EXPIRING_SOON: 'Vencendo em breve',
  EXPIRED: 'Vencida',
};

function formatDateBR(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatShortDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
}

export default function HomeScreen() {
  const logout = useAuthStore((state) => state.logout);
  const { data: me } = useMe();

  const vehiclesQuery = useMyVehicles();
  const vehicle = vehiclesQuery.data?.[0];
  const warrantyQuery = useVehicleWarranty(vehicle?.id);
  const alertsQuery = useMaintenanceAlerts(vehicle?.id);
  const servicesQuery = useMyServices({ vehicleId: vehicle?.id, size: 3 });

  const warranty = warrantyQuery.data;
  const firstAlert = alertsQuery.data?.[0];
  const recentServices = servicesQuery.data?.content ?? [];

  const warrantyPct = warranty
    ? Math.min(100, Math.max(0, (warranty.daysRemaining / 365) * 100))
    : 0;

  const handleLogout = async () => {
    await authService.logout();
    logout();
    router.replace('/');
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      {/* Hero / Header */}
      <View style={styles.hero}>
        <View style={styles.heroBlob1} />
        <View style={styles.heroBlob2} />
        <View style={styles.heroTop}>
          <FordLogo width={110} height={44} />
          <TouchableOpacity style={styles.iconBtn}>
            <MaterialCommunityIcons name="bell-outline" size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.heroGreeting}>
          <Text style={styles.heroHello}>Olá, {me?.name?.split(' ')[0] ?? '—'}</Text>
          <Text style={styles.heroWelcome}>Bem-vindo de volta ao Ford Connect</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Vehicle Card */}
        {vehiclesQuery.isLoading && (
          <View style={[styles.vehicleCard, { paddingVertical: 40, alignItems: 'center' }]}>
            <ActivityIndicator color={COLORS.primary} />
            <Text style={{ color: COLORS.gray, marginTop: 8, fontSize: 12 }}>
              Carregando seu veículo...
            </Text>
          </View>
        )}

        {vehiclesQuery.isError && (
          <View style={[styles.vehicleCard, { padding: 20 }]}>
            <Text style={{ color: '#c62828', fontWeight: '700' }}>Não foi possível carregar</Text>
            <Text style={{ color: COLORS.gray, fontSize: 12, marginTop: 4 }}>
              Verifique sua conexão e tente novamente.
            </Text>
            <TouchableOpacity onPress={() => vehiclesQuery.refetch()} style={{ marginTop: 10 }}>
              <Text style={{ color: COLORS.primary, fontWeight: '700' }}>Tentar de novo</Text>
            </TouchableOpacity>
          </View>
        )}

        {!vehiclesQuery.isLoading && !vehiclesQuery.isError && !vehicle && (
          <View style={[styles.vehicleCard, { alignItems: 'center', padding: 24 }]}>
            <MaterialCommunityIcons name="car-off" size={40} color={COLORS.border} />
            <Text style={{ fontWeight: '800', color: COLORS.dark, marginTop: 8 }}>
              Nenhum veículo cadastrado
            </Text>
            <Text style={{ color: COLORS.gray, fontSize: 12, marginTop: 4, textAlign: 'center' }}>
              Adicione seu Ford no perfil para acompanhar garantia e revisões.
            </Text>
          </View>
        )}

        {vehicle && (
          <View style={styles.vehicleCard}>
            <View style={styles.vehicleHead}>
              <View>
                <Text style={styles.vehicleLabel}>SEU VEÍCULO</Text>
                <Text style={styles.vehicleName}>Ford {vehicle.model}</Text>
                <Text style={styles.vehiclePlate}>
                  {vehicle.year} · {vehicle.plate}
                </Text>
              </View>
              <View style={styles.vehicleIcon}>
                <MaterialCommunityIcons name="car-sports" size={36} color={COLORS.primary} />
              </View>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>
                  {(vehicle.currentKm / 1000).toFixed(0)}k
                </Text>
                <Text style={styles.statLabel}>km rodados</Text>
              </View>
              <View style={styles.statSep} />
              <View style={styles.statBox}>
                <Text style={styles.statValue}>
                  {warranty?.daysRemaining ?? '–'}
                </Text>
                <Text style={styles.statLabel}>dias garantia</Text>
              </View>
              <View style={styles.statSep} />
              <View style={styles.statBox}>
                <Text
                  style={[
                    styles.statValue,
                    {
                      color:
                        vehicle.warrantyStatus === 'ACTIVE'
                          ? COLORS.success
                          : vehicle.warrantyStatus === 'EXPIRING_SOON'
                            ? '#f5a623'
                            : '#ea4335',
                    },
                  ]}
                >
                  {vehicle.warrantyStatus === 'ACTIVE' ? '✓' : '!'}
                </Text>
                <Text style={styles.statLabel}>{WARRANTY_LABEL[vehicle.warrantyStatus]}</Text>
              </View>
            </View>

            {/* Warranty progress */}
            {warranty && (
              <View style={styles.warrantyBlock}>
                <View style={styles.warrantyHead}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <MaterialCommunityIcons
                      name="shield-check"
                      size={16}
                      color={warranty.status === 'ACTIVE' ? COLORS.success : '#f5a623'}
                    />
                    <Text style={styles.warrantyLabel}>Garantia Ford Plus</Text>
                  </View>
                  <Text style={styles.warrantyPct}>{warrantyPct.toFixed(0)}%</Text>
                </View>
                <View style={styles.warrantyBar}>
                  <View style={[styles.warrantyFill, { width: `${warrantyPct}%` }]} />
                </View>
                <Text style={styles.warrantyHint}>
                  Válida até {formatDateBR(warranty.endDate)}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Alert (maintenance) */}
        {firstAlert && (
          <View style={styles.alert}>
            <View style={styles.alertIcon}>
              <MaterialCommunityIcons name="wrench-clock" size={22} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.alertTitle}>{firstAlert.title}</Text>
              <Text style={styles.alertText}>
                Faltam {firstAlert.kmRemaining.toLocaleString('pt-BR')} km
              </Text>
            </View>
            <TouchableOpacity style={styles.alertCta}>
              <MaterialCommunityIcons name="arrow-right" size={18} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        )}

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Acesso rápido</Text>
        <View style={styles.quickGrid}>
          <TouchableOpacity style={styles.quickCard} activeOpacity={0.85}>
            <View style={[styles.quickIcon, { backgroundColor: '#e8efff' }]}>
              <MaterialCommunityIcons name="calendar-plus" size={26} color={COLORS.primary} />
            </View>
            <Text style={styles.quickLabel}>Agendar</Text>
            <Text style={styles.quickSub}>revisão</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickCard} activeOpacity={0.85}>
            <View style={[styles.quickIcon, { backgroundColor: '#fdf0e6' }]}>
              <MaterialCommunityIcons name="map-marker-radius" size={26} color="#ff7043" />
            </View>
            <Text style={styles.quickLabel}>Localizar</Text>
            <Text style={styles.quickSub}>concessionária</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickCard} activeOpacity={0.85}>
            <View style={[styles.quickIcon, { backgroundColor: '#e9f7ee' }]}>
              <MaterialCommunityIcons name="robot-excited-outline" size={26} color="#1e8e3e" />
            </View>
            <Text style={styles.quickLabel}>Assistente</Text>
            <Text style={styles.quickSub}>Ford AI</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickCard} activeOpacity={0.85}>
            <View style={[styles.quickIcon, { backgroundColor: '#fff4e0' }]}>
              <MaterialCommunityIcons name="trophy-outline" size={26} color="#f5a623" />
            </View>
            <Text style={styles.quickLabel}>Pontos</Text>
            <Text style={styles.quickSub}>2.450 disp.</Text>
          </TouchableOpacity>
        </View>

        {/* Service Timeline */}
        <View style={styles.timelineHead}>
          <Text style={styles.sectionTitle}>Histórico de serviços</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>Ver tudo</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.timeline}>
          {servicesQuery.isLoading && (
            <View style={{ paddingVertical: 16, alignItems: 'center' }}>
              <ActivityIndicator color={COLORS.primary} size="small" />
            </View>
          )}

          {!servicesQuery.isLoading && recentServices.length === 0 && (
            <View style={[styles.timelineCard, { marginLeft: 0, alignItems: 'center', padding: 20 }]}>
              <Text style={{ color: COLORS.gray, fontSize: 13 }}>
                Nenhum serviço registrado ainda.
              </Text>
            </View>
          )}

          {recentServices.map((service, i, arr) => (
            <View key={service.id} style={styles.timelineRow}>
              <View style={styles.timelineDotCol}>
                <View style={[styles.timelineDot, { backgroundColor: SERVICE_TYPE_COLOR[service.serviceType] }]}>
                  <MaterialCommunityIcons
                    name={SERVICE_TYPE_ICON[service.serviceType] as any}
                    size={14}
                    color="#fff"
                  />
                </View>
                {i < arr.length - 1 && <View style={styles.timelineLine} />}
              </View>

              <View style={styles.timelineCard}>
                <View style={styles.timelineCardHead}>
                  <Text style={styles.timelineName}>
                    {SERVICE_TYPE_LABEL[service.serviceType]}
                  </Text>
                  <Text style={styles.timelineDate}>{formatShortDate(service.performedAt)}</Text>
                </View>
                <View style={styles.timelineMeta}>
                  <Text style={styles.timelineMetaItem} numberOfLines={1}>
                    {service.summary}
                  </Text>
                  <Text style={styles.timelineMetaDot}>·</Text>
                  <Text style={styles.timelineMetaItem} numberOfLines={1}>
                    {service.dealership}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Promo Banner */}
        <View style={styles.promo}>
          <View style={styles.promoDecor1} />
          <View style={styles.promoDecor2} />
          <View style={{ flex: 1 }}>
            <Text style={styles.promoTag}>EXCLUSIVO PRA VOCÊ</Text>
            <Text style={styles.promoTitle}>Black weekend Ford</Text>
            <Text style={styles.promoText}>
              Até 30% off em peças e acessórios originais. Aproveite antes que acabe.
            </Text>
            <TouchableOpacity style={styles.promoBtn}>
              <Text style={styles.promoBtnText}>Ver ofertas</Text>
              <MaterialCommunityIcons name="arrow-right" size={16} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
          <MaterialCommunityIcons name="tag-multiple" size={64} color="rgba(255,255,255,0.15)" style={styles.promoIcon} />
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },

  /* Hero */
  hero: {
    backgroundColor: COLORS.primary,
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 50,
    overflow: 'hidden',
  },
  heroBlob1: {
    position: 'absolute',
    top: -80,
    right: -60,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  heroBlob2: {
    position: 'absolute',
    bottom: -40,
    left: -30,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroGreeting: {
    marginTop: 20,
  },
  heroHello: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '800',
  },
  heroWelcome: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    marginTop: 4,
  },

  /* Scroll */
  scrollArea: {
    flex: 1,
    backgroundColor: '#f5f5f7',
    marginTop: -30,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 30,
  },

  /* Vehicle Card */
  vehicleCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  vehicleHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  vehicleLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.gray,
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  vehicleName: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.dark,
  },
  vehiclePlate: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 2,
  },
  vehicleIcon: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: '#f0f5ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#fafbfc',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 4,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.dark,
  },
  statLabel: {
    fontSize: 10,
    color: COLORS.gray,
    marginTop: 2,
    fontWeight: '500',
  },
  statSep: {
    width: 1,
    backgroundColor: '#e6e8eb',
    marginVertical: 4,
  },
  warrantyBlock: {
    backgroundColor: '#f0f5ff',
    borderRadius: 14,
    padding: 14,
  },
  warrantyHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  warrantyLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.dark,
  },
  warrantyPct: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primary,
  },
  warrantyBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#dde6f7',
    overflow: 'hidden',
  },
  warrantyFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  warrantyHint: {
    fontSize: 11,
    color: COLORS.gray,
    marginTop: 8,
    fontWeight: '500',
  },

  /* Alert */
  alert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0a4bb8',
    borderRadius: 16,
    padding: 14,
    marginBottom: 18,
  },
  alertIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  alertTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },
  alertText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
    marginTop: 2,
  },
  alertCta: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* Section */
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.dark,
    marginTop: 6,
    marginBottom: 12,
  },
  seeAll: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '700',
  },

  /* Quick Grid */
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 6,
  },
  quickCard: {
    width: (width - 32 - 10) / 2,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  quickIcon: {
    width: 50,
    height: 50,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.dark,
  },
  quickSub: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 2,
  },

  /* Timeline */
  timelineHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 18,
  },
  timeline: {
    marginBottom: 18,
  },
  timelineRow: {
    flexDirection: 'row',
  },
  timelineDotCol: {
    width: 36,
    alignItems: 'center',
  },
  timelineDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 14,
  },
  timelineLine: {
    flex: 1,
    width: 2,
    backgroundColor: '#e6e8eb',
    marginVertical: 4,
  },
  timelineCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    marginLeft: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  timelineCardHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timelineName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.dark,
    flex: 1,
  },
  timelineDate: {
    fontSize: 11,
    color: COLORS.gray,
    fontWeight: '600',
  },
  timelineMeta: {
    flexDirection: 'row',
    marginTop: 6,
  },
  timelineMetaItem: {
    fontSize: 12,
    color: COLORS.gray,
  },
  timelineMetaDot: {
    color: COLORS.gray,
    marginHorizontal: 6,
  },

  /* Promo */
  promo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    padding: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  promoDecor1: {
    position: 'absolute',
    top: -50,
    right: -30,
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  promoDecor2: {
    position: 'absolute',
    bottom: -40,
    right: 30,
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  promoTag: {
    fontSize: 10,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  promoTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 6,
  },
  promoText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 18,
    marginBottom: 14,
    paddingRight: 60,
  },
  promoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
    gap: 6,
  },
  promoBtnText: {
    color: COLORS.primary,
    fontWeight: '800',
    fontSize: 12,
  },
  promoIcon: {
    position: 'absolute',
    right: -8,
    bottom: -8,
  },
});
