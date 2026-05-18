import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { useAuthStore } from '../utils/store';
import { COLORS } from '../constants';
import FordLogo from '../components/FordLogo';
import { authService, UserRole } from '../services/auth.service';
import { ApiError } from '../services/api';

function mapApiRole(role: UserRole): 'client' | 'analyst' {
  return role === 'ANALYST' ? 'analyst' : 'client';
}

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setUser = useAuthStore((state) => state.setUser);

  const isValid = email.trim().length > 3 && email.includes('@') && password.length >= 6;

  const handleLogin = async () => {
    if (!isValid || loading) return;

    setLoading(true);
    setError(null);

    try {
      const data = await authService.login({ email: email.trim(), password });
      const me = await authService.getMe();

      const role = mapApiRole(data.role);

      setUser(
        {
          id: me.userId,
          email: me.email,
          name: me.name,
          phone: me.phone,
          role,
          created_at: me.createdAt,
        },
        role
      );

      router.replace(role === 'analyst' ? '/(analyst)/dashboard' : '/(client)/home');
    } catch (e) {
      const message =
        e instanceof ApiError
          ? e.problem.status === 401
            ? 'Email ou senha incorretos'
            : e.problem.status === 429
              ? 'Muitas tentativas. Aguarde um instante.'
              : e.problem.detail || e.problem.title
          : 'Não foi possível conectar. Verifique sua conexão.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
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
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Acesse sua conta</Text>
          <Text style={styles.cardSubtitle}>Use o email e senha cadastrados</Text>

          {/* Email */}
          <Text style={styles.label}>Email</Text>
          <View style={[styles.inputBox, error && styles.inputBoxError]}>
            <MaterialCommunityIcons name="email-outline" size={20} color={COLORS.gray} />
            <TextInput
              style={styles.input}
              placeholder="seu@email.com"
              placeholderTextColor={COLORS.gray}
              value={email}
              onChangeText={(t) => {
                setEmail(t);
                setError(null);
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />
          </View>

          {/* Password */}
          <Text style={styles.label}>Senha</Text>
          <View style={[styles.inputBox, error && styles.inputBoxError]}>
            <MaterialCommunityIcons name="lock-outline" size={20} color={COLORS.gray} />
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor={COLORS.gray}
              value={password}
              onChangeText={(t) => {
                setPassword(t);
                setError(null);
              }}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
              onSubmitEditing={handleLogin}
            />
            <TouchableOpacity onPress={() => setShowPassword((s) => !s)}>
              <MaterialCommunityIcons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color={COLORS.gray}
              />
            </TouchableOpacity>
          </View>

          {/* Error banner */}
          {error && (
            <View style={styles.errorBanner}>
              <MaterialCommunityIcons name="alert-circle" size={16} color="#c62828" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Forgot password */}
          <TouchableOpacity style={styles.forgotBtn}>
            <Text style={styles.forgotText}>Esqueci minha senha</Text>
          </TouchableOpacity>

          {/* CTA */}
          <TouchableOpacity
            style={[styles.cta, (!isValid || loading) && styles.ctaDisabled]}
            onPress={handleLogin}
            disabled={!isValid || loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Text style={styles.ctaText}>Entrar</Text>
                <MaterialCommunityIcons name="arrow-right" size={20} color="#fff" />
              </>
            )}
          </TouchableOpacity>

          <View style={styles.dividerWrap}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>OU</Text>
            <View style={styles.divider} />
          </View>

          <TouchableOpacity style={styles.secondaryBtn} activeOpacity={0.8} disabled={loading}>
            <MaterialCommunityIcons name="qrcode-scan" size={20} color={COLORS.primary} />
            <Text style={styles.secondaryBtnText}>Escanear VIN do veículo</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>Ford VIN Share © 2026 · v0.1.0</Text>
      </ScrollView>
    </KeyboardAvoidingView>
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

  /* Scroll */
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
    marginBottom: 22,
  },

  /* Inputs */
  label: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.gray,
    letterSpacing: 0.5,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f7',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: 'transparent',
    gap: 10,
  },
  inputBoxError: {
    borderColor: '#ea4335',
    backgroundColor: '#fce8e6',
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: COLORS.dark,
    paddingVertical: 12,
  },

  /* Error */
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fce8e6',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 12,
    gap: 8,
  },
  errorText: {
    color: '#c62828',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },

  /* Forgot */
  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: 8,
  },
  forgotText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '700',
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
    marginTop: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  ctaDisabled: {
    backgroundColor: '#c5cdd9',
    shadowOpacity: 0,
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
