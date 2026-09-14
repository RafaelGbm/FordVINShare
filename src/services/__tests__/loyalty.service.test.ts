import { api } from '../api';
import { loyaltyService } from '../loyalty.service';

jest.mock('../api', () => ({ api: { get: jest.fn(), post: jest.fn() } }));

const mockedGet = api.get as jest.MockedFunction<typeof api.get>;

/**
 * Shapes confirmed against production on 2026-09-14:
 * - `type` is 'EARN' | 'REDEEM' | 'EXPIRE' | 'ADJUSTMENT', never 'SPEND'
 * - `points` is always a positive magnitude, even for a real REDEEM
 * - there is no `label`; REDEEM carries `rewardName` instead
 */
function raw(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 'tx-1',
    type: 'EARN',
    points: 60,
    sourceServiceId: 'svc-1',
    sourceRewardId: null,
    rewardName: null,
    voucherCode: null,
    createdAt: '2026-08-23T23:50:36.201923Z',
    ...overrides,
  };
}

beforeEach(() => mockedGet.mockReset());

describe('loyaltyService.listTransactions', () => {
  it('keeps EARN points positive and derives a generic label', async () => {
    mockedGet.mockResolvedValueOnce({
      data: { content: [raw()], number: 0, size: 10, totalElements: 1, totalPages: 1 },
    } as never);

    const result = await loyaltyService.listTransactions();

    expect(result.content[0]).toEqual({
      id: 'tx-1',
      type: 'EARN',
      label: 'Pontos por serviço',
      points: 60,
      createdAt: '2026-08-23T23:50:36.201923Z',
    });
  });

  /**
   * Confirmed live: redeeming a reward returns points=500 (a positive
   * magnitude), not -500. Screens that did `points > 0 ? '+' : ''` used to
   * show "+500 pts" on a redemption — the service must flip the sign.
   */
  it('flips REDEEM points negative and uses rewardName as the label', async () => {
    mockedGet.mockResolvedValueOnce({
      data: {
        content: [
          raw({
            id: 'tx-2',
            type: 'REDEEM',
            points: 500,
            sourceServiceId: null,
            sourceRewardId: 'rwd-1',
            rewardName: '10% de desconto em troca de óleo',
            voucherCode: 'FORD-ABC123',
          }),
        ],
        number: 0,
        size: 10,
        totalElements: 1,
        totalPages: 1,
      },
    } as never);

    const result = await loyaltyService.listTransactions();

    expect(result.content[0]).toEqual({
      id: 'tx-2',
      type: 'REDEEM',
      label: '10% de desconto em troca de óleo',
      points: -500,
      createdAt: '2026-08-23T23:50:36.201923Z',
    });
  });

  it('flips EXPIRE negative and keeps ADJUSTMENT positive', async () => {
    mockedGet.mockResolvedValueOnce({
      data: {
        content: [raw({ id: 'tx-3', type: 'EXPIRE', points: 40 })],
        number: 0,
        size: 10,
        totalElements: 1,
        totalPages: 1,
      },
    } as never);
    await expect(loyaltyService.listTransactions()).resolves.toMatchObject({
      content: [{ points: -40, type: 'EXPIRE' }],
    });

    mockedGet.mockResolvedValueOnce({
      data: {
        content: [raw({ id: 'tx-4', type: 'ADJUSTMENT', points: 500 })],
        number: 0,
        size: 10,
        totalElements: 1,
        totalPages: 1,
      },
    } as never);
    await expect(loyaltyService.listTransactions()).resolves.toMatchObject({
      content: [{ points: 500, type: 'ADJUSTMENT' }],
    });
  });
});
