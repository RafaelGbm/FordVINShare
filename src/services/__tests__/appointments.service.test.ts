import { api } from '../api';
import { appointmentsService } from '../appointments.service';

jest.mock('../api', () => ({ api: { get: jest.fn() } }));

const mockedGet = api.get as jest.MockedFunction<typeof api.get>;

const appointment = {
  id: 'app-1',
  status: 'SCHEDULED',
  vehicle: { id: 'v-1', model: 'Ranger' },
  dealership: { id: 'dlr-1', name: 'Ford SP Centro' },
  serviceType: 'REVIEW',
  scheduledAt: '2026-10-01T10:00:00-03:00',
  createdAt: '2026-09-01T09:00:00-03:00',
};

/** Mirrors the Spring Page the deployed backend actually returns. */
const page = {
  content: [appointment],
  pageable: {},
  last: true,
  totalElements: 1,
  totalPages: 1,
  first: true,
  size: 20,
  number: 0,
  sort: {},
  numberOfElements: 1,
  empty: false,
};

beforeEach(() => mockedGet.mockReset());

describe('appointmentsService.listMine', () => {
  /**
   * The screens iterate this result directly, so a Page leaking through
   * crashes "Meus agendamentos" with `appointments.filter is not a function`.
   */
  it('unwraps the Spring Page the backend returns', async () => {
    mockedGet.mockResolvedValueOnce({ data: page } as never);

    const result = await appointmentsService.listMine();

    expect(Array.isArray(result)).toBe(true);
    expect(result).toEqual([appointment]);
  });

  it('passes a flat array through unchanged', async () => {
    mockedGet.mockResolvedValueOnce({ data: [appointment] } as never);

    await expect(appointmentsService.listMine()).resolves.toEqual([appointment]);
  });

  it('yields an empty array for an empty page', async () => {
    mockedGet.mockResolvedValueOnce({
      data: { ...page, content: [], totalElements: 0, empty: true },
    } as never);

    await expect(appointmentsService.listMine()).resolves.toEqual([]);
  });

  it('yields an empty array when the body is null', async () => {
    mockedGet.mockResolvedValueOnce({ data: null } as never);

    await expect(appointmentsService.listMine()).resolves.toEqual([]);
  });

  it('forwards the status filter as a query param', async () => {
    mockedGet.mockResolvedValueOnce({ data: page } as never);

    await appointmentsService.listMine('SCHEDULED');

    expect(mockedGet).toHaveBeenCalledWith('/me/appointments', {
      params: { status: 'SCHEDULED' },
    });
  });
});
