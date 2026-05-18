const API_URL = process.env.EXPO_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error(
    'EXPO_PUBLIC_API_URL not set. Create a .env file based on .env.example.'
  );
}

export const ENV = {
  API_URL,
} as const;
