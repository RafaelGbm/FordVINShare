import { api } from '../api';
import { chatService } from '../chat.service';

jest.mock('../api', () => ({ api: { get: jest.fn(), post: jest.fn() } }));

const mockedGet = api.get as jest.Mock;
const mockedPost = api.post as jest.Mock;

/** The API serializes ChatMessageRole as USER / ASSISTANT; the screen compares against lowercase. */
function raw(role: string) {
  return { id: `m-${role}`, role, content: 'oi', suggestedActions: [], createdAt: '2026-09-27T10:00:00Z' };
}

beforeEach(() => jest.clearAllMocks());

describe('chatService', () => {
  it('normalizes the message role when loading the history', async () => {
    mockedGet.mockResolvedValueOnce({ data: [raw('USER'), raw('ASSISTANT')] });

    const history = await chatService.getHistory('s-1');

    expect(history.map((m) => m.role)).toEqual(['user', 'assistant']);
  });

  it('normalizes the role of the assistant reply', async () => {
    mockedPost.mockResolvedValueOnce({ data: raw('ASSISTANT') });

    const reply = await chatService.sendMessage('s-1', 'oi');

    expect(reply.role).toBe('assistant');
  });
});
