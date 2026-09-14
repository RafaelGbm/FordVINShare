import { api } from '../api';
import { customersService } from '../customers.service';

jest.mock('../api', () => ({ api: { get: jest.fn() } }));

const mockedGet = api.get as jest.MockedFunction<typeof api.get>;

beforeEach(() => mockedGet.mockReset());

describe('customersService.get360', () => {
  /**
   * Shape confirmed against production on 2026-09-14. The backend's real
   * response is far narrower than the screen used to assume: `vehicle` is
   * singular (not `vehicles[]`), `segment` is an object carrying its own
   * riskScore (not a bare enum with a top-level riskScore), the lifetime
   * stats live under `lifetimeStats` with different field names and no
   * avgTicket/first/lastServiceAt, and there is no recentServices or
   * activeAppointments at all — those two sections were removed from the
   * screen because the backend has no route that could ever populate them
   * for an analyst looking at someone else's customer.
   */
  it('normalizes the real production shape', async () => {
    mockedGet.mockResolvedValueOnce({
      data: {
        customer: {
          id: 'cust-1',
          name: 'Sophie Porto',
          cpfMasked: '***.***.253-**',
          email: null,
          phone: '+5511456031887',
        },
        vehicle: {
          id: 'veh-1',
          model: 'Bronco',
          year: 2023,
          currentKm: 66366,
          warrantyStatus: 'EXPIRING_SOON',
        },
        segment: { name: 'ESQUECIDO', riskScore: 70 },
        lifetimeStats: { servicesCount: 4, totalSpent: 1200, averageNps: 8.5 },
      },
    } as never);

    const result = await customersService.get360('cust-1');

    expect(result).toEqual({
      customer: {
        id: 'cust-1',
        name: 'Sophie Porto',
        cpfMasked: '***.***.253-**',
        email: null,
        phone: '+5511456031887',
      },
      vehicle: {
        id: 'veh-1',
        model: 'Bronco',
        year: 2023,
        currentKm: 66366,
        warrantyStatus: 'EXPIRING_SOON',
      },
      segment: 'ESQUECIDO',
      riskScore: 70,
      lifetime: { totalSpent: 1200, totalServices: 4, avgTicket: 300, avgNps: 8.5 },
    });
  });

  it('derives avgTicket as 0 instead of dividing by zero when there are no services', async () => {
    mockedGet.mockResolvedValueOnce({
      data: {
        customer: { id: 'c', name: 'N', cpfMasked: 'x', email: null, phone: 'x' },
        vehicle: { id: 'v', model: 'M', year: 2020, currentKm: 0, warrantyStatus: 'ACTIVE' },
        segment: { name: 'FIEL', riskScore: 0 },
        lifetimeStats: { servicesCount: 0, totalSpent: 0, averageNps: 0 },
      },
    } as never);

    await expect(customersService.get360('c')).resolves.toMatchObject({
      lifetime: { avgTicket: 0, totalServices: 0 },
    });
  });
});

describe('customersService.getTimeline', () => {
  /**
   * Confirmed against production: the backend sends `at`, not `occurredAt`,
   * and no `id` at all — the screen keys its list off `event.id`, so one is
   * synthesized here rather than leaving it undefined.
   */
  it('maps `at` to `occurredAt` and synthesizes a stable id', async () => {
    mockedGet.mockResolvedValueOnce({
      data: [
        { at: '2026-05-20T13:14:10Z', type: 'APPOINTMENT', title: 'Agendamento COMPLETED', description: 'Ford Caxias do Sul' },
        { at: '2023-08-02T13:14:09Z', type: 'SERVICE', title: 'Serviço realizado: Revisao', description: 'Ford Caxias do Sul' },
      ],
    } as never);

    const result = await customersService.getTimeline('cust-1');

    expect(result).toEqual([
      {
        id: 'APPOINTMENT-2026-05-20T13:14:10Z-0',
        type: 'APPOINTMENT',
        occurredAt: '2026-05-20T13:14:10Z',
        title: 'Agendamento COMPLETED',
        description: 'Ford Caxias do Sul',
      },
      {
        id: 'SERVICE-2023-08-02T13:14:09Z-1',
        type: 'SERVICE',
        occurredAt: '2023-08-02T13:14:09Z',
        title: 'Serviço realizado: Revisao',
        description: 'Ford Caxias do Sul',
      },
    ]);
  });
});
