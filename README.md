# RealtimeTalk — Conversação por Voz em Tempo Real com IA

Aplicação 100% client-side para conversação por voz em tempo real com modelos de IA da OpenAI, conectando via WebRTC diretamente do browser — sem backend, sem banco de dados remoto, sem autenticação server-side.

---

## O que o projeto faz

**RealtimeTalk** é uma aplicação web que permite conversar por voz com modelos de IA da OpenAI em tempo real. O áudio do microfone do usuário é transmitido diretamente para a OpenAI via WebRTC, e a resposta de voz do modelo é reproduzida no browser, tudo sem intermediários.

### Funcionalidades implementadas

- **Conversação por voz bidirecional em tempo real** — fale com o microfone e ouça a resposta do modelo instantaneamente via WebRTC peer-to-peer
- **Modelo BYOK (Bring Your Own Key)** — o usuário insere sua própria API key da OpenAI; a app gera um token efêmero (`client_secret`) e estabelece a conexão WebRTC
- **Seleção de modelo** — suporte a `gpt-realtime`, `gpt-realtime-mini` e `gpt-realtime-1.5`
- **10 vozes disponíveis** — alloy, ash, ballad, coral, echo, sage, shimmer, verse, marin e cedar
- **VAD semântico configurável** — detecção de fim de fala baseada em semântica (não apenas silêncio), com controle de agressividade (`eagerness`: low, medium, high, auto)
- **Transcrição em tempo real** — transcrição bidirecional (usuário e modelo) exibida durante a conversa
- **Sistema de personalidade completo** — criação, edição e aplicação de personalidades com identidade, regras, tom de voz, tópicos proibidos e deflexões anti-jailbreak
- **3 presets de personalidade** — Assistente Padrão, Suporte Técnico, Tutor de Idiomas
- **Compilador de personalidade** — converte `PersonalityConfig` em system prompt otimizado com guardrails
- **Troca de personalidade mid-session** — altera personalidade durante uma sessão ativa via `session.update`
- **Action Registry tipado com Zod** — registro de ações TypeScript com validação de parâmetros, conversão automática Zod → JSON Schema para tools da OpenAI
- **4 ações built-in** — `search_web` (mock), `create_reminder`, `get_current_time`, `log_interaction`
- **Function calling completo** — modelo chama tool → handler executa → resultado volta → modelo continua falando
- **Ações background** — ações que executam sem injetar resultado na conversa (ex: analytics)
- **Memória conversacional persistente** — extração automática de fatos via GPT-4o-mini ao final da sessão, injeção dos últimos 20 fatos na próxima sessão
- **Injeção de contexto dinâmico** — injeção de contexto de sistema e de usuário mid-session via `conversation.item.create`
- **Template engine** — resolução de variáveis `{{variable}}` em prompts
- **Histórico de sessões** — lista de sessões anteriores com transcrição, duração e metadados
- **Export/Import de dados** — exportação completa (sessões, memórias, personalidades) como JSON; importação para restaurar
- **Criptografia de API key** — AES-256-GCM com PBKDF2 (100K iterações), salt e IV aleatórios, armazenamento opcional em localStorage
- **Estimativa de custo** — cálculo de custo por sessão baseado em tokens de texto e áudio (input/output/cached)
- **Visualizador de áudio** — canvas com análise de frequência em tempo real (barras ou waveform) via Web Audio API
- **Indicador de estado** — visual animado para todos os estados (idle, connecting, connected, listening, thinking, speaking, disconnected, error)
- **PWA** — Progressive Web App com service worker, manifest, e suporte offline
- **Dark mode** — via Tailwind CSS
- **Reconexão automática** — até 3 tentativas com backoff exponencial
- **Deploy estático** — GitHub Pages via GitHub Actions

---

## O que o projeto NÃO faz

