import { useMutation, useQueryClient } from '@tanstack/react-query';

import { vehiclesService } from '../services/vehicles.service';
import { vehicleKeys } from './useVehicles';

export function useUpdateOdometer(vehicleId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (km: number) => {
      if (!vehicleId) throw new Error('vehicleId required');
      return vehiclesService.updateOdometer(vehicleId, km);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: vehicleKeys.all });
    },
  });
}
