import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
} from 'react-native';

import { COLORS } from '../../constants';
import { ClientTabScreenProps } from '../../navigation/types';

type Props = ClientTabScreenProps<'Scheduling'>;

export default function SchedulingScreen({ }: Props) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Agendar Serviço</Text>
        <Text style={styles.placeholder}>Tela em desenvolvimento...</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.light,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 16,
  },
  placeholder: {
    fontSize: 16,
    color: COLORS.gray,
  },
});