- **Não tem backend** — tudo roda no browser; não existe servidor, API intermediária, nem proxy
- **Não tem autenticação de usuários** — não há login, signup, sessões de usuário, nem controle de acesso
- **Não tem banco de dados remoto** — toda persistência é local (IndexedDB + localStorage)
- **Não faz busca web real** — a action `search_web` retorna dados mock; não consulta nenhuma API de busca
- **Não suporta múltiplos idiomas na UI** — a interface é fixa em inglês; o modelo conversa no idioma configurado na personalidade, mas a UI não é internacionalizada
- **Não tem testes automatizados** — não há unit tests, integration tests, nem E2E tests
- **Não tem SSR/SSG** — é uma SPA pura sem server-side rendering
- **Não tem rate limiting nem controle de gastos** — o custo é estimado mas não há limites configuráveis para proteger o usuário de gastos excessivos
- **Não suporta múltiplas conversas simultâneas** — uma sessão WebRTC ativa por vez
- **Não tem compartilhamento de sessões** — sessões são locais e não podem ser compartilhadas entre dispositivos/usuários
- **Não grava áudio** — o áudio é transmitido em tempo real mas não é salvo; apenas a transcrição é persistida
- **Não tem streaming de texto** — output é por áudio; texto é disponibilizado apenas via transcrição após o modelo falar

---

## O que o projeto ainda não faz, mas está caminhando para fazer

Baseado no roadmap original e no estado atual da implementação:

| Funcionalidade | Estado | Evidência |
|---|---|---|
| **Gestão ativa de context window** | Código existe, não integrado | `contextWindow.ts` implementa `ContextWindowManager` com pruning e estimativa de tokens, mas não é chamado pela `ConversationPage` |
| **Busca web real via action** | Stub implementado | `search_web` action registrada com schema Zod, handler retorna mock — falta integrar uma API de busca real |
| **Editor visual de personalidade completo** | Funcional, pode expandir | `PersonalityEditor.tsx` permite criar personalidades customizadas; roadmap prevê editor mais sofisticado |
| **Ícones PWA** | Manifest configurado, ícones ausentes | `vite-plugin-pwa` configurado com referência a `pwa-192x192.png` e `pwa-512x512.png` que não existem no repositório |
| **Notificações push** | Parcial | `create_reminder` action usa `Notification API` com `setTimeout`, mas não há service worker push notifications |
| **Testes automatizados** | Não implementado | Roadmap fase 7 previa testes; nenhum framework de test está instalado |
| **Documentação de uso** | Não implementado | Roadmap fase 7 previa README com guia de setup, criação de actions e personalidades |

---

## Tecnologias empregadas

### Core

| Tecnologia | Versão | Propósito | Custo |
|---|---|---|---|
| **React** | 19.2.4 | Framework UI com hooks | Grátis |
| **TypeScript** | 5.9.3 | Tipagem estática, strict mode | Grátis |
| **Vite** | 8.0.0 | Bundler e dev server com HMR | Grátis |
| **Tailwind CSS** | 4.2.1 | Estilização utility-first com dark mode | Grátis |
| **React Router DOM** | 7.13.1 | Roteamento client-side SPA | Grátis |
| **Zod** | 4.3.6 | Validação runtime de schemas | Grátis |
| **zod-to-json-schema** | 3.25.1 | Conversão Zod → JSON Schema para tools OpenAI | Grátis |
| **idb** | 8.0.3 | Wrapper tipado para IndexedDB | Grátis |
| **vite-plugin-pwa** | 1.2.0 | Service worker e PWA support | Grátis |

### APIs nativas do browser

| API | Propósito |
|---|---|
| **WebRTC** (`RTCPeerConnection`) | Conexão peer-to-peer com OpenAI Realtime API |
| **MediaDevices** (`getUserMedia`) | Captura de áudio do microfone |
| **Web Audio API** (`AnalyserNode`) | Análise de frequência para visualização |
| **Web Crypto API** (`AES-GCM`, `PBKDF2`) | Criptografia de API keys |
| **IndexedDB** | Persistência estruturada (sessões, memórias, personalidades) |
| **localStorage** | Persistência simples (API keys criptografadas, personalidades, reminders) |
| **Notification API** | Notificações de lembretes |

