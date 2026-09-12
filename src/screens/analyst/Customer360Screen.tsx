import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';

import { COLORS, ACCENTS } from '../../constants';
import { useCustomer360, useCustomerTimeline } from '../../hooks/useCustomers';
import {
  useCheckInAppointment,
  useCompleteAppointment,
} from '../../hooks/useAppointments';
import { ApiError } from '../../services/api';
import {
  AppointmentStatus,
  AppointmentSummary,
} from '../../services/appointments.service';
import { LeadSegment } from '../../services/leads.service';
import { ServiceType } from '../../services/services.service';
import { WarrantyStatus } from '../../services/vehicles.service';
import { TimelineEventType } from '../../services/customers.service';
import type { IconName } from '../../types';

const SEGMENT_META: Record<LeadSegment, { label: string; color: string; bg: string }> = {
  FIEL: { label: 'Fiel', color: COLORS.success, bg: COLORS.successTint },
  ECONOMICO: { label: 'Econômico', color: COLORS.secondary, bg: COLORS.primaryTintStrong },
  ESQUECIDO: { label: 'Esquecido', color: COLORS.warningText, bg: COLORS.warningTint },
  ABANDONO: { label: 'Abandono', color: COLORS.danger, bg: COLORS.dangerTint },
};

const SERVICE_LABEL: Record<ServiceType, string> = {
  REVIEW: 'Revisão',
  OIL_CHANGE: 'Troca de óleo',
  WARRANTY: 'Garantia',
  REPAIR: 'Reparo',
};

const WARRANTY_LABEL: Record<WarrantyStatus, string> = {
  ACTIVE: 'Garantia ativa',
  EXPIRING_SOON: 'Garantia vencendo',
  EXPIRED: 'Garantia vencida',
};

const WARRANTY_COLOR: Record<WarrantyStatus, string> = {
  ACTIVE: COLORS.success,
  EXPIRING_SOON: COLORS.warningText,
  EXPIRED: COLORS.danger,
};

const TIMELINE_ICON: Record<TimelineEventType, IconName> = {
  SERVICE: 'wrench',
  APPOINTMENT: 'calendar',
  NPS: 'star',
  REDEEM: 'gift',
  LEAD_ACTION: 'account-arrow-right',
  WARRANTY_EVENT: 'shield-check',
};

const TIMELINE_COLOR: Record<TimelineEventType, string> = {
  SERVICE: COLORS.success,
  APPOINTMENT: COLORS.primary,
  NPS: COLORS.warning,
  REDEEM: ACCENTS.purple,
  LEAD_ACTION: COLORS.secondary,
  WARRANTY_EVENT: COLORS.success,
};

