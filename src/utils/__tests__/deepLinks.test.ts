import { parseDeepLink } from '../deepLinks';

describe('parseDeepLink', () => {
  it('returns null for empty input', () => {
    expect(parseDeepLink(undefined)).toBeNull();
    expect(parseDeepLink(null)).toBeNull();
    expect(parseDeepLink('')).toBeNull();
  });

  it('maps known client hosts to the matching expo-router path', () => {
    expect(parseDeepLink('fordapp://home')).toBe('/(client)/home');
    expect(parseDeepLink('fordapp://vehicle')).toBe('/(client)/home');
    expect(parseDeepLink('fordapp://scheduling')).toBe('/(client)/scheduling');
    expect(parseDeepLink('fordapp://locator')).toBe('/(client)/locator');
    expect(parseDeepLink('fordapp://points')).toBe('/(client)/points');
    expect(parseDeepLink('fordapp://chat')).toBe('/(client)/chat');
    expect(parseDeepLink('fordapp://profile')).toBe('/(client)/profile');
  });

  it('maps known analyst hosts', () => {
    expect(parseDeepLink('fordapp://dashboard')).toBe('/(analyst)/dashboard');
    expect(parseDeepLink('fordapp://leads')).toBe('/(analyst)/leads');
    expect(parseDeepLink('fordapp://segmentation')).toBe('/(analyst)/segmentation');
  });

  it('forwards query string untouched on the standard routes', () => {
    expect(parseDeepLink('fordapp://scheduling?vehicleId=abc')).toBe(
      '/(client)/scheduling?vehicleId=abc'
    );
    expect(parseDeepLink('fordapp://locator?lat=-23.5&lng=-46.6')).toBe(
      '/(client)/locator?lat=-23.5&lng=-46.6'
    );
  });

  it('rewrites the nps deep link into a path param', () => {
    expect(parseDeepLink('fordapp://nps?serviceId=svc-1')).toBe('/nps/svc-1');
  });

  it('keeps remaining query parameters when rewriting nps', () => {
    expect(parseDeepLink('fordapp://nps?serviceId=svc-1&source=push')).toBe(
      '/nps/svc-1?source=push'
    );
  });

  it('returns null when nps is missing serviceId', () => {
    expect(parseDeepLink('fordapp://nps')).toBeNull();
    expect(parseDeepLink('fordapp://nps?source=push')).toBeNull();
  });

  it('accepts bare paths without a scheme', () => {
    expect(parseDeepLink('/scheduling')).toBe('/(client)/scheduling');
    expect(parseDeepLink('locator?lat=1&lng=2')).toBe('/(client)/locator?lat=1&lng=2');
  });

  it('returns null for unknown hosts', () => {
    expect(parseDeepLink('fordapp://unknown')).toBeNull();
    expect(parseDeepLink('fordapp://settings?x=1')).toBeNull();
  });
});
