import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Switch,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { COLORS } from '../../constants';
import { useAuthStore } from '../../utils/store';
import { authService } from '../../services/auth.service';
import { useMe } from '../../hooks/useAuth';
import { useMyVehicles } from '../../hooks/useVehicles';
import { WarrantyStatus } from '../../services/vehicles.service';

function warrantyMeta(status: WarrantyStatus) {
  switch (status) {
    case 'ACTIVE':
      return { label: 'Garantia ativa', color: COLORS.success };
    case 'EXPIRING_SOON':
      return { label: 'Garantia vencendo', color: '#f5a623' };
    case 'EXPIRED':
      return { label: 'Garantia vencida', color: '#ea4335' };
  }
}

export default function ProfileScreen() {
  const logout = useAuthStore((state) => state.logout);
  const { data: me } = useMe();
  const { data: vehicles } = useMyVehicles();
  const [notifPush, setNotifPush] = useState(true);
  const [notifEmail, setNotifEmail] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const primaryVehicle = vehicles?.[0];
  const initials =
    me?.name
      ?.split(' ')
      .slice(0, 2)
      .map((n) => n[0])
      .join('') ?? '—';

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
          <Text style={styles.heroLabel}>Minha conta</Text>
          <TouchableOpacity style={styles.iconBtn}>
            <MaterialCommunityIcons name="pencil-outline" size={18} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarBig}>
            <Text style={styles.avatarBigText}>{initials}</Text>
            <View style={styles.avatarBadge}>
              <MaterialCommunityIcons name="check-decagram" size={18} color={COLORS.primary} />
            </View>
          </View>
          <Text style={styles.profileName}>{me?.name ?? '—'}</Text>
          <View style={styles.profileTier}>
            <MaterialCommunityIcons name="medal" size={12} color="#ffc966" />
            <Text style={styles.profileTierText}>
              Ford Gold{me?.createdAt && ` · Cliente desde ${new Date(me.createdAt).getFullYear()}`}
            </Text>
          </View>

          <View style={styles.profileStats}>
            <View style={styles.profileStat}>
              <Text style={styles.profileStatValue}>12</Text>
              <Text style={styles.profileStatLabel}>serviços</Text>
            </View>
            <View style={styles.profileStatSep} />
            <View style={styles.profileStat}>
              <Text style={styles.profileStatValue}>2.450</Text>
              <Text style={styles.profileStatLabel}>pontos</Text>
            </View>
            <View style={styles.profileStatSep} />
            <View style={styles.profileStat}>
              <Text style={styles.profileStatValue}>4.9</Text>
              <Text style={styles.profileStatLabel}>NPS</Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Personal data */}
        <SectionTitle>Dados pessoais</SectionTitle>
        <View style={styles.card}>
          <InfoRow icon="email-outline" label="Email" value={me?.email ?? '—'} />
          <Divider />
          <InfoRow icon="phone-outline" label="Telefone" value={me?.phone ?? '—'} />
          <Divider />
          <InfoRow
            icon="map-marker-outline"
            label="Endereço"
            value="Cadastre seu endereço"
            action
          />
        </View>

        {/* My Vehicle */}
        <SectionTitle>Meus veículos</SectionTitle>
        {(vehicles ?? []).map((v, idx) => {
          const statusMeta = warrantyMeta(v.warrantyStatus);
          return (
            <TouchableOpacity key={v.id} style={styles.vehicleCard} activeOpacity={0.85}>
              <View style={styles.vehicleIconBg}>
                <MaterialCommunityIcons name="car-sports" size={28} color={COLORS.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.vehicleTop}>
                  <Text style={styles.vehicleName}>Ford {v.model}</Text>
                  {idx === 0 && (
                    <View style={styles.vehicleDefault}>
                      <Text style={styles.vehicleDefaultText}>PRINCIPAL</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.vehicleInfo}>
                  {v.year} · {(v.currentKm / 1000).toFixed(0)}k km · {v.plate}
                </Text>
                <View style={styles.vehicleStatus}>
                  <View style={[styles.statusDotG, { backgroundColor: statusMeta.color }]} />
                  <Text style={[styles.vehicleStatusText, { color: statusMeta.color }]}>
                    {statusMeta.label}
                  </Text>
                </View>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={22} color={COLORS.gray} />
            </TouchableOpacity>
          );
        })}
        {!primaryVehicle && (
          <View style={[styles.vehicleCard, { justifyContent: 'center' }]}>
            <Text style={styles.rowSub}>Nenhum veículo cadastrado</Text>
          </View>
        )}

        <TouchableOpacity style={styles.addVehicleBtn} activeOpacity={0.85}>
          <MaterialCommunityIcons name="plus" size={18} color={COLORS.primary} />
          <Text style={styles.addVehicleBtnText}>Adicionar outro veículo</Text>
        </TouchableOpacity>

        {/* Preferences */}
        <SectionTitle>Preferências</SectionTitle>
        <View style={styles.card}>
          <ToggleRow
            icon="bell-outline"
            label="Notificações push"
            sub="Revisões, ofertas e alertas"
            value={notifPush}
            onChange={setNotifPush}
          />
          <Divider />
          <ToggleRow
            icon="email-newsletter"
            label="Email marketing"
            sub="Receber novidades por email"
            value={notifEmail}
            onChange={setNotifEmail}
          />
          <Divider />
          <ToggleRow
            icon="weather-night"
            label="Modo escuro"
            sub="Tema escuro do aplicativo"
            value={darkMode}
            onChange={setDarkMode}
          />
        </View>

        {/* Security & legal */}
        <SectionTitle>Segurança e privacidade</SectionTitle>
        <View style={styles.card}>
          <MenuRow icon="lock-outline" label="Alterar senha" />
          <Divider />
          <MenuRow icon="shield-check-outline" label="Autenticação em 2 fatores" badge="Ativada" badgeColor={COLORS.success} />
          <Divider />
          <MenuRow icon="file-document-outline" label="Termos de uso" />
          <Divider />
          <MenuRow icon="incognito" label="Política de privacidade" />
        </View>

        {/* Support */}
        <SectionTitle>Suporte</SectionTitle>
        <View style={styles.card}>
          <MenuRow icon="help-circle-outline" label="Central de ajuda" />
          <Divider />
          <MenuRow icon="message-text-outline" label="Falar com atendente" />
          <Divider />
          <MenuRow icon="star-outline" label="Avaliar o app" />
        </View>

        {/* Logout */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={handleLogout}
          activeOpacity={0.85}
        >
          <MaterialCommunityIcons name="logout" size={18} color="#ea4335" />
          <Text style={styles.logoutText}>Sair da conta</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>Ford VIN Share · v0.1.0</Text>

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <Text style={styles.sectionTitle}>{children}</Text>;
}

function Divider() {
  return <View style={styles.divider} />;
}

function InfoRow({
  icon,
  label,
  value,
  action,
}: {
  icon: string;
  label: string;
  value: string;
  action?: boolean;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.rowIcon}>
        <MaterialCommunityIcons name={icon as any} size={18} color={COLORS.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowValue}>{value}</Text>
      </View>
      {action && (
        <MaterialCommunityIcons name="chevron-right" size={20} color={COLORS.gray} />
      )}
    </View>
  );
}

