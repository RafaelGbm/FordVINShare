import React, { useRef, useState } from 'react';
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
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { COLORS } from '../../constants';

type Message = {
  id: string;
  role: 'user' | 'ai';
  text: string;
  time: string;
};

const SUGGESTIONS = [
  { id: 's1', icon: 'calendar', label: 'Agendar revisão' },
  { id: 's2', icon: 'shield-check', label: 'Status da garantia' },
  { id: 's3', icon: 'cog-outline', label: 'Próxima manutenção' },
  { id: 's4', icon: 'gift-outline', label: 'Saldo de pontos' },
  { id: 's5', icon: 'wrench', label: 'Onde fica o filtro de ar?' },
];

const now = () => {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

const INITIAL_MESSAGES: Message[] = [
  {
    id: 'm1',
    role: 'ai',
    text: 'Olá, João! Sou a Ford AI, sua assistente virtual. Posso te ajudar com agendamentos, garantia, pontos, dúvidas técnicas do seu Fiesta 2022 e muito mais. 🚗',
    time: '10:32',
  },
  {
    id: 'm2',
    role: 'ai',
    text: 'Como posso te ajudar hoje?',
    time: '10:32',
  },
];

const MOCK_REPLIES: Record<string, string> = {
  default:
    'Entendido! Estou processando sua solicitação. Em alguns instantes vou trazer a resposta mais precisa baseada no histórico do seu Fiesta 2022.',
  agendar:
    'Posso te ajudar com o agendamento! Sua próxima revisão gratuita está disponível. Quer que eu sugira datas e concessionárias próximas? 📅',
  garantia:
    'Sua garantia Ford Plus está ATIVA e válida até 12/01/2027 — faltam 245 dias. Ela cobre revisões programadas, motor e transmissão. 🛡️',
  manutenção:
    'Sua próxima revisão é em ~600 km (40.000 km). Inclui troca de óleo, filtros e inspeção dos itens de segurança. Custo estimado: GRATUITO pela garantia. 🔧',
  pontos:
    'Você tem 2.450 pontos disponíveis no Ford Gold. Faltam 2.550 pontos para Platinum. Quer ver as recompensas que pode resgatar agora? 🎁',
  filtro:
    'O filtro de ar do Fiesta 2022 fica na parte superior do motor, em uma caixa preta retangular do lado do passageiro. Recomendo trocar a cada 15.000 km. 🛠️',
};

function generateReply(userText: string): string {
  const t = userText.toLowerCase();
  if (t.includes('agendar') || t.includes('revisão') || t.includes('marcar')) return MOCK_REPLIES.agendar;
  if (t.includes('garantia')) return MOCK_REPLIES.garantia;
  if (t.includes('manutenção') || t.includes('próxima')) return MOCK_REPLIES.manutenção;
  if (t.includes('ponto')) return MOCK_REPLIES.pontos;
  if (t.includes('filtro') || t.includes('ar')) return MOCK_REPLIES.filtro;
  return MOCK_REPLIES.default;
}

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const handleSend = (text?: string) => {
    const value = (text ?? input).trim();
    if (!value) return;

    const userMsg: Message = {
      id: `m${Date.now()}`,
      role: 'user',
      text: value,
      time: now(),
    };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setTyping(true);

    setTimeout(() => {
      const aiMsg: Message = {
        id: `m${Date.now() + 1}`,
        role: 'ai',
        text: generateReply(value),
        time: now(),
      };
      setMessages((m) => [...m, aiMsg]);
      setTyping(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
    }, 1100);

    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
  };

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

        {messages.map((m, i) => {
          const isUser = m.role === 'user';
          const prevSameRole = i > 0 && messages[i - 1].role === m.role;
          return (
            <View
              key={m.id}
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
                  {m.text}
                </Text>
                <Text style={[styles.bubbleTime, isUser && styles.bubbleTimeUser]}>
                  {m.time}
                </Text>
              </View>
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

        {/* Quick suggestions (only when empty conversation) */}
        {messages.length <= 2 && (
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
            placeholder="Pergunte algo à Ford AI..."
            placeholderTextColor={COLORS.gray}
            value={input}
            onChangeText={setInput}
            onSubmitEditing={() => handleSend()}
            returnKeyType="send"
            multiline
            maxLength={500}
          />
          <TouchableOpacity style={styles.micBtn}>
            <MaterialCommunityIcons name="microphone-outline" size={20} color={COLORS.gray} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]}
          onPress={() => handleSend()}
          disabled={!input.trim()}
          activeOpacity={0.85}
        >
          <MaterialCommunityIcons
            name="send"
            size={20}
            color={input.trim() ? '#fff' : COLORS.gray}
          />
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
