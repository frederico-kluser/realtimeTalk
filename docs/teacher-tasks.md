# Language Tutor — Task Breakdown

Tarefas decompostas a partir de `docs/teacher-ideas.md`, seguindo principios de story breaking (escalacao progressiva, mudanca de estado mensuravel, checkpoints) e context engineering (task_prompt XML atomico, referencias explicitas, criterios de aceitacao verificaveis).

Cada tarefa e autocontida — pode ser executada por um agente fresh sem contexto extra.

## Status

| Task | Nome | Status |
|------|------|--------|
| 1.1 | IndexedDB Stores + Student Profile | DONE |
| 1.2 | Placement Test | DONE |
| 1.3 | Correcao Gramatical com Log | DONE |
| 1.4 | Palavra do Dia + Expressoes | DONE |
| 2.1 | Quiz de Vocabulario por Voz | DONE |
| 2.2 | Questionario Multipla Escolha | DONE |
| 2.3 | Text Similarity + Pronuncia | DONE |
| 2.4 | Ditado (Dictation Mode) | DONE |
| 3.1 | Role-Play Situacional | DONE |
| 3.2 | Modo Correcao Adiada | DONE |
| 3.3 | Modo Imersao | DONE |
| 3.4 | Modo Debate / Discussao | DONE |
| 4.1 | Progresso Adaptativo | DONE |
| 4.2 | Flashcards SRS | DONE |
| 4.3 | Gamificacao | DONE |

---

## Fase 1 — Fundacao

### Task 1.1: IndexedDB Stores + Student Profile — DONE

```xml
<task_prompt>
  <background_information>
    O RealtimeTalk usa IndexedDB (via idb) para persistencia local. Precisamos criar as stores que serao base para todas as features do Language Tutor: student_profile, vocabulary, corrections, flashcards e gamification. Sem essas stores, nenhuma feature de tracking funciona.
  </background_information>

  <references>
    <item>@CLAUDE.md</item>
    <item>@src/storage/idb.ts</item>
    <item>@src/core/types/realtime.ts</item>
    <item>@docs/teacher-ideas.md (secao "Novas Stores no IndexedDB")</item>
  </references>

  <objective>
    Criar as 5 novas stores no IndexedDB com tipos TypeScript e funcoes CRUD basicas. Adicionar campo opcional tutorReport ao SessionRecord existente.
  </objective>

  <instructions>
    <item>Leia src/storage/idb.ts para entender o padrao atual de criacao de stores.</item>
    <item>Crie as stores: student_profile, vocabulary, corrections, flashcards, gamification.</item>
    <item>Defina interfaces TypeScript para cada store (ex: StudentProfile, VocabularyEntry, CorrectionEntry, Flashcard, GamificationData).</item>
    <item>Adicione campo opcional tutorReport ao tipo SessionRecord.</item>
    <item>Incremente a versao do banco para ativar a migration.</item>
    <item>Exporte tipos e helpers para uso nas actions.</item>
  </instructions>

  <constraints>
    <item>Nao altere stores existentes — apenas adicione novas.</item>
    <item>Mantenha o padrao de tipagem forte existente.</item>
    <item>Nao crie UI — apenas a camada de persistencia.</item>
  </constraints>

  <acceptance_criteria>
    <item>As 5 stores existem no IndexedDB apos upgrade.</item>
    <item>Tipos TypeScript exportados para cada store.</item>
    <item>SessionRecord aceita campo tutorReport opcional.</item>
    <item>npm run typecheck passa.</item>
  </acceptance_criteria>

  <validation>
    <item>Execute npm run typecheck.</item>
    <item>Verifique que a versao do DB foi incrementada.</item>
  </validation>
</task_prompt>
```

**Resultado:** 5 stores criadas em `src/storage/idb.ts` (student_profile, vocabulary, corrections, flashcards, gamification). Tipos exportados: StudentProfile, VocabularyEntry, CorrectionEntry, Flashcard, GamificationData, TutorReport. Campo tutorReport adicionado ao SessionRecord. Typecheck passa.

---

### Task 1.2: Placement Test (Avaliacao de Nivel) — DONE

```xml
<task_prompt>
  <background_information>
    O Language Tutor precisa determinar o nivel CEFR (A1-C2) do aluno na primeira sessao. Isso e a fundacao: todas as features subsequentes adaptam dificuldade baseado nesse nivel. O sistema de actions (Zod + function calling) ja existe e registra tools automaticamente. O sistema de memoria (useMemory) persiste fatos entre sessoes.
  </background_information>

  <references>
    <item>@CLAUDE.md</item>
    <item>@src/actions/appActions.ts</item>
    <item>@src/actions/registry.ts</item>
    <item>@src/personality/presets.ts</item>
    <item>@src/hooks/useMemory.ts</item>
    <item>@src/storage/idb.ts</item>
    <item>@docs/teacher-ideas.md (secao 1)</item>
  </references>

  <objective>
    Implementar 2 actions (placement_test + save_student_level) e atualizar as regras da personalidade Language Tutor para disparar avaliacao automaticamente quando nao existe perfil.
  </objective>

  <instructions>
    <item>Leia src/actions/appActions.ts e registry.ts para entender o padrao de registro de actions.</item>
    <item>Crie action placement_test (conversational) com param target_language: z.string(). O handler retorna criterios de avaliacao por nivel para guiar a IA.</item>
    <item>Crie action save_student_level (background) com params level (enum A1-C2) e scores (vocabulary, grammar, comprehension, fluency). O handler salva no IndexedDB store student_profile.</item>
    <item>Atualize o preset Language Tutor em presets.ts adicionando regra: "At the start of each session, check if the student has a known level. If not, initiate a placement test before proceeding with any exercises."</item>
    <item>Garanta que o resultado do placement test sera injetado nas proximas sessoes via useMemory.</item>
  </instructions>

  <constraints>
    <item>Nao crie UI — funciona 100% por voz.</item>
    <item>Nao altere actions existentes.</item>
    <item>Use o padrao Zod existente para schemas.</item>
  </constraints>

  <acceptance_criteria>
    <item>Action placement_test registrada e visivel como tool do OpenAI.</item>
    <item>Action save_student_level persiste nivel no IndexedDB.</item>
    <item>Preset Language Tutor contem regra de deteccao de primeiro uso.</item>
    <item>npm run typecheck passa.</item>
  </acceptance_criteria>

  <validation>
    <item>Execute npm run typecheck.</item>
    <item>Verifique que as actions aparecem no registro.</item>
  </validation>
</task_prompt>
```

