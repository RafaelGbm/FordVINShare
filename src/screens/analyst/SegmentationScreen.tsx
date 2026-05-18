import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { COLORS } from '../../constants';
import { useSegmentDistribution } from '../../hooks/useSegments';
import { LeadSegment } from '../../services/leads.service';
import { SegmentBucket } from '../../services/segments.service';
import { ApiError } from '../../services/api';

type SegmentVisual = {
  label: string;
  color: string;
  icon: string;
};

const SEGMENT_META: Record<LeadSegment, SegmentVisual> = {
  FIEL: { label: 'Fiel', color: COLORS.success, icon: 'heart' },
  ECONOMICO: { label: 'Econômico', color: COLORS.secondary, icon: 'cash' },
  ESQUECIDO: { label: 'Esquecido', color: '#f5a623', icon: 'alert' },
  ABANDONO: { label: 'Abandono', color: '#ea4335', icon: 'account-off' },
};

const SEGMENT_ORDER: LeadSegment[] = ['FIEL', 'ECONOMICO', 'ESQUECIDO', 'ABANDONO'];

const RISK_FACTORS = [
  { id: 'r1', label: 'Mais de 12 meses sem visita', pct: 78, weight: '+30 pts' },
  { id: 'r2', label: 'Garantia vencendo < 60 dias', pct: 62, weight: '+20 pts' },
  { id: 'r3', label: 'NPS baixo (<7)', pct: 48, weight: '+25 pts' },
  { id: 'r4', label: 'Km próximo de revisão', pct: 34, weight: '+15 pts' },
];

function bucketsByOrder(buckets: SegmentBucket[]): SegmentBucket[] {
  const map = new Map(buckets.map((b) => [b.segment, b]));
  return SEGMENT_ORDER.map(
    (s) =>
      map.get(s) ?? {
        segment: s,
        count: 0,
        percent: 0,
        avgTicket: 0,
        avgNps: 0,
      }
  );
}

