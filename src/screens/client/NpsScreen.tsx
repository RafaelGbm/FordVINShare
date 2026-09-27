import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';

import { COLORS } from '../../constants';
import { HeroIconButton, HeroScreen } from '../../components/HeroScreen';
import { useSubmitNps } from '../../hooks/useNps';
import { NpsCategory } from '../../services/nps.service';
import { ApiError } from '../../services/api';

const CATEGORIES: { id: NpsCategory; label: string }[] = [
  { id: 'ATENDIMENTO', label: 'Atendimento' },
  { id: 'TEMPO_DE_ESPERA', label: 'Tempo de espera' },
  { id: 'PRECO', label: 'Preço' },
  { id: 'QUALIDADE_DO_SERVICO', label: 'Qualidade do serviço' },
  { id: 'COMUNICACAO', label: 'Comunicação' },
  { id: 'INSTALACOES', label: 'Instalações' },
];

function scoreColor(score: number) {
  if (score >= 9) return COLORS.success;
  if (score >= 7) return COLORS.warning;
  return COLORS.danger;
}

function scoreLabel(score: number | null) {
  if (score === null) return 'Toque em uma nota';
  if (score >= 9) return 'Você é um promotor 🎉';
  if (score >= 7) return 'Tem espaço pra melhorar';
  return 'Vamos resolver isso';
}

