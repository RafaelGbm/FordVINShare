import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { COLORS } from '../../constants';

const { width } = Dimensions.get('window');

const SEGMENTS = [
  { id: 'loyal', label: 'Fiel', count: 248, pct: 41, color: COLORS.success, icon: 'heart' },
  { id: 'new', label: 'Novo', count: 142, pct: 24, color: COLORS.secondary, icon: 'account-plus' },
  { id: 'risk', label: 'Em risco', count: 124, pct: 21, color: '#f5a623', icon: 'alert' },
  { id: 'lost', label: 'Perdido', count: 86, pct: 14, color: '#ea4335', icon: 'account-off' },
];

const TOTAL = SEGMENTS.reduce((acc, s) => acc + s.count, 0);

const RISK_FACTORS = [
  { id: 'r1', label: 'Mais de 12 meses sem visita', pct: 78, weight: '+30 pts' },
  { id: 'r2', label: 'Garantia vencendo < 60 dias', pct: 62, weight: '+20 pts' },
  { id: 'r3', label: 'NPS baixo (<7)', pct: 48, weight: '+25 pts' },
  { id: 'r4', label: 'Km próximo de revisão', pct: 34, weight: '+15 pts' },
];

const FUNNEL = [
  { label: 'Clientes totais', value: 600, pct: 100, color: COLORS.primary },
  { label: 'Com garantia ativa', value: 428, pct: 71, color: '#1565c0' },
  { label: 'Engajados (12m)', value: 312, pct: 52, color: COLORS.secondary },
  { label: 'Fidelizados', value: 248, pct: 41, color: COLORS.success },
];

const COMPARISON_PERIODS = ['Mês passado', 'Este mês'];

