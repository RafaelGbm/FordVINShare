import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { COLORS } from '../../constants';

type Step = 1 | 2 | 3;

const SERVICES = [
  { id: 'revision', name: 'Revisão Programada', desc: 'Inspeção dos 40.000 km', icon: 'wrench', tag: 'GRATUITA', tagColor: COLORS.success, time: '~ 2h' },
  { id: 'oil', name: 'Troca de Óleo', desc: 'Óleo + filtros originais', icon: 'oil', tag: null, time: '~ 1h' },
  { id: 'tire', name: 'Pneus & Alinhamento', desc: 'Revisão e balanceamento', icon: 'tire', tag: null, time: '~ 1h30' },
  { id: 'diag', name: 'Diagnóstico Eletrônico', desc: 'Scanner Ford IDS oficial', icon: 'cog', tag: 'PREMIUM', tagColor: '#f5a623', time: '~ 45 min' },
];

const DEALERS = [
  { id: 'sp1', name: 'Ford SP Centro', addr: 'Av. Paulista, 1500', distance: '2.3 km', rating: 4.8, slots: 4 },
  { id: 'sp2', name: 'Ford Tatuapé', addr: 'R. Tuiuti, 850', distance: '5.7 km', rating: 4.6, slots: 7 },
  { id: 'sp3', name: 'Ford Morumbi', addr: 'Av. Giovanni Gronchi, 220', distance: '8.1 km', rating: 4.9, slots: 2 },
];

const DATES = [
  { day: '14', weekday: 'Qui', month: 'Mai' },
  { day: '15', weekday: 'Sex', month: 'Mai' },
  { day: '16', weekday: 'Sáb', month: 'Mai' },
  { day: '19', weekday: 'Ter', month: 'Mai' },
  { day: '20', weekday: 'Qua', month: 'Mai' },
];

const TIMES = ['08:00', '09:30', '11:00', '13:30', '15:00', '16:30'];

export default function SchedulingScreen() {
  const [step, setStep] = useState<Step>(1);
  const [service, setService] = useState<string | null>(null);
  const [dealer, setDealer] = useState<string | null>(null);
  const [date, setDate] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);

  const canContinue =
    (step === 1 && service) ||
    (step === 2 && dealer) ||
    (step === 3 && date && time);

  const handleNext = () => {
    if (step < 3) setStep((step + 1) as Step);
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

            {SERVICES.map((s) => (
              <TouchableOpacity
                key={s.id}
                style={[styles.serviceCard, service === s.id && styles.serviceCardActive]}
                onPress={() => setService(s.id)}
                activeOpacity={0.85}
              >
                <View
                  style={[
                    styles.serviceIcon,
                    service === s.id && { backgroundColor: COLORS.primary },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={s.icon as any}
                    size={26}
                    color={service === s.id ? '#fff' : COLORS.primary}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.serviceHead}>
                    <Text style={styles.serviceName}>{s.name}</Text>
                    {s.tag && (
                      <View style={[styles.tag, { backgroundColor: s.tagColor }]}>
                        <Text style={styles.tagText}>{s.tag}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.serviceDesc}>{s.desc}</Text>
                  <View style={styles.serviceMeta}>
                    <MaterialCommunityIcons name="clock-outline" size={12} color={COLORS.gray} />
                    <Text style={styles.serviceMetaText}>{s.time}</Text>
                  </View>
                </View>
                <MaterialCommunityIcons
                  name={service === s.id ? 'radiobox-marked' : 'radiobox-blank'}
                  size={22}
                  color={service === s.id ? COLORS.primary : COLORS.border}
                />
              </TouchableOpacity>
            ))}
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

            {DEALERS.map((d) => (
              <TouchableOpacity
                key={d.id}
                style={[styles.dealerCard, dealer === d.id && styles.dealerCardActive]}
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
                  <Text style={styles.dealerAddr}>{d.addr}</Text>
                  <View style={styles.dealerMeta}>
                    <View style={styles.dealerMetaItem}>
                      <MaterialCommunityIcons name="map-marker" size={12} color={COLORS.gray} />
                      <Text style={styles.dealerMetaText}>{d.distance}</Text>
                    </View>
                    <View style={styles.dealerMetaItem}>
                      <MaterialCommunityIcons name="star" size={12} color="#f5a623" />
                      <Text style={styles.dealerMetaText}>{d.rating}</Text>
                    </View>
                    <View style={styles.dealerMetaItem}>
                      <MaterialCommunityIcons name="calendar-clock" size={12} color={COLORS.success} />
                      <Text style={[styles.dealerMetaText, { color: COLORS.success }]}>
                        {d.slots} vagas
                      </Text>
                    </View>
                  </View>
                </View>
                <MaterialCommunityIcons
                  name={dealer === d.id ? 'radiobox-marked' : 'radiobox-blank'}
                  size={22}
                  color={dealer === d.id ? COLORS.primary : COLORS.border}
                />
              </TouchableOpacity>
            ))}
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
                const id = `${d.day}/${d.month}`;
                const selected = date === id;
                return (
                  <TouchableOpacity
                    key={id}
                    style={[styles.dateCard, selected && styles.dateCardActive]}
                    onPress={() => setDate(id)}
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
            <View style={styles.timeGrid}>
              {TIMES.map((t) => {
                const selected = time === t;
                return (
                  <TouchableOpacity
                    key={t}
                    style={[styles.timeChip, selected && styles.timeChipActive]}
                    onPress={() => setTime(t)}
                    activeOpacity={0.85}
                  >
                    <Text style={[styles.timeChipText, selected && styles.timeChipTextActive]}>
                      {t}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Summary */}
            {service && dealer && date && time && (
              <View style={styles.summary}>
                <Text style={styles.summaryTitle}>Resumo do agendamento</Text>
                <SummaryRow
                  icon="wrench"
                  label="Serviço"
                  value={SERVICES.find((s) => s.id === service)?.name || ''}
                />
                <SummaryRow
                  icon="store"
                  label="Local"
                  value={DEALERS.find((d) => d.id === dealer)?.name || ''}
                />
                <SummaryRow icon="calendar" label="Data" value={`${date} às ${time}`} />
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
          <Text style={styles.ctaText}>{step === 3 ? 'Confirmar agendamento' : 'Continuar'}</Text>
          <MaterialCommunityIcons
            name={step === 3 ? 'check-circle' : 'arrow-right'}
            size={20}
            color="#fff"
          />
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