**Resultado:** Actions `placement_test` (conversational) e `save_student_level` (background) criadas em `src/actions/appActions.ts`. Criterios CEFR A1-C2 retornados pelo handler. Nivel salvo no IndexedDB store student_profile e como fato na store memories para injecao futura. Regras adicionadas ao preset Language Tutor em `src/personality/presets.ts`. Typecheck passa.

---

### Task 1.3: Correcao Gramatical com Log — DONE

```xml
<task_prompt>
  <background_information>
    Atualmente Sofia corrige erros gramaticais na conversa mas nao persiste as correcoes. Precisamos de um sistema de logging silencioso (background action) que registre cada correcao, e uma action conversational para o aluno revisar seus erros. Isso alimenta o sistema de memoria entre sessoes.
  </background_information>

  <references>
    <item>@CLAUDE.md</item>
    <item>@src/actions/appActions.ts</item>
    <item>@src/actions/registry.ts</item>
    <item>@src/personality/presets.ts</item>
    <item>@src/hooks/useMemory.ts</item>
    <item>@src/storage/idb.ts</item>
    <item>@docs/teacher-ideas.md (secao 4)</item>
  </references>

  <objective>
    Implementar 3 actions: log_grammar_correction (background), get_session_corrections (conversational) e generate_session_report (conversational). Atualizar personalidade para sempre logar correcoes.
  </objective>

  <instructions>
    <item>Crie action log_grammar_correction (background) com params: original, corrected, rule, explanation, severity (enum minor/moderate/critical). Handler salva no IndexedDB store corrections vinculado a sessao.</item>
    <item>Crie action get_session_corrections (conversational) sem params — retorna correcoes da sessao atual agrupadas por regra.</item>
    <item>Crie action generate_session_report (conversational) com params corrections array, vocabulary_used array, fluency_notes string. Gera boletim salvo no campo tutorReport do SessionRecord.</item>
    <item>Adicione regra na personalidade: "Always log grammar corrections using log_grammar_correction when correcting the student."</item>
    <item>Adapte o prompt de extracao em useMemory.ts para incluir padroes de erro gramatical.</item>
  </instructions>

  <constraints>
    <item>log_grammar_correction deve ser background — nao interrompe conversa.</item>
    <item>Nao altere o fluxo existente de correcao por voz — apenas adicione persistencia.</item>
    <item>Nao crie componentes de UI.</item>
  </constraints>

  <acceptance_criteria>
    <item>Correcoes sao salvas no IndexedDB com todos os campos.</item>
    <item>Aluno pode pedir "what mistakes did I make?" e receber resposta.</item>
    <item>Relatorio pode ser gerado e salvo no SessionRecord.</item>
    <item>Memoria entre sessoes inclui padroes de erro.</item>
    <item>npm run typecheck passa.</item>
  </acceptance_criteria>

  <validation>
    <item>Execute npm run typecheck.</item>
  </validation>
</task_prompt>
```

**Resultado:** Actions `log_grammar_correction` (background), `get_session_corrections` (conversational) e `generate_session_report` (conversational) criadas em `src/actions/appActions.ts`. Modulo `src/actions/sessionContext.ts` criado para gerenciar sessionId e tutorReport. Correcoes salvas no IndexedDB store corrections com indice by-session. Regra adicionada ao preset. Adaptacoes em `useMemory.ts` e `useConversationController.ts`. Typecheck passa.

---

### Task 1.4: Palavra do Dia + Expressoes Idiomaticas — DONE

```xml
<task_prompt>
  <background_information>
    Um quick win de engajamento: ao iniciar cada sessao, Sofia apresenta uma expressao idiomatica do dia com definicao, exemplos e monitora se o aluno a usa durante a conversa. Requer um banco de expressoes estatico e 2 actions simples.
  </background_information>

  <references>
    <item>@CLAUDE.md</item>
    <item>@src/actions/appActions.ts</item>
    <item>@src/personality/presets.ts</item>
    <item>@src/hooks/useContextInjection.ts</item>
    <item>@docs/teacher-ideas.md (secao 9)</item>
  </references>

  <objective>
    Criar banco de expressoes idiomaticas por nivel, 2 actions (get_daily_expression + mark_expression_learned) e regra na personalidade para apresentar expressao no inicio da sessao.
  </objective>

  <instructions>
    <item>Crie arquivo src/actions/data/expressions.ts com pelo menos 30 expressoes organizadas por nivel (beginner, intermediate, advanced). Cada expressao: expression, meaning, examples (3), level.</item>
    <item>Crie action get_daily_expression (conversational) sem params. Handler usa hash da data para selecionar deterministicamente uma expressao, consultando localStorage para nao repetir.</item>
    <item>Crie action mark_expression_learned (background) com params expression e used_correctly (boolean).</item>
    <item>Adicione regra na personalidade: "At the start of each session, present the daily expression using get_daily_expression. Monitor if the student uses it during conversation."</item>
  </instructions>

  <constraints>
    <item>Selecao deve ser deterministica por dia (mesmo resultado se chamado multiplas vezes no mesmo dia).</item>
    <item>Expressoes devem ser reais e uteis, nao inventadas.</item>
  </constraints>

  <acceptance_criteria>
    <item>Banco com 30+ expressoes organizadas por nivel.</item>
    <item>get_daily_expression retorna expressao diferente a cada dia.</item>
    <item>Personalidade instrui Sofia a apresentar expressao no inicio.</item>
    <item>npm run typecheck passa.</item>
  </acceptance_criteria>

  <validation>
    <item>Execute npm run typecheck.</item>
  </validation>
</task_prompt>
```

