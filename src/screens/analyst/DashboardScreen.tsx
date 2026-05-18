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
import { router } from 'expo-router';

import { COLORS } from '../../constants';
import { useAuthStore } from '../../utils/store';
import FordLogo from '../../components/FordLogo';

const { width } = Dimensions.get('window');

const PERIODS = [
  { id: '7d', label: '7d' },
  { id: '30d', label: '30d' },
  { id: '90d', label: '90d' },
  { id: 'year', label: 'Ano' },
];

const KPIS = [
  {
    id: 'k1',
    label: 'Veículos em garantia',
    value: '428',
    delta: '+12',
    deltaPositive: true,
    icon: 'shield-car',
    color: COLORS.primary,
    bg: '#e8efff',
  },
  {
    id: 'k2',
    label: 'Taxa VIN Share',
    value: '68%',
    delta: '+4.2%',
    deltaPositive: true,
    icon: 'chart-donut',
    color: '#1e8e3e',
    bg: '#e9f7ee',
  },
  {
    id: 'k3',
    label: 'Receita estimada',
    value: 'R$ 142k',
    delta: '-2.1%',
    deltaPositive: false,
    icon: 'cash-multiple',
    color: '#f5a623',
    bg: '#fff4e0',
  },
  {
    id: 'k4',
    label: 'Leads ativos',
    value: '87',
    delta: '+8',
    deltaPositive: true,
    icon: 'account-multiple-plus',
    color: '#9c27b0',
    bg: '#f3e5f5',
  },
];

const CHART_DATA = [
  { label: 'Seg', value: 0.55 },
  { label: 'Ter', value: 0.62 },
  { label: 'Qua', value: 0.48 },
  { label: 'Qui', value: 0.72 },
  { label: 'Sex', value: 0.85 },
  { label: 'Sáb', value: 0.78 },
  { label: 'Dom', value: 0.42 },
];

const TOP_DEALERS = [
  { id: 'd1', name: 'Ford SP Centro', share: '74%', revenue: 'R$ 48k', trend: 'up' },
  { id: 'd2', name: 'Ford Tatuapé', share: '68%', revenue: 'R$ 38k', trend: 'up' },
  { id: 'd3', name: 'Ford Morumbi', share: '62%', revenue: 'R$ 32k', trend: 'down' },
  { id: 'd4', name: 'Ford Pinheiros', share: '54%', revenue: 'R$ 24k', trend: 'up' },
];

const INSIGHTS = [
  {
    id: 'i1',
    type: 'risk',
    title: '23 clientes em risco',
    desc: 'Garantia vencendo em 60 dias sem contato',
    icon: 'alert-circle',
    color: '#ea4335',
    bg: '#fce8e6',
  },
  {
    id: 'i2',
    type: 'opportunity',
    title: '15 oportunidades de upsell',
    desc: 'Clientes elegíveis para Ford Plus',
    icon: 'trending-up',
    color: COLORS.success,
    bg: '#e9f7ee',
  },
];

export default function DashboardScreen() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [period, setPeriod] = useState('7d');

  const handleLogout = () => {
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
          <Text style={styles.heroHello}>Olá, {user?.name?.split(' ')[0] || 'Ana'}</Text>
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
        <View style={styles.kpisGrid}>
          {KPIS.map((k) => (
            <View key={k.id} style={styles.kpiCard}>
              <View style={[styles.kpiIcon, { backgroundColor: k.bg }]}>
                <MaterialCommunityIcons name={k.icon as any} size={22} color={k.color} />
              </View>
              <Text style={styles.kpiLabel}>{k.label}</Text>
              <Text style={styles.kpiValue}>{k.value}</Text>
              <View style={styles.kpiDelta}>
                <MaterialCommunityIcons
                  name={k.deltaPositive ? 'trending-up' : 'trending-down'}
                  size={12}
                  color={k.deltaPositive ? COLORS.success : '#ea4335'}
                />
                <Text
                  style={[
                    styles.kpiDeltaText,
                    { color: k.deltaPositive ? COLORS.success : '#ea4335' },
                  ]}
                >
                  {k.delta}
                </Text>
                <Text style={styles.kpiDeltaSub}>vs anterior</Text>
              </View>
            </View>
          ))}
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

          <View style={styles.chart}>
            {CHART_DATA.map((d, i) => {
              const isPeak = d.value === Math.max(...CHART_DATA.map((x) => x.value));
              return (
                <View key={i} style={styles.chartCol}>
                  <View style={styles.chartBarWrap}>
                    {isPeak && (
                      <View style={styles.chartPeakLabel}>
                        <Text style={styles.chartPeakText}>{(d.value * 100).toFixed(0)}%</Text>
                      </View>
                    )}
                    <View
                      style={[
                        styles.chartBar,
                        {
                          height: `${d.value * 100}%`,
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

          <View style={styles.chartFooter}>
            <View style={styles.chartFooterItem}>
              <Text style={styles.chartFooterLabel}>Média</Text>
              <Text style={styles.chartFooterValue}>63%</Text>
            </View>
            <View style={styles.chartFooterSep} />
            <View style={styles.chartFooterItem}>
              <Text style={styles.chartFooterLabel}>Pico</Text>
              <Text style={styles.chartFooterValue}>85%</Text>
            </View>
            <View style={styles.chartFooterSep} />
            <View style={styles.chartFooterItem}>
              <Text style={styles.chartFooterLabel}>Meta</Text>
              <Text style={[styles.chartFooterValue, { color: COLORS.success }]}>70%</Text>
            </View>
          </View>
        </View>

        {/* Insights */}
        <Text style={styles.sectionTitle}>Insights e oportunidades</Text>
        {INSIGHTS.map((i) => (
          <TouchableOpacity key={i.id} style={styles.insightCard} activeOpacity={0.85}>
            <View style={[styles.insightIcon, { backgroundColor: i.bg }]}>
              <MaterialCommunityIcons name={i.icon as any} size={22} color={i.color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.insightTitle}>{i.title}</Text>
              <Text style={styles.insightDesc}>{i.desc}</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color={COLORS.gray} />
          </TouchableOpacity>
        ))}

        {/* Top Dealers */}
        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Top concessionárias</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>Ver tudo</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.dealersCard}>
          {TOP_DEALERS.map((d, i) => (
            <View
              key={d.id}
              style={[styles.dealerRow, i === TOP_DEALERS.length - 1 && { borderBottomWidth: 0 }]}
            >
              <View style={[styles.dealerRank, i === 0 && styles.dealerRankGold]}>
                <Text style={[styles.dealerRankText, i === 0 && { color: '#a36b00' }]}>
                  {i + 1}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.dealerName}>{d.name}</Text>
                <Text style={styles.dealerRevenue}>{d.revenue}</Text>
              </View>
              <View style={styles.dealerRight}>
                <Text style={styles.dealerShare}>{d.share}</Text>
                <View style={styles.dealerTrend}>
                  <MaterialCommunityIcons
                    name={d.trend === 'up' ? 'arrow-up' : 'arrow-down'}
                    size={11}
                    color={d.trend === 'up' ? COLORS.success : '#ea4335'}
                  />
                  <Text
                    style={[
                      styles.dealerTrendText,
                      { color: d.trend === 'up' ? COLORS.success : '#ea4335' },
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
