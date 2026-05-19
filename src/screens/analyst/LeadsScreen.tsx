import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { COLORS } from '../../constants';
import { useCreateLeadAction, useLeads } from '../../hooks/useLeads';
import { Lead, LeadStatus } from '../../services/leads.service';
import { ApiError } from '../../services/api';

type UiStatus = 'all' | 'lost' | 'risk' | 'new' | 'recovered';

const API_TO_UI: Record<LeadStatus, Exclude<UiStatus, 'all'>> = {
  PERDIDO: 'lost',
  EM_RISCO: 'risk',
  NOVO: 'new',
  RECUPERADO: 'recovered',
};

const STATUS_META: Record<Exclude<UiStatus, 'all'>, { label: string; color: string; bg: string }> = {
  lost: { label: 'Perdido', color: '#ea4335', bg: '#fce8e6' },
  risk: { label: 'Em risco', color: '#a36b00', bg: '#fff4e0' },
  new: { label: 'Novo', color: COLORS.secondary, bg: '#e8efff' },
  recovered: { label: 'Recuperado', color: COLORS.success, bg: '#e9f7ee' },
};

const FILTER_ORDER: UiStatus[] = ['all', 'lost', 'risk', 'new', 'recovered'];

const AVATAR_COLORS = ['#5e35b1', '#e91e63', '#ff7043', '#1e8e3e', COLORS.primary, '#00897b', '#8e24aa'];

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function avatarColor(id: string) {
  let sum = 0;
  for (let i = 0; i < id.length; i++) sum += id.charCodeAt(i);
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
}

function formatLastVisit(days: number) {
  if (days < 30) return `${days} ${days === 1 ? 'dia' : 'dias'}`;
  const months = Math.floor(days / 30);
  return `${months} ${months === 1 ? 'mês' : 'meses'}`;
}

