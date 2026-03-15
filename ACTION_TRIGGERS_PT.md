# Gatilhos de Ação — Como Criar Ações TypeScript para Conversas por Voz

Este guia explica como criar ações personalizadas (gatilhos de function calling) que a IA pode invocar durante uma conversa por voz no RealtimeTalk.

---

## Visão Geral

Ações são funções TypeScript que o modelo de IA pode chamar durante uma conversa. Quando o usuário diz algo que corresponde à descrição de uma ação, o modelo a aciona automaticamente. Por exemplo:

- Usuário diz: *"Que horas são?"* → aciona `get_current_time`
- Usuário diz: *"Me lembre de ligar para o João em 10 minutos"* → aciona `create_reminder`
- Usuário diz: *"Pesquise as últimas notícias sobre IA"* → aciona `search_web`

As ações usam **Zod** para validação de parâmetros e são automaticamente convertidas para o formato de ferramentas da OpenAI.

---

## Arquitetura

```
src/actions/
├── registry.ts      # Motor central do registro (não modifique)
└── appActions.ts    # Suas definições de ações (adicione novas ações aqui)
```

O fluxo:
1. Ações são definidas com schemas Zod em `appActions.ts`
2. `createActionRegistry()` converte-as em definições de ferramentas da OpenAI
3. As ferramentas são enviadas para a API Realtime via `session.update`
4. Quando a IA chama uma ferramenta, o handler executa e retorna um resultado
5. Para ações `conversational`, o resultado é enviado de volta à IA para continuar falando
6. Para ações `background`, o resultado é registrado silenciosamente

---

## Passo a Passo: Criando uma Nova Ação

### 1. Defina a Ação

Abra `src/actions/appActions.ts` e adicione sua ação na chamada `createActionRegistry()`:

```typescript
import { z } from 'zod';
import { createActionRegistry } from './registry';

export const appActions = createActionRegistry({
  // ... ações existentes ...

  // SUA NOVA AÇÃO
  translate_text: {
    description: 'Traduzir texto para outro idioma quando o usuário pedir uma tradução',
    parameters: z.object({
      text: z.string().describe('O texto a ser traduzido'),
      targetLanguage: z.string().describe('Código do idioma alvo como "es", "fr", "pt"'),
    }),
    handler: async ({ text, targetLanguage }: { text: string; targetLanguage: string }) => {
      // Sua lógica aqui
      const translated = `[Traduzido "${text}" para ${targetLanguage}]`;
      return { translated, from: 'en', to: targetLanguage };
    },
  },
});
```

### 2. Anatomia de uma Ação

```typescript
nome_da_acao: {
  // OBRIGATÓRIO: A descrição diz à IA QUANDO chamar esta ação.
  // Seja específico — o modelo usa isso para decidir se a ação é relevante.
  description: 'Descrição de quando acionar esta ação',

  // OBRIGATÓRIO: Schema Zod definindo os parâmetros.
  // Use .describe() em cada campo — isso ajuda a IA a preenchê-los corretamente.
  parameters: z.object({
    param1: z.string().describe('O que este parâmetro é'),
    param2: z.number().optional().describe('Parâmetro numérico opcional'),
  }),

  // OPCIONAL: Tipo da ação. Padrão é 'conversational'.
  // 'conversational' — resultado é enviado de volta à IA para informar sua resposta
  // 'background' — executa silenciosamente sem afetar a conversa
  type: 'conversational',

  // OBRIGATÓRIO: Função handler assíncrona que recebe parâmetros validados.
  handler: async (params) => {
    // Sua implementação
    return { /* objeto resultado */ };
  },
}
```

### 3. Tipos de Parâmetros com Zod

Schemas Zod são automaticamente convertidos para JSON Schema para a OpenAI. Padrões comuns:

```typescript
import { z } from 'zod';

// Parâmetro string
z.string().describe('Consulta do usuário')

// Parâmetro numérico
z.number().describe('Temperatura em Celsius')

// Parâmetro opcional
z.string().optional().describe('Fuso horário opcional')

// Parâmetro enum
z.enum(['low', 'medium', 'high']).describe('Nível de prioridade')

// Parâmetro booleano
z.boolean().describe('Se deve incluir detalhes')

// Parâmetro array
z.array(z.string()).describe('Lista de tags')
```

---

## Tipos de Ação

### Ações Conversacionais (padrão)

O resultado é enviado de volta ao modelo de IA, que o usa para formular sua resposta falada.

```typescript
get_weather: {
  description: 'Obter o clima atual quando o usuário perguntar sobre condições climáticas',
  parameters: z.object({
    city: z.string().describe('Nome da cidade'),
  }),
  // type padrão é 'conversational'
  handler: async ({ city }) => {
    const data = await fetchWeather(city);
    return { temperature: data.temp, condition: data.condition, city };
  },
},
```

**Fluxo:** Usuário fala → IA chama ferramenta → handler executa → resultado enviado à IA → IA fala a resposta

### Ações em Background

Executam silenciosamente sem interromper a conversa. Úteis para analytics, logging ou efeitos colaterais.

```typescript
track_topic: {
  description: 'Rastrear o tópico da conversa para analytics',
  type: 'background',
  parameters: z.object({
    topic: z.string().describe('O tópico detectado'),
    sentiment: z.enum(['positive', 'neutral', 'negative']),
  }),
  handler: async ({ topic, sentiment }) => {
    console.log(`[analytics] Tópico: ${topic}, Sentimento: ${sentiment}`);
    await saveAnalytics({ topic, sentiment });
    return { tracked: true };
  },
},
```