function formatCurrency(v: number) {
  if (v >= 1_000_000) return `R$ ${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1000) return `R$ ${(v / 1000).toFixed(1)}k`;
  return `R$ ${v.toFixed(0)}`;
}

function formatDateBR(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function Customer360Screen() {
  const { customerId } = useLocalSearchParams<{ customerId: string }>();

  const c360Query = useCustomer360(customerId);
  const timelineQuery = useCustomerTimeline(customerId);

  if (c360Query.isLoading) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator color={COLORS.white} />
        <Text style={styles.splashText}>Carregando visão 360...</Text>
      </View>
    );
  }

  if (c360Query.isError || !c360Query.data) {
    const message =
      c360Query.error instanceof ApiError
        ? c360Query.error.problem.detail || c360Query.error.problem.title
        : 'Não foi possível carregar o cliente';
    return (
      <View style={styles.splash}>
        <MaterialCommunityIcons name="alert-circle" size={48} color={COLORS.white} />
        <Text style={styles.splashText}>{message}</Text>
        <TouchableOpacity style={styles.splashBtn} onPress={() => router.back()}>
          <Text style={styles.splashBtnText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { customer, segment, riskScore, lifetime, vehicles, recentServices, activeAppointments } =
    c360Query.data;
  const segmentMeta = SEGMENT_META[segment];

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      {/* Hero */}
      <View style={styles.hero}>
        <View style={styles.heroBlob1} />
        <View style={styles.heroBlob2} />

        <View style={styles.heroTop}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
            <MaterialCommunityIcons name="chevron-left" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.heroTitle}>Visão 360</Text>
          <TouchableOpacity style={styles.iconBtn}>
            <MaterialCommunityIcons name="dots-vertical" size={20} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials(customer.name)}</Text>
          </View>
          <Text style={styles.customerName}>{customer.name}</Text>
          <Text style={styles.customerCpf}>{customer.cpfMasked}</Text>

          <View style={styles.segmentRow}>
            <View style={[styles.segmentBadge, { backgroundColor: segmentMeta.bg }]}>
              <Text style={[styles.segmentText, { color: segmentMeta.color }]}>
                {segmentMeta.label}
              </Text>
            </View>
            <View style={styles.scorePill}>
              <MaterialCommunityIcons name="speedometer" size={12} color={COLORS.white} />
              <Text style={styles.scoreText}>Risco {riskScore}/100</Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Contact */}
        <View style={styles.contactRow}>
          <TouchableOpacity style={styles.contactBtnPrimary} activeOpacity={0.85}>
            <MaterialCommunityIcons name="phone" size={16} color={COLORS.white} />
            <Text style={styles.contactBtnPrimaryText}>Ligar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.contactBtn} activeOpacity={0.85}>
            <MaterialCommunityIcons name="message-text" size={16} color={COLORS.primary} />
            <Text style={styles.contactBtnText}>WhatsApp</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.contactBtn} activeOpacity={0.85}>
            <MaterialCommunityIcons name="email-outline" size={16} color={COLORS.primary} />
            <Text style={styles.contactBtnText}>Email</Text>
          </TouchableOpacity>
        </View>

        {/* Lifetime stats */}
        <Text style={styles.sectionTitle}>Histórico de relacionamento</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <MaterialCommunityIcons name="cash-multiple" size={20} color={COLORS.success} />
            <Text style={styles.statValue}>{formatCurrency(lifetime.totalSpent)}</Text>
            <Text style={styles.statLabel}>LTV total</Text>
          </View>
          <View style={styles.statCard}>
            <MaterialCommunityIcons name="wrench" size={20} color={COLORS.primary} />
            <Text style={styles.statValue}>{lifetime.totalServices}</Text>
            <Text style={styles.statLabel}>serviços</Text>
          </View>
          <View style={styles.statCard}>
            <MaterialCommunityIcons name="cart-outline" size={20} color={ACCENTS.purple} />
            <Text style={styles.statValue}>{formatCurrency(lifetime.avgTicket)}</Text>
            <Text style={styles.statLabel}>ticket médio</Text>
          </View>
          <View style={styles.statCard}>
            <MaterialCommunityIcons name="star" size={20} color={COLORS.warning} />
            <Text style={styles.statValue}>{lifetime.avgNps.toFixed(1)}</Text>
            <Text style={styles.statLabel}>NPS médio</Text>
          </View>
        </View>

        <View style={styles.relationshipDates}>
          <View style={styles.dateRow}>
            <Text style={styles.dateLabel}>Primeiro atendimento</Text>
            <Text style={styles.dateValue}>{formatDateBR(lifetime.firstServiceAt)}</Text>
          </View>
          <View style={styles.dateRow}>
            <Text style={styles.dateLabel}>Último atendimento</Text>
            <Text style={styles.dateValue}>{formatDateBR(lifetime.lastServiceAt)}</Text>
          </View>
        </View>

        {/* Active appointments */}
        {activeAppointments.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Agendamentos ativos</Text>
            {activeAppointments.map((a) => (
              <ActiveAppointmentCard key={a.id} appointment={a} />
            ))}
          </>
        )}

        {/* Vehicles */}
        <Text style={styles.sectionTitle}>Veículos ({vehicles.length})</Text>
        {vehicles.map((v) => (
          <View key={v.id} style={styles.vehicleCard}>
            <View style={styles.vehicleIcon}>
              <MaterialCommunityIcons name="car-sports" size={24} color={COLORS.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.vehicleName}>
                Ford {v.model} <Text style={styles.vehicleYear}>{v.year}</Text>
              </Text>
              <Text style={styles.vehicleSub}>
                {v.plate} · {(v.currentKm / 1000).toFixed(0)}k km
              </Text>
              <View style={styles.warrantyRow}>
                <View
                  style={[
                    styles.warrantyDot,
                    { backgroundColor: WARRANTY_COLOR[v.warrantyStatus] },
                  ]}
                />
                <Text
                  style={[
                    styles.warrantyText,
                    { color: WARRANTY_COLOR[v.warrantyStatus] },
                  ]}
                >
                  {WARRANTY_LABEL[v.warrantyStatus]}
                </Text>
              </View>
            </View>
          </View>
        ))}

        {/* Recent services */}
        <Text style={styles.sectionTitle}>Serviços recentes</Text>
        {recentServices.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Nenhum serviço registrado.</Text>
          </View>
        ) : (
          recentServices.map((s) => (
            <View key={s.id} style={styles.serviceRow}>
              <View style={styles.serviceIcon}>
                <MaterialCommunityIcons name="wrench" size={16} color={COLORS.white} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.serviceTitle}>{SERVICE_LABEL[s.serviceType]}</Text>
                <Text style={styles.serviceSub} numberOfLines={1}>
                  {s.dealership} · {formatDateBR(s.performedAt)}
                </Text>
              </View>
              <Text style={styles.serviceAmount}>
                {s.totalAmount > 0 ? formatCurrency(s.totalAmount) : 'Garantia'}
              </Text>
            </View>
          ))
        )}

        {/* Timeline */}
        <Text style={styles.sectionTitle}>Linha do tempo</Text>
        {timelineQuery.isLoading && (
          <View style={{ paddingVertical: 12, alignItems: 'center' }}>
            <ActivityIndicator color={COLORS.primary} size="small" />
          </View>
        )}

        {!timelineQuery.isLoading && (timelineQuery.data ?? []).length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Sem eventos registrados.</Text>
          </View>
        )}

        {(timelineQuery.data ?? []).map((event, i, arr) => (
          <View key={event.id} style={styles.timelineRow}>
            <View style={styles.timelineDotCol}>
              <View
                style={[
                  styles.timelineDot,
                  { backgroundColor: TIMELINE_COLOR[event.type] },
                ]}
              >
                <MaterialCommunityIcons
                  name={TIMELINE_ICON[event.type]}
                  size={12}
                  color={COLORS.white}
                />
              </View>
              {i < arr.length - 1 && <View style={styles.timelineLine} />}
            </View>
            <View style={styles.timelineCard}>
              <View style={styles.timelineHead}>
                <Text style={styles.timelineTitle}>{event.title}</Text>
                <Text style={styles.timelineDate}>{formatDateBR(event.occurredAt)}</Text>
              </View>
              {event.description && (
                <Text style={styles.timelineDesc}>{event.description}</Text>
              )}
            </View>
          </View>
        ))}

        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}

const STATUS_LABEL: Record<AppointmentStatus, string> = {
  SCHEDULED: 'Aguardando chegada',
  CHECKED_IN: 'Em atendimento',
  COMPLETED: 'Concluído',
  CANCELED: 'Cancelado',
  NO_SHOW: 'Não compareceu',
};

function ActiveAppointmentCard({ appointment }: { appointment: AppointmentSummary }) {
  const checkInMutation = useCheckInAppointment();
  const completeMutation = useCompleteAppointment();

  const canCheckIn = appointment.status === 'SCHEDULED';
  const canComplete = appointment.status === 'CHECKED_IN';
  const busy = checkInMutation.isPending || completeMutation.isPending;

  async function handleCheckIn() {
    try {
      await checkInMutation.mutateAsync(appointment.id);
    } catch (e) {
      const message =
        e instanceof ApiError ? e.problem.detail || e.problem.title : 'Falha ao registrar chegada.';
      Alert.alert('Erro', message);
    }
  }

  function handleComplete() {
    Alert.alert(
      'Concluir atendimento',
      'Confirmar que o serviço foi finalizado?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Concluir',
          onPress: async () => {
            try {
              await completeMutation.mutateAsync({ id: appointment.id });
            } catch (e) {
              const message =
                e instanceof ApiError
                  ? e.problem.detail || e.problem.title
                  : 'Falha ao concluir.';
              Alert.alert('Erro', message);
            }
          },
        },
      ]
    );
  }

  return (
    <View style={styles.apptCard}>
      <View style={styles.apptCardHead}>
        <View style={[styles.apptIcon, { backgroundColor: COLORS.primaryTintStrong }]}>
          <MaterialCommunityIcons name="calendar-check" size={20} color={COLORS.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.apptTitle}>
            {SERVICE_LABEL[appointment.serviceType]} · {appointment.vehicle.model}
          </Text>
          <Text style={styles.apptSub}>
            {appointment.dealership.name} · {formatDateBR(appointment.scheduledAt)}
          </Text>
        </View>
        <View style={styles.apptStatus}>
          <Text style={styles.apptStatusText}>{STATUS_LABEL[appointment.status]}</Text>
        </View>
      </View>

      {(canCheckIn || canComplete) && (
        <View style={styles.apptActions}>
          {canCheckIn && (
            <TouchableOpacity
              style={[styles.apptActionPrimary, busy && { opacity: 0.6 }]}
              onPress={handleCheckIn}
              disabled={busy}
              activeOpacity={0.85}
            >
              {checkInMutation.isPending ? (
                <ActivityIndicator color={COLORS.white} size="small" />
              ) : (
                <>
                  <MaterialCommunityIcons name="account-arrow-right" size={16} color={COLORS.white} />
                  <Text style={styles.apptActionPrimaryText}>Registrar chegada</Text>
                </>
              )}
            </TouchableOpacity>
          )}
          {canComplete && (
            <TouchableOpacity
              style={[styles.apptActionPrimary, busy && { opacity: 0.6 }]}
              onPress={handleComplete}
              disabled={busy}
              activeOpacity={0.85}
            >
              {completeMutation.isPending ? (
                <ActivityIndicator color={COLORS.white} size="small" />
              ) : (
                <>
                  <MaterialCommunityIcons name="check-circle" size={16} color={COLORS.white} />
                  <Text style={styles.apptActionPrimaryText}>Concluir atendimento</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.primary },

  splash: {
    flex: 1,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    padding: 24,
  },
  splashText: { color: COLORS.white, fontSize: 14, fontWeight: '600', textAlign: 'center' },
  splashBtn: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 8,
  },
  splashBtnText: { color: COLORS.primary, fontWeight: '800' },

  /* Hero */
  hero: {
    backgroundColor: COLORS.primary,
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 60,
    overflow: 'hidden',
  },
  heroBlob1: {
    position: 'absolute',
    top: -60,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  heroBlob2: {
    position: 'absolute',
    bottom: -30,
    left: -30,
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroTitle: { color: COLORS.white, fontSize: 18, fontWeight: '800' },

  profileCard: { alignItems: 'center' },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarText: { color: COLORS.primary, fontWeight: '800', fontSize: 26 },
  customerName: { color: COLORS.white, fontSize: 20, fontWeight: '800' },
  customerCpf: { color: 'rgba(255,255,255,0.75)', fontSize: 12, marginTop: 2 },
  segmentRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 },
  segmentBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  segmentText: { fontSize: 11, fontWeight: '800' },
  scorePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  scoreText: { color: COLORS.white, fontSize: 11, fontWeight: '700' },

  /* Scroll */
  scrollArea: {
    flex: 1,
    backgroundColor: COLORS.background,
    marginTop: -30,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  scrollContent: { padding: 16, paddingTop: 22 },

  /* Contact */
  contactRow: { flexDirection: 'row', gap: 8, marginBottom: 18 },
  contactBtnPrimary: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 11,
    borderRadius: 12,
    gap: 6,
  },
  contactBtnPrimaryText: { color: COLORS.white, fontWeight: '800', fontSize: 13 },
  contactBtn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingVertical: 11,
    borderRadius: 12,
    gap: 6,
    borderWidth: 1.5,
    borderColor: COLORS.surfaceAlt,
  },
  contactBtnText: { color: COLORS.primary, fontWeight: '800', fontSize: 13 },

  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.dark,
    marginTop: 12,
    marginBottom: 10,
  },

  /* Stats */
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  statCard: {
    width: '48.5%',
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 14,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  statValue: { fontSize: 18, fontWeight: '800', color: COLORS.dark, marginTop: 8 },
  statLabel: { fontSize: 11, color: COLORS.gray, marginTop: 2 },

  relationshipDates: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 14,
    marginTop: 8,
    gap: 8,
  },
  dateRow: { flexDirection: 'row', justifyContent: 'space-between' },
  dateLabel: { fontSize: 12, color: COLORS.gray },
  dateValue: { fontSize: 12, color: COLORS.dark, fontWeight: '700' },

  /* Appointment */
  apptCard: {
    backgroundColor: COLORS.white,
    padding: 12,
    borderRadius: 14,
    marginBottom: 8,
  },
  apptCardHead: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  apptActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  apptActionPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  apptActionPrimaryText: {
    color: COLORS.white,
    fontWeight: '800',
    fontSize: 13,
  },
  apptIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  apptTitle: { fontSize: 14, fontWeight: '700', color: COLORS.dark },
  apptSub: { fontSize: 11, color: COLORS.gray, marginTop: 2 },
  apptStatus: {
    backgroundColor: COLORS.primaryTintStrong,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  apptStatusText: { fontSize: 9, fontWeight: '800', color: COLORS.primary, letterSpacing: 0.3 },

  /* Vehicle */
  vehicleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 12,
    borderRadius: 14,
    marginBottom: 8,
  },
  vehicleIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.primaryTint,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  vehicleName: { fontSize: 14, fontWeight: '800', color: COLORS.dark },
  vehicleYear: { fontSize: 12, fontWeight: '500', color: COLORS.gray },
  vehicleSub: { fontSize: 12, color: COLORS.gray, marginTop: 2 },
  warrantyRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  warrantyDot: { width: 6, height: 6, borderRadius: 3 },
  warrantyText: { fontSize: 11, fontWeight: '700' },

  /* Services */
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 12,
    borderRadius: 14,
    marginBottom: 8,
  },
  serviceIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  serviceTitle: { fontSize: 13, fontWeight: '700', color: COLORS.dark },
  serviceSub: { fontSize: 11, color: COLORS.gray, marginTop: 2 },
  serviceAmount: { fontSize: 12, fontWeight: '800', color: COLORS.success },

  /* Timeline */
  timelineRow: { flexDirection: 'row', marginBottom: 4 },
  timelineDotCol: { width: 28, alignItems: 'center' },
  timelineDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  timelineLine: { flex: 1, width: 2, backgroundColor: COLORS.border, marginVertical: 4 },
  timelineCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    marginLeft: 6,
  },
  timelineHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  timelineTitle: { fontSize: 13, fontWeight: '700', color: COLORS.dark, flex: 1, marginRight: 8 },
  timelineDate: { fontSize: 10, color: COLORS.gray, fontWeight: '600' },
  timelineDesc: { fontSize: 11, color: COLORS.gray, marginTop: 4, lineHeight: 15 },

  /* Empty */
  empty: { backgroundColor: COLORS.white, padding: 16, borderRadius: 14, alignItems: 'center' },
  emptyText: { fontSize: 12, color: COLORS.gray },
});
