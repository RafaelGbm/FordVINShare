import React from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { COLORS } from '../constants';

type Variant = 'loading' | 'error' | 'empty';

interface StateBoxProps {
  variant: Variant;
  title?: string;
  message?: string;
  iconName?: string;
  onRetry?: () => void;
  retryLabel?: string;
  style?: ViewStyle;
}

const DEFAULT_ICON: Record<Variant, string | null> = {
  loading: null,
  error: 'alert-circle-outline',
  empty: 'tray-remove',
};

/**
 * Shared state placeholder used across screens for loading, error and
 * empty list states. Keeps copy, colors and retry affordance
 * consistent so each screen doesn't reinvent the wheel.
 */
export function StateBox({
  variant,
  title,
  message,
  iconName,
  onRetry,
  retryLabel = 'Tentar novamente',
  style,
}: StateBoxProps) {
  const icon = iconName ?? DEFAULT_ICON[variant];

  return (
    <View style={[styles.box, style]}>
      {variant === 'loading' ? (
        <ActivityIndicator color={COLORS.primary} />
      ) : icon ? (
        <MaterialCommunityIcons
          name={icon as any}
          size={36}
          color={variant === 'error' ? '#ea4335' : COLORS.border}
        />
      ) : null}

      {title && <Text style={styles.title}>{title}</Text>}
      {message && <Text style={styles.message}>{message}</Text>}

      {onRetry && (
        <TouchableOpacity style={styles.retryBtn} onPress={onRetry} activeOpacity={0.85}>
          <Text style={styles.retryText}>{retryLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
    gap: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.dark,
    textAlign: 'center',
  },
  message: {
    fontSize: 12,
    color: COLORS.gray,
    textAlign: 'center',
    fontWeight: '500',
  },
  retryBtn: {
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
  },
  retryText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 13,
  },
});
