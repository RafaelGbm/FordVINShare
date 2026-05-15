import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Dimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { useAuthStore, getMockUser, getMockAnalyst } from '../utils/store';
import { COLORS } from '../constants';
import FordLogo from '../components/FordLogo';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
  const [selectedRole, setSelectedRole] = useState<'client' | 'analyst'>('client');
  const [selectedClient, setSelectedClient] = useState<'client1' | 'client2'>('client1');
  const setUser = useAuthStore((state) => state.setUser);

  const handleLogin = () => {
    if (selectedRole === 'client') {
      const mockData = getMockUser(selectedClient);
      const user = {
        id: mockData.user.id,
        email: mockData.user.email,
        name: mockData.user.name,
        cpf: mockData.user.cpf,
        phone: mockData.user.phone,
        role: 'client' as const,
        created_at: new Date().toISOString(),
      };
      setUser(user, 'client');
      router.replace('/(client)/home');
    } else {
      const analyst = getMockAnalyst();
      const user = {
        id: analyst.id,
        email: analyst.email,
        name: analyst.name,
        cpf: analyst.cpf,
        phone: analyst.phone,
        role: 'analyst' as const,
        created_at: new Date().toISOString(),
      };
      setUser(user, 'analyst');
      router.replace('/(analyst)/dashboard');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      {/* Hero Header */}
      <View style={styles.hero}>
        <View style={styles.heroOverlay} />
        <View style={styles.heroContent}>
          <FordLogo width={200} height={80} />
          <Text style={styles.heroTitle}>VIN Share</Text>
          <Text style={styles.heroSubtitle}>Sua garantia. Sua rede. Seu carro.</Text>
        </View>
      </View>

      {/* Floating Card */}
      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Acesse sua conta</Text>
          <Text style={styles.cardSubtitle}>Escolha o tipo de perfil para continuar</Text>

          {/* Role Toggle */}
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[
                styles.toggleOption,
                selectedRole === 'client' && styles.toggleOptionActive,
              ]}
              onPress={() => setSelectedRole('client')}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons
                name="account-circle-outline"
                size={22}
                color={selectedRole === 'client' ? '#fff' : COLORS.gray}
              />
              <Text
                style={[
                  styles.toggleText,
                  selectedRole === 'client' && styles.toggleTextActive,
                ]}
              >
                Cliente
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.toggleOption,
                selectedRole === 'analyst' && styles.toggleOptionActive,
              ]}
              onPress={() => setSelectedRole('analyst')}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons
                name="chart-box-outline"
                size={22}
                color={selectedRole === 'analyst' ? '#fff' : COLORS.gray}
              />
              <Text
                style={[
                  styles.toggleText,
                  selectedRole === 'analyst' && styles.toggleTextActive,
                ]}
              >
                Analista
              </Text>
            </TouchableOpacity>
          </View>

          {/* Client selector */}
          {selectedRole === 'client' && (
            <View style={styles.selectorBlock}>
              <Text style={styles.selectorLabel}>Demo de perfil</Text>

              <TouchableOpacity
                style={[
                  styles.profileCard,
                  selectedClient === 'client1' && styles.profileCardActive,
                ]}
                onPress={() => setSelectedClient('client1')}
                activeOpacity={0.9}
              >
                <View style={styles.profileAvatar}>
                  <Text style={styles.profileAvatarText}>JS</Text>
                </View>
                <View style={styles.profileInfo}>
                  <Text style={styles.profileName}>João Silva</Text>
                  <Text style={styles.profileDetail}>Fiesta 2022</Text>
                  <View style={styles.statusBadgeActive}>
                    <View style={styles.statusDot} />
                    <Text style={styles.statusBadgeActiveText}>Garantia ativa</Text>
                  </View>
                </View>
                <MaterialCommunityIcons
                  name={selectedClient === 'client1' ? 'radiobox-marked' : 'radiobox-blank'}
                  size={24}
                  color={selectedClient === 'client1' ? COLORS.primary : COLORS.border}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.profileCard,
                  selectedClient === 'client2' && styles.profileCardActive,
                ]}
                onPress={() => setSelectedClient('client2')}
                activeOpacity={0.9}
              >
                <View style={[styles.profileAvatar, styles.profileAvatarAlt]}>
                  <Text style={styles.profileAvatarText}>MS</Text>
                </View>
                <View style={styles.profileInfo}>
                  <Text style={styles.profileName}>Maria Santos</Text>
                  <Text style={styles.profileDetail}>EcoSport 2021</Text>
                  <View style={styles.statusBadgeWarn}>
                    <View style={[styles.statusDot, styles.statusDotWarn]} />
                    <Text style={styles.statusBadgeWarnText}>Garantia vencida</Text>
                  </View>
                </View>
                <MaterialCommunityIcons
                  name={selectedClient === 'client2' ? 'radiobox-marked' : 'radiobox-blank'}
                  size={24}
                  color={selectedClient === 'client2' ? COLORS.primary : COLORS.border}
                />
              </TouchableOpacity>
            </View>
          )}

          {/* Analyst info */}
          {selectedRole === 'analyst' && (
            <View style={styles.analystBox}>
              <View style={styles.analystAvatar}>
                <Text style={styles.profileAvatarText}>AO</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.profileName}>Ana Oliveira</Text>
                <Text style={styles.profileDetail}>Concessionária Ford — São Paulo</Text>
                <View style={styles.analystTag}>
                  <MaterialCommunityIcons name="shield-star" size={12} color={COLORS.secondary} />
                  <Text style={styles.analystTagText}>Analista certificada</Text>
                </View>
              </View>
            </View>
          )}

          {/* CTA */}
          <TouchableOpacity style={styles.cta} onPress={handleLogin} activeOpacity={0.85}>
            <Text style={styles.ctaText}>Entrar</Text>
            <MaterialCommunityIcons name="arrow-right" size={20} color="#fff" />
          </TouchableOpacity>

          <View style={styles.dividerWrap}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>OU</Text>
            <View style={styles.divider} />
          </View>

          <TouchableOpacity style={styles.secondaryBtn} activeOpacity={0.8}>
            <MaterialCommunityIcons name="qrcode-scan" size={20} color={COLORS.primary} />
            <Text style={styles.secondaryBtnText}>Escanear VIN do veículo</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>
          Ford VIN Share © 2026 · Demonstração de conceito
        </Text>
      </ScrollView>
    </View>
  );
}

