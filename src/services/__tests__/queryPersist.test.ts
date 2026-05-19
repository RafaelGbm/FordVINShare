import { shouldPersistQuery } from '../queryPersist';

function fakeQuery(queryKey: readonly unknown[]) {
  return { queryKey } as Parameters<typeof shouldPersistQuery>[0];
}

describe('shouldPersistQuery', () => {
  it('persists allowed vehicle scopes', () => {
    expect(shouldPersistQuery(fakeQuery(['vehicles', 'list']))).toBe(true);
    expect(shouldPersistQuery(fakeQuery(['vehicles', 'warranty', 'v-1']))).toBe(true);
    expect(shouldPersistQuery(fakeQuery(['vehicles', 'alerts', 'v-1']))).toBe(true);
  });

  it('persists the services.mine scope', () => {
    expect(
      shouldPersistQuery(fakeQuery(['services', 'mine', { vehicleId: 'v-1' }]))
    ).toBe(true);
  });

  it('refuses scopes that hold sensitive data', () => {
    expect(shouldPersistQuery(fakeQuery(['auth', 'me']))).toBe(false);
    expect(shouldPersistQuery(fakeQuery(['chat', 'history', 's-1']))).toBe(false);
    expect(shouldPersistQuery(fakeQuery(['leads', 'list', {}]))).toBe(false);
    expect(shouldPersistQuery(fakeQuery(['segments', 'distribution']))).toBe(false);
    expect(shouldPersistQuery(fakeQuery(['analytics', 'kpis', '7d']))).toBe(false);
    expect(shouldPersistQuery(fakeQuery(['dealerships', 'list', {}]))).toBe(false);
  });

  it('refuses unknown subscopes within an allowed top-level', () => {
    expect(shouldPersistQuery(fakeQuery(['vehicles', 'detail', 'v-1']))).toBe(false);
    expect(shouldPersistQuery(fakeQuery(['services', 'detail', 's-1']))).toBe(false);
  });

  it('refuses non-string keys', () => {
    expect(shouldPersistQuery(fakeQuery([0, 'mine']))).toBe(false);
    expect(shouldPersistQuery(fakeQuery(['vehicles']))).toBe(false);
  });
});
