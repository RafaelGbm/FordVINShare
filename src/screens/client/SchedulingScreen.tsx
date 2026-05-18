import React, { useMemo, useState } from 'react';
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
import { router } from 'expo-router';

import { COLORS } from '../../constants';
import { useMyVehicles } from '../../hooks/useVehicles';
import { useDealerships, useDealershipAvailability } from '../../hooks/useDealerships';
import {
  useServiceTypes,
  useCreateAppointment,
} from '../../hooks/useAppointments';
import { ServiceType } from '../../services/services.service';
import { ApiError } from '../../services/api';

type Step = 1 | 2 | 3;

const SERVICE_META: Record<ServiceType, { icon: string; desc: string; time: string }> = {
  REVIEW: { icon: 'wrench', desc: 'Inspeção programada Ford', time: '~ 2h' },
  OIL_CHANGE: { icon: 'oil', desc: 'Óleo + filtros originais', time: '~ 1h' },
  WARRANTY: { icon: 'shield-check', desc: 'Atendimento em garantia', time: '~ 1h30' },
  REPAIR: { icon: 'cog', desc: 'Diagnóstico e reparo', time: 'A definir' },
};

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

function buildNextDays(count: number) {
  const out = [];
  const today = new Date();
  for (let i = 1; i <= count; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    out.push({
      iso: d.toISOString().slice(0, 10), // YYYY-MM-DD
      day: String(d.getDate()).padStart(2, '0'),
      weekday: WEEKDAYS[d.getDay()],
      month: MONTHS[d.getMonth()],
    });
  }
  return out;
}

// User's coords placeholder (same as LocatorScreen). Replace with expo-location later.
const USER_COORDS = { lat: -23.55, lng: -46.63 };

