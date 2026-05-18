import { useQuery } from '@tanstack/react-query';

import { vehiclesService } from '../services/vehicles.service';

export const vehicleKeys = {
  all: ['vehicles'] as const,
  list: () => [...vehicleKeys.all, 'list'] as const,
  detail: (id: string) => [...vehicleKeys.all, 'detail', id] as const,
  warranty: (id: string) => [...vehicleKeys.all, 'warranty', id] as const,
  alerts: (id: string) => [...vehicleKeys.all, 'alerts', id] as const,
};

export function useMyVehicles() {
  return useQuery({
    queryKey: vehicleKeys.list(),
    queryFn: () => vehiclesService.list(),
  });
}

export function useVehicleWarranty(vehicleId: string | undefined) {
  return useQuery({
    queryKey: vehicleKeys.warranty(vehicleId ?? ''),
    queryFn: () => vehiclesService.getWarranty(vehicleId!),
    enabled: !!vehicleId,
  });
}

export function useMaintenanceAlerts(vehicleId: string | undefined) {
  return useQuery({
    queryKey: vehicleKeys.alerts(vehicleId ?? ''),
    queryFn: () => vehiclesService.getMaintenanceAlerts(vehicleId!),
    enabled: !!vehicleId,
  });
}