**Resultado:** Actions `get_daily_expression` (conversational) e `mark_expression_learned` (background) criadas em `src/actions/appActions.ts`. Banco de expressoes em `src/actions/data/expressions.ts` com 30+ expressoes por nivel. Selecao deterministica via hash da data. Tracking em localStorage. Regra adicionada ao preset. Typecheck passa.

---

## Fase 2 — Exercicios Interativos

### Task 2.1: Quiz de Vocabulario por Voz — DONE

```xml
<task_prompt>
  <background_information>
    Core feature de pratica ativa. Sofia apresenta palavras/frases e o aluno responde por voz. Resultados sao persistidos na store vocabulary (criada na Task 1.1) para tracking de progresso. A action de quiz pode ser acionada por voz ("quiz me") ou proposta proativamente pela Sofia.
  </background_information>

  <references>
    <item>@CLAUDE.md</item>
    <item>@src/actions/appActions.ts</item>
    <item>@src/actions/registry.ts</item>
    <item>@src/personality/presets.ts</item>
    <item>@src/storage/idb.ts</item>
    <item>@src/hooks/useContextInjection.ts</item>
    <item>@docs/teacher-ideas.md (secao 2)</item>
  </references>

  <objective>
    Implementar action start_vocabulary_quiz (conversational) e log_quiz_result (background). Sofia conduz quiz por voz adaptado ao nivel e tema.
  </objective>

  <instructions>
    <item>Crie action start_vocabulary_quiz (conversational) com params: topic (enum food/travel/business/daily_life/emotions/technology), difficulty (enum beginner/intermediate/advanced), count (number, min 3, max 20, default 10).</item>
    <item>O handler busca palavras anteriormente erradas do IndexedDB (progressao) e complementa com novas do tema. Retorna lista estruturada para Sofia conduzir.</item>
    <item>Crie action log_quiz_result (background) com params: word, correct (boolean), category. Salva no IndexedDB store vocabulary.</item>
    <item>Use injectSystemContext() para injetar regras do quiz mid-session.</item>
    <item>Adicione regra na personalidade para propor quizzes proativamente apos 10+ minutos de sessao.</item>
  </instructions>

  <constraints>
    <item>O quiz e conduzido inteiramente por voz — sem UI.</item>
    <item>Reutilize log_quiz_result para multipla escolha (Task 2.2) tambem.</item>
  </constraints>

  <acceptance_criteria>
    <item>Sofia consegue iniciar quiz por comando de voz ou proativamente.</item>
    <item>Resultados persistidos no IndexedDB.</item>
    <item>Palavras erradas reaparecem em quizzes futuros.</item>
    <item>npm run typecheck passa.</item>
  </acceptance_criteria>

  <validation>
    <item>Execute npm run typecheck.</item>
  </validation>
</task_prompt>
```

**Resultado:** Actions `start_vocabulary_quiz` (conversational) e `log_quiz_result` (background) criadas em `src/actions/appActions.ts`. Banco de vocabulario em `src/actions/data/vocabularyBank.ts` com palavras por tema e nivel. Handler busca palavras erradas do IndexedDB para repeticao espacada + novas do tema. Regra adicionada ao preset para propor quizzes proativamente. Typecheck passa.

---

### Task 2.2: Questionario de Multipla Escolha — DONE

```xml
<task_prompt>
  <background_information>
    Variacao estruturada do quiz de vocabulario: perguntas de gramatica/vocabulario com 4 opcoes. O aluno responde "A", "B", "C" ou "D" por voz. Reutiliza a action log_quiz_result da Task 2.1 para tracking.
  </background_information>

  <references>
    <item>@CLAUDE.md</item>
    <item>@src/actions/appActions.ts</item>
    <item>@docs/teacher-ideas.md (secao 3)</item>
  </references>

  <objective>
    Implementar action start_multiple_choice_quiz e criar banco de questoes de gramatica.
  </objective>

  <instructions>
    <item>Crie arquivo src/actions/data/grammarQuiz.ts com pelo menos 50 questoes organizadas por topico (grammar, vocabulary, idioms, prepositions, tenses) e nivel. Cada questao: question, options (array de 4), correct_index, explanation.</item>
    <item>Crie action start_multiple_choice_quiz (conversational) com params: topic (enum), count (default 5), difficulty (enum). Handler seleciona questoes do banco e retorna para Sofia conduzir.</item>
    <item>Reutilize log_quiz_result (ja existente) para persistir resultados.</item>
  </instructions>

  <constraints>
    <item>Questoes devem ser gramaticalmente corretas e pedagogicamente uteis.</item>
    <item>Nao duplique logica de tracking — reutilize log_quiz_result.</item>
  </constraints>

  <acceptance_criteria>
    <item>Banco com 50+ questoes cobrindo 5 topicos e 3 niveis.</item>
    <item>Sofia le opcoes por voz e aceita resposta A/B/C/D.</item>
    <item>npm run typecheck passa.</item>
  </acceptance_criteria>

  <validation>
    <item>Execute npm run typecheck.</item>
  </validation>
</task_prompt>
```

