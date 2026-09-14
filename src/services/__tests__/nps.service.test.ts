import { api } from '../api';
import { npsService } from '../nps.service';

jest.mock('../api', () => ({ api: { get: jest.fn(), post: jest.fn() } }));

const mockedGet = api.get as jest.MockedFunction<typeof api.get>;

/**
 * Shape /me/surveys/pending actually sends — confirmed against production
 * on 2026-09-14. Unlike ServiceRecord/AppointmentSummary, there is no
 * serviceTypeId here at all, only the label — the ServiceType enum cannot
 * be recovered from this endpoint.
 */
const raw = {
  serviceId: 'svc-2',
  serviceTypeLabel: 'Troca de oleo',
  dealershipName: 'Ford São Paulo',
  performedAt: '2026-07-29T22:50:36.201923Z',
};

beforeEach(() => mockedGet.mockReset());

describe('npsService.listPending', () => {
  it('maps dealershipName/serviceTypeLabel to the fields the Home screen reads', async () => {
    mockedGet.mockResolvedValueOnce({ data: [raw] } as never);

    await expect(npsService.listPending()).resolves.toEqual([
      {
        serviceId: 'svc-2',
        serviceTypeLabel: 'Troca de oleo',
        dealership: 'Ford São Paulo',
        performedAt: '2026-07-29T22:50:36.201923Z',
      },
    ]);
  });
});
