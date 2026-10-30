import { useState, useCallback } from 'react';
import { apiClients, API_ENDPOINTS, TribunalKey } from '@/constants/api';
import { SearchParams, Processo } from '@/types';

// Formatar número do processo no padrão CNJ
function formatProcessNumber(numero: string): string {
  if (!numero) return '';
  const clean = numero.replace(/[^\d]/g, '');
  if (clean.length === 20) {
    return `${clean.slice(0,7)}-${clean.slice(7,9)}.${clean.slice(9,13)}.${clean.slice(13,14)}.${clean.slice(14,16)}.${clean.slice(16,20)}`;
  }
  return numero;
}

// Formatar data para pt-BR
function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });
  } catch {
    return dateStr;
  }
}

// ==================== BUSCA DATAJUD (CNJ) ====================
async function searchDataJud(query: string, page: number, size: number): Promise<Processo[]> {
  const client = apiClients.datajud;
  const body = {
    query: {
      multi_match: {
        query: query,
        fields: ['ementa', 'numeroProcesso', 'classeProcessual', 'assunto', 'relator', 'orgaoJulgador'],
        type: 'best_fields',
        fuzziness: 'AUTO',
      },
    },
    sort: [{ dataJulgamento: { order: 'desc' } }],
    from: (page - 1) * size,
    size: size,
    _source: [
      'numeroProcesso', 'classeProcessual', 'assunto', 'relator',
      'orgaoJulgador', 'dataJulgamento', 'ementa', 'inteiroTeor',
      'tribunal', 'grau', 'dataAjuizamento', 'partes', 'movimentacoes'
    ],
  };

  const response = await client.post(API_ENDPOINTS.datajud.search, body);
  const hits = response?.hits?.hits || [];

  return hits.map((hit: any) => ({
    id: hit._id,
    tribunal: 'TJRS (DataJud/CNJ)',
    numeroProcesso: formatProcessNumber(hit._source?.numeroProcesso),
    classeProcessual: hit._source?.classeProcessual || '',
    assunto: hit._source?.assunto || '',
    relator: hit._source?.relator || '',
    orgaoJulgador: hit._source?.orgaoJulgador || '',
    dataJulgamento: hit._source?.dataJulgamento || '',
    ementa: hit._source?.ementa || '',
    inteiroTeor: hit._source?.inteiroTeor || '',
    grau: hit._source?.grau || '',
    dataAjuizamento: hit._source?.dataAjuizamento || '',
    fonte: 'datajud' as const,
    partes: hit._source?.partes || [],
    movimentacoes: hit._source?.movimentacoes || [],
  }));
}

// ==================== BUSCA STJ ====================
async function searchSTJ(query: string, page: number, size: number): Promise<Processo[]> {
  const client = apiClients.stj;
  const params = {
    q: query,
    pagina: page,
    tamanho: size,
    ordenacao: 'data_julgamento_desc',
  };

  const response = await client.get(API_ENDPOINTS.stj.search, { params });
  const dados = response?.dados || [];

  return dados.map((item: any) => ({
    id: item.id || item.numeroProcesso,
    tribunal: 'STJ',
    numeroProcesso: formatProcessNumber(item.numeroProcesso),
    classeProcessual: item.classeProcessual || '',
    assunto: item.assunto || '',
    relator: item.relator || '',
    orgaoJulgador: item.orgaoJulgador || 'STJ',
    dataJulgamento: item.dataJulgamento || '',
    ementa: item.ementa || '',
    inteiroTeor: item.inteiroTeor || '',
    fonte: 'stj' as const,
    partes: item.partes || [],
    movimentacoes: item.movimentacoes || [],
  }));
}

// ==================== BUSCA TJRS DIRETO ====================
async function searchTJRS(query: string, page: number, size: number): Promise<Processo[]> {
  const client = apiClients.tjrs;
  const params = {
    termo: query,
    pagina: page,
    tamanho: size,
  };

  const response = await client.get(API_ENDPOINTS.tjrs.search, { params });
  const dados = response?.dados || [];

  return dados.map((item: any) => ({
    id: item.id || item.numeroProcesso,
    tribunal: 'TJRS Direto',
    numeroProcesso: formatProcessNumber(item.numeroProcesso),
    classeProcessual: item.classeProcessual || '',
    assunto: item.assunto || '',
    relator: item.relator || '',
    orgaoJulgador: item.orgaoJulgador || '',
    dataJulgamento: item.dataJulgamento || '',
    ementa: item.ementa || '',
    inteiroTeor: item.inteiroTeor || '',
    fonte: 'tjrs' as const,
    partes: item.partes || [],
    movimentacoes: item.movimentacoes || [],
  }));
}

