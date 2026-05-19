import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  StatusBar,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';

import { COLORS } from '../../constants';
import { StateBox } from '../../components/StateBox';
import { useMyVehicles } from '../../hooks/useVehicles';
import { useUpdateOdometer } from '../../hooks/useUpdateOdometer';
import { ApiError } from '../../services/api';

export default function UpdateOdometerScreen() {
  const { vehicleId } = useLocalSearchParams<{ vehicleId: string }>();
  const vehiclesQuery = useMyVehicles();
  const vehicle = vehiclesQuery.data?.find((v) => v.id === vehicleId);

  const [value, setValue] = useState('');
  useEffect(() => {
    if (vehicle && !value) setValue(String(vehicle.currentKm));
  }, [vehicle, value]);

  const updateMutation = useUpdateOdometer(vehicleId);

  const parsed = Number(value.replace(/\D/g, ''));
  const valid =
    !!vehicle &&
    Number.isFinite(parsed) &&
    parsed >= vehicle.currentKm &&
    parsed - vehicle.currentKm < 100_000;

  async function handleSubmit() {
    if (!valid) return;
    try {
      await updateMutation.mutateAsync(parsed);
      Alert.alert('Quilometragem atualizada', `${parsed.toLocaleString('pt-BR')} km registrados.`, [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (e) {
      const message =
        e instanceof ApiError ? e.problem.detail || e.problem.title : 'Falha ao atualizar.';
      Alert.alert('Erro', message);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      <View style={styles.hero}>
        <View style={styles.heroBlob} />
        <View style={styles.heroTop}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
            <MaterialCommunityIcons name="close" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.heroTitle}>Atualizar km</Text>
          <View style={{ width: 40 }} />
        </View>

        <Text style={styles.heroSub}>
          Manter a quilometragem em dia ajuda a Ford a avisar antes da próxima revisão.
        </Text>
      </View>

      <View style={styles.body}>
        {!vehicle && (
          <StateBox
            variant="error"
            title="Veículo não encontrado"
            message="Tente abrir novamente pelo perfil."
            onRetry={() => router.back()}
            retryLabel="Voltar"
          />
        )}

        {vehicle && (
          <>
            <View style={styles.vehicleCard}>
              <MaterialCommunityIcons name="car-sports" size={36} color={COLORS.primary} />
              <View style={{ marginLeft: 12 }}>
                <Text style={styles.vehicleName}>Ford {vehicle.model}</Text>
                <Text style={styles.vehicleSub}>
                  {vehicle.year} · {vehicle.plate}
                </Text>
              </View>
            </View>

            <Text style={styles.label}>Quilometragem atual</Text>
            <View style={styles.inputBox}>
              <TextInput
                style={styles.input}
                placeholder="ex: 45000"
                placeholderTextColor={COLORS.gray}
                keyboardType="numeric"
                value={value}
                onChangeText={(t) => setValue(t.replace(/\D/g, ''))}
                editable={!updateMutation.isPending}
              />
              <Text style={styles.suffix}>km</Text>
            </View>

            <View style={styles.hintRow}>
              <MaterialCommunityIcons name="information-outline" size={14} color={COLORS.gray} />
              <Text style={styles.hint}>
                Último valor registrado: {vehicle.currentKm.toLocaleString('pt-BR')} km
              </Text>
            </View>

            {parsed < vehicle.currentKm && value !== '' && (
              <Text style={styles.error}>
                O novo valor precisa ser maior ou igual à quilometragem atual.
              </Text>
            )}

            <TouchableOpacity
              style={[styles.cta, !valid && styles.ctaDisabled]}
              disabled={!valid || updateMutation.isPending}
              onPress={handleSubmit}
              activeOpacity={0.85}
            >
              {updateMutation.isPending ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <MaterialCommunityIcons name="check" size={18} color="#fff" />
                  <Text style={styles.ctaText}>Salvar</Text>
                </>
              )}
            </TouchableOpacity>
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.primary },

  hero: {
    backgroundColor: COLORS.primary,
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 30,
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
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },
  heroSub: { color: 'rgba(255,255,255,0.85)', fontSize: 13, lineHeight: 18 },

  body: {
    flex: 1,
    backgroundColor: '#f5f5f7',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
  },

  vehicleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    marginTop: 8,
    marginBottom: 22,
  },
  vehicleName: { fontSize: 16, fontWeight: '800', color: COLORS.dark },
  vehicleSub: { fontSize: 12, color: COLORS.gray, marginTop: 2 },

  label: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.gray,
    letterSpacing: 0.5,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: '#eef0f3',
  },
  input: {
    flex: 1,
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.dark,
    paddingVertical: 14,
  },
  suffix: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.gray,
  },

  hintRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 },
  hint: { fontSize: 11, color: COLORS.gray, fontWeight: '600' },
  error: {
    fontSize: 12,
    color: '#ea4335',
    fontWeight: '600',
    marginTop: 10,
  },

  cta: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    marginTop: 'auto',
    marginBottom: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  ctaDisabled: { backgroundColor: '#c5cdd9', shadowOpacity: 0 },
  ctaText: { color: '#fff', fontSize: 15, fontWeight: '800', letterSpacing: 0.3 },
});
