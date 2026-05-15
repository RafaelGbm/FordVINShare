import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Dimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { COLORS } from '../../constants';

const { width } = Dimensions.get('window');

const FILTERS = [
  { id: 'all', label: 'Todas', icon: 'view-grid' },
  { id: 'warranty', label: 'Em garantia', icon: 'shield-check' },
  { id: '24h', label: '24h', icon: 'clock-outline' },
  { id: 'premium', label: 'Premium', icon: 'star' },
];

const DEALERS = [
  {
    id: 'sp1',
    name: 'Ford SP Centro',
    addr: 'Av. Paulista, 1500 - Bela Vista',
    distance: '2.3 km',
    rating: 4.8,
    reviews: 1240,
    open: true,
    closesAt: '19h',
    services: ['Revisão', 'Pneus', 'Funilaria'],
    badge: 'PREMIUM',
  },
  {
    id: 'sp2',
    name: 'Ford Tatuapé',
    addr: 'R. Tuiuti, 850 - Tatuapé',
    distance: '5.7 km',
    rating: 4.6,
    reviews: 832,
    open: true,
    closesAt: '18h',
    services: ['Revisão', 'Diagnóstico'],
    badge: null,
  },
  {
    id: 'sp3',
    name: 'Ford Morumbi',
    addr: 'Av. Giovanni Gronchi, 220',
    distance: '8.1 km',
    rating: 4.9,
    reviews: 2104,
    open: false,
    closesAt: '08h amanhã',
    services: ['24h', 'Funilaria', 'Pintura'],
    badge: 'PREMIUM',
  },
  {
    id: 'sp4',
    name: 'Ford Pinheiros',
    addr: 'R. Teodoro Sampaio, 1100',
    distance: '11.4 km',
    rating: 4.5,
    reviews: 567,
    open: true,
    closesAt: '20h',
    services: ['Revisão', 'Pneus'],
    badge: null,
  },
];