**Resultado:** Action `start_multiple_choice_quiz` (conversational) criada em `src/actions/appActions.ts`. Banco de questoes em `src/actions/data/grammarQuiz.ts` com 50+ questoes cobrindo grammar, vocabulary, idioms, prepositions e tenses por 3 niveis. Handler seleciona questoes aleatorias e retorna com opcoes A/B/C/D, letra correta e explicacao. Reutiliza `log_quiz_result` para tracking. Typecheck passa.

---

### Task 2.3: Text Similarity Util + Exercicios de Pronuncia — DONE

```xml
<task_prompt>
  <background_information>
    Sofia fala uma frase e pede ao aluno para repetir. A transcricao bidirecional do WebRTC ja captura o que o aluno fala como texto. Precisamos de uma funcao de comparacao fuzzy (Levenshtein distance) para avaliar a similaridade, e 3 actions para conduzir o exercicio. Esta util sera reutilizada pelo ditado (Task 2.4).
  </background_information>

  <references>
    <item>@CLAUDE.md</item>
    <item>@src/actions/appActions.ts</item>
    <item>@src/hooks/useRealtimeSession.ts</item>
    <item>@docs/teacher-ideas.md (secao 5)</item>
  </references>

  <objective>
    Criar src/utils/textSimilarity.ts com funcao de comparacao fuzzy, e implementar 3 actions: pronunciation_exercise, evaluate_pronunciation, log_pronunciation.
  </objective>

  <instructions>
    <item>Crie src/utils/textSimilarity.ts com: funcao levenshteinDistance(a, b), funcao similarityScore(expected, spoken) que retorna 0-1, e funcao findDifferences(expected, spoken) que retorna array de palavras problematicas.</item>
    <item>Crie action pronunciation_exercise (conversational) com params difficulty (enum) e focus opcional (vowels/consonants/intonation/general). Handler retorna frase adequada ao nivel.</item>
    <item>Crie action evaluate_pronunciation (conversational) com params expected e spoken. Handler usa textSimilarity para comparar e retorna score + palavras problematicas.</item>
    <item>Crie action log_pronunciation (background) para registrar palavras com dificuldade recorrente.</item>
  </instructions>

  <constraints>
    <item>Comparacao e textual, nao fonetica — documente essa limitacao.</item>
    <item>textSimilarity.ts deve ser puro (sem side effects, sem dependencias externas).</item>
    <item>Normalize strings (lowercase, remover pontuacao) antes de comparar.</item>
  </constraints>

  <acceptance_criteria>
    <item>textSimilarity.ts exporta 3 funcoes puras e testadas.</item>
    <item>evaluate_pronunciation retorna score e lista de palavras diferentes.</item>
    <item>npm run typecheck passa.</item>
  </acceptance_criteria>

  <validation>
    <item>Execute npm run typecheck.</item>
  </validation>
</task_prompt>
```

**Resultado:** `src/utils/textSimilarity.ts` criado com funcoes puras: `levenshteinDistance`, `similarityScore` (0-1), `findDifferences` (palavras problematicas) e `normalizeText` (lowercase, sem pontuacao). Actions `pronunciation_exercise` (conversational), `evaluate_pronunciation` (conversational) e `log_pronunciation` (background) criadas em `src/actions/appActions.ts`. Frases por nivel e foco retornadas pelo handler. Regra adicionada ao preset. Typecheck passa.

---

### Task 2.4: Ditado (Dictation Mode) — DONE

```xml
<task_prompt>
  <background_information>
    Sofia dita frases e o aluno repete. O sistema compara via textSimilarity (criado na Task 2.3). Ideal para treinar listening comprehension. Reutiliza infraestrutura existente — transcricao WebRTC + util de comparacao.
  </background_information>

  <references>
    <item>@CLAUDE.md</item>
    <item>@src/actions/appActions.ts</item>
    <item>@src/utils/textSimilarity.ts</item>
    <item>@docs/teacher-ideas.md (secao 8)</item>
  </references>

  <objective>
    Implementar 2 actions: start_dictation e check_dictation.
  </objective>

  <instructions>
    <item>Crie action start_dictation (conversational) com params: difficulty (enum), topic (string opcional), count (number, default 5). Handler retorna lista de frases adequadas ao nivel.</item>
    <item>Crie action check_dictation (conversational) com params: expected (string) e spoken (string). Handler usa textSimilarity com tolerancia para acentos/pontuacao, retorna score e erros especificos.</item>
    <item>Adicione normalizacao Unicode na comparacao (acentos equivalentes).</item>
  </instructions>

  <constraints>
    <item>Reutilize textSimilarity.ts — nao duplique logica de comparacao.</item>
    <item>Nao modifique o VAD programaticamente — apenas sugira na personalidade que Sofia fale mais devagar.</item>
  </constraints>

  <acceptance_criteria>
    <item>start_dictation retorna frases adequadas ao nivel pedido.</item>
    <item>check_dictation compara com tolerancia e retorna feedback util.</item>
    <item>npm run typecheck passa.</item>
  </acceptance_criteria>

  <validation>
    <item>Execute npm run typecheck.</item>
  </validation>
</task_prompt>
```

**Resultado:** Actions `start_dictation` (conversational) e `check_dictation` (conversational) criadas em `src/actions/appActions.ts`. Banco de 30 frases por nivel (beginner/intermediate/advanced) embutido no handler. `check_dictation` reutiliza `similarityScore` e `findDifferences` de `src/utils/textSimilarity.ts`. Retorna score, rating (perfect/excellent/good/fair/needs_practice), palavras perdidas e feedback contextual. Typecheck passa.

