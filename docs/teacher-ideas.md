# Language Tutor — Ideias de Funcionalidades e Implementacao

Documento consolidado com funcionalidades para transformar o preset "Language Tutor (Sofia)" em uma plataforma completa de aprendizado de idiomas, usando exclusivamente a infraestrutura existente: **Action Registry (Zod + function calling)**, **Personality Compiler**, **Memory**, **Context Injection** e **WebRTC com transcricao bidirecional**.

---

## 1. Avaliacao de Nivel Inicial (Placement Test)

**O que e:** Na primeira sessao, Sofia faz uma avaliacao rapida (5-10min) com perguntas progressivamente mais complexas para determinar o nivel CEFR (A1-C2) do aluno.

**Como funciona:**
- O aluno inicia a sessao e Sofia detecta (via memoria) que nao existe perfil
- Sofia faz perguntas de vocabulario, gramatica e compreensao em dificuldade crescente
- Baseado nas respostas, determina o nivel e salva no perfil
- Todas as funcionalidades subsequentes se adaptam a esse nivel

**Implementacao:**
- **Action `placement_test`** (conversational) — inicia a avaliacao
  - Params: `{ target_language: z.string() }`
  - Handler retorna criterios de avaliacao por nivel para guiar a IA
- **Action `save_student_level`** (background) — persiste o resultado
  - Params: `{ level: z.enum(['A1','A2','B1','B2','C1','C2']), scores: z.object({ vocabulary: z.number(), grammar: z.number(), comprehension: z.number(), fluency: z.number() }) }`
  - Salva no IndexedDB em store `student_profile`
- Disparar automaticamente na primeira sessao via regra na personalidade
- Integrar com `useMemory` para reinjetar nivel nas sessoes futuras

**Arquivos a modificar:**
- `src/actions/appActions.ts` — 2 actions
- `src/storage/idb.ts` — nova store `student_profile`
- `src/personality/presets.ts` — regra de deteccao de primeiro uso

---

## 2. Quiz de Vocabulario por Voz

**O que e:** Sofia apresenta palavras/frases e o aluno responde com traducao, sinonimo ou uso em contexto. Pode ser acionado por voz ("quiz me") ou proposto automaticamente.

**Como funciona:**
- Sofia diz: "How do you say 'mesa' in English?"
- O aluno responde por voz
- Sofia avalia, corrige e passa para a proxima palavra
- Resultados sao persistidos para tracking de progresso

**Implementacao:**
- **Action `start_vocabulary_quiz`** (conversational)
  - Params: `{ topic: z.enum(['food','travel','business','daily_life','emotions','technology']), difficulty: z.enum(['beginner','intermediate','advanced']), count: z.number().min(3).max(20).default(10) }`
  - Handler busca palavras que o aluno ja errou (progressao) + novas do tema
  - Retorna lista estruturada para Sofia conduzir o quiz por voz
- **Action `log_quiz_result`** (background)
  - Params: `{ word: z.string(), correct: z.boolean(), category: z.string() }`
  - Salva no IndexedDB store `vocabulary` para tracking
- Usar `injectSystemContext()` para injetar regras do quiz mid-session
- Sofia propoe quizzes proativamente baseado no tempo de sessao e palavras novas detectadas

**Arquivos a modificar:**
- `src/actions/appActions.ts` — 2 actions
- `src/storage/idb.ts` — nova store `vocabulary`
- `src/personality/presets.ts` — regras de quando propor quizzes

---

## 3. Questionario de Multipla Escolha por Voz

**O que e:** Sofia apresenta perguntas de gramatica/vocabulario com 4 opcoes. O aluno responde "A", "B", "C" ou "D" por voz.

**Como funciona:**
- Sofia: "Which sentence is correct? A: She don't like coffee. B: She doesn't like coffee. C: She not like coffee. D: She no like coffee."
- Aluno: "B"
- Sofia confirma e explica por que as outras estao erradas

**Implementacao:**
- **Action `start_multiple_choice_quiz`** (conversational)
  - Params: `{ topic: z.enum(['grammar','vocabulary','idioms','prepositions','tenses']), count: z.number().default(5), difficulty: z.enum(['beginner','intermediate','advanced']) }`
  - Handler retorna questoes com 4 alternativas (banco local ou gerado pelo modelo)
