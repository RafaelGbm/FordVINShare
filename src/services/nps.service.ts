import { api } from './api';

export type NpsCategory =
  | 'ATENDIMENTO'
  | 'TEMPO_DE_ESPERA'
  | 'PRECO'
  | 'QUALIDADE_DO_SERVICO'
  | 'COMUNICACAO'
  | 'INSTALACOES';

export interface PendingSurvey {
  serviceId: string;
  /** Human label only — the backend does not send the ServiceType code here. */
  serviceTypeLabel: string;
  dealership: string;
  performedAt: string;
}

/** Shape the backend actually sends. */
interface RawPendingSurvey {
  serviceId: string;
  serviceTypeLabel: string;
  dealershipName: string;
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
    const { data } = await api.get<RawPendingSurvey[]>('/me/surveys/pending');
    return data.map((raw) => ({
      serviceId: raw.serviceId,
      serviceTypeLabel: raw.serviceTypeLabel,
      dealership: raw.dealershipName,
      performedAt: raw.performedAt,
    }));
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
