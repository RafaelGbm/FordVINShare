import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';

import { COLORS } from '../../constants';
import {
  chatKeys,
  useChatHistory,
  useCreateChatSession,
  useSendChatMessage,
} from '../../hooks/useChat';
import {
  ChatMessage,
  SuggestedAction,
  SuggestedActionType,
} from '../../services/chat.service';
import { ApiError } from '../../services/api';

const SUGGESTIONS = [
  { id: 's1', icon: 'calendar', label: 'Agendar revisão' },
  { id: 's2', icon: 'shield-check', label: 'Status da garantia' },
  { id: 's3', icon: 'cog-outline', label: 'Próxima manutenção' },
  { id: 's4', icon: 'gift-outline', label: 'Saldo de pontos' },
];

const DEEP_LINK_MAP: Record<SuggestedActionType, string> = {
  OPEN_SCHEDULING: '/(client)/scheduling',
  OPEN_LOCATOR: '/(client)/locator',
  OPEN_POINTS: '/(client)/points',
  OPEN_PROFILE: '/(client)/profile',
  OPEN_VEHICLE: '/(client)/home',
};

function formatTime(iso: string) {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function handleSuggestedAction(action: SuggestedAction) {
  const path = DEEP_LINK_MAP[action.type];
  if (!path) return;
  router.push(path as any);
}

export default function ChatScreen() {
  const qc = useQueryClient();
  const scrollRef = useRef<ScrollView>(null);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [bootstrapError, setBootstrapError] = useState<string | null>(null);

  const createSession = useCreateChatSession();
  const historyQuery = useChatHistory(sessionId ?? undefined);
  const sendMutation = useSendChatMessage(sessionId ?? undefined);

  const messages = historyQuery.data ?? [];

  useEffect(() => {
    if (sessionId || createSession.isPending) return;
    createSession.mutate(undefined, {
      onSuccess: (s) => setSessionId(s.sessionId),
      onError: (e) => {
        const message =
          e instanceof ApiError ? e.problem.detail || e.problem.title : 'Falha ao abrir sessão.';
        setBootstrapError(message);
      },
    });
  }, [sessionId, createSession]);

  const handleSend = async (text?: string) => {
    const value = (text ?? input).trim();
    if (!value || !sessionId || sendMutation.isPending) return;

    const userMsg: ChatMessage = {
      id: `local-${Date.now()}`,
      role: 'user',
      content: value,
      createdAt: new Date().toISOString(),
    };
    qc.setQueryData<ChatMessage[]>(chatKeys.history(sessionId), (old) =>
      old ? [...old, userMsg] : [userMsg]
    );
    setInput('');
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);

    try {
      await sendMutation.mutateAsync(value);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
    } catch (e) {
      const message =
        e instanceof ApiError
          ? e.problem.status === 429
            ? 'Muitas mensagens em pouco tempo. Aguarde um instante.'
            : e.problem.detail || e.problem.title
          : 'Não foi possível enviar a mensagem.';
      // Append an error bubble so the user sees feedback.
      qc.setQueryData<ChatMessage[]>(chatKeys.history(sessionId), (old) => [
        ...(old ?? []),
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: `⚠️ ${message}`,
          createdAt: new Date().toISOString(),
        },
      ]);
    }
  };

  const typing = sendMutation.isPending;
  const showSuggestions = !typing && messages.length <= 1;

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerBlob} />

        <View style={styles.headerTop}>
          <View style={styles.avatarOuter}>
            <View style={styles.avatarInner}>
              <MaterialCommunityIcons name="robot-happy" size={22} color={COLORS.primary} />
            </View>
            <View style={styles.onlineDot} />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.headerName}>Ford AI</Text>
            <View style={styles.statusRow}>
              <View style={styles.statusDotSmall} />
              <Text style={styles.statusText}>Online · responde em segundos</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.iconBtn}>
            <MaterialCommunityIcons name="dots-vertical" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollRef}
        style={styles.messages}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
      >
        <View style={styles.dateBadge}>
          <Text style={styles.dateBadgeText}>HOJE</Text>
        </View>

        {bootstrapError && (
          <View
            style={[
              styles.bubble,
              styles.bubbleAi,
              { alignSelf: 'center', backgroundColor: '#fce8e6' },
            ]}
          >
            <Text style={[styles.bubbleText, { color: '#c62828' }]}>{bootstrapError}</Text>
          </View>
        )}

        {!sessionId && !bootstrapError && (
          <View style={{ paddingVertical: 24, alignItems: 'center' }}>
            <ActivityIndicator color={COLORS.primary} />
            <Text style={{ color: COLORS.gray, fontSize: 12, marginTop: 8 }}>
              Iniciando conversa...
            </Text>
          </View>
        )}

        {messages.map((m, i) => {
          const isUser = m.role === 'user';
          const prevSameRole = i > 0 && messages[i - 1].role === m.role;
          return (
            <View key={m.id}>
              <View
                style={[
                  styles.msgRow,
                  isUser ? styles.msgRowUser : styles.msgRowAi,
                  prevSameRole && { marginTop: 4 },
                ]}
              >
                {!isUser && !prevSameRole && (
                  <View style={styles.msgAvatar}>
                    <MaterialCommunityIcons name="robot-happy" size={14} color="#fff" />
                  </View>
                )}
                {!isUser && prevSameRole && <View style={{ width: 30 }} />}

                <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAi]}>
                  <Text style={[styles.bubbleText, isUser && styles.bubbleTextUser]}>
                    {m.content}
                  </Text>
                  <Text style={[styles.bubbleTime, isUser && styles.bubbleTimeUser]}>
                    {formatTime(m.createdAt)}
                  </Text>
                </View>
              </View>

              {!isUser && m.suggestedActions && m.suggestedActions.length > 0 && (
                <View style={styles.actionsRow}>
                  {m.suggestedActions.map((a, idx) => (
                    <TouchableOpacity
                      key={idx}
                      style={styles.actionChip}
                      onPress={() => handleSuggestedAction(a)}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.actionChipText}>{a.label}</Text>
                      <MaterialCommunityIcons
                        name="arrow-right"
                        size={12}
                        color={COLORS.primary}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          );
        })}

        {typing && (
          <View style={[styles.msgRow, styles.msgRowAi]}>
            <View style={styles.msgAvatar}>
              <MaterialCommunityIcons name="robot-happy" size={14} color="#fff" />
            </View>
            <View style={[styles.bubble, styles.bubbleAi, styles.bubbleTyping]}>
              <View style={styles.typingDot} />
              <View style={[styles.typingDot, { animationDelay: '0.2s' as any }]} />
              <View style={[styles.typingDot, { animationDelay: '0.4s' as any }]} />
            </View>
          </View>
        )}

        {/* Quick suggestions (only when conversation hasn't really started) */}
        {showSuggestions && sessionId && (
          <View style={styles.suggestionsBlock}>
            <Text style={styles.suggestionsLabel}>Sugestões para você</Text>
            <View style={styles.suggestionsList}>
              {SUGGESTIONS.map((s) => (
                <TouchableOpacity
                  key={s.id}
                  style={styles.suggestionChip}
                  onPress={() => handleSend(s.label)}
                  activeOpacity={0.85}
                >
                  <MaterialCommunityIcons name={s.icon as any} size={14} color={COLORS.primary} />
                  <Text style={styles.suggestionText}>{s.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <View style={{ height: 12 }} />
      </ScrollView>

      {/* Footer Input */}
      <View style={styles.inputBar}>
        <TouchableOpacity style={styles.attachBtn}>
          <MaterialCommunityIcons name="plus-circle" size={28} color={COLORS.primary} />
        </TouchableOpacity>
        <View style={styles.inputWrap}>
          <TextInput
            style={styles.input}
            placeholder={sessionId ? 'Pergunte algo à Ford AI...' : 'Aguarde a conversa abrir...'}
            placeholderTextColor={COLORS.gray}
            value={input}
            onChangeText={setInput}
            onSubmitEditing={() => handleSend()}
            returnKeyType="send"
            multiline
            maxLength={500}
            editable={!!sessionId && !sendMutation.isPending}
          />
          <TouchableOpacity style={styles.micBtn}>
            <MaterialCommunityIcons name="microphone-outline" size={20} color={COLORS.gray} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={[
            styles.sendBtn,
            (!input.trim() || !sessionId || sendMutation.isPending) && styles.sendBtnDisabled,
          ]}
          onPress={() => handleSend()}
          disabled={!input.trim() || !sessionId || sendMutation.isPending}
          activeOpacity={0.85}
        >
          {sendMutation.isPending ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <MaterialCommunityIcons
              name="send"
              size={20}
              color={input.trim() && sessionId ? '#fff' : COLORS.gray}
            />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f5f5f7' },

  /* Header */
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 18,
    overflow: 'hidden',
  },
  headerBlob: {
    position: 'absolute',
    top: -50,
    right: -30,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarOuter: {
    position: 'relative',
  },
  avatarInner: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.success,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  headerName: { color: '#fff', fontSize: 16, fontWeight: '800' },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2, gap: 5 },
  statusDotSmall: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.success,
  },
  statusText: { color: 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: '600' },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* Messages */
  messages: { flex: 1 },
  messagesContent: { paddingHorizontal: 14, paddingTop: 16 },

  dateBadge: {
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
    marginBottom: 14,
  },
  dateBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.gray,
    letterSpacing: 1.2,
  },

  msgRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 10,
    gap: 6,
  },
  msgRowAi: { justifyContent: 'flex-start' },
  msgRowUser: { justifyContent: 'flex-end' },
  msgAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },

  bubble: {
    maxWidth: '78%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
  },
  bubbleAi: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  bubbleUser: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 4,
  },
  bubbleText: { fontSize: 14, color: COLORS.dark, lineHeight: 20 },
  bubbleTextUser: { color: '#fff' },
  bubbleTime: {
    fontSize: 10,
    color: COLORS.gray,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  bubbleTimeUser: { color: 'rgba(255,255,255,0.7)' },
  bubbleTyping: {
    flexDirection: 'row',
    gap: 4,
    paddingVertical: 14,
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.gray,
    opacity: 0.6,
  },

  /* Suggested actions (deep links from assistant replies) */
  actionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginLeft: 36,
    marginTop: 6,
    marginBottom: 4,
  },
  actionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    gap: 4,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  actionChipText: { fontSize: 12, fontWeight: '700', color: COLORS.primary },

  /* Suggestions */
  suggestionsBlock: { marginTop: 12, marginBottom: 6 },
  suggestionsLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.gray,
    letterSpacing: 1,
    marginBottom: 8,
    paddingLeft: 4,
  },
  suggestionsList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
    gap: 6,
    borderWidth: 1,
    borderColor: '#eef0f3',
  },
  suggestionText: { fontSize: 12, fontWeight: '700', color: COLORS.primary },

  /* Input */
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 26 : 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eef0f3',
    gap: 6,
  },
  attachBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#f5f5f7',
    borderRadius: 22,
    paddingLeft: 16,
    paddingRight: 4,
    paddingVertical: 4,
    minHeight: 44,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: COLORS.dark,
    paddingVertical: 8,
    maxHeight: 120,
  },
  micBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  sendBtnDisabled: {
    backgroundColor: '#e8eaed',
    shadowOpacity: 0,
  },
});
