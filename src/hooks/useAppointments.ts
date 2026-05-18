import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  appointmentsService,
  AppointmentStatus,
  CreateAppointmentInput,
} from '../services/appointments.service';

export const appointmentKeys = {
  all: ['appointments'] as const,
  serviceTypes: () => ['service-types'] as const,
  mine: (status?: AppointmentStatus) =>
    [...appointmentKeys.all, 'mine', status ?? 'all'] as const,
  detail: (id: string) => [...appointmentKeys.all, 'detail', id] as const,
};

export function useServiceTypes() {
  return useQuery({
    queryKey: appointmentKeys.serviceTypes(),
    queryFn: () => appointmentsService.listServiceTypes(),
    staleTime: 5 * 60_000, // service-types changes rarely
  });
}

export function useMyAppointments(status?: AppointmentStatus) {
  return useQuery({
    queryKey: appointmentKeys.mine(status),
    queryFn: () => appointmentsService.listMine(status),
  });
}

export function useCreateAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateAppointmentInput) => appointmentsService.create(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: appointmentKeys.all });
    },
  });
}

export function useCancelAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => appointmentsService.cancel(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: appointmentKeys.all });
    },
  });
}