---

## Fase 3 — Experiencias Ricas

### Task 3.1: Role-Play Situacional — DONE

```xml
<task_prompt>
  <background_information>
    Feature de alto impacto: cenarios imersivos onde Sofia assume papeis (garcom, recepcionista, entrevistador) e o aluno pratica situacoes reais. Requer um banco de cenarios com vocabulario-alvo por nivel e uso de context injection para alterar comportamento da Sofia mid-session.
  </background_information>

  <references>
    <item>@CLAUDE.md</item>
    <item>@src/actions/appActions.ts</item>
    <item>@src/personality/presets.ts</item>
    <item>@src/hooks/useContextInjection.ts</item>
    <item>@docs/teacher-ideas.md (secao 6)</item>
  </references>

  <objective>
    Criar banco de cenarios, implementar 2 actions (start_roleplay + end_roleplay) e integrar com context injection para troca de papel.
  </objective>

  <instructions>
    <item>Crie src/personality/scenarios.ts com pelo menos 8 cenarios: restaurant, airport, hotel, job_interview, doctor_visit, shopping, phone_call, meeting. Cada cenario: nome, descricao, papel da IA, setting, objetivo do aluno, vocabulario-alvo (por nivel), frases-chave.</item>
    <item>Crie action start_roleplay (conversational) com params: scenario (enum dos 8), difficulty (enum). Handler retorna contexto completo do cenario e usa updateInstructions() para trocar o comportamento da Sofia.</item>
    <item>Crie action end_roleplay (conversational) com params: objectives_completed (array), vocabulary_used (number), grammar_accuracy (number). Retorna scorecard e restaura personalidade original.</item>
    <item>Use fileContexts para injetar vocabulario especifico do cenario quando disponivel.</item>
  </instructions>

  <constraints>
    <item>Ao encerrar roleplay, a personalidade original da Sofia deve ser restaurada.</item>
    <item>Cenarios devem ser culturalmente neutros e apropriados para ensino.</item>
  </constraints>

  <acceptance_criteria>
    <item>8 cenarios com vocabulario-alvo por 3 niveis.</item>
    <item>Sofia assume papel do cenario e volta ao normal apos end_roleplay.</item>
    <item>Scorecard gerado ao final com feedback.</item>
    <item>npm run typecheck passa.</item>
  </acceptance_criteria>

  <validation>
    <item>Execute npm run typecheck.</item>
  </validation>
</task_prompt>
```

**Resultado:** Actions `start_roleplay` (conversational) e `end_roleplay` (conversational) criadas em `src/actions/appActions.ts`. Banco de 8 cenarios em `src/personality/scenarios.ts` (restaurant, airport, hotel, job_interview, doctor_visit, shopping, phone_call, meeting) com vocabulario-alvo por nivel e frases-chave. Estado de roleplay gerenciado via `sessionContext`. Scorecard gerado ao final com rating, vocabulario usado e recomendacao. Regras adicionadas ao preset. Typecheck passa.

---

### Task 3.2: Modo Correcao Adiada (Fluency First) — DONE

```xml
<task_prompt>
  <background_information>
    Correcao imediata pode inibir fluencia. Este modo permite ao aluno falar livremente enquanto erros sao acumulados silenciosamente. Apos N turnos ou quando pedido, Sofia entrega feedback consolidado. Reutiliza log_grammar_correction da Task 1.3.
  </background_information>

  <references>
    <item>@CLAUDE.md</item>
    <item>@src/actions/appActions.ts</item>
    <item>@src/personality/presets.ts</item>
    <item>@src/hooks/useContextInjection.ts</item>
    <item>@docs/teacher-ideas.md (secao 12)</item>
  </references>

  <objective>
    Implementar action toggle_correction_mode que alterna entre correcao imediata e adiada via updateInstructions().
  </objective>

  <instructions>
    <item>Crie action toggle_correction_mode (conversational) com param mode (enum immediate/deferred).</item>
    <item>No modo deferred, use updateInstructions() para adicionar: "Do NOT correct grammar inline. Instead, silently log all errors using log_grammar_correction. Continue the conversation naturally."</item>
    <item>No modo immediate, restaure o comportamento padrao de correcao.</item>
    <item>Adicione regra na personalidade que permita ao aluno ativar por voz: "I want to practice fluency" ou "correct me later".</item>
  </instructions>

  <constraints>
    <item>Reutilize log_grammar_correction — nao crie novo mecanismo de logging.</item>
    <item>A troca deve ser instantanea e nao interromper a conversa.</item>
  </constraints>

  <acceptance_criteria>
    <item>toggle_correction_mode alterna comportamento em tempo real.</item>
    <item>No modo deferred, erros sao logados silenciosamente.</item>
    <item>npm run typecheck passa.</item>
  </acceptance_criteria>

  <validation>
    <item>Execute npm run typecheck.</item>
  </validation>
</task_prompt>
```

**Resultado:** Action `toggle_correction_mode` (conversational) criada em `src/actions/appActions.ts`. Alterna entre modo immediate e deferred via `sessionContext.setCorrectionMode()`. No modo deferred, envia `session.update` com instrucoes adicionais para nao corrigir inline e apenas logar erros via `log_grammar_correction`. Funcoes `setSendEvent`, `setPersonalityPrompt` e `setCorrectionMode` adicionadas ao `sessionContext.ts`. Integrado com `useConversationController.ts` e `usePersonality.ts`. Regra adicionada ao preset. Typecheck passa.

---

### Task 3.3: Modo Imersao — DONE

