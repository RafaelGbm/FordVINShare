/**
 * Translates an incoming push notification deepLink (e.g.
 * "fordapp://scheduling?vehicleId=abc") into an expo-router path the
 * AppShell can hand to router.push(). Returns null when the URL is
 * unrecognised so the caller can decide whether to ignore it or
 * fall back to a default screen.
 */
const HOST_TO_ROUTE: Record<string, string> = {
  home: '/(client)/home',
  vehicle: '/(client)/home',
  scheduling: '/(client)/scheduling',
  locator: '/(client)/locator',
  points: '/(client)/points',
  chat: '/(client)/chat',
  profile: '/(client)/profile',
  dashboard: '/(analyst)/dashboard',
  leads: '/(analyst)/leads',
  segmentation: '/(analyst)/segmentation',
};

export function parseDeepLink(input: string | undefined | null): string | null {
  if (!input) return null;

  // Accept both fordapp://scheduling?x=y and bare /scheduling?x=y forms.
  let pathPart: string;
  let queryPart = '';

  if (input.includes('://')) {
    const url = input.split('://')[1] ?? '';
    const [host, query = ''] = url.split('?');
    pathPart = host.split('/')[0];
    queryPart = query;
  } else {
    const [path, query = ''] = input.replace(/^\/+/, '').split('?');
    pathPart = path.split('/')[0];
    queryPart = query;
  }

  const route = HOST_TO_ROUTE[pathPart];
  if (!route) return null;

  return queryPart ? `${route}?${queryPart}` : route;
}
