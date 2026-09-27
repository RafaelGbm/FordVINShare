import { api } from './api';

export type ChatRole = 'user' | 'assistant';

export type SuggestedActionType =
  | 'OPEN_SCHEDULING'
  | 'OPEN_LOCATOR'
  | 'OPEN_POINTS'
  | 'OPEN_PROFILE'
  | 'OPEN_VEHICLE';

export interface SuggestedAction {
  type: SuggestedActionType;
  label: string;
  params?: Record<string, string>;
}

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  suggestedActions?: SuggestedAction[];
  createdAt: string;
}

/** The API serializes the role as USER / ASSISTANT. */
type RawChatMessage = Omit<ChatMessage, 'role'> & { role: string };

function normalizeMessage(message: RawChatMessage): ChatMessage {
  return { ...message, role: message.role.toLowerCase() === 'user' ? 'user' : 'assistant' };
}

export interface ChatSession {
  sessionId: string;
  startedAt: string;
}

export const chatService = {
  async createSession(): Promise<ChatSession> {
    const { data } = await api.post<ChatSession>('/chat/sessions');
    return data;
  },

  async sendMessage(sessionId: string, message: string): Promise<ChatMessage> {
    const { data } = await api.post<RawChatMessage>(
      `/chat/sessions/${sessionId}/messages`,
      { message }
    );
    return normalizeMessage(data);
  },

  async getHistory(sessionId: string): Promise<ChatMessage[]> {
    const { data } = await api.get<RawChatMessage[]>(`/chat/sessions/${sessionId}/messages`);
    return data.map(normalizeMessage);
  },
};
