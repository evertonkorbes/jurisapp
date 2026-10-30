// Configuração para chamar APIs brasileiras DIRETO do celular
// FUNCIONA QUANDO VPN BRASIL ESTIVER LIGADA
// React Native NÃO tem bloqueio CORS (diferente do navegador)

export const TRIBUNAIS = {
  all: { label: 'Todos (DataJud + STJ)', icon: '🏛️' },
  datajud: { label: 'TJRS via DataJud/CNJ', icon: '⚖️' },
  stj: { label: 'STJ', icon: '🏛️' },
  tjrs: { label: 'TJRS Direto', icon: '📋' },
} as const;

export type TribunalKey = keyof typeof TRIBUNAIS;

// APIs oficiais brasileiras
const API_CONFIG = {
  datajud: {
    baseURL: 'https://api-publica.datajud.cnj.jus.br',
    search: '/api_publica_tjrs/_search',
    detail: '/api_publica_tjrs/_doc/',
  },
  stj: {
    baseURL: 'https://www.stj.jus.br',
    search: '/api/jurisprudencia/v1/pesquisa',
    detail: '/api/jurisprudencia/v1/detalhe/',
  },
  tjrs: {
    baseURL: 'https://www.tjrs.jus.br',
    search: '/api/jurisprudencia/pesquisa',
    detail: '/api/jurisprudencia/detalhe/',
  },
};

// Cliente HTTP otimizado para mobile
const createClient = (baseURL: string) => {
  return {
    async get(url: string, config?: { params?: Record<string, any> }) {
      const params = new URLSearchParams(config?.params);
      const fullUrl = `${baseURL}${url}${params.toString() ? '?' + params.toString() : ''}`;

      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'JurisApp/1.0 (Android; Mobile)',
        },
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    },

    async post(url: string, data: any) {
      const response = await fetch(`${baseURL}${url}`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'User-Agent': 'JurisApp/1.0 (Android; Mobile)',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    },
  };
};

export const apiClients = {
  datajud: createClient(API_CONFIG.datajud.baseURL),
  stj: createClient(API_CONFIG.stj.baseURL),
  tjrs: createClient(API_CONFIG.tjrs.baseURL),
};

export const API_ENDPOINTS = API_CONFIG;