export default function SegmentationScreen() {
  const [view, setView] = useState<'donut' | 'list'>('donut');

  const { data, isLoading, error, refetch, isRefetching } = useSegmentDistribution();

  const orderedBuckets = useMemo(
    () => bucketsByOrder(data?.buckets ?? []),
    [data?.buckets]
  );

  const total = data?.totalCustomers ?? 0;
  const fielBucket = orderedBuckets.find((b) => b.segment === 'FIEL');
  const riskBucket = orderedBuckets.find((b) => b.segment === 'ESQUECIDO');
  const lostBucket = orderedBuckets.find((b) => b.segment === 'ABANDONO');

  const showContent = !isLoading && !error && data;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      <View style={styles.hero}>
        <View style={styles.heroBlob} />

        <View style={styles.heroTop}>
          <View>
            <Text style={styles.heroSub}>Análise preditiva</Text>
            <Text style={styles.heroTitle}>Segmentação</Text>
          </View>
          <TouchableOpacity style={styles.iconBtn} onPress={() => refetch()}>
            <MaterialCommunityIcons
              name={isRefetching ? 'loading' : 'refresh'}
              size={20}
              color="#fff"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.totalCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.totalLabel}>Base total</Text>
            <View style={styles.totalValueRow}>
              <Text style={styles.totalValue}>{total.toLocaleString('pt-BR')}</Text>
              <Text style={styles.totalUnit}>clientes</Text>
            </View>
            {data?.computedAt && (
              <View style={styles.totalDelta}>
                <MaterialCommunityIcons name="clock-outline" size={11} color="rgba(255,255,255,0.7)" />
                <Text style={styles.totalDeltaText}>
                  atualizado {new Date(data.computedAt).toLocaleDateString('pt-BR')}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.miniRings}>
            {orderedBuckets.map((b) => (
              <View key={b.segment} style={styles.miniRingRow}>
                <View style={[styles.miniDot, { backgroundColor: SEGMENT_META[b.segment].color }]} />
                <Text style={styles.miniRingText}>{b.percent.toFixed(0)}%</Text>
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
        {isLoading && (
          <View style={styles.stateBox}>
            <ActivityIndicator color={COLORS.primary} />
            <Text style={styles.stateText}>Carregando segmentação...</Text>
          </View>
        )}

        {error && !isLoading && (
          <View style={styles.stateBox}>
            <MaterialCommunityIcons name="alert-circle-outline" size={36} color="#ea4335" />
            <Text style={styles.stateTitle}>Falha ao carregar segmentação</Text>
            <Text style={styles.stateText}>
              {error instanceof ApiError
                ? error.problem.detail || error.problem.title
                : 'Tente novamente em instantes'}
            </Text>
            <TouchableOpacity style={styles.retryBtn} onPress={() => refetch()}>
              <Text style={styles.retryText}>Tentar novamente</Text>
            </TouchableOpacity>
          </View>
        )}

        {showContent && (
          <>
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

            {view === 'donut' && (
              <View style={styles.donutCard}>
                <View style={styles.donutWrap}>
                  <View style={styles.donutCircle}>
                    {(() => {
                      let cumulative = 0;
                      return orderedBuckets.map((b) => {
                        const rotation = (cumulative / 100) * 360;
                        cumulative += b.percent;
                        return (
                          <View
                            key={b.segment}
                            style={[
                              styles.donutArc,
                              {
                                backgroundColor: SEGMENT_META[b.segment].color,
                                transform: [{ rotate: `${rotation}deg` }],
                              },
                            ]}
                          />
                        );
                      });
                    })()}
                    <View style={styles.donutCenter}>
                      <Text style={styles.donutCenterValue}>{total}</Text>
                      <Text style={styles.donutCenterLabel}>clientes</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.donutLegend}>
                  {orderedBuckets.map((b) => (
                    <View key={b.segment} style={styles.legendItem}>
                      <View
                        style={[styles.legendBox, { backgroundColor: SEGMENT_META[b.segment].color }]}
                      />
                      <Text style={styles.legendLabel}>{SEGMENT_META[b.segment].label}</Text>
                      <Text style={styles.legendPct}>{b.percent.toFixed(0)}%</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {view === 'list' && (
              <View>
                {orderedBuckets.map((b) => {
                  const meta = SEGMENT_META[b.segment];
                  return (
                    <View key={b.segment} style={styles.segCard}>
                      <View style={[styles.segIcon, { backgroundColor: `${meta.color}20` }]}>
                        <MaterialCommunityIcons name={meta.icon as any} size={22} color={meta.color} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <View style={styles.segHead}>
                          <Text style={styles.segLabel}>{meta.label}</Text>
                          <Text style={[styles.segPct, { color: meta.color }]}>
                            {b.percent.toFixed(0)}%
                          </Text>
                        </View>
                        <View style={styles.segBar}>
                          <View
                            style={[styles.segFill, { width: `${b.percent}%`, backgroundColor: meta.color }]}
                          />
                        </View>
                        <Text style={styles.segCount}>
                          {b.count} clientes · ticket médio R$ {b.avgTicket.toFixed(0)} · NPS {b.avgNps.toFixed(1)}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}

            <Text style={[styles.sectionTitle, { marginTop: 18 }]}>Funil de fidelização</Text>
            <View style={styles.funnelCard}>
              {orderedBuckets.map((b) => {
                const meta = SEGMENT_META[b.segment];
                return (
                  <View key={b.segment} style={styles.funnelRow}>
                    <View style={[styles.funnelBar, { width: `${Math.max(8, b.percent)}%`, backgroundColor: meta.color }]}>
                      <Text style={styles.funnelValue}>{b.count}</Text>
                    </View>
                    <View style={styles.funnelMeta}>
                      <Text style={styles.funnelLabel}>{meta.label}</Text>
                      <Text style={styles.funnelPct}>{b.percent.toFixed(0)}%</Text>
                    </View>
                  </View>
                );
              })}
            </View>

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

            {(riskBucket || lostBucket) && (
              <View style={styles.actionCard}>
                <View style={styles.actionIcon}>
                  <MaterialCommunityIcons name="lightbulb-on" size={24} color="#f5a623" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.actionTitle}>Plano de retenção sugerido</Text>
                  <Text style={styles.actionDesc}>
                    Acione {(riskBucket?.count ?? 0) + (lostBucket?.count ?? 0)} clientes em risco com revisão gratuita + 200 pontos bônus.
                  </Text>
                </View>
                <TouchableOpacity style={styles.actionBtn} activeOpacity={0.85}>
                  <Text style={styles.actionBtnText}>Ativar</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}

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
  totalDeltaText: { color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: '600' },
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

  scrollArea: {
    flex: 1,
    backgroundColor: '#f5f5f7',
    marginTop: -28,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  scrollContent: { padding: 16, paddingTop: 22 },

  stateBox: { alignItems: 'center', paddingVertical: 40, paddingHorizontal: 20, gap: 8 },
  stateTitle: { fontSize: 14, fontWeight: '800', color: COLORS.dark },
  stateText: { fontSize: 12, color: COLORS.gray, textAlign: 'center' },
  retryBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 4,
  },
  retryText: { color: '#fff', fontWeight: '800', fontSize: 13 },

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
