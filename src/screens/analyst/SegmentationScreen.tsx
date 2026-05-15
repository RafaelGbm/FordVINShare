import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { COLORS } from '../../constants';
import { AnalystTabScreenProps } from '../../navigation/types';

type Props = AnalystTabScreenProps<'Segmentation'>;

export default function SegmentationScreen({ }: Props) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Segmentação</Text>
        <Text style={styles.placeholder}>Análise de clientes por segmento</Text>
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
