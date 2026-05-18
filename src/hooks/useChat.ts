import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { chatService, ChatMessage } from '../services/chat.service';

export const chatKeys = {
  all: ['chat'] as const,
  history: (sessionId: string) => [...chatKeys.all, 'history', sessionId] as const,
};

export function useChatHistory(sessionId: string | undefined) {
  return useQuery({
    queryKey: chatKeys.history(sessionId ?? ''),
    queryFn: () => chatService.getHistory(sessionId!),
    enabled: !!sessionId,
  });
}

export function useCreateChatSession() {
  return useMutation({
    mutationFn: () => chatService.createSession(),
  });
}

export function useSendChatMessage(sessionId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (message: string) => {
      if (!sessionId) throw new Error('No active chat session');
      return chatService.sendMessage(sessionId, message);
    },
    onSuccess: (assistantMessage) => {
      // Optimistically append the assistant reply; the user message is
      // appended in the screen before the request fires.
      if (!sessionId) return;
      qc.setQueryData<ChatMessage[]>(chatKeys.history(sessionId), (old) =>
        old ? [...old, assistantMessage] : [assistantMessage]
      );
    },
  });
}
