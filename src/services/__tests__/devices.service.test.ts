import { api } from '../api';
import { devicesService } from '../devices.service';

jest.mock('../api', () => ({ api: { post: jest.fn(), delete: jest.fn() } }));

const mockedPost = api.post as jest.Mock;

beforeEach(() => mockedPost.mockReset());

describe('devicesService.register', () => {
  /**
   * The API expects RegisterDeviceRequestDTO { token, platform: IOS | ANDROID }.
   * The previous payload ({ expoPushToken, platform: 'ios', ... }) was rejected with 400.
   */
  it.each([
    ['ios', 'IOS'],
    ['android', 'ANDROID'],
  ] as const)('sends the Expo token and the %s platform in the API format', async (local, api) => {
    mockedPost.mockResolvedValueOnce({ data: { id: 'dev-1', token: 'ExponentPushToken[abc]', platform: api } });

    const result = await devicesService.register('ExponentPushToken[abc]', local);

    expect(mockedPost).toHaveBeenCalledWith('/me/devices', { token: 'ExponentPushToken[abc]', platform: api });
    expect(result.token).toBe('ExponentPushToken[abc]');
  });
});
