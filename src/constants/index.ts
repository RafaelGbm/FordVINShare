export const COLORS = {
  primary: '#003087', // Ford blue
  secondary: '#1a73e8',
  success: '#34a853',
  warning: '#fbbc04',
  danger: '#ea4335',
  light: '#f8f9fa',
  dark: '#202124',
  gray: '#80868b',
  border: '#dadce0',
};

export const SEGMENTS = {
  loyal: {
    name: 'Fiel',
    color: '#34a853',
    description: 'Clientes regulares na rede Ford',
  },
  at_risk: {
    name: 'Em Risco',
    color: '#fbbc04',
    description: 'Clientes que podem sair',
  },
  lost: {
    name: 'Perdido',
    color: '#ea4335',
    description: 'Clientes inativos há muito tempo',
  },
  new: {
    name: 'Novo',
    color: '#1a73e8',
    description: 'Clientes novos na base',
  },
};

export const SERVICE_TYPES = {
  revision: 'Revisão',
  oil_change: 'Troca de Óleo',
  warranty: 'Garantia',
  repair: 'Reparo',
};

export const WARRANTY_STATUS = {
  active: 'Ativa',
  expiring_soon: 'Vencendo em breve',
  expired: 'Vencida',
};

export const REVISION_INTERVAL_KM = 10000;

export const NPS_THRESHOLD = {
  promoter: 9,
  passive: 7,
  detractor: 0,
};

export const RISK_SCORE_THRESHOLDS = {
  loyal: 20,
  at_risk: 60,
  lost: 80,
};

export const FORD_MODELS = [
  'Ka',
  'Fiesta',
  'EcoSport',
  'Ranger',
  'Bronco',
  'Territory',
];
