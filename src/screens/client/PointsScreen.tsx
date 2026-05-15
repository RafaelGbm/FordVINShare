import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { COLORS } from '../../constants';
import { ClientTabScreenProps } from '../../navigation/types';

type Props = ClientTabScreenProps<'Points'>;

export default function PointsScreen({ }: Props) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Meus Pontos</Text>
        <Text style={styles.placeholder}>Sistema de fidelidade e resgate</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.light },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: COLORS.dark, marginBottom: 16 },
  placeholder: { fontSize: 16, color: COLORS.gray },
});
