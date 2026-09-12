import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { COLORS } from '../../constants';
import { StateBox } from '../../components/StateBox';
import {
  useCancelAppointment,
  useMyAppointments,
} from '../../hooks/useAppointments';
import {
  AppointmentStatus,
} from '../../services/appointments.service';
import { ServiceType } from '../../services/services.service';
import { ApiError } from '../../services/api';
import type { IconName } from '../../types';

type FilterId = 'all' | 'upcoming' | 'history' | 'canceled';

const FILTERS: { id: FilterId; label: string }[] = [
  { id: 'upcoming', label: 'Próximos' },
  { id: 'history', label: 'Histórico' },
  { id: 'canceled', label: 'Cancelados' },
  { id: 'all', label: 'Todos' },
];

const STATUS_META: Record<
  AppointmentStatus,
  { label: string; color: string; bg: string }
> = {
  SCHEDULED: { label: 'Agendado', color: COLORS.primary, bg: COLORS.primaryTintStrong },
  CHECKED_IN: { label: 'Em atendimento', color: COLORS.warningText, bg: COLORS.warningTint },
  COMPLETED: { label: 'Concluído', color: COLORS.success, bg: COLORS.successTint },
  CANCELED: { label: 'Cancelado', color: COLORS.danger, bg: COLORS.dangerTint },
  NO_SHOW: { label: 'Não compareceu', color: COLORS.danger, bg: COLORS.dangerTint },
};

const SERVICE_LABEL: Record<ServiceType, string> = {
  REVIEW: 'Revisão',
  OIL_CHANGE: 'Troca de óleo',
  WARRANTY: 'Atendimento em garantia',
  REPAIR: 'Reparo',
};

const SERVICE_ICON: Record<ServiceType, IconName> = {
  REVIEW: 'wrench',
  OIL_CHANGE: 'oil',
  WARRANTY: 'shield-check',
  REPAIR: 'cog',
};

function formatDateBR(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatTimeBR(iso: string) {
  return new Date(iso).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function matchesFilter(status: AppointmentStatus, filter: FilterId) {
  if (filter === 'all') return true;
  if (filter === 'upcoming') return status === 'SCHEDULED' || status === 'CHECKED_IN';
  if (filter === 'history') return status === 'COMPLETED';
  return status === 'CANCELED' || status === 'NO_SHOW';
}

export default function AppointmentsScreen() {
  const [filter, setFilter] = useState<FilterId>('upcoming');
  const { data, isLoading, error, refetch } = useMyAppointments();
  const cancelMutation = useCancelAppointment();

  const appointments = useMemo(() => data ?? [], [data]);
  const visible = useMemo(
    () => appointments.filter((a) => matchesFilter(a.status, filter)),
    [appointments, filter]
  );

  function handleCancel(id: string) {
    Alert.alert(
      'Cancelar agendamento',
      'Tem certeza que deseja cancelar? Você pode reagendar a qualquer momento.',
      [
        { text: 'Manter', style: 'cancel' },
        {
          text: 'Cancelar agendamento',
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelMutation.mutateAsync(id);
            } catch (e) {
              const message =
                e instanceof ApiError
                  ? e.problem.detail || e.problem.title
                  : 'Não foi possível cancelar.';
              Alert.alert('Erro', message);
            }
          },
        },
      ]
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      {/* Hero */}
      <View style={styles.hero}>
        <View style={styles.heroBlob} />

        <View style={styles.heroTop}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
            <MaterialCommunityIcons name="chevron-left" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.heroTitle}>Meus agendamentos</Text>
          <View style={{ width: 40 }} />
        </View>

        <Text style={styles.heroSub}>Acompanhe próximos atendimentos e histórico</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filters}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
      >
        {FILTERS.map((f) => {
          const active = filter === f.id;
          return (
            <TouchableOpacity
              key={f.id}
              style={[styles.filterChip, active && styles.filterChipActive]}
              onPress={() => setFilter(f.id)}
              activeOpacity={0.85}
            >
              <Text style={[styles.filterText, active && styles.filterTextActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {isLoading && <StateBox variant="loading" message="Carregando agendamentos..." />}

        {error && !isLoading && (
          <StateBox
            variant="error"
            title="Falha ao carregar"
            message={
              error instanceof ApiError
                ? error.problem.detail || error.problem.title
                : 'Tente novamente em instantes'
            }
            onRetry={() => refetch()}
          />
        )}

        {!isLoading && !error && visible.length === 0 && (
          <StateBox
            variant="empty"
            iconName="calendar-blank-outline"
            title="Sem agendamentos"
            message="Você ainda não tem agendamentos nessa categoria."
          />
        )}

        {!isLoading && !error && visible.map((a) => {
          const meta = STATUS_META[a.status];
          const canCancel = a.status === 'SCHEDULED';
          return (
            <View key={a.id} style={styles.card}>
              <View style={styles.cardHead}>
                <View style={[styles.serviceIcon, { backgroundColor: COLORS.primaryTintStrong }]}>
                  <MaterialCommunityIcons
                    name={SERVICE_ICON[a.serviceType]}
                    size={22}
                    color={COLORS.primary}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.serviceName}>{SERVICE_LABEL[a.serviceType]}</Text>
                  <Text style={styles.vehicleName}>{a.vehicle.model}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: meta.bg }]}>
                  <Text style={[styles.statusText, { color: meta.color }]}>{meta.label}</Text>
                </View>
              </View>

              <View style={styles.cardDetails}>
                <View style={styles.detailRow}>
                  <MaterialCommunityIcons name="calendar" size={14} color={COLORS.gray} />
                  <Text style={styles.detailText}>
                    {formatDateBR(a.scheduledAt)} às {formatTimeBR(a.scheduledAt)}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <MaterialCommunityIcons name="store" size={14} color={COLORS.gray} />
                  <Text style={styles.detailText} numberOfLines={1}>
                    {a.dealership.name}
                  </Text>
                </View>
              </View>

              {canCancel && (
                <TouchableOpacity
                  style={[
                    styles.cancelBtn,
                    cancelMutation.isPending && { opacity: 0.5 },
                  ]}
                  onPress={() => handleCancel(a.id)}
                  disabled={cancelMutation.isPending}
                  activeOpacity={0.85}
                >
                  <MaterialCommunityIcons name="close-circle-outline" size={16} color={COLORS.danger} />
                  <Text style={styles.cancelBtnText}>Cancelar agendamento</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })}

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.primary },

  hero: {
    backgroundColor: COLORS.primary,
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 24,
    overflow: 'hidden',
  },
  heroBlob: {
    position: 'absolute',
    top: -50,
    right: -40,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
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
  heroSub: { color: 'rgba(255,255,255,0.85)', fontSize: 12 },

  filters: {
    backgroundColor: COLORS.primary,
    paddingBottom: 16,
    maxHeight: 56,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 18,
  },
  filterChipActive: { backgroundColor: COLORS.white },
  filterText: { fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.85)' },
  filterTextActive: { color: COLORS.primary },

  scrollArea: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  scrollContent: { padding: 16, paddingTop: 22 },

  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHead: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  serviceIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  serviceName: { fontSize: 14, fontWeight: '800', color: COLORS.dark },
  vehicleName: { fontSize: 12, color: COLORS.gray, marginTop: 2 },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.3 },

  cardDetails: { gap: 6 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  detailText: { fontSize: 12, color: COLORS.dark, flex: 1 },

  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    marginTop: 12,
    borderRadius: 10,
    backgroundColor: COLORS.dangerTint,
    gap: 6,
  },
  cancelBtnText: { color: COLORS.danger, fontWeight: '800', fontSize: 13 },
});
