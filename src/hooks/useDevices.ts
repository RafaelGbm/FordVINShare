import { useMutation } from '@tanstack/react-query';

import { devicesService, DevicePlatform } from '../services/devices.service';

export function useRegisterDevice() {
  return useMutation({
    mutationFn: ({ token, platform }: { token: string; platform: DevicePlatform }) =>
      devicesService.register(token, platform),
  });
}

export function useUnregisterDevice() {
  return useMutation({
    mutationFn: (token: string) => devicesService.unregister(token),
  });
}