```xml
<task_prompt>
  <background_information>
    Modo onde Sofia fala exclusivamente no idioma alvo, forcando imersao total. Se o aluno nao entende, Sofia simplifica mas nao troca de idioma. A personalidade Sofia ja tem regra "Switch to a different language unless asked" que precisa ser invertida neste modo.
  </background_information>

  <references>
    <item>@CLAUDE.md</item>
    <item>@src/actions/appActions.ts</item>
    <item>@src/personality/presets.ts</item>
    <item>@src/hooks/useContextInjection.ts</item>
    <item>@docs/teacher-ideas.md (secao 10)</item>
  </references>

  <objective>
    Implementar action toggle_immersion_mode e 2 actions background de tracking (log_fluency_metric, log_vocabulary_usage).
  </objective>

  <instructions>
    <item>Crie action toggle_immersion_mode (conversational) com params: enabled (boolean), target_language (string).</item>
    <item>Quando enabled, use updateInstructions() para adicionar: "You MUST speak ONLY in {{target_language}}. If the student doesn't understand, simplify your language but NEVER switch to another language. Use the native language ONLY as an absolute last resort."</item>
    <item>Crie action log_fluency_metric (background) para tracking silencioso.</item>
    <item>Crie action log_vocabulary_usage (background) para registrar vocabulario usado.</item>
    <item>Salve estado de imersao em localStorage para persistir entre reconexoes.</item>
  </instructions>

  <constraints>
    <item>Nao altere o comportamento padrao da Sofia — apenas adicione toggle.</item>
  </constraints>

  <acceptance_criteria>
    <item>Sofia fala exclusivamente no idioma alvo quando ativado.</item>
    <item>Metricas coletadas silenciosamente em background.</item>
    <item>npm run typecheck passa.</item>
  </acceptance_criteria>

  <validation>
    <item>Execute npm run typecheck.</item>
  </validation>
</task_prompt>
```

**Resultado:** Actions `toggle_immersion_mode` (conversational), `log_fluency_metric` (background) e `log_vocabulary_usage` (background) criadas em `src/actions/appActions.ts`. Immersion mode salva/remove estado em localStorage. Handler retorna instrucoes de imersao para injecao via session.update. Metricas de fluencia e vocabulario coletadas silenciosamente com limite de 200/500 entradas. Integrado com `useConversationController.ts` e `useActionRegistry.ts`. Regras adicionadas ao preset. Typecheck passa.

---

### Task 3.4: Modo Debate / Discussao — DONE

```xml
<task_prompt>
  <background_information>
    Feature para nivel intermediario/avancado: Sofia propoe tema, defende um lado, e o aluno argumenta o oposto. Ideal para praticar expressoes de opiniao, conectivos e argumentacao. Requer banco de temas e expressoes-alvo.
  </background_information>

  <references>
    <item>@CLAUDE.md</item>
    <item>@src/actions/appActions.ts</item>
    <item>@src/hooks/useContextInjection.ts</item>
    <item>@docs/teacher-ideas.md (secao 11)</item>
  </references>

  <objective>
    Criar banco de temas de debate e implementar action start_debate com expressoes-alvo por nivel.
  </objective>

  <instructions>
    <item>Crie src/actions/data/debateTopics.ts com pelo menos 15 temas adequados para pratica de idiomas. Cada tema: topic, description, expressions_for (expressoes pro-argumento), expressions_against, useful_connectors, difficulty_level.</item>
    <item>Crie action start_debate (conversational) com params: topic (string) e user_side (enum for/against).</item>
    <item>Handler retorna tema com expressoes-alvo e injeta via context injection.</item>
    <item>Ao final do debate, Sofia deve dar feedback sobre vocabulario de argumentacao usado.</item>
  </instructions>

  <constraints>
    <item>Temas devem ser leves e adequados para ensino — sem temas polemicos pesados.</item>
    <item>Foco em pratica linguistica, nao em opiniao.</item>
  </constraints>

  <acceptance_criteria>
    <item>15+ temas com expressoes-alvo por nivel.</item>
    <item>Sofia assume posicao e debate naturalmente.</item>
    <item>npm run typecheck passa.</item>
  </acceptance_criteria>

  <validation>
    <item>Execute npm run typecheck.</item>
  </validation>
</task_prompt>
```

**Resultado:** Action `start_debate` (conversational) criada em `src/actions/appActions.ts`. Banco de 15+ temas de debate em `src/actions/data/debateTopics.ts` com expressoes pro/contra, conectivos uteis e nivel de dificuldade. Handler faz busca fuzzy por topico, fallback para aleatorio, e atribui lados (student vs Sofia). Retorna expressoes-alvo para ambos os lados e instrucoes detalhadas para conduzir debate de 4-6 trocas com feedback final. Typecheck passa.

---

## Fase 4 — Meta-features

### Task 4.1: Sistema de Progresso Adaptativo — DONE

