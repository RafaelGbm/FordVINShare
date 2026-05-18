import { useMutation } from '@tanstack/react-query';

import {
  devicesService,
  RegisterDeviceInput,
} from '../services/devices.service';

export function useRegisterDevice() {
  return useMutation({
    mutationFn: (input: RegisterDeviceInput) => devicesService.register(input),
  });
}

export function useUnregisterDevice() {
  return useMutation({
    mutationFn: (expoPushToken: string) => devicesService.unregister(expoPushToken),
  });
}
