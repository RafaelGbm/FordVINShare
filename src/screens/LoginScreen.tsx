import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useAuthStore, getMockUser, getMockAnalyst } from '../utils/store';
import { COLORS } from '../constants';

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
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <MaterialCommunityIcons name="car" size={64} color={COLORS.primary} />
        <Text style={styles.title}>Ford VIN Share</Text>
        <Text style={styles.subtitle}>Sua garantia, sua rede</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Escolha seu perfil</Text>

        <View style={styles.roleSelector}>
          <TouchableOpacity
            style={[
              styles.roleButton,
              selectedRole === 'client' && styles.roleButtonActive,
            ]}
            onPress={() => setSelectedRole('client')}
          >
            <MaterialCommunityIcons
              name="account"
              size={24}
              color={selectedRole === 'client' ? COLORS.primary : COLORS.gray}
            />
            <Text
              style={[
                styles.roleButtonText,
                selectedRole === 'client' && styles.roleButtonTextActive,
              ]}
            >
              Cliente
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.roleButton,
              selectedRole === 'analyst' && styles.roleButtonActive,
            ]}
            onPress={() => setSelectedRole('analyst')}
          >
            <MaterialCommunityIcons
              name="chart-line"
              size={24}
              color={selectedRole === 'analyst' ? COLORS.primary : COLORS.gray}
            />
            <Text
              style={[
                styles.roleButtonText,
                selectedRole === 'analyst' && styles.roleButtonTextActive,
              ]}
            >
              Analista
            </Text>
          </TouchableOpacity>
        </View>

        {selectedRole === 'client' && (
          <View style={styles.clientSelector}>
            <Text style={styles.labelText}>Selecione um cliente demo:</Text>

            <TouchableOpacity
              style={[
                styles.clientOption,
                selectedClient === 'client1' && styles.clientOptionActive,
              ]}
              onPress={() => setSelectedClient('client1')}
            >
              <MaterialCommunityIcons
                name="check-circle"
                size={20}
                color={
                  selectedClient === 'client1'
                    ? COLORS.primary
                    : COLORS.border
                }
              />
              <View style={styles.clientInfo}>
                <Text style={styles.clientName}>João Silva</Text>
                <Text style={styles.clientDetail}>
                  Fiesta 2022 - Garantia Ativa
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.clientOption,
                selectedClient === 'client2' && styles.clientOptionActive,
              ]}
              onPress={() => setSelectedClient('client2')}
            >
              <MaterialCommunityIcons
                name="check-circle"
                size={20}
                color={
                  selectedClient === 'client2'
                    ? COLORS.primary
                    : COLORS.border
                }
              />
              <View style={styles.clientInfo}>
                <Text style={styles.clientName}>Maria Santos</Text>
                <Text style={styles.clientDetail}>
                  EcoSport 2021 - Garantia Vencida
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {selectedRole === 'analyst' && (
          <View style={styles.analystInfo}>
            <MaterialCommunityIcons
              name="information"
              size={24}
              color={COLORS.secondary}
            />
            <Text style={styles.analystInfoText}>
              Entrando como: Ana Oliveira
            </Text>
            <Text style={styles.analystInfoSubtext}>
              Concessionária - São Paulo
            </Text>
          </View>
        )}
      </View>

      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginButtonText}>Continuar</Text>
      </TouchableOpacity>

      <Text style={styles.footer}>
        Ford VIN Share - Demonstração de Conceito
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: COLORS.light,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginTop: 16,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.gray,
    marginTop: 8,
  },
  content: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 20,
  },
  roleSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  roleButton: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    borderRadius: 12,
    backgroundColor: '#fff',
    marginHorizontal: 6,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  roleButtonActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#f0f4ff',
  },
  roleButtonText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray,
  },
  roleButtonTextActive: {
    color: COLORS.primary,
  },
  clientSelector: {
    marginBottom: 24,
  },
  labelText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 12,
  },
  clientOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    marginBottom: 12,
  },
  clientOptionActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#f0f4ff',
  },
  clientInfo: {
    marginLeft: 12,
    flex: 1,
  },
  clientName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.dark,
  },
  clientDetail: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 4,
  },
  analystInfo: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#e3f2fd',
    borderRadius: 12,
    marginBottom: 24,
  },
  analystInfoText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
    marginTop: 12,
  },
  analystInfoSubtext: {
    fontSize: 14,
    color: COLORS.gray,
    marginTop: 4,
  },
  loginButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    textAlign: 'center',
    fontSize: 12,
    color: COLORS.gray,
    marginBottom: 20,
  },
});