```xml
<task_prompt>
  <background_information>
    Meta-feature que agrega dados de TODAS as features anteriores. Tracking automatico do nivel do aluno baseado em performance. Depende das stores criadas na Task 1.1 e dos dados coletados por todas as actions background. O useMemory ja extrai fatos automaticamente — precisa ser complementado com dados estruturados de progresso.
  </background_information>

  <references>
    <item>@CLAUDE.md</item>
    <item>@src/actions/appActions.ts</item>
    <item>@src/hooks/useMemory.ts</item>
    <item>@src/hooks/useContextInjection.ts</item>
    <item>@src/personality/presets.ts</item>
    <item>@src/storage/idb.ts</item>
    <item>@docs/teacher-ideas.md (secao 13)</item>
  </references>

  <objective>
    Implementar 2 actions (update_student_profile + get_student_profile) e integrar perfil do aluno na injecao de contexto ao iniciar sessao.
  </objective>

  <instructions>
    <item>Crie action update_student_profile (background) com params opcionais: vocabulary_used (array), grammar_errors (number), exercise_score (0-100), topics_practiced (array). Handler faz merge de metricas no IndexedDB, calcula media movel de scores e atualiza nivel estimado.</item>
    <item>Crie action get_student_profile (conversational) sem params — retorna perfil completo com nivel, palavras conhecidas, areas de dificuldade, historico de scores.</item>
    <item>Integre perfil na injecao de contexto ao iniciar sessao com template: "Current learner level: {{level}}. Focus areas: {{focus}}. Known vocabulary: {{count}} words."</item>
    <item>Adicione regra adaptativa na personalidade: Sofia ajusta dificuldade baseado no nivel do perfil.</item>
  </instructions>

  <constraints>
    <item>Nao recalcule dados que ja estao em outras stores — agregue.</item>
    <item>A funcao de media movel deve considerar pelo menos as ultimas 10 sessoes.</item>
  </constraints>

  <acceptance_criteria>
    <item>Perfil atualizado automaticamente apos cada sessao.</item>
    <item>Nivel injetado no contexto da proxima sessao.</item>
    <item>Aluno pode perguntar "what's my level?" e receber resposta com dados reais.</item>
    <item>npm run typecheck passa.</item>
  </acceptance_criteria>

  <validation>
    <item>Execute npm run typecheck.</item>
  </validation>
</task_prompt>
```

**Resultado:** Actions `update_student_profile` (background) e `get_student_profile` (conversational) criadas em `src/actions/appActions.ts`. Handler agrega metricas no IndexedDB store student_profile: merge de vocabulario, media movel de scores (ultimas 10 sessoes), atualizacao automatica de nivel estimado. Perfil injetado no contexto ao iniciar sessao via `useMemory.ts` com template de nivel/foco. Regras adaptativas adicionadas ao preset (A1-A2/B1-B2/C1-C2). Typecheck passa.

---

### Task 4.2: Flashcards com Repeticao Espacada (SRS) — DONE

```xml
<task_prompt>
  <background_information>
    Sistema de repeticao espacada (SRS) por voz. Palavras aprendidas nas conversas viram flashcards automaticamente. Usa algoritmo SM-2 simplificado para calcular intervalos de revisao. Depende da store flashcards criada na Task 1.1.
  </background_information>

  <references>
    <item>@CLAUDE.md</item>
    <item>@src/actions/appActions.ts</item>
    <item>@src/storage/idb.ts</item>
    <item>@docs/teacher-ideas.md (secao 7)</item>
  </references>

  <objective>
    Implementar algoritmo SM-2 simplificado e 3 actions: flashcard_session, update_flashcard, add_flashcard.
  </objective>

  <instructions>
    <item>Crie src/utils/srs.ts com algoritmo SM-2 simplificado (~30 linhas): funcao calculateNextReview(correct: boolean, currentInterval: number, easeFactor: number) que retorna { nextInterval, nextEaseFactor, nextReviewDate }.</item>
    <item>Crie action flashcard_session (conversational) com params: max_cards (5-30, default 10), focus_area (enum vocabulary/phrases/idioms/all). Handler busca cards com next_review <= now do IndexedDB.</item>
    <item>Crie action update_flashcard (background) com params: word e correct (boolean). Handler usa srs.ts para recalcular intervalo.</item>
    <item>Crie action add_flashcard (background) com params: word, translation, context_sentence, difficulty. Sofia chama automaticamente ao ensinar vocabulario novo.</item>
    <item>Adicione regra na personalidade: "When teaching a new word, always call add_flashcard to save it for future review."</item>
  </instructions>

  <constraints>
    <item>srs.ts deve ser puro e sem dependencias.</item>
    <item>Intervalo minimo: 1 dia. Maximo: 365 dias.</item>
    <item>Ease factor minimo: 1.3 (SM-2 padrao).</item>
  </constraints>

  <acceptance_criteria>
    <item>srs.ts implementa SM-2 corretamente.</item>
    <item>Cards pendentes sao apresentados por voz.</item>
    <item>Intervalos aumentam com acertos, resetam com erros.</item>
    <item>Novos cards criados automaticamente durante conversas.</item>
    <item>npm run typecheck passa.</item>
  </acceptance_criteria>

  <validation>
    <item>Execute npm run typecheck.</item>
  </validation>
</task_prompt>
```

**Resultado:** `src/utils/srs.ts` criado com algoritmo SM-2 simplificado: `calculateNextReview(correct, currentInterval, easeFactor)` retorna nextInterval, nextEaseFactor e nextReviewDate. Intervalo min 1 dia, max 365 dias, ease factor min 1.3. Actions `flashcard_session` (conversational), `update_flashcard` (background) e `add_flashcard` (background) criadas em `src/actions/appActions.ts`. Handler busca cards pendentes (next_review <= now) do IndexedDB store flashcards. Sofia chama add_flashcard automaticamente ao ensinar vocabulario novo. Regras adicionadas ao preset. Typecheck passa.

---

### Task 4.3: Gamificacao — DONE

