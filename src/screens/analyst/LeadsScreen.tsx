import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { COLORS } from '../../constants';

type Status = 'all' | 'lost' | 'risk' | 'new' | 'loyal';

const STATUS_FILTERS: { id: Status; label: string; count: number; color: string }[] = [
  { id: 'all', label: 'Todos', count: 87, color: COLORS.primary },
  { id: 'lost', label: 'Perdido', count: 12, color: '#ea4335' },
  { id: 'risk', label: 'Em risco', count: 23, color: '#f5a623' },
  { id: 'new', label: 'Novo', count: 18, color: COLORS.secondary },
  { id: 'loyal', label: 'Fiel', count: 34, color: COLORS.success },
];

const LEADS = [
  {
    id: 'l1',
    name: 'Carlos Mendes',
    vehicle: 'Ford Ranger 2019',
    lastVisit: '14 meses',
    score: 87,
    status: 'lost' as Status,
    nps: 5,
    plate: 'EFG-7H89',
    initials: 'CM',
    color: '#5e35b1',
  },
  {
    id: 'l2',
    name: 'Patrícia Costa',
    vehicle: 'Ford EcoSport 2021',
    lastVisit: '9 meses',
    score: 72,
    status: 'risk' as Status,
    nps: 6,
    plate: 'XYZ-4M21',
    initials: 'PC',
    color: '#e91e63',
  },
  {
    id: 'l3',
    name: 'Roberto Lima',
    vehicle: 'Ford Ka 2020',
    lastVisit: '7 meses',
    score: 68,
    status: 'risk' as Status,
    nps: 7,
    plate: 'JKL-2N56',
    initials: 'RL',
    color: '#ff7043',
  },
  {
    id: 'l4',
    name: 'Mariana Alves',
    vehicle: 'Ford Bronco 2024',
    lastVisit: '1 mês',
    score: 15,
    status: 'new' as Status,
    nps: 9,
    plate: 'NEW-2024',
    initials: 'MA',
    color: '#1e8e3e',
  },
  {
    id: 'l5',
    name: 'Felipe Santos',
    vehicle: 'Ford Mustang 2023',
    lastVisit: '2 meses',
    score: 8,
    status: 'loyal' as Status,
    nps: 10,
    plate: 'GT5-0023',
    initials: 'FS',
    color: COLORS.primary,
  },
];

function statusStyle(status: Status) {
  switch (status) {
    case 'lost':
      return { color: '#ea4335', bg: '#fce8e6', label: 'Perdido' };
    case 'risk':
      return { color: '#a36b00', bg: '#fff4e0', label: 'Em risco' };
    case 'new':
      return { color: COLORS.secondary, bg: '#e8efff', label: 'Novo' };
    case 'loyal':
      return { color: COLORS.success, bg: '#e9f7ee', label: 'Fiel' };
    default:
      return { color: COLORS.gray, bg: '#f5f5f7', label: 'Todos' };
  }
}

