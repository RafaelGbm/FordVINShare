import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import type { Query } from '@tanstack/react-query';

/**
 * AsyncStorage-backed persister for the React Query cache. We only
 * persist a small allowlist of queries (vehicles, warranty,
 * maintenance alerts, and the user's service history) so the home
 * screen can render last-known data while the device is offline, but
 * sensitive responses (chat, /me, analytics, leads) stay in-memory.
 */
export const queryPersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: 'ford-vinshare-query-cache',
  throttleTime: 1000,
});

const PERSISTED_TOP_LEVELS: Record<string, ReadonlySet<string>> = {
  vehicles: new Set(['list', 'warranty', 'alerts']),
  services: new Set(['mine']),
};

/**
 * Allowlist filter passed to PersistQueryClientProvider so only the
 * data the home tab needs offline is written to disk.
 */
export function shouldPersistQuery(query: Query): boolean {
  const [scope, subscope] = query.queryKey;
  if (typeof scope !== 'string' || typeof subscope !== 'string') return false;
  const allowedSubscopes = PERSISTED_TOP_LEVELS[scope];
  if (!allowedSubscopes) return false;
  return allowedSubscopes.has(subscope);
}

// Bumped when the persisted shape changes so we wipe stale entries
// on the next launch.
export const QUERY_CACHE_BUSTER = 'v1';
