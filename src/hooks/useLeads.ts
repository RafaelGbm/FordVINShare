import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  leadsService,
  LeadActionInput,
  ListLeadsParams,
} from '../services/leads.service';

export const leadKeys = {
  all: ['leads'] as const,
  list: (params: ListLeadsParams) => [...leadKeys.all, 'list', params] as const,
  detail: (id: string) => [...leadKeys.all, 'detail', id] as const,
};

export function useLeads(params: ListLeadsParams = {}) {
  return useQuery({
    queryKey: leadKeys.list(params),
    queryFn: () => leadsService.list(params),
  });
}

export function useLead(id: string | undefined) {
  return useQuery({
    queryKey: leadKeys.detail(id ?? ''),
    queryFn: () => leadsService.getById(id!),
    enabled: !!id,
  });
}

export function useCreateLeadAction(leadId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: LeadActionInput) => {
      if (!leadId) throw new Error('leadId is required');
      return leadsService.createAction(leadId, input);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: leadKeys.all });
    },
  });
}
