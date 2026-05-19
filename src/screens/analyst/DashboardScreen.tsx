import React, { useState } from 'react';
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

import { COLORS } from '../../constants';
import { useAuthStore } from '../../utils/store';
import FordLogo from '../../components/FordLogo';
import { StateBox } from '../../components/StateBox';
import { authService } from '../../services/auth.service';
import { useMe } from '../../hooks/useAuth';
import {
  useKpis,
  useVinShareSeries,
  useVinShareByDealership,
} from '../../hooks/useAnalytics';
import { AnalyticsPeriod, KpisWithDelta } from '../../services/analytics.service';

const { width } = Dimensions.get('window');

const PERIODS: { id: AnalyticsPeriod; label: string }[] = [
  { id: '7d', label: '7d' },
  { id: '30d', label: '30d' },
  { id: '90d', label: '90d' },
  { id: 'year', label: 'Ano' },
];

type KpiCard = {
  id: string;
  label: string;
  value: string;
  delta?: number;
  deltaSuffix?: string;
  invertDelta?: boolean; // for "leadsAtRisk" higher is bad
  icon: string;
  color: string;
  bg: string;
};

function formatCurrency(v: number) {
  if (v >= 1_000_000) return `R$ ${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1000) return `R$ ${(v / 1000).toFixed(0)}k`;
  return `R$ ${v.toFixed(0)}`;
}

function buildKpiCards(k: KpisWithDelta | undefined): KpiCard[] {
  return [
    {
      id: 'k1',
      label: 'Veículos em garantia',
      value: k ? k.vehiclesUnderWarranty.toLocaleString('pt-BR') : '—',
      delta: k?.vehiclesUnderWarrantyDelta,
      icon: 'shield-car',
      color: COLORS.primary,
      bg: '#e8efff',
    },
    {
      id: 'k2',
      label: 'Taxa VIN Share',
      value: k ? `${k.vinSharePercent.toFixed(1)}%` : '—',
      delta: k?.vinSharePercentDelta,
      deltaSuffix: '%',
      icon: 'chart-donut',
      color: '#1e8e3e',
      bg: '#e9f7ee',
    },
    {
      id: 'k3',
      label: 'Receita estimada',
      value: k ? formatCurrency(k.estimatedRevenue) : '—',
      delta: k?.estimatedRevenueDelta,
      deltaSuffix: '%',
      icon: 'cash-multiple',
      color: '#f5a623',
      bg: '#fff4e0',
    },
    {
      id: 'k4',
      label: 'Leads em risco',
      value: k ? k.leadsAtRisk.toLocaleString('pt-BR') : '—',
      delta: k?.leadsAtRiskDelta,
      invertDelta: true,
      icon: 'account-alert',
      color: '#9c27b0',
      bg: '#f3e5f5',
    },
  ];
}

export default function DashboardScreen() {
  const logout = useAuthStore((state) => state.logout);
  const { data: me } = useMe();
  const [period, setPeriod] = useState<AnalyticsPeriod>('7d');

  const kpisQuery = useKpis(period);
  const seriesQuery = useVinShareSeries('day');
  const byDealershipQuery = useVinShareByDealership(period === '7d' ? '30d' : period);

  const kpiCards = buildKpiCards(kpisQuery.data);
  const chartPoints = seriesQuery.data?.points ?? [];
  const peakValue = seriesQuery.data?.peakPercent ?? 0;
  const topDealers = byDealershipQuery.data ?? [];

  const handleLogout = async () => {
    await authService.logout();
    logout();
    router.replace('/');
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      {/* Hero */}
      <View style={styles.hero}>
        <View style={styles.heroBlob1} />
        <View style={styles.heroBlob2} />

        <View style={styles.heroTop}>
          <FordLogo width={90} height={36} />
          <View style={styles.heroActions}>
            <TouchableOpacity style={styles.iconBtn}>
              <MaterialCommunityIcons name="bell-outline" size={20} color="#fff" />
              <View style={styles.notifBadge}>
                <Text style={styles.notifBadgeText}>3</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={handleLogout}>
              <MaterialCommunityIcons name="logout-variant" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.heroGreeting}>
          <Text style={styles.heroHello}>Olá, {me?.name?.split(' ')[0] ?? '—'}</Text>
          <View style={styles.dealerTag}>
            <MaterialCommunityIcons name="store" size={12} color="#fff" />
            <Text style={styles.dealerText}>Ford SP Centro · Analista</Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Period filter */}
        <View style={styles.periodRow}>
          <Text style={styles.sectionLabel}>Visão geral</Text>
          <View style={styles.periodPills}>
            {PERIODS.map((p) => {
              const active = period === p.id;
              return (
                <TouchableOpacity
                  key={p.id}
                  style={[styles.periodPill, active && styles.periodPillActive]}
                  onPress={() => setPeriod(p.id)}
                  activeOpacity={0.85}
                >
                  <Text style={[styles.periodText, active && styles.periodTextActive]}>
                    {p.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* KPIs Grid */}
        {kpisQuery.isError && (
          <StateBox
            variant="error"
            title="Não foi possível carregar KPIs"
            message="Verifique sua conexão e tente novamente."
            onRetry={() => kpisQuery.refetch()}
            style={{ marginBottom: 12 }}
          />
        )}

        <View style={styles.kpisGrid}>
          {kpiCards.map((k) => {
            const hasDelta = typeof k.delta === 'number';
            const isUp = hasDelta && k.delta! > 0;
            const positive = k.invertDelta ? !isUp : isUp;
            return (
              <View key={k.id} style={styles.kpiCard}>
                <View style={[styles.kpiIcon, { backgroundColor: k.bg }]}>
                  <MaterialCommunityIcons name={k.icon as any} size={22} color={k.color} />
                </View>
                <Text style={styles.kpiLabel}>{k.label}</Text>
                <Text style={styles.kpiValue}>
                  {kpisQuery.isLoading ? '...' : k.value}
                </Text>
                {hasDelta && (
                  <View style={styles.kpiDelta}>
                    <MaterialCommunityIcons
                      name={isUp ? 'trending-up' : 'trending-down'}
                      size={12}
                      color={positive ? COLORS.success : '#ea4335'}
                    />
                    <Text
                      style={[
                        styles.kpiDeltaText,
                        { color: positive ? COLORS.success : '#ea4335' },
                      ]}
                    >
                      {isUp ? '+' : ''}
                      {k.delta}
                      {k.deltaSuffix ?? ''}
                    </Text>
                    <Text style={styles.kpiDeltaSub}>vs anterior</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* Chart */}
        <View style={styles.chartCard}>
          <View style={styles.chartHead}>
            <View>
              <Text style={styles.chartTitle}>VIN Share semanal</Text>
              <Text style={styles.chartSub}>Conversão de revisões pós-garantia</Text>
            </View>
            <View style={styles.chartLegend}>
              <View style={[styles.legendDot, { backgroundColor: COLORS.primary }]} />
              <Text style={styles.legendText}>Esta semana</Text>
            </View>
          </View>

          {seriesQuery.isLoading ? (
            <View style={{ height: 140, justifyContent: 'center', alignItems: 'center' }}>
              <ActivityIndicator color={COLORS.primary} />
            </View>
          ) : chartPoints.length === 0 ? (
            <View style={{ height: 140, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ color: COLORS.gray, fontSize: 12 }}>Sem dados no período.</Text>
            </View>
          ) : (
            <View style={styles.chart}>
              {chartPoints.map((d, i) => {
                const isPeak = d.vinSharePercent === peakValue;
                const height = peakValue > 0 ? (d.vinSharePercent / peakValue) * 100 : 0;
                return (
                  <View key={i} style={styles.chartCol}>
                    <View style={styles.chartBarWrap}>
                      {isPeak && (
                        <View style={styles.chartPeakLabel}>
                          <Text style={styles.chartPeakText}>
                            {d.vinSharePercent.toFixed(0)}%
                          </Text>
                        </View>
                      )}
                      <View
                        style={[
                          styles.chartBar,
                          {
                            height: `${height}%`,
                            backgroundColor: isPeak ? COLORS.primary : '#c5d4f0',
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.chartLabel}>{d.label}</Text>
                  </View>
                );
              })}
            </View>
          )}

          <View style={styles.chartFooter}>
            <View style={styles.chartFooterItem}>
              <Text style={styles.chartFooterLabel}>Média</Text>
              <Text style={styles.chartFooterValue}>
                {seriesQuery.data ? `${seriesQuery.data.averagePercent.toFixed(0)}%` : '—'}
              </Text>
            </View>
            <View style={styles.chartFooterSep} />
            <View style={styles.chartFooterItem}>
              <Text style={styles.chartFooterLabel}>Pico</Text>
              <Text style={styles.chartFooterValue}>
                {seriesQuery.data ? `${seriesQuery.data.peakPercent.toFixed(0)}%` : '—'}
              </Text>
            </View>
            <View style={styles.chartFooterSep} />
            <View style={styles.chartFooterItem}>
              <Text style={styles.chartFooterLabel}>Meta</Text>
              <Text style={[styles.chartFooterValue, { color: COLORS.success }]}>
                {seriesQuery.data ? `${seriesQuery.data.targetPercent.toFixed(0)}%` : '—'}
              </Text>
            </View>
          </View>
        </View>

        {/* Insights derived from KPIs */}
        {kpisQuery.data && kpisQuery.data.leadsAtRisk > 0 && (
          <>
            <Text style={styles.sectionTitle}>Insights e oportunidades</Text>
            <TouchableOpacity
              style={styles.insightCard}
              activeOpacity={0.85}
              onPress={() => router.push('/(analyst)/leads' as any)}
            >
              <View style={[styles.insightIcon, { backgroundColor: '#fce8e6' }]}>
                <MaterialCommunityIcons name="alert-circle" size={22} color="#ea4335" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.insightTitle}>
                  {kpisQuery.data.leadsAtRisk} clientes em risco
                </Text>
                <Text style={styles.insightDesc}>
                  Toque para ver a lista e priorizar contatos
                </Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={20} color={COLORS.gray} />
            </TouchableOpacity>
          </>
        )}

        {/* Top Dealers */}
        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Top concessionárias</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>Ver tudo</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.dealersCard}>
          {byDealershipQuery.isLoading && <StateBox variant="loading" />}

          {!byDealershipQuery.isLoading && topDealers.length === 0 && (
            <StateBox
              variant="empty"
              iconName="store-off"
              message="Sem dados de concessionárias."
            />
          )}

          {topDealers.map((d, i) => (
            <View
              key={d.dealershipId}
              style={[styles.dealerRow, i === topDealers.length - 1 && { borderBottomWidth: 0 }]}
            >
              <View style={[styles.dealerRank, i === 0 && styles.dealerRankGold]}>
                <Text style={[styles.dealerRankText, i === 0 && { color: '#a36b00' }]}>
                  {i + 1}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.dealerName}>{d.dealershipName}</Text>
                <Text style={styles.dealerRevenue}>{formatCurrency(d.estimatedRevenue)}</Text>
              </View>
              <View style={styles.dealerRight}>
                <Text style={styles.dealerShare}>{d.vinSharePercent.toFixed(0)}%</Text>
                <View style={styles.dealerTrend}>
                  <MaterialCommunityIcons
                    name={
                      d.trend === 'UP'
                        ? 'arrow-up'
                        : d.trend === 'DOWN'
                          ? 'arrow-down'
                          : 'minus'
                    }
                    size={11}
                    color={
                      d.trend === 'UP'
                        ? COLORS.success
                        : d.trend === 'DOWN'
                          ? '#ea4335'
                          : COLORS.gray
                    }
                  />
                  <Text
                    style={[
                      styles.dealerTrendText,
                      {
                        color:
                          d.trend === 'UP'
                            ? COLORS.success
                            : d.trend === 'DOWN'
                              ? '#ea4335'
                              : COLORS.gray,
                      },
                    ]}
                  >
                    VIN
                  </Text>
                </View>
              </View>
            </View>
          ))}
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
    paddingBottom: 40,
    overflow: 'hidden',
  },
  heroBlob1: {
    position: 'absolute',
    top: -50,
    right: -40,
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  heroActions: { flexDirection: 'row', gap: 8 },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notifBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 4,
    borderRadius: 8,
    backgroundColor: '#ea4335',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notifBadgeText: { color: '#fff', fontSize: 9, fontWeight: '800' },
  heroGreeting: {},
  heroHello: { color: '#fff', fontSize: 24, fontWeight: '800', marginBottom: 6 },
  dealerTag: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 4,
  },
  dealerText: { color: '#fff', fontSize: 11, fontWeight: '700' },

  /* Scroll */
  scrollArea: {
    flex: 1,
    backgroundColor: '#f5f5f7',
    marginTop: -22,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  scrollContent: { padding: 16, paddingTop: 22 },

  /* Period */
  periodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionLabel: { fontSize: 16, fontWeight: '800', color: COLORS.dark },
  periodPills: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 3,
  },
  periodPill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 7 },
  periodPillActive: { backgroundColor: COLORS.primary },
  periodText: { fontSize: 11, fontWeight: '700', color: COLORS.gray },
  periodTextActive: { color: '#fff' },

  /* KPIs */
  kpisGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  kpiCard: {
    width: (width - 32 - 10) / 2,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  kpiIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  kpiLabel: { fontSize: 11, color: COLORS.gray, fontWeight: '600' },
  kpiValue: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.dark,
    marginTop: 2,
    letterSpacing: -0.5,
  },
  kpiDelta: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 6 },
  kpiDeltaText: { fontSize: 11, fontWeight: '800' },
  kpiDeltaSub: { fontSize: 10, color: COLORS.gray, marginLeft: 2 },

  /* Chart */
  chartCard: {
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
  chartHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 18,
  },
  chartTitle: { fontSize: 15, fontWeight: '800', color: COLORS.dark },
  chartSub: { fontSize: 11, color: COLORS.gray, marginTop: 2 },
  chartLegend: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 11, color: COLORS.gray, fontWeight: '600' },

  chart: {
    flexDirection: 'row',
    height: 140,
    alignItems: 'flex-end',
    gap: 8,
    marginBottom: 10,
  },
  chartCol: { flex: 1, alignItems: 'center' },
  chartBarWrap: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  chartBar: { width: '70%', borderRadius: 6, minHeight: 6 },
  chartPeakLabel: {
    position: 'absolute',
    top: -8,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    zIndex: 2,
  },
  chartPeakText: { color: '#fff', fontSize: 9, fontWeight: '800' },
  chartLabel: { fontSize: 10, color: COLORS.gray, fontWeight: '700', marginTop: 6 },

  chartFooter: {
    flexDirection: 'row',
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#f0f2f5',
  },
  chartFooterItem: { flex: 1, alignItems: 'center' },
  chartFooterSep: { width: 1, backgroundColor: '#f0f2f5' },
  chartFooterLabel: { fontSize: 10, color: COLORS.gray, fontWeight: '600' },
  chartFooterValue: { fontSize: 14, color: COLORS.dark, fontWeight: '800', marginTop: 2 },

  /* Section */
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.dark,
    marginTop: 4,
    marginBottom: 10,
  },
  sectionHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 10,
  },
  seeAll: { fontSize: 12, color: COLORS.primary, fontWeight: '700' },

  /* Insight */
  insightCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  insightIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  insightTitle: { fontSize: 14, fontWeight: '800', color: COLORS.dark },
  insightDesc: { fontSize: 12, color: COLORS.gray, marginTop: 2 },

  /* Dealers */
  dealersCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  dealerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f2f5',
  },
  dealerRank: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: '#f0f2f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  dealerRankGold: { backgroundColor: '#fff4e0' },
  dealerRankText: { fontSize: 13, fontWeight: '800', color: COLORS.gray },
  dealerName: { fontSize: 14, fontWeight: '700', color: COLORS.dark },
  dealerRevenue: { fontSize: 11, color: COLORS.gray, marginTop: 2, fontWeight: '600' },
  dealerRight: { alignItems: 'flex-end' },
  dealerShare: { fontSize: 16, fontWeight: '800', color: COLORS.primary },
  dealerTrend: { flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 2 },
  dealerTrendText: { fontSize: 10, fontWeight: '800' },
});
