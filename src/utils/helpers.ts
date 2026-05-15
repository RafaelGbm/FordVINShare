import { REVISION_INTERVAL_KM, RISK_SCORE_THRESHOLDS, NPS_THRESHOLD } from '../constants';

export const formatDate = (date: string | Date) => {
  const d = new Date(date);
  return d.toLocaleDateString('pt-BR');
};

export const formatDatetime = (date: string | Date) => {
  const d = new Date(date);
  return d.toLocaleString('pt-BR');
};

export const daysUntil = (targetDate: string) => {
  const target = new Date(targetDate);
  const today = new Date();
  const diff = target.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

export const formatDistance = (distanceKm: number) => {
  if (distanceKm < 1000) {
    return `${Math.round(distanceKm)} km`;
  }
  return `${(distanceKm / 1000).toFixed(1)} mil km`;
};

export const getNextRevisionKm = (currentKm: number) => {
  return Math.ceil(currentKm / REVISION_INTERVAL_KM) * REVISION_INTERVAL_KM;
};

export const getRevisionAlertKm = (currentKm: number) => {
  const nextRevision = getNextRevisionKm(currentKm);
  return nextRevision - 500;
};

export const isNearRevision = (currentKm: number) => {
  return currentKm >= getRevisionAlertKm(currentKm);
};

export const calculateRiskScore = (
  lastVisitMonthsAgo: number,
  daysUntilWarrantyExpiry: number,
  avgNPS: number,
  servicesInLastYear: number,
  kmToNextRevision: number,
): number => {
  let score = 0;

  if (lastVisitMonthsAgo > 12) score += 30;
  if (daysUntilWarrantyExpiry > 0 && daysUntilWarrantyExpiry < 60) score += 20;
  if (avgNPS < 7) score += 25;
  if (kmToNextRevision < 500) score += 15;
  if (servicesInLastYear >= 3) score -= 20;
  if (avgNPS >= 9) score -= 10;

  return Math.max(0, Math.min(100, score));
};

export const getSegmentFromRiskScore = (score: number) => {
  if (score < RISK_SCORE_THRESHOLDS.loyal) return 'Fiel';
  if (score < RISK_SCORE_THRESHOLDS.at_risk) return 'Novo';
  if (score < RISK_SCORE_THRESHOLDS.lost) return 'Em Risco';
  return 'Perdido';
};

export const getNPSCategory = (score: number) => {
  if (score >= NPS_THRESHOLD.promoter) return 'Promoter';
  if (score >= NPS_THRESHOLD.passive) return 'Passive';
  return 'Detractor';
};

export const calculateAverageNPS = (scores: number[]) => {
  if (scores.length === 0) return 0;
  return scores.reduce((a, b) => a + b, 0) / scores.length;
};

export const formatCPF = (cpf: string) => {
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

export const formatPhone = (phone: string) => {
  return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
};

export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};