**Fluxo:** IA chama ferramenta → handler executa → resultado registrado → conversa continua sem interrupção

---

## Exemplos

### Exemplo 1: Calculadora

```typescript
calculate: {
  description: 'Realizar um cálculo matemático quando o usuário pedir para calcular algo',
  parameters: z.object({
    expression: z.string().describe('Expressão matemática como "2 + 2" ou "sqrt(144)"'),
  }),
  handler: async ({ expression }: { expression: string }) => {
    try {
      // AVISO: Em produção, use um parser matemático seguro em vez de eval
      const result = Function(`"use strict"; return (${expression})`)();
      return { expression, result: String(result) };
    } catch {
      return { expression, error: 'Expressão inválida' };
    }
  },
},
```

### Exemplo 2: Salvar Nota

```typescript
save_note: {
  description: 'Salvar uma nota quando o usuário pedir para lembrar ou anotar algo',
  parameters: z.object({
    title: z.string().describe('Título curto para a nota'),
    content: z.string().describe('O conteúdo da nota'),
  }),
  handler: async ({ title, content }: { title: string; content: string }) => {
    const notes = JSON.parse(localStorage.getItem('notes') ?? '[]');
    const note = { id: crypto.randomUUID(), title, content, createdAt: new Date().toISOString() };
    notes.push(note);
    localStorage.setItem('notes', JSON.stringify(notes));
    return { saved: true, id: note.id, title };
  },
},
```

### Exemplo 3: Buscar Dados de API

```typescript
get_stock_price: {
  description: 'Obter o preço atual de uma ação quando o usuário perguntar sobre dados do mercado',
  parameters: z.object({
    symbol: z.string().describe('Símbolo do ticker como "AAPL" ou "GOOGL"'),
  }),
  handler: async ({ symbol }: { symbol: string }) => {
    const response = await fetch(`https://api.example.com/stocks/${symbol}`);
    if (!response.ok) return { error: `Não foi possível encontrar a ação ${symbol}` };
    const data = await response.json();
    return { symbol, price: data.price, currency: 'USD' };
  },
},
```

### Exemplo 4: Controle de Casa Inteligente (Background)

```typescript
set_light: {
  description: 'Controlar luzes da casa inteligente quando o usuário pedir para ligar ou desligar luzes',
  type: 'background',
  parameters: z.object({
    room: z.string().describe('Nome do cômodo como "quarto" ou "cozinha"'),
    action: z.enum(['on', 'off', 'dim']).describe('O que fazer com a luz'),
    brightness: z.number().optional().describe('Porcentagem de brilho 0-100'),
  }),
  handler: async ({ room, action, brightness }) => {
    await fetch('https://my-home-api.local/lights', {
      method: 'POST',
      body: JSON.stringify({ room, action, brightness }),
    });
    return { success: true, room, action };
  },
},
```

---

## Como Funciona Internamente

### Registro (`src/actions/registry.ts`)

```
createActionRegistry(definitions)
  ├── getToolDefinitions() → Converte Zod → JSON Schema → ToolDefinition[] da OpenAI
  └── execute(name, argsJson) → Faz parse dos args JSON com Zod → chama handler → retorna resultado
```

### Hook (`src/hooks/useActionRegistry.ts`)

```
useActionRegistry(registry, session)
  ├── syncTools()           → Envia session.update com definições de ferramentas
  ├── handleResponseDone()  → Processa itens function_call da resposta da IA
  │     ├── Conversacional  → Envia function_call_output + response.create
  │     └── Background      → Execução silenciosa, apenas registrada
  └── actionLog             → Array de execuções recentes de ações (máx 50)
```

### Fluxo de Eventos

```
1. Usuário fala → áudio WebRTC → API Realtime da OpenAI
2. IA decide chamar uma ferramenta → envia response.done com itens function_call
3. handleResponseDone() processa cada function_call:
   a. Extrai nome + JSON dos argumentos
   b. Chama registry.execute(name, argsJson)
   c. Zod valida e faz parse dos argumentos
   d. Handler executa com parâmetros tipados
   e. Resultado retornado
4. Para ações conversacionais:
   a. Envia conversation.item.create com function_call_output
   b. Envia response.create para a IA falar o resultado
5. Para ações background:
   a. Resultado é registrado no actionLog
   b. Conversa continua sem interrupção
```

---

## Dicas

1. **Seja específico nas descrições** — A IA decide qual ferramenta chamar com base na string `description`. Descrições vagas levam a acionamentos incorretos.

2. **Use `.describe()` em todos os campos Zod** — Isso se torna a descrição do parâmetro no JSON Schema, ajudando a IA a preencher os parâmetros corretamente.

3. **Retorne dados estruturados** — Retorne objetos, não strings. A IA consegue interpretar resultados estruturados melhor.

4. **Use `background` para efeitos colaterais** — Se o usuário não precisa ouvir sobre o resultado (analytics, logging, atualizações de estado), faça uma ação background.

5. **Trate erros graciosamente** — Retorne objetos de erro em vez de lançar exceções. A IA usará a mensagem de erro na sua resposta.

6. **Mantenha os handlers rápidos** — O usuário está esperando uma resposta falada. Handlers demorados criam pausas desconfortáveis.

7. **Teste com voz** — Ações que funcionam com texto podem precisar de descrições diferentes para voz. Usuários falam naturalmente, não em comandos.
