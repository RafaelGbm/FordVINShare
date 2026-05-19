// Make EXPO_PUBLIC_API_URL available during tests so src/config/env
// doesn't throw when imported. Override in individual tests if needed.
process.env.EXPO_PUBLIC_API_URL =
  process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8080/api/v1';