- **Action `log_quiz_result`** (background) — reutiliza a mesma do quiz de vocabulario
- Banco de questoes em arquivo separado `src/actions/data/grammarQuiz.ts`

**Arquivos a modificar:**
- `src/actions/appActions.ts` — 1 action
- Novo: `src/actions/data/grammarQuiz.ts` — banco de questoes

---

## 4. Correcao Gramatical com Log e Relatorio

**O que e:** Toda correcao que Sofia faz durante a conversa e registrada silenciosamente. No final da sessao, o aluno recebe um "boletim" com todos os erros, correcoes e padroes recorrentes.

**Como funciona:**
- Aluno fala: "I goed to the store yesterday"
- Sofia corrige naturalmente: "Great try! The correct form is 'I went to the store.' Go is an irregular verb..."
- Em background, o erro e registrado com a regra gramatical
- No final, Sofia pode entregar um resumo ou o aluno pede "what mistakes did I make today?"

**Implementacao:**
- **Action `log_grammar_correction`** (background)
  - Params: `{ original: z.string(), corrected: z.string(), rule: z.string(), explanation: z.string(), severity: z.enum(['minor','moderate','critical']) }`
  - Salva no IndexedDB store `corrections` vinculado a sessao
- **Action `get_session_corrections`** (conversational)
  - Sem params — retorna todas as correcoes da sessao atual agrupadas por regra
- **Action `generate_session_report`** (conversational)
  - Params: `{ corrections: z.array(z.object({ original: z.string(), corrected: z.string(), rule: z.string() })), vocabulary_used: z.array(z.string()), fluency_notes: z.string() }`
  - Gera boletim completo salvo junto ao `SessionRecord`
- Adaptar `useMemory` para extrair padroes de erro e injetar na proxima sessao: "O aluno tem dificuldade com verbos irregulares no passado"

**Arquivos a modificar:**
- `src/actions/appActions.ts` — 3 actions
- `src/storage/idb.ts` — nova store `corrections`, campo opcional `tutorReport` em `SessionRecord`
- `src/hooks/useMemory.ts` — prompt de extracao expandido para metricas de ensino
- `src/personality/presets.ts` — regra "Always log corrections using log_grammar_correction"

---

## 5. Exercicios de Pronuncia com Feedback

**O que e:** Sofia fala uma frase e pede ao aluno para repetir. Usa a transcricao do WebRTC para comparar o que o aluno disse com a frase esperada.

**Como funciona:**
- Sofia: "Repeat after me: The weather is particularly pleasant today"
- O aluno repete
- Sofia compara a transcricao do aluno com a frase original
- Feedback especifico sobre palavras omitidas, trocadas ou pronunciadas diferente

**Implementacao:**
- **Action `pronunciation_exercise`** (conversational)
  - Params: `{ difficulty: z.enum(['beginner','intermediate','advanced']), focus: z.enum(['vowels','consonants','intonation','general']).optional() }`
  - Handler retorna frase adequada ao nivel do aluno
- **Action `evaluate_pronunciation`** (conversational)
  - Params: `{ expected: z.string(), spoken: z.string() }`
  - Handler faz comparacao fuzzy (Levenshtein distance) e retorna score + palavras problematicas
- **Action `log_pronunciation`** (background) — registra palavras com dificuldade recorrente
- Funcao de comparacao em `src/utils/textSimilarity.ts`
- A transcricao bidirecional do WebRTC ja fornece o input — nao precisa de infra nova

**Limitacao:** compara texto, nao fonetica real — mas detecta palavras trocadas ou omitidas.

**Arquivos a modificar:**
- `src/actions/appActions.ts` — 3 actions
- Novo: `src/utils/textSimilarity.ts` — Levenshtein distance ou similar

---

## 6. Cenarios de Role-Play Situacional

**O que e:** Sofia propoe cenarios do mundo real (restaurante, aeroporto, entrevista de emprego, consulta medica) e assume o papel do interlocutor nativo. O aluno pratica frases e comportamentos adequados ao contexto.

