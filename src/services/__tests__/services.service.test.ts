import { api } from '../api';
import { servicesService } from '../services.service';

jest.mock('../api', () => ({ api: { get: jest.fn() } }));

const mockedGet = api.get as jest.MockedFunction<typeof api.get>;

/**
 * Shape the deployed backend actually sends for /me/services,
 * /services/{id} and /vehicles/{id}/services — confirmed against
 * production on 2026-09-14. dealership/serviceType come as an id + a
 * human label instead of the single fields the screens read.
 */
const raw = {
  id: 'svc-1',
  vehicleId: 'v-1',
  vehicleModel: 'Ranger',
  dealershipId: 'dlr-1',
  dealershipName: 'Ford São Paulo',
  serviceTypeId: 'OIL_CHANGE',
  serviceTypeLabel: 'Troca de oleo',
  performedAt: '2026-07-29T22:50:36.201923Z',
  totalAmount: 380,
  summary: 'Troca de óleo e filtros originais',
};

const normalized = {
  id: 'svc-1',
  vehicleId: 'v-1',
  dealership: 'Ford São Paulo',
  serviceType: 'OIL_CHANGE',
  performedAt: '2026-07-29T22:50:36.201923Z',
  totalAmount: 380,
  summary: 'Troca de óleo e filtros originais',
};

beforeEach(() => mockedGet.mockReset());

describe('servicesService', () => {
  it('normalizes listMine()', async () => {
    mockedGet.mockResolvedValueOnce({
      data: { content: [raw], number: 0, size: 20, totalElements: 1, totalPages: 1 },
    } as never);

    const result = await servicesService.listMine();

    expect(result.content).toEqual([normalized]);
  });

  it('normalizes getById()', async () => {
    mockedGet.mockResolvedValueOnce({ data: raw } as never);
    await expect(servicesService.getById('svc-1')).resolves.toEqual(normalized);
  });

  it('normalizes listByVehicle()', async () => {
    mockedGet.mockResolvedValueOnce({
      data: { content: [raw], number: 0, size: 20, totalElements: 1, totalPages: 1 },
    } as never);

    const result = await servicesService.listByVehicle('v-1');
    expect(result.content).toEqual([normalized]);
  });
});