### APIs externas

| API | Propósito | Custo |
|---|---|---|
| **OpenAI Realtime API** (WebRTC) | Conversação por voz em tempo real | Pago pelo usuário (BYOK) |
| **OpenAI Chat API** (`gpt-4o-mini`) | Extração de fatos para memória | Pago pelo usuário |

### DevDependencies

| Tecnologia | Versão | Propósito |
|---|---|---|
| **ESLint** | 9.39.4 | Linting |
| **typescript-eslint** | 8.56.1 | Regras TypeScript para ESLint |
| **eslint-plugin-react-hooks** | 7.0.1 | Regras de hooks React |
| **eslint-plugin-react-refresh** | 0.5.2 | Validação de Fast Refresh |
| **@vitejs/plugin-react** | 6.0.0 | Plugin React para Vite (Oxc) |

---

## Arquitetura

```
┌─────────────────────────────────────────────────────────────────────┐
│                          BROWSER (React SPA)                        │
│                                                                     │
│  ┌──────────┐  ┌──────────────┐  ┌──────────────┐  ┌────────────┐ │
│  │ API Key  │  │ Personality  │  │   Action     │  │  Context   │ │
│  │ Manager  │  │  Compiler    │  │  Registry    │  │  Injector  │ │
│  └────┬─────┘  └──────┬───────┘  └──────┬───────┘  └─────┬──────┘ │
│       │               │                 │                 │        │
│       ▼               ▼                 ▼                 ▼        │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │           useRealtimeSession() — Core WebRTC Engine         │   │
│  │  RTCPeerConnection (audio) ◄──► RTCDataChannel (events)     │   │
│  └──────────────────────────┬──────────────────────────────────┘   │
│                              │                                      │
│  ┌───────────────────────────┴──────────────────────────────────┐   │
│  │              IndexedDB + localStorage                         │   │
│  │   Sessions │ Memories │ Personalities │ Encrypted API Keys    │   │
│  └──────────────────────────────────────────────────────────────┘   │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
          ┌────────────────┴────────────────┐
          │                                 │
          ▼                                 ▼
┌──────────────────┐            ┌───────────────────────┐
│ OpenAI REST API  │            │  OpenAI Realtime API   │
│ POST /client_    │──token──►  │  WebRTC P2P Connection │
│      secrets     │            │  Audio ◄────► Audio    │
│ POST /chat/      │            │  DataChannel ◄► Events │
│   completions    │            │                        │
└──────────────────┘            └───────────────────────┘
```

### Rotas

| Rota | Componente | Descrição |
|---|---|---|
| `/` | `ConversationPage` | Interface principal de conversação |
| `/settings` | `SettingsPage` | Gerenciamento de API key e configurações |
| `/history` | `HistoryPage` | Histórico de sessões e export/import |
| `/personality/:id?` | `PersonalityEditor` | Criação/edição de personalidades |

---

## Limitações atuais

### Técnicas

- **Context window management passivo** — o `ContextWindowManager` está implementado mas não integrado ao fluxo principal; o truncamento depende do comportamento automático da OpenAI (remove mensagens antigas ao atingir 28.672 tokens de input)
- **Sem testes** — nenhum framework de test instalado; toda validação é manual
- **Sem CI de qualidade** — o GitHub Actions faz apenas build + deploy; não roda linting nem testes
- **PWA incompleta** — manifest e service worker configurados, mas ícones de app não incluídos no repositório
- **Estimativa de custo simplificada** — baseada em preços fixos hard-coded; não acompanha mudanças de pricing da OpenAI
- **Reconexão limitada** — 3 tentativas com backoff, mas sem persistência de estado da conversa entre reconexões

### Funcionais

