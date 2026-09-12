import { AxiosError, AxiosHeaders } from 'axios';

import { ApiError, fallbackProblem } from '../api';

describe('ApiError', () => {
  it('exposes the problem payload and uses detail as the message', () => {
    const err = new ApiError({
      title: 'Validação',
      status: 400,
      detail: 'Email obrigatório',
    });
    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe('ApiError');
    expect(err.message).toBe('Email obrigatório');
    expect(err.problem.status).toBe(400);
    expect(err.problem.title).toBe('Validação');
  });

  it('falls back to title when detail is missing', () => {
    const err = new ApiError({ title: 'Sessão expirada', status: 401 });
    expect(err.message).toBe('Sessão expirada');
  });
});

/** Builds an AxiosError carrying a response with the given status and no body. */
function errorWithStatus(status: number): AxiosError {
  const config = { headers: new AxiosHeaders() };
  return new AxiosError(`Request failed with status code ${status}`, String(status), config, {}, {
    data: '',
    status,
    statusText: '',
    headers: new AxiosHeaders(),
    config,
  });
}

describe('fallbackProblem', () => {
  /**
   * The live backend answers a missing token with 401 and an empty body, so
   * this path is reachable in production — it must not leak axios's English
   * "Request failed with status code 401" into the UI.
   */
  it('translates an empty-bodied 401 instead of surfacing the axios message', () => {
    const problem = fallbackProblem(errorWithStatus(401));

    expect(problem.status).toBe(401);
    expect(problem.title).toBe('Sessão expirada');
    expect(problem.title).not.toMatch(/Request failed/);
    expect(problem.detail).toBeTruthy();
  });

  it.each([
    [403, 'Acesso negado'],
    [404, 'Não encontrado'],
    [429, 'Muitas tentativas'],
  ])('maps %i to a translated title', (status, title) => {
    expect(fallbackProblem(errorWithStatus(status)).title).toBe(title);
  });

  it.each([500, 502, 503])('treats %i as a server error', (status) => {
    const problem = fallbackProblem(errorWithStatus(status));
    expect(problem.title).toBe('Erro no servidor');
    expect(problem.status).toBe(status);
  });

  it('reports a missing response as a connection problem', () => {
    const problem = fallbackProblem(new AxiosError('Network Error', 'ERR_NETWORK'));

    expect(problem.status).toBe(0);
    expect(problem.title).toBe('Sem conexão com o servidor');
  });

  it('distinguishes a timeout from a plain network failure', () => {
    const problem = fallbackProblem(new AxiosError('timeout', 'ECONNABORTED'));

    expect(problem.title).toBe('Tempo de conexão esgotado');
  });

  it('still answers for an unmapped 4xx', () => {
    const problem = fallbackProblem(errorWithStatus(418));

    expect(problem.status).toBe(418);
    expect(problem.title).toBe('Erro de comunicação com o servidor');
  });

  it('never returns an English axios message for any status', () => {
    for (const status of [400, 401, 403, 404, 409, 418, 422, 429, 500, 503]) {
      expect(fallbackProblem(errorWithStatus(status)).title).not.toMatch(/Request failed/);
    }
  });
});