export default function NpsScreen() {
  const { serviceId } = useLocalSearchParams<{ serviceId: string }>();
  const [score, setScore] = useState<number | null>(null);
  const [liked, setLiked] = useState<NpsCategory[]>([]);
  const [improve, setImprove] = useState<NpsCategory[]>([]);
  const [comment, setComment] = useState('');

  const submit = useSubmitNps(serviceId);

  function toggle(list: NpsCategory[], setter: (v: NpsCategory[]) => void, cat: NpsCategory) {
    if (list.includes(cat)) setter(list.filter((c) => c !== cat));
    else setter([...list, cat]);
  }

  const canSubmit = score !== null && !submit.isPending;

  async function handleSubmit() {
    if (score === null || !serviceId) return;
    try {
      await submit.mutateAsync({
        score,
        comment: comment.trim() || undefined,
        likedCategories: liked,
        improvementCategories: improve,
      });
      Alert.alert(
        'Obrigado!',
        'Sua avaliação foi registrada. Ela ajuda a Ford a melhorar.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (e) {
      const message =
        e instanceof ApiError
          ? e.problem.detail || e.problem.title
          : 'Não foi possível enviar sua avaliação.';
      Alert.alert('Erro', message);
    }
  }

  return (
    <HeroScreen
      blobs={[{ size: 180, top: -50, right: -40 }]}
      heroPaddingBottom={40}
      overlap={-20}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
      footer={
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.cta, !canSubmit && styles.ctaDisabled]}
            onPress={handleSubmit}
            disabled={!canSubmit}
            activeOpacity={0.85}
          >
            {submit.isPending ? (
              <ActivityIndicator color={COLORS.white} size="small" />
            ) : (
              <>
                <Text style={styles.ctaText}>Enviar avaliação</Text>
                <MaterialCommunityIcons name="send" size={18} color={COLORS.white} />
              </>
            )}
          </TouchableOpacity>
        </View>
      }
      bodyChildren={
        <>
        {/* Score grid 0-10 */}
        <View style={styles.scoreCard}>
          <View style={styles.scoreGrid}>
            {Array.from({ length: 11 }).map((_, i) => {
              const selected = score === i;
              return (
                <TouchableOpacity
                  key={i}
                  style={[
                    styles.scoreBtn,
                    selected && {
                      backgroundColor: scoreColor(i),
                      borderColor: scoreColor(i),
                    },
                  ]}
                  onPress={() => setScore(i)}
                  activeOpacity={0.85}
                >
                  <Text style={[styles.scoreBtnText, selected && { color: COLORS.white }]}>
                    {i}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <View style={styles.scoreLegend}>
            <Text style={styles.scoreLegendText}>Pouco provável</Text>
            <Text style={styles.scoreLegendText}>Muito provável</Text>
          </View>

          <Text
            style={[
              styles.scoreFeedback,
              score !== null && { color: scoreColor(score) },
            ]}
          >
            {scoreLabel(score)}
          </Text>
        </View>

        {/* Liked categories */}
        <Text style={styles.sectionTitle}>O que mais gostou?</Text>
        <Text style={styles.sectionSub}>Pode marcar mais de uma</Text>
        <View style={styles.chipsRow}>
          {CATEGORIES.map((c) => {
            const selected = liked.includes(c.id);
            return (
              <TouchableOpacity
                key={c.id}
                style={[
                  styles.chip,
                  selected && { backgroundColor: COLORS.successTint, borderColor: COLORS.success },
                ]}
                onPress={() => toggle(liked, setLiked, c.id)}
                activeOpacity={0.85}
              >
                {selected && (
                  <MaterialCommunityIcons name="check" size={12} color={COLORS.success} />
                )}
                <Text style={[styles.chipText, selected && { color: COLORS.success }]}>
                  {c.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Improvement categories */}
        <Text style={[styles.sectionTitle, { marginTop: 18 }]}>
          O que pode melhorar?
        </Text>
        <Text style={styles.sectionSub}>Pode marcar mais de uma</Text>
        <View style={styles.chipsRow}>
          {CATEGORIES.map((c) => {
            const selected = improve.includes(c.id);
            return (
              <TouchableOpacity
                key={c.id}
                style={[
                  styles.chip,
                  selected && { backgroundColor: COLORS.warningTint, borderColor: COLORS.warning },
                ]}
                onPress={() => toggle(improve, setImprove, c.id)}
                activeOpacity={0.85}
              >
                {selected && (
                  <MaterialCommunityIcons name="check" size={12} color={COLORS.warningText} />
                )}
                <Text style={[styles.chipText, selected && { color: COLORS.warningText }]}>
                  {c.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Comment */}
        <Text style={[styles.sectionTitle, { marginTop: 18 }]}>
          Quer deixar um comentário?
        </Text>
        <Text style={styles.sectionSub}>Opcional</Text>
        <TextInput
          style={styles.textarea}
          placeholder="Conte como foi sua experiência..."
          placeholderTextColor={COLORS.gray}
          value={comment}
          onChangeText={setComment}
          multiline
          numberOfLines={4}
          maxLength={500}
        />
        <Text style={styles.counter}>{comment.length}/500</Text>

        <View style={{ height: 16 }} />
        </>
      }
    >
      <View style={styles.heroTop}>
        <HeroIconButton icon="close" onPress={() => router.back()} />
        <Text style={styles.heroTitle}>Avaliação do serviço</Text>
        <View style={{ width: 40 }} />
      </View>
      <Text style={styles.heroSub}>
        De 0 a 10, o quanto você recomendaria a Ford a um amigo?
      </Text>
    </HeroScreen>
  );
}

const styles = StyleSheet.create({
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  heroTitle: { color: COLORS.white, fontSize: 18, fontWeight: '800' },
  heroSub: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    lineHeight: 18,
  },

  scrollContent: { padding: 20, paddingTop: 22, paddingBottom: 24 },

  scoreCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 18,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  scoreGrid: {
    flexDirection: 'row',
    gap: 4,
  },
  scoreBtn: {
    flex: 1,
    aspectRatio: 1,
    backgroundColor: COLORS.background,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.surfaceAlt,
  },
  scoreBtnText: { fontSize: 12, fontWeight: '800', color: COLORS.dark },
  scoreLegend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  scoreLegendText: { fontSize: 10, color: COLORS.gray, fontWeight: '600' },
  scoreFeedback: {
    marginTop: 14,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.gray,
  },

  sectionTitle: { fontSize: 15, fontWeight: '800', color: COLORS.dark, marginBottom: 2 },
  sectionSub: { fontSize: 11, color: COLORS.gray, marginBottom: 10 },

  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: COLORS.white,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: COLORS.surfaceAlt,
  },
  chipText: { fontSize: 12, fontWeight: '700', color: COLORS.dark },

  textarea: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 14,
    fontSize: 14,
    color: COLORS.dark,
    minHeight: 96,
    textAlignVertical: 'top',
    borderWidth: 1.5,
    borderColor: COLORS.surfaceAlt,
  },
  counter: {
    alignSelf: 'flex-end',
    fontSize: 11,
    color: COLORS.gray,
    marginTop: 4,
  },

  footer: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 28,
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceAlt,
  },
  cta: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  ctaDisabled: { backgroundColor: COLORS.borderStrong, shadowOpacity: 0 },
  ctaText: { color: COLORS.white, fontSize: 15, fontWeight: '800', letterSpacing: 0.3 },
});