export default function SchedulingScreen() {
  const [step, setStep] = useState<Step>(1);
  const [service, setService] = useState<ServiceType | null>(null);
  const [dealer, setDealer] = useState<string | null>(null);
  const [date, setDate] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);

  const DATES = useMemo(() => buildNextDays(7), []);

  const vehiclesQuery = useMyVehicles();
  const vehicle = vehiclesQuery.data?.[0];

  const serviceTypesQuery = useServiceTypes();
  const dealershipsQuery = useDealerships({
    lat: USER_COORDS.lat,
    lng: USER_COORDS.lng,
    radiusKm: 20,
    service: service ?? undefined,
  });
  const availabilityQuery = useDealershipAvailability(
    dealer ?? undefined,
    service ?? undefined,
    date ?? undefined
  );

  const createMutation = useCreateAppointment();

  const canContinue =
    (step === 1 && !!service) ||
    (step === 2 && !!dealer) ||
    (step === 3 && !!date && !!time && !createMutation.isPending);

  const handleNext = () => {
    if (step < 3) {
      setStep((step + 1) as Step);
      return;
    }
    handleConfirm();
  };

  const handleConfirm = async () => {
    if (!vehicle || !dealer || !service || !date || !time) return;

    const scheduledAt = `${date}T${time}:00-03:00`;

    try {
      await createMutation.mutateAsync({
        vehicleId: vehicle.id,
        dealershipId: dealer,
        serviceTypeId: service,
        scheduledAt,
      });
      Alert.alert(
        'Agendamento confirmado',
        'Você receberá uma notificação com os detalhes.',
        [{ text: 'OK', onPress: () => router.replace('/(client)/home') }]
      );
    } catch (e) {
      const message =
        e instanceof ApiError
          ? e.problem.status === 409
            ? 'Esse horário já foi reservado. Escolha outro.'
            : e.problem.detail || e.problem.title
          : 'Não foi possível confirmar o agendamento.';
      Alert.alert('Erro', message);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep((step - 1) as Step);
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      {/* Hero */}
      <View style={styles.hero}>
        <View style={styles.heroBlob} />
        <View style={styles.heroTop}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={handleBack}
            disabled={step === 1}
          >
            <MaterialCommunityIcons
              name="chevron-left"
              size={26}
              color={step === 1 ? 'rgba(255,255,255,0.4)' : '#fff'}
            />
          </TouchableOpacity>
          <Text style={styles.heroTitle}>Agendar Serviço</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Stepper */}
        <View style={styles.stepper}>
          {[1, 2, 3].map((s) => (
            <View key={s} style={styles.stepWrap}>
              <View
                style={[
                  styles.stepDot,
                  step >= s && styles.stepDotActive,
                  step === s && styles.stepDotCurrent,
                ]}
              >
                {step > s ? (
                  <MaterialCommunityIcons name="check" size={14} color={COLORS.primary} />
                ) : (
                  <Text style={[styles.stepNum, step >= s && styles.stepNumActive]}>{s}</Text>
                )}
              </View>
              {s < 3 && <View style={[styles.stepLine, step > s && styles.stepLineActive]} />}
            </View>
          ))}
        </View>

        <View style={styles.stepLabels}>
          <Text style={[styles.stepLabel, step === 1 && styles.stepLabelActive]}>Serviço</Text>
          <Text style={[styles.stepLabel, step === 2 && styles.stepLabelActive]}>Local</Text>
          <Text style={[styles.stepLabel, step === 3 && styles.stepLabelActive]}>Data</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* STEP 1 — Service */}
        {step === 1 && (
          <View>
            <Text style={styles.sectionTitle}>Qual serviço você precisa?</Text>
            <Text style={styles.sectionSub}>Escolha o tipo de atendimento</Text>

            {serviceTypesQuery.isLoading && (
              <View style={{ paddingVertical: 32, alignItems: 'center' }}>
                <ActivityIndicator color={COLORS.primary} />
              </View>
            )}

            {(serviceTypesQuery.data ?? []).map((s) => {
              const meta = SERVICE_META[s.id];
              const isFree = s.freeWithWarranty && vehicle?.warrantyStatus === 'ACTIVE';
              const active = service === s.id;
              return (
                <TouchableOpacity
                  key={s.id}
                  style={[styles.serviceCard, active && styles.serviceCardActive]}
                  onPress={() => setService(s.id)}
                  activeOpacity={0.85}
                >
                  <View
                    style={[
                      styles.serviceIcon,
                      active && { backgroundColor: COLORS.primary },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={meta.icon as any}
                      size={26}
                      color={active ? '#fff' : COLORS.primary}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={styles.serviceHead}>
                      <Text style={styles.serviceName}>{s.label}</Text>
                      {isFree && (
                        <View style={[styles.tag, { backgroundColor: COLORS.success }]}>
                          <Text style={styles.tagText}>GRATUITA</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.serviceDesc}>{meta.desc}</Text>
                    <View style={styles.serviceMeta}>
                      <MaterialCommunityIcons name="clock-outline" size={12} color={COLORS.gray} />
                      <Text style={styles.serviceMetaText}>{meta.time}</Text>
                    </View>
                  </View>
                  <MaterialCommunityIcons
                    name={active ? 'radiobox-marked' : 'radiobox-blank'}
                    size={22}
                    color={active ? COLORS.primary : COLORS.border}
                  />
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* STEP 2 — Dealer */}
        {step === 2 && (
          <View>
            <Text style={styles.sectionTitle}>Onde deseja ser atendido?</Text>
            <Text style={styles.sectionSub}>Concessionárias próximas a você</Text>

            <View style={styles.mapPreview}>
              <MaterialCommunityIcons name="map-outline" size={32} color={COLORS.primary} />
              <Text style={styles.mapPreviewText}>Ver no mapa</Text>
              <MaterialCommunityIcons name="chevron-right" size={20} color={COLORS.primary} />
            </View>

            {dealershipsQuery.isLoading && (
              <View style={{ paddingVertical: 32, alignItems: 'center' }}>
                <ActivityIndicator color={COLORS.primary} />
              </View>
            )}

            {!dealershipsQuery.isLoading && (dealershipsQuery.data ?? []).length === 0 && (
              <View style={[styles.dealerCard, { alignItems: 'center', padding: 20 }]}>
                <Text style={{ color: COLORS.gray, fontSize: 13 }}>
                  Nenhuma concessionária disponível para esse serviço.
                </Text>
              </View>
            )}

            {(dealershipsQuery.data ?? []).map((d) => {
              const active = dealer === d.id;
              return (
                <TouchableOpacity
                  key={d.id}
                  style={[styles.dealerCard, active && styles.dealerCardActive]}
                  onPress={() => setDealer(d.id)}
                  activeOpacity={0.85}
                >
                  <View style={styles.dealerLeft}>
                    <View style={styles.dealerIconBg}>
                      <MaterialCommunityIcons name="store" size={22} color={COLORS.primary} />
                    </View>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.dealerName}>{d.name}</Text>
                    <Text style={styles.dealerAddr}>{d.address}</Text>
                    <View style={styles.dealerMeta}>
                      <View style={styles.dealerMetaItem}>
                        <MaterialCommunityIcons name="map-marker" size={12} color={COLORS.gray} />
                        <Text style={styles.dealerMetaText}>{d.distanceKm.toFixed(1)} km</Text>
                      </View>
                      <View style={styles.dealerMetaItem}>
                        <MaterialCommunityIcons name="clock-outline" size={12} color={COLORS.gray} />
                        <Text style={styles.dealerMetaText} numberOfLines={1}>
                          {d.openingHours}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <MaterialCommunityIcons
                    name={active ? 'radiobox-marked' : 'radiobox-blank'}
                    size={22}
                    color={active ? COLORS.primary : COLORS.border}
                  />
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* STEP 3 — Date & Time */}
        {step === 3 && (
          <View>
            <Text style={styles.sectionTitle}>Quando você quer ir?</Text>
            <Text style={styles.sectionSub}>Selecione data e horário</Text>

            <Text style={styles.minorLabel}>DATA</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateScroll}>
              {DATES.map((d) => {
                const selected = date === d.iso;
                return (
                  <TouchableOpacity
                    key={d.iso}
                    style={[styles.dateCard, selected && styles.dateCardActive]}
                    onPress={() => {
                      setDate(d.iso);
                      setTime(null);
                    }}
                    activeOpacity={0.85}
                  >
                    <Text style={[styles.dateWeekday, selected && styles.dateWeekdayActive]}>
                      {d.weekday}
                    </Text>
                    <Text style={[styles.dateDay, selected && styles.dateDayActive]}>{d.day}</Text>
                    <Text style={[styles.dateMonth, selected && styles.dateMonthActive]}>
                      {d.month}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <Text style={[styles.minorLabel, { marginTop: 18 }]}>HORÁRIO</Text>

            {!date && (
              <Text style={{ color: COLORS.gray, fontSize: 12, paddingVertical: 8 }}>
                Selecione uma data para ver os horários disponíveis.
              </Text>
            )}

            {date && availabilityQuery.isLoading && (
              <View style={{ paddingVertical: 16, alignItems: 'center' }}>
                <ActivityIndicator color={COLORS.primary} size="small" />
              </View>
            )}

            {date && !availabilityQuery.isLoading && (availabilityQuery.data?.slots ?? []).length === 0 && (
              <Text style={{ color: COLORS.gray, fontSize: 12, paddingVertical: 8 }}>
                Sem horários disponíveis nessa data.
              </Text>
            )}

            {date && !availabilityQuery.isLoading && (
              <View style={styles.timeGrid}>
                {(availabilityQuery.data?.slots ?? []).map((slot) => {
                  const selected = time === slot.time;
                  return (
                    <TouchableOpacity
                      key={slot.time}
                      style={[
                        styles.timeChip,
                        selected && styles.timeChipActive,
                        !slot.available && { opacity: 0.4 },
                      ]}
                      onPress={() => slot.available && setTime(slot.time)}
                      disabled={!slot.available}
                      activeOpacity={0.85}
                    >
                      <Text style={[styles.timeChipText, selected && styles.timeChipTextActive]}>
                        {slot.time}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            {/* Summary */}
            {service && dealer && date && time && (
              <View style={styles.summary}>
                <Text style={styles.summaryTitle}>Resumo do agendamento</Text>
                <SummaryRow
                  icon="wrench"
                  label="Serviço"
                  value={serviceTypesQuery.data?.find((s) => s.id === service)?.label || ''}
                />
                <SummaryRow
                  icon="store"
                  label="Local"
                  value={dealershipsQuery.data?.find((d) => d.id === dealer)?.name || ''}
                />
                <SummaryRow
                  icon="calendar"
                  label="Data"
                  value={`${new Date(date).toLocaleDateString('pt-BR')} às ${time}`}
                />
              </View>
            )}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Footer fixed CTA */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.cta, !canContinue && styles.ctaDisabled]}
          onPress={handleNext}
          disabled={!canContinue}
          activeOpacity={0.85}
        >
          {createMutation.isPending ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Text style={styles.ctaText}>
                {step === 3 ? 'Confirmar agendamento' : 'Continuar'}
              </Text>
              <MaterialCommunityIcons
                name={step === 3 ? 'check-circle' : 'arrow-right'}
                size={20}
                color="#fff"
              />
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

function SummaryRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.summaryRow}>
      <View style={styles.summaryIcon}>
        <MaterialCommunityIcons name={icon as any} size={16} color={COLORS.primary} />
      </View>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.primary },

  /* Hero */
  hero: {
    backgroundColor: COLORS.primary,
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 40,
    overflow: 'hidden',
  },
  heroBlob: {
    position: 'absolute',
    top: -70,
    right: -50,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },

  /* Stepper */
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 30,
    marginBottom: 8,
  },
  stepWrap: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  stepDot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepDotActive: { backgroundColor: '#fff' },
  stepDotCurrent: {
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.4)',
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  stepNum: { color: '#fff', fontSize: 12, fontWeight: '800' },
  stepNumActive: { color: COLORS.primary },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: 4,
  },
  stepLineActive: { backgroundColor: '#fff' },
  stepLabels: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 4,
  },
  stepLabel: {
    flex: 1,
    textAlign: 'center',
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    fontWeight: '700',
  },
  stepLabelActive: { color: '#fff' },

  /* Scroll */
  scrollArea: {
    flex: 1,
    backgroundColor: '#f5f5f7',
    marginTop: -20,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  scrollContent: { padding: 20, paddingTop: 24 },

  sectionTitle: { fontSize: 22, fontWeight: '800', color: COLORS.dark, marginBottom: 4 },
  sectionSub: { fontSize: 13, color: COLORS.gray, marginBottom: 20 },
  minorLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.gray,
    letterSpacing: 1.5,
    marginBottom: 10,
  },

  /* Service Card */
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: '#eef0f3',
  },
  serviceCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#f6faff',
  },
  serviceIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#f0f5ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  serviceHead: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  serviceName: { fontSize: 15, fontWeight: '800', color: COLORS.dark },
  serviceDesc: { fontSize: 12, color: COLORS.gray, marginBottom: 6 },
  serviceMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  serviceMetaText: { fontSize: 11, color: COLORS.gray, fontWeight: '600' },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  tagText: { fontSize: 9, color: '#fff', fontWeight: '800', letterSpacing: 0.5 },

  /* Dealer */
  mapPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f5ff',
    padding: 14,
    borderRadius: 14,
    marginBottom: 14,
    gap: 10,
  },
  mapPreviewText: {
    flex: 1,
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 13,
  },
  dealerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: '#eef0f3',
  },
  dealerCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#f6faff',
  },
  dealerLeft: { marginRight: 12 },
  dealerIconBg: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#f0f5ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dealerName: { fontSize: 15, fontWeight: '800', color: COLORS.dark },
  dealerAddr: { fontSize: 12, color: COLORS.gray, marginTop: 2 },
  dealerMeta: { flexDirection: 'row', gap: 12, marginTop: 8 },
  dealerMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  dealerMetaText: { fontSize: 11, color: COLORS.gray, fontWeight: '600' },

  /* Date */
  dateScroll: { marginHorizontal: -20 },
  dateCard: {
    width: 70,
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderRadius: 14,
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 1.5,
    borderColor: '#eef0f3',
  },
  dateCardActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  dateWeekday: { fontSize: 11, color: COLORS.gray, fontWeight: '700' },
  dateWeekdayActive: { color: 'rgba(255,255,255,0.8)' },
  dateDay: { fontSize: 22, color: COLORS.dark, fontWeight: '800', marginTop: 2 },
  dateDayActive: { color: '#fff' },
  dateMonth: { fontSize: 10, color: COLORS.gray, fontWeight: '700', marginTop: 2 },
  dateMonthActive: { color: 'rgba(255,255,255,0.8)' },

  /* Time */
  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  timeChip: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#eef0f3',
  },
  timeChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  timeChipText: { color: COLORS.dark, fontWeight: '700', fontSize: 13 },
  timeChipTextActive: { color: '#fff' },

  /* Summary */
  summary: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginTop: 20,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  summaryTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  summaryRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  summaryIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#f0f5ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  summaryLabel: { fontSize: 12, color: COLORS.gray, width: 60 },
  summaryValue: { fontSize: 13, color: COLORS.dark, fontWeight: '700', flex: 1 },

  /* Footer */
  footer: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 28,
    borderTopWidth: 1,
    borderTopColor: '#eef0f3',
  },
  cta: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  ctaDisabled: {
    backgroundColor: '#c5cdd9',
    shadowOpacity: 0,
  },
  ctaText: { color: '#fff', fontSize: 15, fontWeight: '800', letterSpacing: 0.3 },
});
