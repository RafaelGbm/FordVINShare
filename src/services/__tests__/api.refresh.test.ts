import { AxiosError, AxiosHeaders, InternalAxiosRequestConfig } from 'axios';

import { api, ApiError, configureAuth } from '../api';
import { secureStorage } from '../secureStorage';

jest.mock('../secureStorage', () => ({
  secureStorage: {
    getAccessToken: jest.fn().mockResolvedValue('expired-access'),
    clear: jest.fn(),
  },
}));

/** Every request answers 401, as happens when the access token expires. */
function rejectWith401() {
  api.defaults.adapter = async (config: InternalAxiosRequestConfig) => {
    throw new AxiosError('Unauthorized', 'ERR_BAD_REQUEST', config, {}, {
      data: '',
      status: 401,
      statusText: 'Unauthorized',
      headers: new AxiosHeaders(),
      config,
    });
  };
}

async function callProtected(): Promise<unknown> {
  try {
    await api.get('/me');
  } catch (e) {
    return e;
  }
  throw new Error('expected the request to fail');
}

const onLogout = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  rejectWith401();
});

describe('refresh failure handling', () => {
  it.each([
    [429, 'rate limit'],
    [503, 'server unavailable'],
    [0, 'no connection'],
  ])('keeps the session when the refresh fails with %i (%s)', async (status) => {
    configureAuth({
      refresh: () => Promise.reject(new ApiError({ title: 'Falha temporária', status })),
      onLogout,
    });

    const error = (await callProtected()) as ApiError;

    expect(error).toBeInstanceOf(ApiError);
    expect(error.problem.status).toBe(status);
    expect(secureStorage.clear).not.toHaveBeenCalled();
    expect(onLogout).not.toHaveBeenCalled();
  });

  it.each([400, 401])('ends the session when the API rejects the refresh token (%i)', async (status) => {
    configureAuth({
      refresh: () => Promise.reject(new ApiError({ title: 'Refresh token inválido', status })),
      onLogout,
    });

    const error = (await callProtected()) as ApiError;

    expect(error.problem.status).toBe(401);
    expect(secureStorage.clear).toHaveBeenCalled();
    expect(onLogout).toHaveBeenCalled();
  });

  it('ends the session when there is no refresh token stored', async () => {
    configureAuth({ refresh: () => Promise.reject(new Error('No refresh token available')), onLogout });

    await callProtected();

    expect(secureStorage.clear).toHaveBeenCalled();
    expect(onLogout).toHaveBeenCalled();
  });
});
