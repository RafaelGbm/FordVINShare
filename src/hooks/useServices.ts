import { useQuery } from '@tanstack/react-query';

import { servicesService, ListServicesParams } from '../services/services.service';

export const serviceKeys = {
  all: ['services'] as const,
  mine: (params: ListServicesParams) => [...serviceKeys.all, 'mine', params] as const,
  detail: (id: string) => [...serviceKeys.all, 'detail', id] as const,
  byVehicle: (id: string) => [...serviceKeys.all, 'by-vehicle', id] as const,
};

export function useMyServices(params: ListServicesParams = {}) {
  return useQuery({
    queryKey: serviceKeys.mine(params),
    queryFn: () => servicesService.listMine(params),
  });
}
