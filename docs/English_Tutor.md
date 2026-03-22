<task_prompt>
  <background_information>
    O produto ja exibe resumo final de branch e diff stat, mas a acao de visualizar o diff completo ainda nao funciona. Ha expectativa explicita de UX no terminal para [d] ver diff. A implementacao deve respeitar o padrao atual de telas Ink e manter a navegacao simples.
  </background_information>

  <references>
    <item>@CLAUDE.md</item>
    <item>@docs/general/file-agent-patterns.md</item>
    <item>@docs/general/ink.md</item>
    <item>@docs/general/story-breaking.md</item>
    <item>@README.md</item>
    <item>@src/app.tsx</item>
    <item>@src/screens/result-screen.tsx</item>
    <item>@src/pipeline/orchestrator.ts</item>
    <item>@src/git/git-wrapper.ts</item>
  </references>

  <objective>
    Implementar um fluxo real para visualizacao do diff final da execucao, sem quebrar a TUI. O usuario deve conseguir sair da tela de resultado, abrir o diff completo, inspecionar o patch final da branch gerada e voltar de forma previsivel ou encerrar o CLI sem estados inconsistentes.
  </objective>

  <instructions>
    <item>Analise como o diff stat e atualmente calculado e identifique a melhor origem para o diff completo.</item>
    <item>Escolha uma implementacao minima e consistente com Ink. Pode ser uma nova tela de diff, um viewer simples paginado, ou uma estrategia equivalente claramente integrada ao fluxo atual.</item>
    <item>Evite depender de comportamento externo opaco; a experiencia precisa ser previsivel dentro do CLI.</item>
    <item>Se criar nova tela ou componente, mantenha responsabilidade unica e nomes descritivos.</item>
    <item>Reutilize o branch final e o contexto de execucao existentes em vez de recalcular dados sem necessidade.</item>
    <item>Garanta que o keybinding `[d]` realmente abre algo util e que `[q]` continua funcionando.</item>
  </instructions>

  <constraints>
    <item>Nao implemente um diff fake baseado apenas no diffStat.</item>
    <item>Nao esconda o problema com logs no console.</item>
    <item>Nao altere o contrato de resultado de forma que quebre a tela final.</item>
  </constraints>

  <acceptance_criteria>
    <item>Ao final da execucao, `[d]` mostra o diff completo real da branch final.</item>
    <item>O usuario consegue voltar ou sair sem travar a TUI.</item>
    <item>O fluxo continua compativel com Ink e com o estado atual do app.</item>
    <item>`npm run typecheck` passa.</item>
  </acceptance_criteria>

  <validation>
    <item>Execute `npm run typecheck`.</item>
    <item>Rode um fluxo manual simples e valide que `[d]` exibe diff real.</item>
  </validation>
</task_prompt>