function ToggleRow({
  icon,
  label,
  sub,
  value,
  onChange,
}: {
  icon: string;
  label: string;
  sub: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.rowIcon}>
        <MaterialCommunityIcons name={icon as any} size={18} color={COLORS.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowSub}>{sub}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: '#dde1e6', true: COLORS.primary }}
        thumbColor="#fff"
      />
    </View>
  );
}

function MenuRow({
  icon,
  label,
  badge,
  badgeColor,
}: {
  icon: string;
  label: string;
  badge?: string;
  badgeColor?: string;
}) {
  return (
    <TouchableOpacity style={styles.row} activeOpacity={0.85}>
      <View style={styles.rowIcon}>
        <MaterialCommunityIcons name={icon as any} size={18} color={COLORS.primary} />
      </View>
      <Text style={[styles.rowLabel, { flex: 1 }]}>{label}</Text>
      {badge && (
        <View style={[styles.miniBadge, { backgroundColor: `${badgeColor}20` }]}>
          <Text style={[styles.miniBadgeText, { color: badgeColor }]}>{badge}</Text>
        </View>
      )}
      <MaterialCommunityIcons name="chevron-right" size={20} color={COLORS.gray} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.primary },

  /* Hero */
  hero: {
    backgroundColor: COLORS.primary,
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 70,
    overflow: 'hidden',
  },
  heroBlob1: {
    position: 'absolute',
    top: -50,
    right: -40,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  heroBlob2: {
    position: 'absolute',
    bottom: -30,
    left: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  heroLabel: { color: '#fff', fontSize: 16, fontWeight: '800' },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* Profile Card */
  profileCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    paddingTop: 50,
    paddingBottom: 18,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    position: 'relative',
  },
  avatarBig: {
    position: 'absolute',
    top: -34,
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: COLORS.primary,
  },
  avatarBigText: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: -1,
  },
  avatarBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  profileName: { color: '#fff', fontSize: 18, fontWeight: '800', marginBottom: 4 },
  profileTier: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 16 },
  profileTierText: { color: 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: '700' },

  profileStats: {
    flexDirection: 'row',
    width: '100%',
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.15)',
  },
  profileStat: { flex: 1, alignItems: 'center' },
  profileStatValue: { color: '#fff', fontSize: 18, fontWeight: '800' },
  profileStatLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: '600', marginTop: 2 },
  profileStatSep: { width: 1, backgroundColor: 'rgba(255,255,255,0.15)' },

  /* Scroll */
  scrollArea: {
    flex: 1,
    backgroundColor: '#f5f5f7',
    marginTop: -40,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  scrollContent: { padding: 20, paddingTop: 26 },

  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.gray,
    letterSpacing: 1.5,
    marginBottom: 10,
    marginTop: 12,
    textTransform: 'uppercase',
  },

  /* Card */
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#f0f5ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rowLabel: { fontSize: 14, fontWeight: '700', color: COLORS.dark },
  rowValue: { fontSize: 12, color: COLORS.gray, marginTop: 2 },
  rowSub: { fontSize: 11, color: COLORS.gray, marginTop: 2 },
  divider: { height: 1, backgroundColor: '#f0f2f5', marginLeft: 48 },

  miniBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginRight: 6,
  },
  miniBadgeText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.3 },

  /* Vehicle */
  vehicleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
    marginBottom: 10,
  },
  vehicleIconBg: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: '#f0f5ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  vehicleTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  vehicleName: { fontSize: 15, fontWeight: '800', color: COLORS.dark },
  vehicleDefault: {
    backgroundColor: '#e8efff',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 5,
  },
  vehicleDefaultText: { fontSize: 9, fontWeight: '800', color: COLORS.primary, letterSpacing: 0.5 },
  vehicleInfo: { fontSize: 12, color: COLORS.gray, marginTop: 4 },
  vehicleStatus: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 6 },
  statusDotG: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: COLORS.success },
  vehicleStatusText: { fontSize: 11, color: COLORS.success, fontWeight: '700' },

  addVehicleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    backgroundColor: '#fff',
    gap: 6,
  },
  addVehicleBtnText: { color: COLORS.primary, fontWeight: '800', fontSize: 13 },

  /* Logout */
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#fff',
    marginTop: 24,
    gap: 8,
    borderWidth: 1.5,
    borderColor: '#fce8e6',
  },
  logoutText: { color: '#ea4335', fontWeight: '800', fontSize: 14 },

  versionText: {
    textAlign: 'center',
    fontSize: 11,
    color: COLORS.gray,
    marginTop: 16,
    fontWeight: '600',
  },
});
