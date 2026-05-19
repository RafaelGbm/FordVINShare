const API_URL = process.env.EXPO_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error(
    'EXPO_PUBLIC_API_URL not set. Create a .env file based on .env.example.'
  );
}

export const ENV = {
  API_URL,
  /**
   * When true the app bypasses login and seeds the React Query cache
   * with the fixtures in src/utils/demoMode.ts. Useful for
   * demonstrations without a live backend. Toggle via
   * EXPO_PUBLIC_DEMO_MODE=true in the .env file.
   */
  DEMO_MODE: process.env.EXPO_PUBLIC_DEMO_MODE === 'true',
} as const;
