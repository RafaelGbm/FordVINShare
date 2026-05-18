import { useQuery } from '@tanstack/react-query';

import {
  customersService,
  ListTimelineParams,
} from '../services/customers.service';

export const customerKeys = {
  all: ['customers'] as const,
  detail: (id: string) => [...customerKeys.all, 'detail', id] as const,
  v360: (id: string) => [...customerKeys.all, '360', id] as const,
  timeline: (id: string, params: ListTimelineParams) =>
    [...customerKeys.all, 'timeline', id, params] as const,
};

export function useCustomer(id: string | undefined) {
  return useQuery({
    queryKey: customerKeys.detail(id ?? ''),
    queryFn: () => customersService.getById(id!),
    enabled: !!id,
  });
}

export function useCustomer360(id: string | undefined) {
  return useQuery({
    queryKey: customerKeys.v360(id ?? ''),
    queryFn: () => customersService.get360(id!),
    enabled: !!id,
  });
}

export function useCustomerTimeline(
  id: string | undefined,
  params: ListTimelineParams = {}
) {
  return useQuery({
    queryKey: customerKeys.timeline(id ?? '', params),
    queryFn: () => customersService.getTimeline(id!, params),
    enabled: !!id,
  });
}
