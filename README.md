# JurisApp - Mobile

App React Native (Expo) para consultar jurisprudência brasileira (TJRS, STJ, DataJud/CNJ) **com número do processo completo, sem máscara**.

## 🎯 Funcionalidades

- ✅ Busca unificada: TJRS (DataJud/CNJ), STJ, TJRS Direto
- ✅ **Número do processo COMPLETO visível** (padrão CNJ: NNNNNNN-DD.AAAA.J.TR.OOOO)
- ✅ Ementa e inteiro teor completo
- ✅ Partes e advogados
- ✅ Movimentações processuais
- ✅ Filtro por tribunal
- ✅ Paginação infinita (scroll para carregar mais)
- ✅ Pull-to-refresh
- ✅ Funciona dos EUA (via backend proxy no Brasil)

## 🏗️ Arquitetura

```
┌─────────────────┐     HTTPS      ┌──────────────────┐     APIs Oficiais     ┌─────────────────┐
│  Seu Celular    │ ─────────────► │  Backend Proxy   │ ────────────────────► │  DataJud (CNJ)  │
│  (EUA/Brasil)   │                │  (NO BRASIL)     │                       │  STJ            │
└─────────────────┘                └──────────────────┘                       │  TJRS           │
                                            │                                └─────────────────┘
                                            │ Deploy no Brasil (Railway,
                                            │  Render, VPS brasileira, etc.)
                                            ▼
```

**Por que o backend no Brasil?** As APIs oficiais (DataJud, STJ, TJRS) bloqueiam IPs fora do Brasil. O backend roda em servidor brasileiro e faz as requisições por você.

## 🚀 Setup Rápido

### 1. Deploy do Backend (OBRIGATÓRIO - no Brasil)

```bash
cd backend
# Siga o README do backend para deploy no Railway/Render/VPS brasileira
# Anote a URL pública (ex: https://juris-backend.railway.app)
```

### 2. Configurar o App Mobile

```bash
cd mobile
cp .env.example .env
# Edite .env e coloque a URL do seu backend:
# EXPO_PUBLIC_API_URL=https://seu-backend.railway.app
```

### 3. Instalar e Rodar

```bash
cd mobile
npm install
npm start
```

- Pressione `a` para Android
- Pressione `i` para iOS (precisa Mac + Xcode)
- Pressione `w` para Web

### 4. Build para App Stores (EAS Build)

```bash
npm install -g eas-cli
eas login
eas build --platform all
# Android: eas build --platform android
# iOS: eas build --platform ios
```

## 📱 Telas

| Tela | Descrição |
|------|-----------|
| **Home** | Busca com filtros, lista de resultados com número completo |
| **Detalhe** | Processo completo: ementa, inteiro teor, partes, movimentações |

## 🔧 Personalização

### Alterar cores/tema
Edite `app.config.js` e os estilos nos componentes.

### Adicionar mais tribunais
1. No backend: adicione em `API_CONFIG` e crie funções `searchXXX`/`getXXXProcess`
2. No mobile: adicione em `constants/api.ts` no objeto `TRIBUNAIS`

## 📦 Dependências Principais

- `expo-router` - Navegação baseada em arquivos
- `axios` - Requisições HTTP
- `date-fns` - Formatação de datas (pt-BR)
- `react-native-markdown-display` - Renderizar inteiro teor em markdown

## 🌐 Deploy do Backend (Resumo)

### Railway (GRÁTIS, região São Paulo) ✅ RECOMENDADO
1. Fork este repo no GitHub
2. railway.app → New Project → Deploy from GitHub
3. Selecione pasta `backend`
4. Settings → Environment → `FRONTEND_URL=*`
5. Deploy automático! URL: `https://xxx.railway.app`

### Render (GRÁTIS, região São Paulo)
1. render.com → New Web Service → Docker
2. Conecte GitHub, pasta `backend`
3. Region: São Paulo
4. Deploy!

### VPS Brasileira (HostGator, Locaweb, KingHost)
```bash
# No servidor:
git clone seu-repo
cd juris-app/backend
docker build -t juris-backend .
docker run -d -p 3000:3000 --restart unless-stopped juris-backend
```

## ⚠️ Importante

1. **Backend DEVE estar no Brasil** (IP brasileiro)
2. DataJud TJRS é público (sem token)
3. Outros tribunais no DataJud precisam token CNJ (gratuito em datajud.cnj.jus.br)
4. Rate limit: 100 req/15min por IP no backend
5. Para produção, configure `FRONTEND_URL` com a URL real do app

## 📄 Licença

MIT - Uso livre para fins educacionais e profissionais.

---

**Desenvolvido para advogados que precisam acessar jurisprudência brasileira do exterior.** ⚖️🇧🇷