// ==================== DETALHE DO PROCESSO ====================
async function getProcessDetail(tribunal: TribunalKey, numeroProcesso: string): Promise<Processo | null> {
  const cleanNumber = numeroProcesso.replace(/[.\-]/g, '');

  try {
    switch (tribunal) {
      case 'datajud': {
        const client = apiClients.datajud;
        const response = await client.get(`${API_ENDPOINTS.datajud.detail}${cleanNumber}`);
        const src = response?._source;
        if (!src) return null;
        return {
          id: response._id,
          tribunal: 'TJRS (DataJud/CNJ)',
          numeroProcesso: formatProcessNumber(src.numeroProcesso),
          classeProcessual: src.classeProcessual || '',
          assunto: src.assunto || '',
          relator: src.relator || '',
          orgaoJulgador: src.orgaoJulgador || '',
          dataJulgamento: src.dataJulgamento || '',
          dataAjuizamento: src.dataAjuizamento || '',
          ementa: src.ementa || '',
          inteiroTeor: src.inteiroTeor || '',
          grau: src.grau || '',
          fonte: 'datajud',
          partes: src.partes || [],
          movimentacoes: src.movimentacoes || [],
        };
      }

      case 'stj': {
        const client = apiClients.stj;
        const response = await client.get(`${API_ENDPOINTS.stj.detail}${encodeURIComponent(numeroProcesso)}`);
        const data = response;
        if (!data) return null;
        return {
          id: data.id || data.numeroProcesso,
          tribunal: 'STJ',
          numeroProcesso: formatProcessNumber(data.numeroProcesso),
          classeProcessual: data.classeProcessual || '',
          assunto: data.assunto || '',
          relator: data.relator || '',
          orgaoJulgador: data.orgaoJulgador || 'STJ',
          dataJulgamento: data.dataJulgamento || '',
          ementa: data.ementa || '',
          inteiroTeor: data.inteiroTeor || '',
          fonte: 'stj',
          partes: data.partes || [],
          movimentacoes: data.movimentacoes || [],
        };
      }

      case 'tjrs': {
        const client = apiClients.tjrs;
        const response = await client.get(`${API_ENDPOINTS.tjrs.detail}${encodeURIComponent(numeroProcesso)}`);
        const data = response;
        if (!data) return null;
        return {
          id: data.id || data.numeroProcesso,
          tribunal: 'TJRS Direto',
          numeroProcesso: formatProcessNumber(data.numeroProcesso),
          classeProcessual: data.classeProcessual || '',
          assunto: data.assunto || '',
          relator: data.relator || '',
          orgaoJulgador: data.orgaoJulgador || '',
          dataJulgamento: data.dataJulgamento || '',
          ementa: data.ementa || '',
          inteiroTeor: data.inteiroTeor || '',
          fonte: 'tjrs',
          partes: data.partes || [],
          movimentacoes: data.movimentacoes || [],
        };
      }

      default:
        return null;
    }
  } catch (error) {
    console.error(`Erro ao buscar detalhe ${tribunal}:`, error);
    return null;
  }
}

// ==================== HOOKS ====================

export function useSearch() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<Processo[]>([]);
  const [pagination, setPagination] = useState({ page: 1, total: 0, size: 20 });

  const search = useCallback(async (params: SearchParams) => {
    setLoading(true);
    setError(null);

    try {
      const { query, tribunal, page, size } = params;
      let allResults: Processo[] = [];

      if (tribunal === 'all' || tribunal === 'datajud') {
        try {
          const r = await searchDataJud(query, page, size);
          allResults.push(...r);
        } catch (e) {
          console.warn('DataJud falhou:', e);
        }
      }

      if (tribunal === 'all' || tribunal === 'stj') {
        try {
          const r = await searchSTJ(query, page, size);
          allResults.push(...r);
        } catch (e) {
          console.warn('STJ falhou:', e);
        }
      }

      if (tribunal === 'all' || tribunal === 'tjrs') {
        try {
          const r = await searchTJRS(query, page, size);
          allResults.push(...r);
        } catch (e) {
          console.warn('TJRS falhou:', e);
        }
      }

      // Ordenar por data mais recente
      allResults.sort((a, b) =>
        new Date(b.dataJulgamento || 0).getTime() - new Date(a.dataJulgamento || 0).getTime()
      );

      if (page === 1) {
        setResults(allResults);
      } else {
        setResults(prev => [...prev, ...allResults]);
      }

      setPagination({ page, total: allResults.length, size });

      return { results: allResults, total: allResults.length };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro na busca';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMore = useCallback(async (params: Omit<SearchParams, 'page'>) => {
    if (loading) return;
    await search({ ...params, page: pagination.page + 1 });
  }, [loading, pagination.page, search]);

  const clear = useCallback(() => {
    setResults([]);
    setPagination({ page: 1, total: 0, size: 20 });
    setError(null);
  }, []);

  return {
    results,
    loading,
    error,
    pagination,
    search,
    loadMore,
    clear,
    hasMore: results.length < pagination.total,
  };
}

export function useProcessDetail() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [process, setProcess] = useState<Processo | null>(null);

  const fetchDetail = useCallback(async (tribunal: TribunalKey, numeroProcesso: string) => {
    setLoading(true);
    setError(null);
    setProcess(null);

    try {
      const result = await getProcessDetail(tribunal, numeroProcesso);
      if (!result) throw new Error('Processo não encontrado');
      setProcess(result);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao buscar processo';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clear = useCallback(() => {
    setProcess(null);
    setError(null);
  }, []);

  return { process, loading, error, fetchDetail, clear };
}

// Health check: testa se consegue acessar as APIs (VPN Brasil ligada?)
export function useHealthCheck() {
  const [healthy, setHealthy] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(false);
  const [apiStatus, setApiStatus] = useState<Record<string, boolean>>({});

  const check = useCallback(async () => {
    setChecking(true);
    const status: Record<string, boolean> = {};

    // Testa cada API com timeout curto
    const testApi = async (name: string, fn: () => Promise<any>) => {
      try {
        await Promise.race([
          fn(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 8000)),
        ]);
        status[name] = true;
      } catch {
        status[name] = false;
      }
    };

    await Promise.all([
      testApi('datajud', () => apiClients.datajud.post(API_ENDPOINTS.datajud.search, { query: { match_all: {} }, size: 1 })),
      testApi('stj', () => apiClients.stj.get(API_ENDPOINTS.stj.search, { params: { q: 'teste', tamanho: 1 } })),
      testApi('tjrs', () => apiClients.tjrs.get(API_ENDPOINTS.tjrs.search, { params: { termo: 'teste', tamanho: 1 } })),
    ]);

    setApiStatus(status);
    setHealthy(Object.values(status).some(v => v)); // Pelo menos uma funcionando
    setChecking(false);
  }, []);

  return { healthy, checking, check, apiStatus };
}