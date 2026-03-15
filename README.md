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
| `/personality/:id?` | `PersonalityEditorPage` | Criação/edição de personalidades |

---

## Estrutura do projeto

A aplicação segue **Atomic Design** para componentes UI e **Controller/View pattern** para separação de lógica e apresentação nas páginas.

```
src/
├── components/                     # Atomic Design component hierarchy
│   ├── atoms/                      # Smallest UI primitives (no business logic)
│   │   ├── Badge.tsx              # Tag/badge with optional remove
│   │   ├── Button.tsx             # Multi-variant button (primary, danger, ghost, outline)
│   │   ├── EmptyState.tsx         # Empty state placeholder message
│   │   ├── IconButton.tsx         # Button wrapper for icon-only actions
│   │   ├── Input.tsx              # Text input with border color variants
│   │   ├── Label.tsx              # Form label
│   │   ├── MessageBubble.tsx      # Chat message bubble (user/assistant)
│   │   ├── SectionTitle.tsx       # Section heading
│   │   ├── Select.tsx             # Dropdown select with typed options
│   │   ├── StatusDot.tsx          # Session status indicator dot + label
│   │   ├── Textarea.tsx           # Multi-line text input
│   │   ├── icons.tsx              # SVG icon components (Back, Settings, Clock, Mic, etc.)
│   │   └── index.ts               # Barrel export
│   ├── molecules/                  # Combinations of atoms
│   │   ├── AudioVisualizer.tsx    # Canvas frequency bar visualization
│   │   ├── CostTokenDisplay.tsx   # Cost + token counter inline display
│   │   ├── FormField.tsx          # Label + input wrapper
│   │   ├── StatusMessage.tsx      # Feedback message bar
│   │   ├── TagInput.tsx           # Input + tag list with add/remove
│   │   └── index.ts
│   ├── organisms/                  # Complex UI sections
│   │   ├── ActionLogPanel.tsx     # Recent action execution log
│   │   ├── ApiKeySection.tsx      # API key management form
│   │   ├── AppHeader.tsx          # Page header with back nav + actions
│   │   ├── ConversationSettingsPanel.tsx  # Model/voice/VAD/personality config
│   │   ├── PersonalityForm.tsx    # Personality editor form sections
│   │   ├── SessionCard.tsx        # Expandable session history card
│   │   ├── SessionControls.tsx    # Connect/disconnect + mute + visualizer
│   │   ├── TranscriptPanel.tsx    # Scrollable message transcript
│   │   └── index.ts
│   ├── templates/                  # Page layout wrappers
│   │   ├── ContentLayout.tsx      # Scrollable content area with max-width
│   │   ├── PageLayout.tsx         # Full-screen flex column container
│   │   └── index.ts
│   └── pages/                      # Page components (Controller + View)
│       ├── ConversationPage/
│       │   ├── index.tsx                    # Connects controller → view
│       │   ├── useConversationController.ts # All state & business logic
│       │   └── ConversationPageView.tsx     # Pure render (no useState)
│       ├── HistoryPage/
│       │   ├── index.tsx
│       │   ├── useHistoryController.ts
│       │   └── HistoryPageView.tsx
│       ├── SettingsPage/
│       │   ├── index.tsx
│       │   ├── useSettingsController.ts
│       │   └── SettingsPageView.tsx
│       └── PersonalityEditorPage/
│           ├── index.tsx
│           ├── usePersonalityEditorController.ts
│           └── PersonalityEditorView.tsx
├── hooks/                          # Shared React hooks
│   ├── useRealtimeSession.ts      # Core: WebRTC + session lifecycle
│   ├── useAudioControls.ts       # Mute + frequency analysis
│   ├── useActionRegistry.ts      # Function calling + action log
│   ├── usePersonality.ts         # Apply/save personalities
│   ├── useMemory.ts              # Memory extraction/injection
│   └── useContextInjection.ts    # Dynamic context mid-session
├── core/                           # Engine e infraestrutura
│   ├── types/realtime.ts          # OpenAI Realtime API type definitions
│   ├── webrtc/ephemeralToken.ts   # Ephemeral token generation
│   ├── events/eventEmitter.ts     # Typed event emitter
│   └── contextWindow.ts           # Context window management (pruning)
├── actions/                        # Action Registry + handlers
│   ├── registry.ts                # Typed registry with Zod
│   └── appActions.ts              # 4 built-in actions
├── personality/                    # Personality system
│   ├── types.ts                   # PersonalityConfig interface
│   ├── compiler.ts                # Config → system prompt
│   └── presets.ts                 # 3 presets
├── storage/                        # Local persistence
│   ├── idb.ts                     # IndexedDB (sessions, memories, personalities)
│   ├── keyManager.ts              # AES-256-GCM API key encryption
│   └── exportImport.ts            # Export/Import JSON
├── utils/
│   └── costEstimator.ts           # Cost calculation per model
├── App.tsx                         # React Router
├── main.tsx                        # Entry point
└── index.css                       # Tailwind CSS
```

### Padrões arquiteturais

#### Atomic Design (componentes)

| Nível | Descrição | Exemplos |
|---|---|---|
| **Atoms** | Menores unidades UI reutilizáveis, sem lógica de negócio | `Button`, `Input`, `Select`, `Badge`, `StatusDot` |
| **Molecules** | Combinações de átomos com comportamento isolado | `TagInput`, `AudioVisualizer`, `CostTokenDisplay` |
| **Organisms** | Seções complexas da UI compostas por moléculas e átomos | `SessionControls`, `TranscriptPanel`, `AppHeader` |
| **Templates** | Layouts estruturais que definem o esqueleto da página | `PageLayout`, `ContentLayout` |
| **Pages** | Páginas completas com controller/view separation | `ConversationPage`, `HistoryPage` |

#### Controller/View Pattern (páginas)

Cada página é dividida em 3 arquivos:
- **`index.tsx`** — conecta controller ao view (5-6 linhas)
- **`use[Page]Controller.ts`** — toda a lógica de estado e side effects (hooks, callbacks)
- **`[Page]View.tsx`** — render puro, recebe props do controller, sem `useState`

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
