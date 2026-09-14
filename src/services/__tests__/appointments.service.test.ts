import { api } from '../api';
import { appointmentsService } from '../appointments.service';

jest.mock('../api', () => ({ api: { get: jest.fn(), post: jest.fn(), patch: jest.fn() } }));

const mockedGet = api.get as jest.MockedFunction<typeof api.get>;
const mockedPost = api.post as jest.MockedFunction<typeof api.post>;
const mockedPatch = api.patch as jest.MockedFunction<typeof api.patch>;

/**
 * Shape the deployed backend actually sends: flat id + name/model fields
 * instead of the nested { id, name } objects the screens read, and the
 * service type split into an id + a human label. Confirmed against
 * production on 2026-09-14 for /me/appointments, /appointments/{id},
 * POST /appointments and every PATCH transition.
 */
const rawAppointment = {
  id: 'app-1',
  status: 'SCHEDULED',
  vehicleId: 'v-1',
  vehicleModel: 'Ranger',
  dealershipId: 'dlr-1',
  dealershipName: 'Ford São Paulo',
  serviceTypeId: 'REVIEW',
  serviceTypeLabel: 'Revisao',
  scheduledAt: '2026-10-01T10:00:00-03:00',
  createdAt: '2026-09-01T09:00:00-03:00',
};

/** What the service must hand back to the screens after normalizing. */
const normalized = {
  id: 'app-1',
  status: 'SCHEDULED',
  vehicle: { id: 'v-1', model: 'Ranger' },
  dealership: { id: 'dlr-1', name: 'Ford São Paulo' },
  serviceType: 'REVIEW',
  scheduledAt: '2026-10-01T10:00:00-03:00',
  createdAt: '2026-09-01T09:00:00-03:00',
};

/** Mirrors the Spring Page the deployed backend actually returns. */
const page = {
  content: [rawAppointment],
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

beforeEach(() => {
  mockedGet.mockReset();
  mockedPost.mockReset();
  mockedPatch.mockReset();
});

describe('appointmentsService.listMine', () => {
  /**
   * The screens iterate this result directly, so a Page leaking through
   * crashes "Meus agendamentos" with `appointments.filter is not a function`.
   */
  it('unwraps the Spring Page the backend returns', async () => {
    mockedGet.mockResolvedValueOnce({ data: page } as never);

    const result = await appointmentsService.listMine();

    expect(Array.isArray(result)).toBe(true);
    expect(result).toEqual([normalized]);
  });

  it('normalizes a flat array response the same way', async () => {
    mockedGet.mockResolvedValueOnce({ data: [rawAppointment] } as never);

    await expect(appointmentsService.listMine()).resolves.toEqual([normalized]);
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

describe('appointmentsService — single-appointment endpoints', () => {
  it('normalizes create()', async () => {
    mockedPost.mockResolvedValueOnce({ data: rawAppointment } as never);
    await expect(
      appointmentsService.create({
        vehicleId: 'v-1',
        dealershipId: 'dlr-1',
        serviceTypeId: 'REVIEW',
        scheduledAt: '2026-10-01T10:00:00-03:00',
      })
    ).resolves.toEqual(normalized);
  });

  it('normalizes getById()', async () => {
    mockedGet.mockResolvedValueOnce({ data: rawAppointment } as never);
    await expect(appointmentsService.getById('app-1')).resolves.toEqual(normalized);
  });

  it('normalizes cancel(), checkIn() and complete()', async () => {
    mockedPatch.mockResolvedValue({ data: { ...rawAppointment, status: 'CANCELED' } } as never);
    await expect(appointmentsService.cancel('app-1')).resolves.toMatchObject({
      status: 'CANCELED',
      dealership: { name: 'Ford São Paulo' },
    });

    mockedPatch.mockResolvedValue({ data: { ...rawAppointment, status: 'CHECKED_IN' } } as never);
    await expect(appointmentsService.checkIn('app-1')).resolves.toMatchObject({
      status: 'CHECKED_IN',
    });

    mockedPatch.mockResolvedValue({ data: { ...rawAppointment, status: 'COMPLETED' } } as never);
    await expect(appointmentsService.complete('app-1')).resolves.toMatchObject({
      status: 'COMPLETED',
    });
  });
});
