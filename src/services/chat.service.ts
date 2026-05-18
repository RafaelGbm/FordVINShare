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

export interface ChatSession {
  sessionId: string;
  createdAt: string;
}

export const chatService = {
  async createSession(): Promise<ChatSession> {
    const { data } = await api.post<ChatSession>('/chat/sessions');
    return data;
  },

  async sendMessage(sessionId: string, message: string): Promise<ChatMessage> {
    const { data } = await api.post<ChatMessage>(
      `/chat/sessions/${sessionId}/messages`,
      { message }
    );
    return data;
  },

  async getHistory(sessionId: string): Promise<ChatMessage[]> {
    const { data } = await api.get<ChatMessage[]>(`/chat/sessions/${sessionId}/messages`);
    return data;
  },
};