const HERO_HEIGHT = 280;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },

  /* Hero */
  hero: {
    height: HERO_HEIGHT,
    backgroundColor: COLORS.primary,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  heroOverlay: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  heroContent: {
    alignItems: 'center',
    paddingTop: 30,
  },
  heroTitle: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginTop: 16,
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 14,
    marginTop: 8,
    letterSpacing: 0.3,
  },

  /* Scroll content */
  scrollArea: {
    flex: 1,
    backgroundColor: '#f5f5f7',
    marginTop: -32,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 40,
  },

  /* Card */
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.dark,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    color: COLORS.gray,
    marginBottom: 24,
  },

  /* Toggle */
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#f0f2f5',
    borderRadius: 14,
    padding: 4,
    marginBottom: 24,
  },
  toggleOption: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  toggleOptionActive: {
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.gray,
  },
  toggleTextActive: {
    color: '#fff',
  },

  /* Selector block */
  selectorBlock: {
    marginBottom: 8,
  },
  selectorLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.gray,
    letterSpacing: 1,
    marginBottom: 12,
    textTransform: 'uppercase',
  },

  /* Profile card */
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: '#fafbfc',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#eef0f3',
    marginBottom: 10,
  },
  profileCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#f0f5ff',
  },
  profileAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  profileAvatarAlt: {
    backgroundColor: '#5e35b1',
  },
  profileAvatarText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.dark,
  },
  profileDetail: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 2,
  },
  statusBadgeActive: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    backgroundColor: '#e6f7ec',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    gap: 6,
  },
  statusBadgeActiveText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0f8a4f',
  },
  statusBadgeWarn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    backgroundColor: '#fff4e5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    gap: 6,
  },
  statusBadgeWarnText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#b35900',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#0f8a4f',
  },
  statusDotWarn: {
    backgroundColor: '#b35900',
  },

  /* Analyst */
  analystBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f0f5ff',
    borderRadius: 14,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  analystAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  analystTag: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 4,
    alignSelf: 'flex-start',
  },
  analystTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.secondary,
  },

  /* CTA */
  cta: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 20,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  ctaText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  /* Divider */
  dividerWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#e5e8ec',
  },
  dividerText: {
    fontSize: 11,
    color: COLORS.gray,
    fontWeight: '700',
    marginHorizontal: 12,
    letterSpacing: 1,
  },

  /* Secondary */
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    backgroundColor: '#fff',
    gap: 10,
  },
  secondaryBtnText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '700',
  },

  /* Footer */
  footer: {
    textAlign: 'center',
    fontSize: 11,
    color: COLORS.gray,
    marginTop: 24,
    letterSpacing: 0.3,
  },
});