export default function SegmentationScreen() {
  const [view, setView] = useState<'donut' | 'list'>('donut');

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      {/* Hero */}
      <View style={styles.hero}>
        <View style={styles.heroBlob} />

        <View style={styles.heroTop}>
          <View>
            <Text style={styles.heroSub}>Análise preditiva</Text>
            <Text style={styles.heroTitle}>Segmentação</Text>
          </View>
          <TouchableOpacity style={styles.iconBtn}>
            <MaterialCommunityIcons name="download" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Total Card */}
        <View style={styles.totalCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.totalLabel}>Base total</Text>
            <View style={styles.totalValueRow}>
              <Text style={styles.totalValue}>{TOTAL}</Text>
              <Text style={styles.totalUnit}>clientes</Text>
            </View>
            <View style={styles.totalDelta}>
              <MaterialCommunityIcons name="trending-up" size={12} color="#84d49a" />
              <Text style={styles.totalDeltaText}>+34 este mês</Text>
            </View>
          </View>
          <View style={styles.miniRings}>
            {SEGMENTS.map((s) => (
              <View key={s.id} style={styles.miniRingRow}>
                <View style={[styles.miniDot, { backgroundColor: s.color }]} />
                <Text style={styles.miniRingText}>{s.pct}%</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* View Toggle */}
        <View style={styles.viewToggle}>
          <Text style={styles.sectionTitle}>Distribuição por segmento</Text>
          <View style={styles.toggleGroup}>
            <TouchableOpacity
              style={[styles.toggleBtn, view === 'donut' && styles.toggleBtnActive]}
              onPress={() => setView('donut')}
            >
              <MaterialCommunityIcons
                name="chart-donut"
                size={14}
                color={view === 'donut' ? '#fff' : COLORS.gray}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleBtn, view === 'list' && styles.toggleBtnActive]}
              onPress={() => setView('list')}
            >
              <MaterialCommunityIcons
                name="format-list-bulleted"
                size={14}
                color={view === 'list' ? '#fff' : COLORS.gray}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Donut visualization */}
        {view === 'donut' && (
          <View style={styles.donutCard}>
            <View style={styles.donutWrap}>
              <View style={styles.donutCircle}>
                {/* Stacked colored arcs simulated with rotated views */}
                <View style={[styles.donutArc, { backgroundColor: COLORS.success, transform: [{ rotate: '0deg' }] }]} />
                <View style={[styles.donutArc, { backgroundColor: COLORS.secondary, transform: [{ rotate: '148deg' }] }]} />
                <View style={[styles.donutArc, { backgroundColor: '#f5a623', transform: [{ rotate: '234deg' }] }]} />
                <View style={[styles.donutArc, { backgroundColor: '#ea4335', transform: [{ rotate: '309deg' }] }]} />
                <View style={styles.donutCenter}>
                  <Text style={styles.donutCenterValue}>{TOTAL}</Text>
                  <Text style={styles.donutCenterLabel}>clientes</Text>
                </View>
              </View>
            </View>

            <View style={styles.donutLegend}>
              {SEGMENTS.map((s) => (
                <View key={s.id} style={styles.legendItem}>
                  <View style={[styles.legendBox, { backgroundColor: s.color }]} />
                  <Text style={styles.legendLabel}>{s.label}</Text>
                  <Text style={styles.legendPct}>{s.pct}%</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* List view */}
        {view === 'list' && (
          <View>
            {SEGMENTS.map((s) => (
              <View key={s.id} style={styles.segCard}>
                <View style={[styles.segIcon, { backgroundColor: `${s.color}20` }]}>
                  <MaterialCommunityIcons name={s.icon as any} size={22} color={s.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.segHead}>
                    <Text style={styles.segLabel}>{s.label}</Text>
                    <Text style={[styles.segPct, { color: s.color }]}>{s.pct}%</Text>
                  </View>
                  <View style={styles.segBar}>
                    <View style={[styles.segFill, { width: `${s.pct}%`, backgroundColor: s.color }]} />
                  </View>
                  <Text style={styles.segCount}>{s.count} clientes</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Funnel */}
        <Text style={[styles.sectionTitle, { marginTop: 18 }]}>Funil de fidelização</Text>
        <View style={styles.funnelCard}>
          {FUNNEL.map((f, i) => (
            <View key={i} style={styles.funnelRow}>
              <View style={[styles.funnelBar, { width: `${f.pct}%`, backgroundColor: f.color }]}>
                <Text style={styles.funnelValue}>{f.value}</Text>
              </View>
              <View style={styles.funnelMeta}>
                <Text style={styles.funnelLabel}>{f.label}</Text>
                <Text style={styles.funnelPct}>{f.pct}%</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Comparison */}
        <View style={styles.compareCard}>
          <View style={styles.compareHead}>
            <Text style={styles.compareTitle}>Evolução mensal</Text>
            <Text style={styles.compareSub}>vs mês anterior</Text>
          </View>

          <View style={styles.compareRow}>
            <View style={styles.compareItem}>
              <View style={styles.compareDot}>
                <MaterialCommunityIcons name="arrow-up" size={11} color={COLORS.success} />
              </View>
              <Text style={styles.compareValue}>+18</Text>
              <Text style={styles.compareLabel}>fidelizados</Text>
            </View>
            <View style={styles.compareItem}>
              <View style={[styles.compareDot, { backgroundColor: '#fce8e6' }]}>
                <MaterialCommunityIcons name="arrow-down" size={11} color="#ea4335" />
              </View>
              <Text style={styles.compareValue}>-5</Text>
              <Text style={styles.compareLabel}>em risco</Text>
            </View>
            <View style={styles.compareItem}>
              <View style={[styles.compareDot, { backgroundColor: '#e8efff' }]}>
                <MaterialCommunityIcons name="arrow-up" size={11} color={COLORS.secondary} />
              </View>
              <Text style={styles.compareValue}>+12</Text>
              <Text style={styles.compareLabel}>novos</Text>
            </View>
          </View>
        </View>

        {/* Risk Factors */}
        <Text style={[styles.sectionTitle, { marginTop: 8 }]}>Fatores de risco mais comuns</Text>
        <View style={styles.riskCard}>
          {RISK_FACTORS.map((r, i) => (
            <View
              key={r.id}
              style={[styles.riskRow, i === RISK_FACTORS.length - 1 && { borderBottomWidth: 0 }]}
            >
              <View style={styles.riskLeft}>
                <Text style={styles.riskRank}>{i + 1}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.riskHead}>
                  <Text style={styles.riskLabel}>{r.label}</Text>
                  <View style={styles.riskWeight}>
                    <Text style={styles.riskWeightText}>{r.weight}</Text>
                  </View>
                </View>
                <View style={styles.riskBar}>
                  <View style={[styles.riskFill, { width: `${r.pct}%` }]} />
                </View>
                <Text style={styles.riskPct}>{r.pct}% dos clientes em risco</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Action card */}
        <View style={styles.actionCard}>
          <View style={styles.actionIcon}>
            <MaterialCommunityIcons name="lightbulb-on" size={24} color="#f5a623" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.actionTitle}>Plano de retenção sugerido</Text>
            <Text style={styles.actionDesc}>
              Acione 124 clientes em risco com revisão gratuita + 200 pontos bônus.
            </Text>
          </View>
          <TouchableOpacity style={styles.actionBtn} activeOpacity={0.85}>
            <Text style={styles.actionBtnText}>Ativar</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.primary },

  /* Hero */
  hero: {
    backgroundColor: COLORS.primary,
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 60,
    overflow: 'hidden',
  },
  heroBlob: {
    position: 'absolute',
    top: -60,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  heroSub: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    letterSpacing: 1.5,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  heroTitle: { color: '#fff', fontSize: 22, fontWeight: '800', marginTop: 4 },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* Total Card */
  totalCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  totalLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  totalValueRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 6, marginTop: 4 },
  totalValue: { color: '#fff', fontSize: 36, fontWeight: '800', letterSpacing: -1 },
  totalUnit: { color: '#fff', fontSize: 13, fontWeight: '700', marginBottom: 6 },
  totalDelta: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 4 },
  totalDeltaText: { color: '#84d49a', fontSize: 11, fontWeight: '700' },
  miniRings: {
    paddingLeft: 14,
    marginLeft: 14,
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    gap: 6,
  },
  miniRingRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  miniDot: { width: 8, height: 8, borderRadius: 4 },
  miniRingText: { color: '#fff', fontSize: 11, fontWeight: '700', minWidth: 28 },

  /* Scroll */
  scrollArea: {
    flex: 1,
    backgroundColor: '#f5f5f7',
    marginTop: -28,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  scrollContent: { padding: 16, paddingTop: 22 },

  /* View toggle */
  viewToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: COLORS.dark, marginBottom: 10 },
  toggleGroup: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 8, padding: 3 },
  toggleBtn: { width: 30, height: 26, justifyContent: 'center', alignItems: 'center', borderRadius: 5 },
  toggleBtnActive: { backgroundColor: COLORS.primary },

  /* Donut */
  donutCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  donutWrap: { width: 140, height: 140, justifyContent: 'center', alignItems: 'center' },
  donutCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#f0f2f5',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  donutArc: {
    position: 'absolute',
    top: 0,
    left: 70,
    width: 70,
    height: 70,
    transformOrigin: '0 70',
  },
  donutCenter: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    zIndex: 10,
  },
  donutCenterValue: { fontSize: 28, fontWeight: '800', color: COLORS.dark, letterSpacing: -1 },
  donutCenterLabel: { fontSize: 11, color: COLORS.gray, fontWeight: '600' },
  donutLegend: { flex: 1, marginLeft: 18, gap: 10 },
  legendItem: { flexDirection: 'row', alignItems: 'center' },
  legendBox: { width: 10, height: 10, borderRadius: 3, marginRight: 8 },
  legendLabel: { flex: 1, fontSize: 13, fontWeight: '700', color: COLORS.dark },
  legendPct: { fontSize: 14, fontWeight: '800', color: COLORS.dark },

  /* Segment Card (list view) */
  segCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  segIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  segHead: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  segLabel: { fontSize: 14, fontWeight: '800', color: COLORS.dark },
  segPct: { fontSize: 16, fontWeight: '800' },
  segBar: { height: 5, borderRadius: 3, backgroundColor: '#f0f2f5', overflow: 'hidden' },
  segFill: { height: '100%', borderRadius: 3 },
  segCount: { fontSize: 11, color: COLORS.gray, marginTop: 6, fontWeight: '600' },

  /* Funnel */
  funnelCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  funnelRow: { marginBottom: 12 },
  funnelBar: {
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    paddingHorizontal: 12,
    minWidth: 60,
    marginBottom: 4,
  },
  funnelValue: { color: '#fff', fontSize: 13, fontWeight: '800' },
  funnelMeta: { flexDirection: 'row', justifyContent: 'space-between' },
  funnelLabel: { fontSize: 12, color: COLORS.dark, fontWeight: '700' },
  funnelPct: { fontSize: 12, color: COLORS.gray, fontWeight: '700' },

  /* Compare */
  compareCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  compareHead: { marginBottom: 14 },
  compareTitle: { fontSize: 14, fontWeight: '800', color: COLORS.dark },
  compareSub: { fontSize: 11, color: COLORS.gray, marginTop: 2 },
  compareRow: { flexDirection: 'row', justifyContent: 'space-around' },
  compareItem: { alignItems: 'center' },
  compareDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e9f7ee',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  compareValue: { fontSize: 18, fontWeight: '800', color: COLORS.dark },
  compareLabel: { fontSize: 11, color: COLORS.gray, marginTop: 2, fontWeight: '600' },

  /* Risk Factors */
  riskCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 14,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  riskRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f2f5',
  },
  riskLeft: { marginRight: 12 },
  riskRank: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: '#fff4e0',
    textAlign: 'center',
    lineHeight: 26,
    fontSize: 12,
    fontWeight: '800',
    color: '#a36b00',
  },
  riskHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  riskLabel: { fontSize: 13, fontWeight: '700', color: COLORS.dark, flex: 1 },
  riskWeight: {
    backgroundColor: '#fff4e0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
  },
  riskWeightText: { fontSize: 10, fontWeight: '800', color: '#a36b00' },
  riskBar: { height: 4, borderRadius: 2, backgroundColor: '#f0f2f5', overflow: 'hidden' },
  riskFill: { height: '100%', backgroundColor: '#f5a623', borderRadius: 2 },
  riskPct: { fontSize: 11, color: COLORS.gray, marginTop: 6, fontWeight: '600' },

  /* Action card */
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff8e6',
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#f5a623',
    gap: 12,
  },
  actionIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionTitle: { fontSize: 14, fontWeight: '800', color: '#8c5a00' },
  actionDesc: { fontSize: 12, color: '#a36b00', marginTop: 4, lineHeight: 16 },
  actionBtn: {
    backgroundColor: '#f5a623',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  actionBtnText: { color: '#fff', fontWeight: '800', fontSize: 12 },
});