export default function LocatorScreen() {
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState<string | null>('sp1');

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      {/* Hero with search */}
      <View style={styles.hero}>
        <View style={styles.heroBlob} />

        <View style={styles.heroHead}>
          <View>
            <Text style={styles.heroSub}>Localizador</Text>
            <Text style={styles.heroTitle}>Concessionárias Ford</Text>
          </View>
          <TouchableOpacity style={styles.iconBtn}>
            <MaterialCommunityIcons name="tune-variant" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.searchBar}>
          <MaterialCommunityIcons name="magnify" size={20} color={COLORS.gray} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por nome ou bairro..."
            placeholderTextColor={COLORS.gray}
          />
          <MaterialCommunityIcons name="crosshairs-gps" size={20} color={COLORS.primary} />
        </View>
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Map Preview */}
        <View style={styles.mapBox}>
          {/* Grid pattern simulating map */}
          <View style={styles.mapGrid}>
            {Array.from({ length: 8 }).map((_, i) => (
              <View key={`h-${i}`} style={[styles.mapGridLine, { top: i * 22, width: '100%', height: 1 }]} />
            ))}
            {Array.from({ length: 10 }).map((_, i) => (
              <View key={`v-${i}`} style={[styles.mapGridLine, { left: i * 40, height: '100%', width: 1 }]} />
            ))}
          </View>

          {/* Road */}
          <View style={styles.mapRoad1} />
          <View style={styles.mapRoad2} />
          <View style={styles.mapRoad3} />

          {/* User pin */}
          <View style={[styles.mapPin, { top: 70, left: width / 2 - 30 }]}>
            <View style={styles.userPinOuter}>
              <View style={styles.userPinInner} />
            </View>
            <Text style={styles.userPinLabel}>VOCÊ</Text>
          </View>

          {/* Dealer pins */}
          <View style={[styles.dealerPin, { top: 30, left: 50 }]}>
            <MaterialCommunityIcons name="map-marker" size={36} color={COLORS.primary} />
          </View>
          <View style={[styles.dealerPin, { top: 100, right: 60 }]}>
            <MaterialCommunityIcons name="map-marker" size={36} color={COLORS.primary} />
          </View>
          <View style={[styles.dealerPin, { bottom: 30, left: 80 }]}>
            <MaterialCommunityIcons name="map-marker" size={36} color={COLORS.primary} />
          </View>
          <View style={[styles.dealerPin, { bottom: 50, right: 30 }]}>
            <MaterialCommunityIcons name="map-marker" size={36} color={COLORS.primary} />
          </View>

          {/* Zoom controls */}
          <View style={styles.mapControls}>
            <TouchableOpacity style={styles.mapControlBtn}>
              <MaterialCommunityIcons name="plus" size={18} color={COLORS.dark} />
            </TouchableOpacity>
            <View style={styles.mapControlDivider} />
            <TouchableOpacity style={styles.mapControlBtn}>
              <MaterialCommunityIcons name="minus" size={18} color={COLORS.dark} />
            </TouchableOpacity>
          </View>

          {/* Expand button */}
          <TouchableOpacity style={styles.expandBtn}>
            <MaterialCommunityIcons name="arrow-expand" size={16} color={COLORS.primary} />
            <Text style={styles.expandBtnText}>Tela cheia</Text>
          </TouchableOpacity>
        </View>

        {/* Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filtersRow}
          contentContainerStyle={{ paddingHorizontal: 20 }}
        >
          {FILTERS.map((f) => {
            const active = filter === f.id;
            return (
              <TouchableOpacity
                key={f.id}
                style={[styles.filterChip, active && styles.filterChipActive]}
                onPress={() => setFilter(f.id)}
                activeOpacity={0.85}
              >
                <MaterialCommunityIcons
                  name={f.icon as any}
                  size={14}
                  color={active ? '#fff' : COLORS.gray}
                />
                <Text style={[styles.filterText, active && styles.filterTextActive]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* List */}
        <View style={styles.listHead}>
          <Text style={styles.listTitle}>{DEALERS.length} concessionárias próximas</Text>
          <TouchableOpacity style={styles.sortBtn}>
            <MaterialCommunityIcons name="sort-variant" size={14} color={COLORS.primary} />
            <Text style={styles.sortText}>Distância</Text>
          </TouchableOpacity>
        </View>

        {DEALERS.map((d) => {
          const active = selected === d.id;
          return (
            <TouchableOpacity
              key={d.id}
              style={[styles.dealerCard, active && styles.dealerCardActive]}
              onPress={() => setSelected(d.id)}
              activeOpacity={0.9}
            >
              <View style={styles.dealerHead}>
                <View style={styles.dealerIconBg}>
                  <MaterialCommunityIcons name="store" size={22} color={COLORS.primary} />
                </View>

                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={styles.dealerName}>{d.name}</Text>
                    {d.badge && (
                      <View style={styles.premiumBadge}>
                        <MaterialCommunityIcons name="star" size={9} color="#f5a623" />
                        <Text style={styles.premiumText}>{d.badge}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.dealerAddr}>{d.addr}</Text>
                </View>

                <Text style={styles.dealerDistance}>{d.distance}</Text>
              </View>

              <View style={styles.dealerMeta}>
                <View style={styles.metaItem}>
                  <MaterialCommunityIcons name="star" size={13} color="#f5a623" />
                  <Text style={styles.metaText}>
                    {d.rating} <Text style={styles.metaSub}>({d.reviews})</Text>
                  </Text>
                </View>
                <View style={styles.metaDivider} />
                <View style={styles.metaItem}>
                  <View
                    style={[
                      styles.statusDot,
                      { backgroundColor: d.open ? COLORS.success : '#ea4335' },
                    ]}
                  />
                  <Text style={[styles.metaText, { color: d.open ? COLORS.success : '#ea4335' }]}>
                    {d.open ? `Aberto até ${d.closesAt}` : `Fecha às ${d.closesAt}`}
                  </Text>
                </View>
              </View>

              <View style={styles.servicesRow}>
                {d.services.map((s) => (
                  <View key={s} style={styles.serviceChip}>
                    <Text style={styles.serviceChipText}>{s}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.actionsRow}>
                <TouchableOpacity style={styles.actionBtnPrimary} activeOpacity={0.85}>
                  <MaterialCommunityIcons name="directions" size={18} color="#fff" />
                  <Text style={styles.actionBtnPrimaryText}>Rota</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtnSecondary} activeOpacity={0.85}>
                  <MaterialCommunityIcons name="phone" size={18} color={COLORS.primary} />
                  <Text style={styles.actionBtnSecondaryText}>Ligar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtnIcon} activeOpacity={0.85}>
                  <MaterialCommunityIcons name="heart-outline" size={18} color={COLORS.gray} />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        })}

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
    top: -60,
    right: -40,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.06)',
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

  /* Map */
  mapBox: {
    marginHorizontal: 20,
    height: 220,
    backgroundColor: '#e6ecf2',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    position: 'relative',
  },
  mapGrid: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  mapGridLine: { position: 'absolute', backgroundColor: 'rgba(0,0,0,0.04)' },
  mapRoad1: {
    position: 'absolute',
    top: 60,
    left: -20,
    right: -20,
    height: 14,
    backgroundColor: '#fff',
    transform: [{ rotate: '-8deg' }],
  },
  mapRoad2: {
    position: 'absolute',
    top: 130,
    left: -20,
    right: -20,
    height: 10,
    backgroundColor: '#fff',
    transform: [{ rotate: '5deg' }],
  },
  mapRoad3: {
    position: 'absolute',
    top: -20,
    bottom: -20,
    left: width / 2 - 30,
    width: 12,
    backgroundColor: '#fff',
    transform: [{ rotate: '12deg' }],
  },
  mapPin: { position: 'absolute', alignItems: 'center' },
  userPinOuter: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(26,115,232,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userPinInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#1a73e8',
    borderWidth: 2,
    borderColor: '#fff',
  },
  userPinLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: '#1a73e8',
    backgroundColor: '#fff',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    marginTop: 4,
    letterSpacing: 0.5,
  },
  dealerPin: { position: 'absolute' },
  mapControls: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mapControlBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  mapControlDivider: { height: 1, backgroundColor: '#eef0f3' },
  expandBtn: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  expandBtnText: { fontSize: 12, fontWeight: '700', color: COLORS.primary },

  /* Filters */
  filtersRow: { marginBottom: 14 },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 20,
    marginRight: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: '#eef0f3',
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterText: { fontSize: 13, fontWeight: '700', color: COLORS.gray },
  filterTextActive: { color: '#fff' },

  /* List */
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

  /* Dealer Card */
  dealerCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    marginHorizontal: 20,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: '#eef0f3',
  },
  dealerCardActive: { borderColor: COLORS.primary },
  dealerHead: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  dealerIconBg: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#f0f5ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  dealerName: { fontSize: 15, fontWeight: '800', color: COLORS.dark },
  dealerAddr: { fontSize: 12, color: COLORS.gray, marginTop: 2 },
  dealerDistance: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primary,
    backgroundColor: '#f0f5ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff4e0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
    gap: 3,
  },
  premiumText: { fontSize: 9, fontWeight: '800', color: '#a36b00', letterSpacing: 0.3 },

  dealerMeta: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 10 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, fontWeight: '700', color: COLORS.dark },
  metaSub: { color: COLORS.gray, fontWeight: '500' },
  metaDivider: { width: 1, height: 12, backgroundColor: '#e6e8eb' },
  statusDot: { width: 7, height: 7, borderRadius: 3.5 },

  servicesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  serviceChip: {
    backgroundColor: '#f5f5f7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  serviceChipText: { fontSize: 10, fontWeight: '700', color: COLORS.gray },

  actionsRow: { flexDirection: 'row', gap: 8 },
  actionBtnPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  actionBtnPrimaryText: { color: '#fff', fontWeight: '800', fontSize: 13 },
  actionBtnSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f5ff',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  actionBtnSecondaryText: { color: COLORS.primary, fontWeight: '800', fontSize: 13 },
  actionBtnIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#f5f5f7',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
