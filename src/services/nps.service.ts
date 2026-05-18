import { api } from './api';
import { ServiceType } from './services.service';

export type NpsCategory =
  | 'ATENDIMENTO'
  | 'TEMPO_DE_ESPERA'
  | 'PRECO'
  | 'QUALIDADE_DO_SERVICO'
  | 'COMUNICACAO'
  | 'INSTALACOES';

export interface PendingSurvey {
  serviceId: string;
  serviceType: ServiceType;
  dealership: string;
  performedAt: string;
}

export interface NpsResponse {
  serviceId: string;
  score: number;
  comment?: string;
  likedCategories: NpsCategory[];
  improvementCategories: NpsCategory[];
  submittedAt: string;
}

export interface SubmitNpsInput {
  score: number;
  comment?: string;
  likedCategories: NpsCategory[];
  improvementCategories: NpsCategory[];
}

export const npsService = {
  async listPending(): Promise<PendingSurvey[]> {
    const { data } = await api.get<PendingSurvey[]>('/me/surveys/pending');
    return data;
  },

  async submit(serviceId: string, input: SubmitNpsInput): Promise<NpsResponse> {
    const { data } = await api.post<NpsResponse>(`/services/${serviceId}/nps`, input);
    return data;
  },

  async get(serviceId: string): Promise<NpsResponse> {
    const { data } = await api.get<NpsResponse>(`/services/${serviceId}/nps`);
    return data;
  },
};
