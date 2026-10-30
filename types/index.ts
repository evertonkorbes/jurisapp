export interface Processo {
  id: string;
  tribunal: string;
  numeroProcesso: string;
  classeProcessual: string;
  assunto: string;
  relator: string;
  orgaoJulgador: string;
  dataJulgamento: string;
  ementa: string;
  inteiroTeor?: string;
  grau?: string;
  dataAjuizamento?: string;
  fonte: 'datajud' | 'stj' | 'tjrs';
  partes?: Parte[];
  movimentacoes?: Movimentacao[];
}

export interface Parte {
  tipo: 'autor' | 'reu' | 'outro';
  nome: string;
  advogados?: string[];
}

export interface Movimentacao {
  data: string;
  descricao: string;
  tipo?: string;
}

export interface SearchParams {
  query: string;
  tribunal: TribunalKey;
  page: number;
  size: number;
}

export interface SearchResponse {
  success: boolean;
  total: number;
  page: number;
  size: number;
  results: Processo[];
}

export interface ProcessDetailResponse {
  success: boolean;
  process: Processo;
}

export type TribunalKey = 'all' | 'datajud' | 'stj' | 'tjrs';

export interface TribunalInfo {
  label: string;
  icon: string;
}