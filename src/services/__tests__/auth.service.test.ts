import { api } from '../api';
import { authService } from '../auth.service';
import { secureStorage } from '../secureStorage';

jest.mock('../api', () => ({
  api: { post: jest.fn(), delete: jest.fn() },
  configureAuth: jest.fn(),
}));
jest.mock('../secureStorage', () => ({
  secureStorage: {
    getRefreshToken: jest.fn(),
    getPushToken: jest.fn(),
    clear: jest.fn(),
  },
}));

const mocked = {
  post: api.post as jest.Mock,
  del: api.delete as jest.Mock,
  getRefreshToken: secureStorage.getRefreshToken as jest.Mock,
  getPushToken: secureStorage.getPushToken as jest.Mock,
  clear: secureStorage.clear as jest.Mock,
};

beforeEach(() => jest.clearAllMocks());

describe('authService.logout', () => {
  it('sends the refresh token so the API can revoke the session', async () => {
    mocked.getRefreshToken.mockResolvedValue('refresh-123');
    mocked.getPushToken.mockResolvedValue(null);

    await authService.logout();

    expect(mocked.post).toHaveBeenCalledWith('/auth/logout', { refreshToken: 'refresh-123' });
    expect(mocked.clear).toHaveBeenCalled();
  });

  it('unregisters the push token before clearing, so the next account on this phone can register it', async () => {
    mocked.getRefreshToken.mockResolvedValue('refresh-123');
    mocked.getPushToken.mockResolvedValue('ExponentPushToken[abc]');

    await authService.logout();

    expect(mocked.del).toHaveBeenCalledWith(`/me/devices/${encodeURIComponent('ExponentPushToken[abc]')}`);
    expect(mocked.del.mock.invocationCallOrder[0]).toBeLessThan(mocked.clear.mock.invocationCallOrder[0]);
  });

  it('still clears local state when the server calls fail', async () => {
    mocked.getRefreshToken.mockResolvedValue('refresh-123');
    mocked.getPushToken.mockResolvedValue('ExponentPushToken[abc]');
    mocked.del.mockRejectedValue(new Error('offline'));
    mocked.post.mockRejectedValue(new Error('offline'));

    await authService.logout();

    expect(mocked.clear).toHaveBeenCalled();
  });

  it('skips the server logout when there is no refresh token', async () => {
    mocked.getRefreshToken.mockResolvedValue(null);
    mocked.getPushToken.mockResolvedValue(null);

    await authService.logout();

    expect(mocked.post).not.toHaveBeenCalled();
    expect(mocked.clear).toHaveBeenCalled();
  });
});