**Como funciona:**
- Aluno escolhe cenario ou Sofia sugere baseado no nivel
- Sofia assume o papel (garcom, recepcionista, entrevistador)
- A conversa segue o contexto do cenario com vocabulario especifico
- Ao final, Sofia da feedback sobre vocabulario, fluencia e naturalidade

**Implementacao:**
- **Action `start_roleplay`** (conversational)
  - Params: `{ scenario: z.enum(['restaurant','airport','hotel','job_interview','doctor_visit','shopping','phone_call','meeting']), difficulty: z.enum(['beginner','intermediate','advanced']) }`
  - Handler retorna contexto do cenario: papel da IA, setting, objetivo do aluno, vocabulario-alvo
- **Action `end_roleplay`** (conversational)
  - Params: `{ objectives_completed: z.array(z.string()), vocabulary_used: z.number(), grammar_accuracy: z.number() }`
  - Retorna scorecard do cenario
- Banco de cenarios em `src/personality/scenarios.ts` com vocabulario-alvo por nivel
- Usar `updateInstructions()` para trocar temporariamente o contexto da Sofia para o personagem
- Usar `fileContexts` para injetar vocabulario especifico do cenario

**Arquivos a modificar:**
- `src/actions/appActions.ts` — 2 actions
- Novo: `src/personality/scenarios.ts` — banco de cenarios com vocabulario-alvo
- `src/hooks/useContextInjection.ts` — facilitar troca de contexto

---

## 7. Flashcards por Voz com Repeticao Espacada (SRS)

**O que e:** Sistema de repeticao espacada controlado por voz. Palavras aprendidas nas conversas viram flashcards automaticamente. Palavras dificeis voltam com mais frequencia (algoritmo SM-2 simplificado).

**Como funciona:**
- Sofia apresenta palavra no idioma alvo, aluno responde com significado/traducao
- Palavras corretas tem intervalo aumentado; erradas voltam rapido
- Cards sao criados automaticamente quando Sofia ensina vocabulario novo
- O aluno pode iniciar sessao de revisao: "let's review my flashcards"

**Implementacao:**
- **Action `flashcard_session`** (conversational)
  - Params: `{ max_cards: z.number().min(5).max(30).default(10), focus_area: z.enum(['vocabulary','phrases','idioms','all']).default('all') }`
  - Handler busca cards pendentes (next_review <= now) do IndexedDB
- **Action `update_flashcard`** (background)
  - Params: `{ word: z.string(), correct: z.boolean() }`
  - Atualiza intervalo SRS: correto = intervalo * 2, errado = reset para 1 dia
- **Action `add_flashcard`** (background)
  - Params: `{ word: z.string(), translation: z.string(), context_sentence: z.string(), difficulty: z.enum(['easy','medium','hard']) }`
  - Sofia chama automaticamente ao ensinar vocabulario novo
- Algoritmo SM-2 simplificado em `src/utils/srs.ts` (~30 linhas)
- Nova store `flashcards` no IndexedDB com campos: word, translation, context, next_review, interval, ease_factor, correct_count, review_count

**Arquivos a modificar:**
- `src/actions/appActions.ts` — 3 actions
- Novo: `src/utils/srs.ts` — algoritmo de repeticao espacada
- `src/storage/idb.ts` — nova store `flashcards`

---

## 8. Ditado (Dictation Mode)

**O que e:** Sofia dita frases em velocidade natural ou lenta, e o aluno repete. O sistema compara a transcricao. Ideal para treinar listening comprehension e pronuncia simultaneamente.

**Como funciona:**
- Sofia dita uma frase claramente
- O aluno repete o que ouviu
- O modelo compara transcript do aluno com a frase original
- Feedback imediato sobre palavras omitidas, trocadas ou acrescentadas

**Implementacao:**
- **Action `start_dictation`** (conversational)
  - Params: `{ difficulty: z.enum(['beginner','intermediate','advanced']), topic: z.string().optional(), count: z.number().default(5) }`
  - Handler retorna lista de frases adequadas ao nivel
- **Action `check_dictation`** (conversational)
  - Params: `{ expected: z.string(), spoken: z.string() }`
  - Compara com tolerancia para acentos/pontuacao, retorna score e erros especificos
- Reutiliza `src/utils/textSimilarity.ts` da feature de pronuncia
- Aproveita transcricao bidirecional do WebRTC que ja existe
- Possibilidade de ajustar VAD para `low` eagerness durante ditado (menos interrupcoes)