- **Action `search_web` é mock** — retorna dados fictícios; necessita integração com API de busca real
- **Sem controle de gastos** — o custo é exibido mas não há limites configuráveis (ex: "pare após $5")
- **Sem gravação de áudio** — apenas transcrição é salva; áudio é efêmero
- **Sem i18n** — UI apenas em inglês
- **Sem acessibilidade avançada** — sem ARIA labels abrangentes, sem navegação por teclado completa
- **Sem suporte a imagem/vídeo** — apenas áudio e texto
- **Uma sessão por vez** — não suporta múltiplas conversas paralelas

### Segurança

- **API key no browser** — mesmo criptografada, a key é decifrada em memória durante o uso; qualquer extensão do browser ou XSS teria acesso
- **Export sem criptografia** — o JSON exportado contém todos os dados em texto plano
- **Sem CSP rigoroso** — não há Content Security Policy configurada no HTML

---

## Comparação com o Roadmap original

### Progresso por fase

| Fase | Descrição | Status | Observações |
|---|---|---|---|
| **FASE 0** — Setup do Projeto | Scaffold, tipagens, utilitários | ✅ **Completa** | Estrutura de pastas criada, tipos da Realtime API definidos, `ApiKeyManager` com criptografia funcional, TypeScript strict mode |
| **FASE 1** — Core Voice Engine | WebRTC, conversação por voz, VAD | ✅ **Completa** | `useRealtimeSession` implementa todo o fluxo WebRTC, seleção de modelo, semantic VAD, transcrição, mute, indicador de estado |
| **FASE 2** — Function Calling | Action Registry, Zod, tools | ✅ **Completa** | `ActionRegistry` com Zod → JSON Schema, fluxo completo de function calling, ações background, action log |
| **FASE 3** — Contexto Dinâmico | Context injection, template engine | ✅ **Completa** (parcial integração) | `useContextInjection` funciona, template engine com variáveis `{{}}` implementada, `ContextWindowManager` existe mas não integrado ativamente |
| **FASE 4** — Personalidade | Compiler, presets, guardrails | ✅ **Completa** | 3 presets, compiler com guardrails anti-injection, editor visual, troca mid-session |
| **FASE 5** — Memória/Persistência | IndexedDB, export/import | ✅ **Completa** | 3 stores IndexedDB, extração de fatos via GPT-4o-mini, injeção de memória, export/import JSON |
| **FASE 6** — Interface Completa | UI responsiva, dark mode | ✅ **Completa** | 4 páginas, componentes shared, dark mode, visualizador de áudio, responsivo |
| **FASE 7** — Polish/Deploy | PWA, custos, testes, docs | ⚠️ **Parcial** | Cost calculator implementado, PWA configurada (sem ícones), deploy via GitHub Pages; faltam testes e documentação |

### Desvios do roadmap

| Aspecto | Roadmap previa | Implementação real |
|---|---|---|
| **Estrutura de pastas** | `src/core/realtime-client.ts`, `token-manager.ts`, `event-emitter.ts` separados | Consolidado em `src/core/webrtc/ephemeralToken.ts`, `src/core/events/eventEmitter.ts`, e hook `useRealtimeSession.ts` absorveu o `RealtimeClient` |
| **RealtimeClient como classe** | Classe standalone `RealtimeClient` | Lógica integrada diretamente no hook `useRealtimeSession` com `useRef` e `useCallback` |
| **Modelo adicional** | `gpt-realtime` e `gpt-realtime-mini` | Adicionou `gpt-realtime-1.5` não previsto no roadmap |
| **Biblioteca IndexedDB** | Wrapper manual com `indexedDB.open()` | Usa biblioteca `idb` (tipada) em vez de wrapper manual |
| **Zod → JSON Schema** | Conversão manual `zodToJsonSchema()` | Usa `zod-to-json-schema` (biblioteca externa) |
| **Roteamento** | "React Router ou state-based routing" | React Router DOM implementado |
| **Storage de personalidades** | IndexedDB | localStorage (mais simples) |
| **Testes** | Previstos na fase 7 | Não implementados |

