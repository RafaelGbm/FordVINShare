import React, { ReactNode } from 'react';
import {
  View,
  Text,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  StyleSheet,
  ScrollViewProps,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { COLORS } from '../constants';
import type { IconName } from '../types';

export interface HeroBlobSpec {
  size: number;
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
  opacity?: number;
}

interface HeroScreenProps {
  /** 0-2 decorative circles. Position/size are per-screen, nothing is guessed. */
  blobs?: HeroBlobSpec[];
  heroPaddingHorizontal?: number;
  heroPaddingBottom: number;
  /** marginTop on the content area — how much it overlaps the hero above it. */
  overlap?: number;
  /** false renders the content area as a plain View instead of a ScrollView. */
  scrollable?: boolean;
  contentContainerStyle?: StyleProp<ViewStyle>;
  keyboardShouldPersistTaps?: ScrollViewProps['keyboardShouldPersistTaps'];
  /** Top row + any hero-specific content (stepper, search bar, stat card...). */
  children: ReactNode;
  /** Rendered between the hero and the content area, still on the primary background — e.g. AppointmentsScreen's filter chips. */
  afterHero?: ReactNode;
  bodyChildren: ReactNode;
  /** Fixed bar below the content area, e.g. a bottom "Confirmar"/"Enviar" CTA. */
  footer?: ReactNode;
}

/**
 * Shell shared by every "hero" screen in the app: the primary-blue header
 * with decorative blobs, and a rounded content area that overlaps it.
 * Each screen still supplies its own top row and hero content as
 * `children` — a back button, a title, a search bar, a stat card, whatever
 * it needs. That part varies too much between screens to standardize;
 * only the chrome around it (background, blobs, corner radius, overlap)
 * was actually identical everywhere.
 */
export function HeroScreen({
  blobs = [],
  heroPaddingHorizontal = 20,
  heroPaddingBottom,
  overlap = 0,
  scrollable = true,
  contentContainerStyle,
  keyboardShouldPersistTaps,
  children,
  afterHero,
  bodyChildren,
  footer,
}: HeroScreenProps) {
  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      <View
        style={[
          styles.hero,
          { paddingHorizontal: heroPaddingHorizontal, paddingBottom: heroPaddingBottom },
        ]}
      >
        {blobs.map((b, i) => (
          <View
            key={i}
            style={[
              styles.blob,
              {
                width: b.size,
                height: b.size,
                borderRadius: b.size / 2,
                top: b.top,
                bottom: b.bottom,
                left: b.left,
                right: b.right,
                backgroundColor: `rgba(255,255,255,${b.opacity ?? (i === 0 ? 0.06 : 0.04)})`,
              },
            ]}
          />
        ))}
        {children}
      </View>

      {afterHero}

      {scrollable ? (
        <ScrollView
          style={[styles.wrap, { marginTop: overlap }]}
          contentContainerStyle={contentContainerStyle}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps={keyboardShouldPersistTaps}
        >
          {bodyChildren}
        </ScrollView>
      ) : (
        <View style={[styles.wrap, { marginTop: overlap }, contentContainerStyle]}>
          {bodyChildren}
        </View>
      )}

      {footer}
    </View>
  );
}

interface HeroIconButtonProps {
  icon: IconName;
  onPress?: () => void;
  size?: number;
  iconSize?: number;
  color?: string;
  disabled?: boolean;
  badge?: string;
  style?: StyleProp<ViewStyle>;
}

/** The circular translucent icon button repeated in every hero header. */
export function HeroIconButton({
  icon,
  onPress,
  size = 40,
  iconSize = 20,
  color = COLORS.white,
  disabled,
  badge,
  style,
}: HeroIconButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.iconBtn, { width: size, height: size, borderRadius: size / 2 }, style]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.85}
    >
      <MaterialCommunityIcons name={icon} size={iconSize} color={color} />
      {badge != null && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.primary },
  hero: {
    backgroundColor: COLORS.primary,
    paddingTop: 50,
    overflow: 'hidden',
  },
  blob: { position: 'absolute' },
  wrap: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  iconBtn: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 4,
    borderRadius: 8,
    backgroundColor: COLORS.danger,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: { color: COLORS.white, fontSize: 9, fontWeight: '800' },
});