**Arquivos a modificar:**
- `src/actions/appActions.ts` — 2 actions

---

## 9. Palavra do Dia + Expressoes Idiomaticas

**O que e:** Ao iniciar sessao, Sofia apresenta uma palavra ou expressao idiomatica com pronuncia, definicao, exemplos e desafia o aluno a usa-la durante a conversa.

**Como funciona:**
- Sofia: "Today's expression is 'break the ice'. It means to do something to relieve tension in a social situation..."
- Da 3 exemplos de uso natural
- Monitora se o aluno usa a expressao durante a sessao
- No final, da feedback sobre o uso ou lembra se nao foi usada

**Implementacao:**
- **Action `get_daily_expression`** (conversational)
  - Sem params — consulta localStorage para ver a ultima expressao e retorna a proxima
  - Selecao diaria via hash da data (deterministica)
- **Action `mark_expression_learned`** (background)
  - Params: `{ expression: z.string(), used_correctly: z.boolean() }`
  - Registra quando o aluno usou a expressao corretamente
- Banco de expressoes por nivel em `src/actions/data/expressions.ts`
- Injetar via `injectSystemContext()` no inicio da sessao
- Regra na personalidade: "At the start of each session, present the daily expression"

**Arquivos a modificar:**
- `src/actions/appActions.ts` — 2 actions
- Novo: `src/actions/data/expressions.ts` — banco de expressoes idiomaticas por nivel

---

## 10. Modo Imersao (So no Idioma Alvo)

**O que e:** Um modo onde Sofia fala exclusivamente no idioma que o aluno esta aprendendo, forcando imersao total. Se o aluno nao entende, Sofia simplifica mas continua no idioma alvo.

**Como funciona:**
- Aluno ativa: "let's do immersion mode"
- Sofia fala exclusivamente no idioma alvo
- Se o aluno nao entende, Sofia simplifica mas nao troca de idioma
- Idioma nativo so como ultimo recurso absoluto
- Metricas sao coletadas silenciosamente em background

**Implementacao:**
- **Action `toggle_immersion_mode`** (conversational)
  - Params: `{ enabled: z.boolean(), target_language: z.string() }`
  - Usa `updateInstructions()` para adicionar regra: "You MUST speak only in {{target_language}}"
  - Salva estado em localStorage
- Actions background para tracking silencioso: `log_fluency_metric`, `log_vocabulary_usage`
- A personalidade Sofia ja tem regra "Switch to a different language unless asked" — inverter essa logica no modo imersao

**Arquivos a modificar:**
- `src/actions/appActions.ts` — 1 action + 2 background
- `src/hooks/useContextInjection.ts` — atualizar instrucoes
- `src/personality/presets.ts` — variacao das regras

---

## 11. Modo Debate / Discussao

**O que e:** Sofia propoe um tema e defende um lado. O aluno deve argumentar o lado oposto. Excelente para praticar expressoes de opiniao, conectivos e argumentacao em nivel intermediario/avancado.

**Como funciona:**
- Sofia: "Let's debate: Is social media good for society? I'll argue that it is. You argue that it isn't."
- O aluno argumenta seu lado
- Sofia contra-argumenta usando expressoes-alvo
- Ao final, feedback sobre vocabulario de argumentacao, uso de conectivos e estrutura dos argumentos

**Implementacao:**
- **Action `start_debate`** (conversational)
  - Params: `{ topic: z.string(), user_side: z.enum(['for','against']) }`
  - Handler retorna tema com expressoes-alvo por nivel (conjuncoes, opiniao, contra-argumento)
- Context injection com regras do debate e expressoes uteis
- Lista de temas pre-selecionados adequados para pratica de idiomas

**Arquivos a modificar:**
- `src/actions/appActions.ts` — 1 action
- Novo: `src/actions/data/debateTopics.ts` — temas com expressoes-alvo

---

## 12. Modo de Correcao Adiada (Fluency First)

**O que e:** Em vez de corrigir imediatamente (que pode inibir fluencia), Sofia deixa o aluno falar livremente e acumula correcoes. Ao final de um bloco de conversa, entrega todas as correcoes de uma vez.

