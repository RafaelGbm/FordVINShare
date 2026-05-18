import { useQuery } from '@tanstack/react-query';

import {
  dealershipsService,
  ListDealershipsParams,
} from '../services/dealerships.service';
import { ServiceType } from '../services/services.service';

export const dealershipKeys = {
  all: ['dealerships'] as const,
  list: (params: ListDealershipsParams) =>
    [...dealershipKeys.all, 'list', params] as const,
  detail: (id: string) => [...dealershipKeys.all, 'detail', id] as const,
  availability: (id: string, serviceType: ServiceType, date: string) =>
    [...dealershipKeys.all, 'availability', id, serviceType, date] as const,
};

export function useDealerships(params: ListDealershipsParams = {}) {
  return useQuery({
    queryKey: dealershipKeys.list(params),
    queryFn: () => dealershipsService.list(params),
  });
}

export function useDealership(id: string | undefined) {
  return useQuery({
    queryKey: dealershipKeys.detail(id ?? ''),
    queryFn: () => dealershipsService.getById(id!),
    enabled: !!id,
  });
}

export function useDealershipAvailability(
  id: string | undefined,
  serviceType: ServiceType | undefined,
  date: string | undefined
) {
  return useQuery({
    queryKey: dealershipKeys.availability(id ?? '', serviceType ?? 'REVIEW', date ?? ''),
    queryFn: () => dealershipsService.getAvailability(id!, serviceType!, date!),
    enabled: !!id && !!serviceType && !!date,
  });
}
