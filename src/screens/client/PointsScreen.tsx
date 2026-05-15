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
import FordLogo from '../../components/FordLogo';

const { width } = Dimensions.get('window');

const CATEGORIES = [
  { id: 'all', label: 'Todos' },
  { id: 'service', label: 'Serviços' },
  { id: 'parts', label: 'Peças' },
  { id: 'lifestyle', label: 'Lifestyle' },
];

const REWARDS = [
  {
    id: 'r1',
    name: 'Revisão Premium',
    desc: 'Inclui troca de óleo + filtros',
    points: 2000,
    icon: 'wrench',
    bg: '#e8efff',
    color: COLORS.primary,
    tag: 'POPULAR',
  },
  {
    id: 'r2',
    name: '20% off Acessórios',
    desc: 'Cupom para loja oficial',
    points: 800,
    icon: 'tag-heart',
    bg: '#fdf0e6',
    color: '#ff7043',
    tag: null,
  },
  {
    id: 'r3',
    name: 'Lavagem Detalhada',
    desc: 'Externa + interna + cera',
    points: 500,
    icon: 'car-wash',
    bg: '#e9f7ee',
    color: '#1e8e3e',
    tag: 'NOVO',
  },
  {
    id: 'r4',
    name: 'Boné Ford Original',
    desc: 'Edição limitada Mustang',
    points: 1200,
    icon: 'tshirt-crew',
    bg: '#fce4ec',
    color: '#e91e63',
    tag: null,
  },
];

const HISTORY = [
  { id: 'h1', type: 'earn', label: 'Revisão Preventiva', date: '15 Mar', points: 350 },
  { id: 'h2', type: 'earn', label: 'Indicação - Carlos M.', date: '10 Mar', points: 200 },
  { id: 'h3', type: 'spend', label: 'Resgate: 10% off peças', date: '02 Mar', points: -400 },
  { id: 'h4', type: 'earn', label: 'Troca de óleo', date: '22 Fev', points: 150 },
];

export default function PointsScreen() {
  const [cat, setCat] = useState('all');
  const balance = 2450;
  const tier = 'Ford Gold';
  const nextTierAt = 5000;
  const tierPct = (balance / nextTierAt) * 100;

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
                <Text style={styles.pointsValue}>{balance.toLocaleString('pt-BR')}</Text>
                <Text style={styles.pointsUnit}>pts</Text>
              </View>
            </View>
            <FordLogo width={70} height={28} style={{ opacity: 0.9 }} />
          </View>

          <View style={styles.tierRow}>
            <View style={styles.tierBadge}>
              <MaterialCommunityIcons name="medal" size={14} color="#f5a623" />
              <Text style={styles.tierText}>{tier}</Text>
            </View>
            <Text style={styles.tierGoal}>
              Faltam {(nextTierAt - balance).toLocaleString('pt-BR')} pra Platinum
            </Text>
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
            <Text style={styles.statValue}>+750</Text>
            <Text style={styles.statLabel}>este mês</Text>
          </View>
          <View style={styles.statCard}>
            <MaterialCommunityIcons name="account-multiple" size={20} color={COLORS.primary} />
            <Text style={styles.statValue}>3</Text>
            <Text style={styles.statLabel}>indicações</Text>
          </View>
          <View style={styles.statCard}>
            <MaterialCommunityIcons name="gift-outline" size={20} color="#ff7043" />
            <Text style={styles.statValue}>2</Text>
            <Text style={styles.statLabel}>resgates</Text>
          </View>
        </View>

        {/* How to earn */}
        <View style={styles.earnBox}>
          <View style={styles.earnIcon}>
            <MaterialCommunityIcons name="lightning-bolt" size={20} color="#f5a623" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.earnTitle}>Ganhe pontos turbinado</Text>
            <Text style={styles.earnText}>Indique 3 amigos este mês e ganhe 500 pts bônus</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={20} color={COLORS.gray} />
        </View>

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

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
        >
          {REWARDS.map((r) => {
            const canRedeem = balance >= r.points;
            return (
              <TouchableOpacity
                key={r.id}
                style={styles.rewardCard}
                activeOpacity={0.9}
              >
                <View style={[styles.rewardImg, { backgroundColor: r.bg }]}>
                  <MaterialCommunityIcons name={r.icon as any} size={48} color={r.color} />
                  {r.tag && (
                    <View style={[styles.rewardTag, { backgroundColor: r.color }]}>
                      <Text style={styles.rewardTagText}>{r.tag}</Text>
                    </View>
                  )}
                </View>
                <View style={styles.rewardBody}>
                  <Text style={styles.rewardName} numberOfLines={1}>
                    {r.name}
                  </Text>
                  <Text style={styles.rewardDesc} numberOfLines={2}>
                    {r.desc}
                  </Text>
                  <View style={styles.rewardFoot}>
                    <View style={styles.rewardPoints}>
                      <MaterialCommunityIcons name="circle" size={6} color="#f5a623" />
                      <Text style={styles.rewardPointsText}>
                        {r.points.toLocaleString('pt-BR')} pts
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
          {HISTORY.map((h, i) => (
            <View key={h.id} style={[styles.historyRow, i === HISTORY.length - 1 && { borderBottomWidth: 0 }]}>
              <View
                style={[
                  styles.historyIcon,
                  { backgroundColor: h.type === 'earn' ? '#e9f7ee' : '#fce8e6' },
                ]}
              >
                <MaterialCommunityIcons
                  name={h.type === 'earn' ? 'arrow-up' : 'arrow-down'}
                  size={16}
                  color={h.type === 'earn' ? COLORS.success : '#ea4335'}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.historyLabel}>{h.label}</Text>
                <Text style={styles.historyDate}>{h.date}</Text>
              </View>
              <Text
                style={[
                  styles.historyPoints,
                  { color: h.type === 'earn' ? COLORS.success : '#ea4335' },
                ]}
              >
                {h.points > 0 ? '+' : ''}
                {h.points} pts
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