```xml
<task_prompt>
  <background_information>
    Sistema de pontos, streaks e conquistas para motivar pratica diaria. Depende da store gamification criada na Task 1.1 e dos dados de todas as features anteriores. Sofia menciona conquistas naturalmente durante a conversa.
  </background_information>

  <references>
    <item>@CLAUDE.md</item>
    <item>@src/actions/appActions.ts</item>
    <item>@src/personality/presets.ts</item>
    <item>@src/storage/idb.ts</item>
    <item>@docs/teacher-ideas.md (secao 14)</item>
  </references>

  <objective>
    Implementar 3 actions: award_points (background), check_streak (conversational), get_achievements (conversational). Definir sistema de conquistas e regras de pontuacao.
  </objective>

  <instructions>
    <item>Defina tabela de pontuacao: sessao completada (+10), quiz perfeito (+25), streak 5 dias (+50), streak 30 dias (+200), novo nivel CEFR (+100), primeiro roleplay (+15), 100 flashcards revisados (+50).</item>
    <item>Crie action award_points (background) com params: reason (string), points (number). Handler atualiza total no IndexedDB store gamification.</item>
    <item>Crie action check_streak (conversational) sem params. Handler calcula streak atual baseado em datas de sessoes no IndexedDB.</item>
    <item>Crie action get_achievements (conversational) sem params. Handler retorna badges desbloqueados e proximos marcos.</item>
    <item>Defina pelo menos 10 conquistas com nome, descricao e criterio.</item>
    <item>Adicione regra na personalidade: "Occasionally mention achievements and streaks to motivate the student. Be enthusiastic but not excessive."</item>
  </instructions>

  <constraints>
    <item>Gamificacao deve ser motivadora, nao irritante — mencionar conquistas ocasionalmente.</item>
    <item>Streak conta apenas dias com sessao de pelo menos 5 minutos.</item>
  </constraints>

  <acceptance_criteria>
    <item>Pontos acumulados corretamente por diferentes atividades.</item>
    <item>Streak calculado baseado em sessoes reais.</item>
    <item>10+ conquistas definidas com criterios claros.</item>
    <item>Sofia menciona conquistas naturalmente.</item>
    <item>npm run typecheck passa.</item>
  </acceptance_criteria>

  <validation>
    <item>Execute npm run typecheck.</item>
  </validation>
</task_prompt>
```

**Resultado:** Actions `award_points` (background), `check_streak` (conversational) e `get_achievements` (conversational) criadas em `src/actions/appActions.ts`. Tabela de pontuacao: sessao (+10), quiz perfeito (+25), primeiro roleplay (+15). Streak calculado a partir de sessoes >= 5min no IndexedDB com mensagens de milestone (3/5/7/14/30 dias). 12 conquistas definidas: First Steps, Getting Started, Dedicated Learner, Five Alive, Monthly Master, Quiz Master, Vocabulary Collector, Role Player, Debater, Level Up, Error Hunter, Century Club. Conquistas avaliadas dinamicamente a partir dos dados reais de todas as stores. Regras adicionadas ao preset para mencionar conquistas ocasionalmente. Typecheck passa.

---

## Grafo de Dependencias

```
Task 1.1 (IndexedDB Stores)
  ├── Task 1.2 (Placement Test)
  ├── Task 1.3 (Correcao Gramatical)
  │     └── Task 3.2 (Correcao Adiada) — reutiliza log_grammar_correction
  ├── Task 1.4 (Palavra do Dia) — independente
  ├── Task 2.1 (Quiz Vocabulario)
  │     └── Task 2.2 (Multipla Escolha) — reutiliza log_quiz_result
  ├── Task 2.3 (TextSimilarity + Pronuncia)
  │     └── Task 2.4 (Ditado) — reutiliza textSimilarity
  ├── Task 3.1 (Role-Play) — independente
  ├── Task 3.3 (Modo Imersao) — independente
  ├── Task 3.4 (Debate) — independente
  ├── Task 4.1 (Progresso) — depende de TODAS as anteriores
  ├── Task 4.2 (Flashcards SRS) — independente
  └── Task 4.3 (Gamificacao) — depende de TODAS as anteriores
```

## Tarefas Parallelizaveis

Dentro de cada fase, as seguintes tarefas podem rodar em paralelo:

- **Fase 1**: Task 1.2, 1.3 e 1.4 (todas dependem apenas de 1.1)
- **Fase 2**: Task 2.1 e 2.3 (independentes entre si; 2.2 depende de 2.1, 2.4 depende de 2.3)
- **Fase 3**: Task 3.1, 3.2, 3.3 e 3.4 (todas independentes entre si)
- **Fase 4**: Task 4.2 e independente; 4.1 e 4.3 dependem de dados das anteriores

## Resumo

| Task | Nome | Actions Novas | Arquivos Novos | Depende de |
|------|------|---------------|----------------|------------|
| 1.1 | IndexedDB Stores | 0 | 0 | — |
| 1.2 | Placement Test | 2 | 0 | 1.1 |
| 1.3 | Correcao Gramatical | 3 | 0 | 1.1 |
| 1.4 | Palavra do Dia | 2 | 1 (expressions.ts) | — |
| 2.1 | Quiz Vocabulario | 2 | 0 | 1.1 |
| 2.2 | Multipla Escolha | 1 | 1 (grammarQuiz.ts) | 2.1 |
| 2.3 | Pronuncia + TextSimilarity | 3 | 1 (textSimilarity.ts) | 1.1 |
| 2.4 | Ditado | 2 | 0 | 2.3 |
| 3.1 | Role-Play | 2 | 1 (scenarios.ts) | 1.1 |
| 3.2 | Correcao Adiada | 1 | 0 | 1.3 |
| 3.3 | Modo Imersao | 3 | 0 | — |
| 3.4 | Debate | 1 | 1 (debateTopics.ts) | — |
| 4.1 | Progresso Adaptativo | 2 | 0 | todos |
| 4.2 | Flashcards SRS | 3 | 1 (srs.ts) | 1.1 |
| 4.3 | Gamificacao | 3 | 0 | todos |
| **Total** | | **~30** | **6** | |