**Como funciona:**
- Aluno ativa: "I want to practice fluency, correct me later"
- Sofia conversa naturalmente sem interromper para corrigir
- Erros sao registrados silenciosamente via actions background
- Apos N turnos ou quando o aluno pedir, Sofia entrega feedback consolidado

**Implementacao:**
- **Action `toggle_correction_mode`** (conversational)
  - Params: `{ mode: z.enum(['immediate','deferred']) }`
  - Usa `updateInstructions()` para alterar comportamento de correcao em tempo real
- Reutiliza `log_grammar_correction` (feature #4) para buffer de correcoes
- Regra condicional na personalidade: durante modo adiado, acumular sem corrigir

**Arquivos a modificar:**
- `src/actions/appActions.ts` — 1 action
- `src/personality/presets.ts` — regras condicionais

---

## 13. Sistema de Progresso e Nivel Adaptativo

**O que e:** Meta-feature que agrega dados de todas as outras funcionalidades. Tracking automatico do nivel do aluno baseado em performance, com adaptacao automatica de dificuldade.

**Como funciona:**
- Cada sessao extrai metricas: vocabulario usado, erros cometidos, scores de exercicios
- Sofia adapta dificuldade automaticamente baseado no perfil
- Na proxima sessao, memoria injeta o nivel atual e areas de foco
- O aluno pode perguntar seu progresso a qualquer momento

**Implementacao:**
- **Action `update_student_profile`** (background)
  - Params: `{ vocabulary_used: z.array(z.string()).optional(), grammar_errors: z.number().optional(), exercise_score: z.number().min(0).max(100).optional(), topics_practiced: z.array(z.string()).optional() }`
  - Merge e atualiza metricas no IndexedDB
  - Calcula media movel de scores e atualiza nivel estimado
- **Action `get_student_profile`** (conversational)
  - Sem params — retorna perfil completo com nivel, palavras conhecidas, areas de dificuldade
- O `useMemory` ja extrai fatos automaticamente — complementar com dados estruturados
- Integrar perfil na injecao de contexto ao iniciar sessao com template: `"Current learner level: {{level}}. Focus areas: {{focus}}"`

**Arquivos a modificar:**
- `src/actions/appActions.ts` — 2 actions
- `src/storage/idb.ts` — store `student_profile`
- `src/hooks/useMemory.ts` — injecao de perfil
- `src/personality/presets.ts` — regras adaptativas

---

## 14. Gamificacao (Pontos, Streaks, Conquistas)

**O que e:** Sistema de pontos e conquistas para motivar pratica diaria. Streaks de dias consecutivos, badges por marcos alcancados.

**Como funciona:**
- Pontos por: sessao completada (+10), quiz perfeito (+25), streak de 5 dias (+50), novo nivel (+100)
- Sofia menciona conquistas naturalmente: "Amazing, 7 days in a row! You're on fire!"
- Streak tracking via datas de sessoes
- Badges desbloqueados aparecem no perfil

**Implementacao:**
- **Action `award_points`** (background)
  - Params: `{ reason: z.string(), points: z.number() }`
- **Action `check_streak`** (conversational)
  - Sem params — calcula streak atual e retorna
- **Action `get_achievements`** (conversational)
  - Sem params — retorna badges desbloqueados e proximos marcos
- Nova store `gamification` no IndexedDB: pontos, streaks, conquistas

**Arquivos a modificar:**
- `src/actions/appActions.ts` — 3 actions
- `src/storage/idb.ts` — nova store `gamification`
- `src/personality/presets.ts` — regras para mencionar conquistas

---

## Resumo de Prioridades

| # | Funcionalidade | Complexidade | Impacto | Prioridade |
|---|---|---|---|---|
| 1 | Avaliacao de Nivel | Media | Muito Alto | **Critica** |
| 4 | Correcao com Log/Relatorio | Baixa | Alto | **Alta** |
| 2 | Quiz de Vocabulario | Baixa | Alto | **Alta** |
| 6 | Role-Play Situacional | Media | Muito Alto | **Alta** |
| 13 | Progresso Adaptativo | Media | Muito Alto | **Alta** |
| 5 | Exercicios de Pronuncia | Media | Alto | **Alta** |
| 9 | Palavra do Dia | Baixa | Medio | Media |
| 3 | Multipla Escolha | Baixa | Alto | Media |
| 8 | Ditado | Baixa | Medio | Media |
| 7 | Flashcards SRS | Alta | Alto | Media |
| 12 | Correcao Adiada | Baixa | Alto | Media |
| 10 | Modo Imersao | Baixa | Medio | Media |
| 11 | Debate | Media | Medio | Baixa |
| 14 | Gamificacao | Alta | Medio | Baixa |

---

## Ordem de Implementacao Recomendada

### Fase 1 — Fundacao (so actions + memoria existente)
1. **#1 Avaliacao de Nivel** — define baseline para tudo que vem depois
2. **#4 Correcao com Log** — baixa complexidade, alto impacto, 2 actions background
3. **#9 Palavra do Dia** — quick win de engajamento, 1 action + banco de dados

### Fase 2 — Exercicios Interativos (actions + transcricao WebRTC)
4. **#2 Quiz de Vocabulario** — core feature de pratica ativa
5. **#3 Multipla Escolha** — variacao estruturada do quiz
6. **#5 Pronuncia** — aproveita transcricao existente + 1 util nova
7. **#8 Ditado** — reutiliza textSimilarity da pronuncia

### Fase 3 — Experiencias Ricas (context injection + cenarios)
8. **#6 Role-Play** — cenarios pre-definidos + troca de contexto
9. **#12 Correcao Adiada** — toggle simples de comportamento
10. **#10 Modo Imersao** — toggle de regras na personalidade
11. **#11 Debate** — temas + expressoes-alvo

### Fase 4 — Meta-features (persistencia + UI opcional)
12. **#13 Progresso Adaptativo** — agrega dados de todas as features
13. **#7 Flashcards SRS** — algoritmo SM-2 + store dedicada
14. **#14 Gamificacao** — pontos, streaks, conquistas

---

## Padrao de Implementacao

Todas as funcionalidades seguem o mesmo padrao arquitetural:

```
1. Definir action com Zod schema em src/actions/appActions.ts
2. O registry converte automaticamente Zod → JSON Schema para OpenAI tools
3. (Opcional) Dados estaticos em src/actions/data/
4. (Opcional) Nova store no IndexedDB em src/storage/idb.ts
5. Atualizar regras em src/personality/presets.ts para Sofia saber quando usar
6. Context injection via useContextInjection para dados mid-session
7. Background actions para tracking silencioso sem interromper conversa
8. useMemory injeta dados de progresso na proxima sessao automaticamente
```

**Nenhuma funcionalidade requer:**
- Mudanca no core WebRTC ou fluxo de conexao
- Novas dependencias externas
- Backend ou infraestrutura server-side
- Mudanca na arquitetura de componentes

**Infraestrutura existente aproveitada:**
- **Action Registry** (`src/actions/registry.ts`) — Zod validation + JSON Schema automatico
- **Transcricao bidirecional WebRTC** — input para pronuncia, ditado e avaliacao
- **Context Injection** (`useContextInjection`) — injecao de cenarios e regras mid-session
- **Memory** (`useMemory`) — persistencia de fatos entre sessoes via gpt-4o-mini
- **Personality Compiler** — regras dinamicas que controlam comportamento da Sofia
- **IndexedDB + localStorage** — persistencia local de todos os dados de progresso

---

## Novas Stores no IndexedDB

| Store | Funcionalidades | Campos Principais |
|---|---|---|
| `student_profile` | #1, #13 | level, scores, known_words, avg_score, last_session |
| `vocabulary` | #2, #3 | word, correct, category, timestamp |
| `corrections` | #4 | original, corrected, rule, severity, session_id |
| `flashcards` | #7 | word, translation, context, next_review, interval, ease_factor |
| `gamification` | #14 | points, streak, achievements, last_active |

---

## Total de Actions Novas

| Tipo | Quantidade | Exemplos |
|---|---|---|
| Conversational | ~14 | placement_test, start_vocabulary_quiz, start_roleplay, get_student_profile |
| Background | ~10 | log_grammar_correction, log_quiz_result, update_student_profile, award_points |
| **Total** | **~24** | Todas registradas em `src/actions/appActions.ts` |