export default function LeadsScreen() {
  const [filter, setFilter] = useState<Status>('all');
  const [search, setSearch] = useState('');

  const filteredLeads = LEADS.filter((l) => filter === 'all' || l.status === filter).filter((l) =>
    l.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      {/* Hero */}
      <View style={styles.hero}>
        <View style={styles.heroBlob} />

        <View style={styles.heroTop}>
          <View>
            <Text style={styles.heroSub}>Gestão de carteira</Text>
            <Text style={styles.heroTitle}>Leads</Text>
          </View>
          <TouchableOpacity style={styles.iconBtn}>
            <MaterialCommunityIcons name="dots-horizontal" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.searchBar}>
          <MaterialCommunityIcons name="magnify" size={20} color={COLORS.gray} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar lead por nome..."
            placeholderTextColor={COLORS.gray}
            value={search}
            onChangeText={setSearch}
          />
          <TouchableOpacity>
            <MaterialCommunityIcons name="tune-variant" size={20} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Status filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
          style={styles.filtersScroll}
        >
          {STATUS_FILTERS.map((f) => {
            const active = filter === f.id;
            return (
              <TouchableOpacity
                key={f.id}
                style={[styles.filterChip, active && { borderColor: f.color, backgroundColor: `${f.color}10` }]}
                onPress={() => setFilter(f.id)}
                activeOpacity={0.85}
              >
                <View style={[styles.filterDot, { backgroundColor: f.color }]} />
                <Text style={[styles.filterText, active && { color: f.color }]}>
                  {f.label}
                </Text>
                <View style={[styles.filterCount, active && { backgroundColor: f.color }]}>
                  <Text style={[styles.filterCountText, active && { color: '#fff' }]}>
                    {f.count}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* List head */}
        <View style={styles.listHead}>
          <Text style={styles.listTitle}>
            {filteredLeads.length} {filteredLeads.length === 1 ? 'lead' : 'leads'}
          </Text>
          <TouchableOpacity style={styles.sortBtn}>
            <MaterialCommunityIcons name="sort-variant" size={14} color={COLORS.primary} />
            <Text style={styles.sortText}>Score</Text>
          </TouchableOpacity>
        </View>

        {/* Leads list */}
        {filteredLeads.map((l) => {
          const s = statusStyle(l.status);
          return (
            <TouchableOpacity key={l.id} style={styles.leadCard} activeOpacity={0.9}>
              <View style={styles.leadHead}>
                <View style={[styles.leadAvatar, { backgroundColor: l.color }]}>
                  <Text style={styles.leadAvatarText}>{l.initials}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.leadName}>{l.name}</Text>
                  <View style={styles.leadMeta}>
                    <MaterialCommunityIcons name="car" size={11} color={COLORS.gray} />
                    <Text style={styles.leadMetaText}>{l.vehicle}</Text>
                    <Text style={styles.leadMetaDot}>·</Text>
                    <Text style={styles.leadMetaText}>{l.plate}</Text>
                  </View>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: s.bg }]}>
                  <Text style={[styles.statusText, { color: s.color }]}>{s.label}</Text>
                </View>
              </View>

              {/* Score bar */}
              <View style={styles.scoreBlock}>
                <View style={styles.scoreInfo}>
                  <Text style={styles.scoreLabel}>Score de risco</Text>
                  <Text style={[styles.scoreValue, { color: s.color }]}>{l.score}/100</Text>
                </View>
                <View style={styles.scoreBar}>
                  <View
                    style={[styles.scoreFill, { width: `${l.score}%`, backgroundColor: s.color }]}
                  />
                </View>
              </View>

              <View style={styles.leadStats}>
                <View style={styles.leadStat}>
                  <MaterialCommunityIcons name="clock-outline" size={12} color={COLORS.gray} />
                  <Text style={styles.leadStatText}>{l.lastVisit}</Text>
                  <Text style={styles.leadStatSub}>sem visita</Text>
                </View>
                <View style={styles.leadStatSep} />
                <View style={styles.leadStat}>
                  <MaterialCommunityIcons name="star" size={12} color="#f5a623" />
                  <Text style={styles.leadStatText}>NPS {l.nps}</Text>
                </View>
              </View>

              <View style={styles.leadActions}>
                <TouchableOpacity style={styles.actionPrimary} activeOpacity={0.85}>
                  <MaterialCommunityIcons name="phone" size={16} color="#fff" />
                  <Text style={styles.actionPrimaryText}>Ligar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionSecondary} activeOpacity={0.85}>
                  <MaterialCommunityIcons name="message-text" size={16} color={COLORS.primary} />
                  <Text style={styles.actionSecondaryText}>WhatsApp</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionIcon} activeOpacity={0.85}>
                  <MaterialCommunityIcons name="account-details" size={18} color={COLORS.gray} />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        })}

        {filteredLeads.length === 0 && (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="account-search-outline" size={48} color={COLORS.border} />
            <Text style={styles.emptyTitle}>Nenhum lead encontrado</Text>
            <Text style={styles.emptyDesc}>Ajuste os filtros ou a busca</Text>
          </View>
        )}

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
    paddingBottom: 50,
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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    gap: 10,
  },
  searchInput: { flex: 1, fontSize: 14, color: COLORS.dark, padding: 0 },

  /* Scroll */
  scrollArea: {
    flex: 1,
    backgroundColor: '#f5f5f7',
    marginTop: -28,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  scrollContent: { paddingTop: 18, paddingBottom: 30 },

  /* Filters */
  filtersScroll: { marginBottom: 12 },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 20,
    gap: 6,
    borderWidth: 1.5,
    borderColor: '#eef0f3',
  },
  filterDot: { width: 6, height: 6, borderRadius: 3 },
  filterText: { fontSize: 13, fontWeight: '700', color: COLORS.gray },
  filterCount: {
    backgroundColor: '#f0f2f5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    minWidth: 20,
    alignItems: 'center',
  },
  filterCountText: { fontSize: 10, fontWeight: '800', color: COLORS.gray },

  /* List head */
  listHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  listTitle: { fontSize: 13, fontWeight: '700', color: COLORS.dark },
  sortBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  sortText: { fontSize: 12, fontWeight: '700', color: COLORS.primary },

  /* Lead Card */
  leadCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    marginHorizontal: 20,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  leadHead: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  leadAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  leadAvatarText: { color: '#fff', fontSize: 14, fontWeight: '800' },
  leadName: { fontSize: 15, fontWeight: '800', color: COLORS.dark },
  leadMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 3, gap: 4 },
  leadMetaText: { fontSize: 11, color: COLORS.gray },
  leadMetaDot: { color: COLORS.gray, fontWeight: '700' },

  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },

  /* Score */
  scoreBlock: { marginBottom: 12 },
  scoreInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  scoreLabel: { fontSize: 11, color: COLORS.gray, fontWeight: '600' },
  scoreValue: { fontSize: 12, fontWeight: '800' },
  scoreBar: {
    height: 5,
    borderRadius: 3,
    backgroundColor: '#f0f2f5',
    overflow: 'hidden',
  },
  scoreFill: { height: '100%', borderRadius: 3 },

  /* Lead Stats */
  leadStats: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fafbfc',
    borderRadius: 10,
    paddingVertical: 8,
    marginBottom: 12,
  },
  leadStat: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 },
  leadStatText: { fontSize: 12, fontWeight: '700', color: COLORS.dark },
  leadStatSub: { fontSize: 10, color: COLORS.gray, marginLeft: 1 },
  leadStatSep: { width: 1, height: 16, backgroundColor: '#e6e8eb' },

  /* Actions */
  leadActions: { flexDirection: 'row', gap: 8 },
  actionPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  actionPrimaryText: { color: '#fff', fontWeight: '800', fontSize: 13 },
  actionSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e8efff',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  actionSecondaryText: { color: COLORS.primary, fontWeight: '800', fontSize: 13 },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#f5f5f7',
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* Empty */
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyTitle: { fontSize: 14, fontWeight: '800', color: COLORS.dark, marginTop: 12 },
  emptyDesc: { fontSize: 12, color: COLORS.gray, marginTop: 4 },
});
