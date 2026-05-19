import { ApiError } from '../api';

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
