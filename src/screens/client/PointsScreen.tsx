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

import { COLORS } from '../../constants';
import FordLogo from '../../components/FordLogo';
import {
  useLoyaltyBalance,
  useLoyaltyRewards,
  useLoyaltyTransactions,
  useRedeemReward,
} from '../../hooks/useLoyalty';
import { ApiError } from '../../services/api';

const CATEGORIES = [
  { id: 'all', label: 'Todos' },
  { id: 'SERVICE', label: 'Serviços' },
  { id: 'PARTS', label: 'Peças' },
  { id: 'LIFESTYLE', label: 'Lifestyle' },
];

const REWARD_BG_BY_CATEGORY: Record<string, { bg: string; color: string }> = {
  SERVICE: { bg: '#e8efff', color: COLORS.primary },
  PARTS: { bg: '#fdf0e6', color: '#ff7043' },
  LIFESTYLE: { bg: '#fce4ec', color: '#e91e63' },
  DEFAULT: { bg: '#e9f7ee', color: '#1e8e3e' },
};

function tierFor(balance: number) {
  if (balance >= 5000) return { name: 'Ford Platinum', next: balance, nextLabel: '' };
  if (balance >= 2000) return { name: 'Ford Gold', next: 5000, nextLabel: 'Platinum' };
  if (balance >= 500) return { name: 'Ford Silver', next: 2000, nextLabel: 'Gold' };
  return { name: 'Ford Bronze', next: 500, nextLabel: 'Silver' };
}

function formatShortDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