---

## Próximos passos planejados

Baseado nas lacunas entre o roadmap e a implementação atual:

### Prioridade alta

1. **Integrar `ContextWindowManager` ao fluxo principal** — o código existe em `src/core/contextWindow.ts` mas não é chamado pela `ConversationPage`; necessário para evitar truncamento abrupto em conversas longas
2. **Implementar `search_web` action com API real** — substituir o mock por integração com uma API de busca (ex: Brave Search, Tavily, ou SerpAPI)
3. **Adicionar testes automatizados** — instalar Vitest + React Testing Library; cobrir hooks core (`useRealtimeSession`, `useActionRegistry`, `useMemory`)

### Prioridade média

4. **Criar ícones PWA** — gerar `pwa-192x192.png` e `pwa-512x512.png` para que a instalação como app funcione corretamente
5. **Adicionar controle de gastos** — permitir que o usuário defina um limite de custo por sessão; pausar/desconectar automaticamente ao atingir
6. **Melhorar CI/CD** — adicionar steps de lint e test no workflow do GitHub Actions antes do deploy

### Prioridade baixa

7. **Internacionalização (i18n)** — suportar a UI em múltiplos idiomas
8. **Acessibilidade** — adicionar ARIA labels, navegação por teclado, e suporte a screen readers
9. **Export criptografado** — opção de exportar dados com senha
10. **Gravação de áudio opcional** — salvar o áudio da sessão localmente para replay

---

## Como rodar

```bash
# Instalar dependências
npm install

# Desenvolvimento (localhost com HMR)
npm run dev

# Build de produção
npm run build

# Preview do build
npm run preview
```

### Pré-requisitos

- Node.js 20+
- API key da OpenAI com acesso à Realtime API
- Browser com suporte a WebRTC e getUserMedia (Chrome, Edge, Firefox, Safari 15+)
- HTTPS em produção (necessário para `getUserMedia` e Web Crypto API)

---

## Estrutura do projeto

```
src/
├── core/                        # Engine e infraestrutura
│   ├── types/realtime.ts        # Tipagens da OpenAI Realtime API (GA)
│   ├── webrtc/ephemeralToken.ts # Geração de client_secret efêmero
│   ├── events/eventEmitter.ts   # Event emitter tipado
│   └── contextWindow.ts         # Gestão de context window (pruning)
├── hooks/                       # React hooks
│   ├── useRealtimeSession.ts    # Core: WebRTC + sessão + transcrição
│   ├── useAudioControls.ts      # Mute + análise de frequência
│   ├── useActionRegistry.ts     # Function calling + action log
│   ├── usePersonality.ts        # Aplicar/salvar personalidades
│   ├── useMemory.ts             # Extração/injeção de fatos
│   └── useContextInjection.ts   # Contexto dinâmico mid-session
├── components/                  # Componentes React
│   ├── conversation/            # Página principal de conversa
│   ├── settings/                # Gerenciamento de API key
│   ├── history/                 # Histórico de sessões
│   ├── personality/             # Editor de personalidade
│   └── shared/                  # AudioVisualizer, StatusIndicator, CostDisplay
├── actions/                     # Action Registry + handlers
│   ├── registry.ts              # Registro tipado com Zod
│   └── appActions.ts            # 4 ações built-in
├── personality/                 # Sistema de personalidade
│   ├── types.ts                 # PersonalityConfig interface
│   ├── compiler.ts              # Config → system prompt
│   └── presets.ts               # 3 presets
├── storage/                     # Persistência local
│   ├── idb.ts                   # IndexedDB (sessões, memórias, personalidades)
│   ├── keyManager.ts            # Criptografia AES-256-GCM de API keys
│   └── exportImport.ts          # Export/Import JSON
├── utils/
│   └── costEstimator.ts         # Cálculo de custo por modelo
├── App.tsx                      # React Router
├── main.tsx                     # Entry point
└── index.css                    # Tailwind CSS
```