export default function LeadsScreen() {
  const [filter, setFilter] = useState<UiStatus>('all');
  const [search, setSearch] = useState('');

  const { data, isLoading, error, refetch, isRefetching } = useLeads({ size: 200 });
  const leads = useMemo(() => data?.content ?? [], [data]);

  const counts = useMemo(() => {
    const acc: Record<UiStatus, number> = {
      all: leads.length,
      lost: 0,
      risk: 0,
      new: 0,
      recovered: 0,
    };
    for (const l of leads) acc[API_TO_UI[l.status]]++;
    return acc;
  }, [leads]);

  const filteredLeads = useMemo(() => {
    const term = search.toLowerCase();
    return leads
      .filter((l) => filter === 'all' || API_TO_UI[l.status] === filter)
      .filter((l) => l.customerName.toLowerCase().includes(term));
  }, [leads, filter, search]);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      <View style={styles.hero}>
        <View style={styles.heroBlob} />

        <View style={styles.heroTop}>
          <View>
            <Text style={styles.heroSub}>Gestão de carteira</Text>
            <Text style={styles.heroTitle}>Leads</Text>
          </View>
          <TouchableOpacity style={styles.iconBtn} onPress={() => refetch()}>
            <MaterialCommunityIcons
              name={isRefetching ? 'loading' : 'refresh'}
              size={20}
              color="#fff"
            />
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
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
          style={styles.filtersScroll}
        >
          {FILTER_ORDER.map((id) => {
            const active = filter === id;
            const meta =
              id === 'all'
                ? { label: 'Todos', color: COLORS.primary }
                : STATUS_META[id];
            return (
              <TouchableOpacity
                key={id}
                style={[
                  styles.filterChip,
                  active && { borderColor: meta.color, backgroundColor: `${meta.color}10` },
                ]}
                onPress={() => setFilter(id)}
                activeOpacity={0.85}
              >
                <View style={[styles.filterDot, { backgroundColor: meta.color }]} />
                <Text style={[styles.filterText, active && { color: meta.color }]}>
                  {meta.label}
                </Text>
                <View style={[styles.filterCount, active && { backgroundColor: meta.color }]}>
                  <Text style={[styles.filterCountText, active && { color: '#fff' }]}>
                    {counts[id]}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.listHead}>
          <Text style={styles.listTitle}>
            {filteredLeads.length} {filteredLeads.length === 1 ? 'lead' : 'leads'}
          </Text>
          <TouchableOpacity style={styles.sortBtn}>
            <MaterialCommunityIcons name="sort-variant" size={14} color={COLORS.primary} />
            <Text style={styles.sortText}>Score</Text>
          </TouchableOpacity>
        </View>

        {isLoading && (
          <View style={styles.stateBox}>
            <ActivityIndicator color={COLORS.primary} />
            <Text style={styles.stateText}>Carregando leads...</Text>
          </View>
        )}

        {error && !isLoading && (
          <View style={styles.stateBox}>
            <MaterialCommunityIcons name="alert-circle-outline" size={36} color="#ea4335" />
            <Text style={styles.stateTitle}>Falha ao carregar leads</Text>
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

        {!isLoading && !error && filteredLeads.map((l) => (
          <LeadCard key={l.id} lead={l} />
        ))}

        {!isLoading && !error && filteredLeads.length === 0 && (
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

function LeadCard({ lead }: { lead: Lead }) {
  const uiStatus = API_TO_UI[lead.status];
  const meta = STATUS_META[uiStatus];
  const initials = initialsFromName(lead.customerName);
  const color = avatarColor(lead.id);

  const action = useCreateLeadAction(lead.id);

  function triggerWhatsapp() {
    action.mutate(
      { channel: 'WHATSAPP', templateId: 'RETORNO_REVISAO_DESCONTO' },
      {
        onSuccess: (res) => {
          Alert.alert('Mensagem registrada', `Ação ${res.actionId} enviada via WhatsApp`);
        },
        onError: (err) => {
          const message =
            err instanceof ApiError ? err.problem.detail || err.problem.title : 'Erro ao enviar';
          Alert.alert('Falha', message);
        },
      }
    );
  }

  function triggerCall() {
    action.mutate(
      { channel: 'CALL', templateId: 'LIGACAO_RETENCAO' },
      {
        onSuccess: (res) => {
          Alert.alert('Ligação registrada', `Ação ${res.actionId} agendada`);
        },
        onError: (err) => {
          const message =
            err instanceof ApiError ? err.problem.detail || err.problem.title : 'Erro ao registrar';
          Alert.alert('Falha', message);
        },
      }
    );
  }

  return (
    <TouchableOpacity
      style={styles.leadCard}
      activeOpacity={0.9}
      onPress={() => router.push(`/customers/${lead.customerId}` as any)}
    >
      <View style={styles.leadHead}>
        <View style={[styles.leadAvatar, { backgroundColor: color }]}>
          <Text style={styles.leadAvatarText}>{initials}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.leadName}>{lead.customerName}</Text>
          <View style={styles.leadMeta}>
            <MaterialCommunityIcons name="car" size={11} color={COLORS.gray} />
            <Text style={styles.leadMetaText}>{lead.vehicleModel}</Text>
            <Text style={styles.leadMetaDot}>·</Text>
            <Text style={styles.leadMetaText}>{lead.vehiclePlate}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: meta.bg }]}>
          <Text style={[styles.statusText, { color: meta.color }]}>{meta.label}</Text>
        </View>
      </View>

      <View style={styles.scoreBlock}>
        <View style={styles.scoreInfo}>
          <Text style={styles.scoreLabel}>Score de risco</Text>
          <Text style={[styles.scoreValue, { color: meta.color }]}>{lead.riskScore}/100</Text>
        </View>
        <View style={styles.scoreBar}>
          <View
            style={[
              styles.scoreFill,
              { width: `${Math.min(100, Math.max(0, lead.riskScore))}%`, backgroundColor: meta.color },
            ]}
          />
        </View>
      </View>

      <View style={styles.leadStats}>
        <View style={styles.leadStat}>
          <MaterialCommunityIcons name="clock-outline" size={12} color={COLORS.gray} />
          <Text style={styles.leadStatText}>{formatLastVisit(lead.daysSinceLastVisit)}</Text>
          <Text style={styles.leadStatSub}>sem visita</Text>
        </View>
        <View style={styles.leadStatSep} />
        <View style={styles.leadStat}>
          <MaterialCommunityIcons name="star" size={12} color="#f5a623" />
          <Text style={styles.leadStatText}>
            NPS {lead.lastNpsScore ?? '—'}
          </Text>
        </View>
      </View>

      {lead.recommendedAction && (
        <View style={styles.suggestion}>
          <MaterialCommunityIcons name="lightbulb-on-outline" size={13} color="#a36b00" />
          <Text style={styles.suggestionText}>{lead.recommendedAction}</Text>
        </View>
      )}

      <View style={styles.leadActions}>
        <TouchableOpacity
          style={[styles.actionPrimary, action.isPending && { opacity: 0.6 }]}
          activeOpacity={0.85}
          onPress={triggerCall}
          disabled={action.isPending}
        >
          <MaterialCommunityIcons name="phone" size={16} color="#fff" />
          <Text style={styles.actionPrimaryText}>Ligar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionSecondary, action.isPending && { opacity: 0.6 }]}
          activeOpacity={0.85}
          onPress={triggerWhatsapp}
          disabled={action.isPending}
        >
          <MaterialCommunityIcons name="message-text" size={16} color={COLORS.primary} />
          <Text style={styles.actionSecondaryText}>WhatsApp</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionIcon}
          activeOpacity={0.85}
          onPress={() => router.push(`/customers/${lead.customerId}` as any)}
        >
          <MaterialCommunityIcons name="account-details" size={18} color={COLORS.gray} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.primary },

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

  scrollArea: {
    flex: 1,
    backgroundColor: '#f5f5f7',
    marginTop: -28,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  scrollContent: { paddingTop: 18, paddingBottom: 30 },

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

  suggestion: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    backgroundColor: '#fff8e6',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 12,
  },
  suggestionText: { flex: 1, fontSize: 11, color: '#8c5a00', fontWeight: '600', lineHeight: 15 },

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

  stateBox: { alignItems: 'center', paddingVertical: 30, paddingHorizontal: 20, gap: 8 },
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

  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyTitle: { fontSize: 14, fontWeight: '800', color: COLORS.dark, marginTop: 12 },
  emptyDesc: { fontSize: 12, color: COLORS.gray, marginTop: 4 },
});