export default function PointsScreen() {
  const [cat, setCat] = useState('all');

  const balanceQuery = useLoyaltyBalance();
  const rewardsQuery = useLoyaltyRewards();
  const transactionsQuery = useLoyaltyTransactions(0, 10);
  const redeemMutation = useRedeemReward();

  const balance = balanceQuery.data?.balance ?? 0;
  const expiringIn30Days = balanceQuery.data?.expiringIn30Days ?? 0;
  const tier = useMemo(() => tierFor(balance), [balance]);
  const tierPct = tier.next > 0 ? Math.min(100, (balance / tier.next) * 100) : 100;

  const transactions = useMemo(
    () => transactionsQuery.data?.content ?? [],
    [transactionsQuery.data]
  );
  const monthEarnings = useMemo(() => {
    const now = new Date();
    return transactions
      .filter(
        (t) =>
          t.type === 'EARN' &&
          new Date(t.createdAt).getMonth() === now.getMonth() &&
          new Date(t.createdAt).getFullYear() === now.getFullYear()
      )
      .reduce((acc, t) => acc + t.points, 0);
  }, [transactions]);

  const totalRedemptions = useMemo(
    () => transactions.filter((t) => t.type === 'SPEND').length,
    [transactions]
  );

  const rewards = useMemo(() => {
    const list = rewardsQuery.data ?? [];
    if (cat === 'all') return list;
    return list.filter((r) => r.category === cat);
  }, [rewardsQuery.data, cat]);

  const handleRedeem = (rewardId: string, rewardName: string, cost: number) => {
    if (balance < cost) return;
    Alert.alert(
      'Confirmar resgate',
      `Você vai resgatar "${rewardName}" por ${cost.toLocaleString('pt-BR')} pts.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Resgatar',
          onPress: async () => {
            try {
              const result = await redeemMutation.mutateAsync(rewardId);
              Alert.alert(
                'Resgate confirmado!',
                `Código: ${result.voucherCode}\nVálido até ${new Date(result.expiresAt).toLocaleDateString('pt-BR')}.`
              );
            } catch (e) {
              const message =
                e instanceof ApiError
                  ? e.problem.detail || e.problem.title
                  : 'Não foi possível concluir o resgate.';
              Alert.alert('Erro', message);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      {/* Hero */}
      <View style={styles.hero}>
        <View style={styles.heroBlob1} />
        <View style={styles.heroBlob2} />

        <View style={styles.heroHead}>
          <View>
            <Text style={styles.heroSub}>Programa de fidelidade</Text>
            <Text style={styles.heroTitle}>Ford Points</Text>
          </View>
          <TouchableOpacity style={styles.iconBtn}>
            <MaterialCommunityIcons name="information-outline" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Points Card */}
        <View style={styles.pointsCard}>
          <View style={styles.pointsCardTop}>
            <View>
              <Text style={styles.pointsLabel}>Saldo disponível</Text>
              <View style={styles.pointsValueRow}>
                {balanceQuery.isLoading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Text style={styles.pointsValue}>{balance.toLocaleString('pt-BR')}</Text>
                    <Text style={styles.pointsUnit}>pts</Text>
                  </>
                )}
              </View>
            </View>
            <FordLogo width={70} height={28} style={{ opacity: 0.9 }} />
          </View>

          <View style={styles.tierRow}>
            <View style={styles.tierBadge}>
              <MaterialCommunityIcons name="medal" size={14} color="#f5a623" />
              <Text style={styles.tierText}>{tier.name}</Text>
            </View>
            {tier.nextLabel ? (
              <Text style={styles.tierGoal}>
                Faltam {(tier.next - balance).toLocaleString('pt-BR')} pra {tier.nextLabel}
              </Text>
            ) : (
              <Text style={styles.tierGoal}>Nível máximo atingido</Text>
            )}
          </View>

          <View style={styles.tierBar}>
            <View style={[styles.tierFill, { width: `${tierPct}%` }]} />
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <MaterialCommunityIcons name="trending-up" size={20} color={COLORS.success} />
            <Text style={styles.statValue}>
              {monthEarnings > 0 ? `+${monthEarnings.toLocaleString('pt-BR')}` : '–'}
            </Text>
            <Text style={styles.statLabel}>este mês</Text>
          </View>
          <View style={styles.statCard}>
            <MaterialCommunityIcons name="gift-outline" size={20} color="#ff7043" />
            <Text style={styles.statValue}>{totalRedemptions}</Text>
            <Text style={styles.statLabel}>resgates</Text>
          </View>
          <View style={styles.statCard}>
            <MaterialCommunityIcons name="clock-alert-outline" size={20} color="#f5a623" />
            <Text style={styles.statValue}>
              {expiringIn30Days > 0 ? expiringIn30Days.toLocaleString('pt-BR') : '–'}
            </Text>
            <Text style={styles.statLabel}>vencem em 30d</Text>
          </View>
        </View>

        {/* Expiring warning */}
        {expiringIn30Days > 0 && (
          <View style={styles.earnBox}>
            <View style={styles.earnIcon}>
              <MaterialCommunityIcons name="clock-alert" size={20} color="#f5a623" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.earnTitle}>Pontos próximos do vencimento</Text>
              <Text style={styles.earnText}>
                {expiringIn30Days.toLocaleString('pt-BR')} pts vencem nos próximos 30 dias
              </Text>
            </View>
          </View>
        )}

        {/* Rewards */}
        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Resgatar pontos</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>Ver tudo</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
          style={styles.catScroll}
        >
          {CATEGORIES.map((c) => {
            const active = cat === c.id;
            return (
              <TouchableOpacity
                key={c.id}
                style={[styles.catChip, active && styles.catChipActive]}
                onPress={() => setCat(c.id)}
                activeOpacity={0.85}
              >
                <Text style={[styles.catText, active && styles.catTextActive]}>{c.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {rewardsQuery.isLoading && (
          <View style={{ paddingVertical: 32, alignItems: 'center' }}>
            <ActivityIndicator color={COLORS.primary} />
          </View>
        )}

        {!rewardsQuery.isLoading && rewards.length === 0 && (
          <View style={{ paddingHorizontal: 20 }}>
            <Text style={{ color: COLORS.gray, fontSize: 13 }}>
              Nenhuma recompensa disponível nesta categoria.
            </Text>
          </View>
        )}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
        >
          {rewards.map((r) => {
            const canRedeem = balance >= r.pointsCost;
            const style = REWARD_BG_BY_CATEGORY[r.category ?? 'DEFAULT'] ?? REWARD_BG_BY_CATEGORY.DEFAULT;
            return (
              <TouchableOpacity
                key={r.id}
                style={styles.rewardCard}
                activeOpacity={0.9}
                onPress={() => canRedeem && handleRedeem(r.id, r.name, r.pointsCost)}
                disabled={!canRedeem || redeemMutation.isPending}
              >
                <View style={[styles.rewardImg, { backgroundColor: style.bg }]}>
                  <MaterialCommunityIcons name="gift" size={48} color={style.color} />
                </View>
                <View style={styles.rewardBody}>
                  <Text style={styles.rewardName} numberOfLines={1}>
                    {r.name}
                  </Text>
                  <Text style={styles.rewardDesc} numberOfLines={2}>
                    {r.description}
                  </Text>
                  <View style={styles.rewardFoot}>
                    <View style={styles.rewardPoints}>
                      <MaterialCommunityIcons name="circle" size={6} color="#f5a623" />
                      <Text style={styles.rewardPointsText}>
                        {r.pointsCost.toLocaleString('pt-BR')} pts
                      </Text>
                    </View>
                    <View style={[styles.rewardBtn, !canRedeem && styles.rewardBtnDisabled]}>
                      <Text style={[styles.rewardBtnText, !canRedeem && styles.rewardBtnTextDisabled]}>
                        {canRedeem ? 'Resgatar' : 'Faltam pts'}
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* History */}
        <View style={[styles.sectionHead, { marginTop: 24 }]}>
          <Text style={styles.sectionTitle}>Extrato recente</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>Ver tudo</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.historyCard}>
          {transactionsQuery.isLoading && (
            <View style={{ paddingVertical: 16, alignItems: 'center' }}>
              <ActivityIndicator color={COLORS.primary} size="small" />
            </View>
          )}

          {!transactionsQuery.isLoading && transactions.length === 0 && (
            <View style={{ paddingVertical: 20, alignItems: 'center' }}>
              <Text style={{ color: COLORS.gray, fontSize: 13 }}>
                Nenhuma transação ainda.
              </Text>
            </View>
          )}

          {transactions.map((h, i) => (
            <View
              key={h.id}
              style={[
                styles.historyRow,
                i === transactions.length - 1 && { borderBottomWidth: 0 },
              ]}
            >
              <View
                style={[
                  styles.historyIcon,
                  { backgroundColor: h.type === 'EARN' ? '#e9f7ee' : '#fce8e6' },
                ]}
              >
                <MaterialCommunityIcons
                  name={h.type === 'EARN' ? 'arrow-up' : 'arrow-down'}
                  size={16}
                  color={h.type === 'EARN' ? COLORS.success : '#ea4335'}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.historyLabel}>{h.label}</Text>
                <Text style={styles.historyDate}>{formatShortDate(h.createdAt)}</Text>
              </View>
              <Text
                style={[
                  styles.historyPoints,
                  { color: h.type === 'EARN' ? COLORS.success : '#ea4335' },
                ]}
              >
                {h.points > 0 ? '+' : ''}
                {h.points.toLocaleString('pt-BR')} pts
              </Text>
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
    paddingBottom: 80,
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
    left: -40,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  heroHead: {
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

  /* Points Card */
  pointsCard: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  pointsCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 18,
  },
  pointsLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  pointsValueRow: { flexDirection: 'row', alignItems: 'flex-end', marginTop: 4, gap: 6 },
  pointsValue: { color: '#fff', fontSize: 38, fontWeight: '800', letterSpacing: -1 },
  pointsUnit: { color: '#fff', fontSize: 14, fontWeight: '700', marginBottom: 8 },

  tierRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245,166,35,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  tierText: { fontSize: 12, fontWeight: '800', color: '#ffc966' },
  tierGoal: { fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: '600' },

  tierBar: { height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.15)', overflow: 'hidden' },
  tierFill: { height: '100%', backgroundColor: '#ffc966', borderRadius: 3 },

  /* Scroll */
  scrollArea: {
    flex: 1,
    backgroundColor: '#f5f5f7',
    marginTop: -50,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  scrollContent: { paddingTop: 22, paddingBottom: 30 },

  /* Stats */
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 14,
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  statValue: { fontSize: 20, fontWeight: '800', color: COLORS.dark, marginTop: 6 },
  statLabel: { fontSize: 11, color: COLORS.gray, fontWeight: '600' },

  /* Earn box */
  earnBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff8e6',
    marginHorizontal: 20,
    padding: 14,
    borderRadius: 14,
    marginBottom: 18,
    borderLeftWidth: 4,
    borderLeftColor: '#f5a623',
  },
  earnIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  earnTitle: { fontSize: 14, fontWeight: '800', color: '#a36b00' },
  earnText: { fontSize: 12, color: '#8c5a00', marginTop: 2 },

  /* Section */
  sectionHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: COLORS.dark },
  seeAll: { fontSize: 12, color: COLORS.primary, fontWeight: '700' },

  /* Categories */
  catScroll: { marginBottom: 12 },
  catChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#eef0f3',
  },
  catChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  catText: { fontSize: 12, fontWeight: '700', color: COLORS.gray },
  catTextActive: { color: '#fff' },

  /* Reward Card */
  rewardCard: {
    width: 200,
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  rewardImg: {
    height: 110,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  rewardTag: {
    position: 'absolute',
    top: 10,
    left: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  rewardTagText: { fontSize: 9, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },
  rewardBody: { padding: 12 },
  rewardName: { fontSize: 14, fontWeight: '800', color: COLORS.dark },
  rewardDesc: { fontSize: 11, color: COLORS.gray, marginTop: 4, minHeight: 28 },
  rewardFoot: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  rewardPoints: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  rewardPointsText: { fontSize: 13, fontWeight: '800', color: '#a36b00' },
  rewardBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  rewardBtnDisabled: { backgroundColor: '#e8eaed' },
  rewardBtnText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  rewardBtnTextDisabled: { color: COLORS.gray },

  /* History */
  historyCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 16,
    paddingHorizontal: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f2f5',
  },
  historyIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  historyLabel: { fontSize: 13, fontWeight: '700', color: COLORS.dark },
  historyDate: { fontSize: 11, color: COLORS.gray, marginTop: 2 },
  historyPoints: { fontSize: 14, fontWeight: '800' },
});
