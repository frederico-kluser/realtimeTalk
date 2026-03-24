import type { Translations } from './en';

export const pt: Translations = {
  // Common
  save: 'Salvar',
  cancel: 'Cancelar',
  delete: 'Excluir',
  back: 'Voltar',
  close: 'Fechar',
  loading: 'Carregando...',
  export: 'Exportar',
  import: 'Importar',
  language: 'Idioma',

  // Conversation Page
  voiceAi: 'Voice AI',
  settings: 'Configurações',
  history: 'Histórico',
  startConversation: 'Iniciar Conversa',
  endSession: 'Encerrar Sessão',
  connecting: 'Conectando...',
  pausedMessage: 'Pausado — IA e microfone estão em espera',
  resumeConversation: 'Retomar conversa',
  pauseConversation: 'Pausar conversa',
  emptyTranscript: 'Comece a falar para iniciar uma conversa...',
  actions: 'Ações',
  you: 'Você',
  ai: 'IA',

  // Status
  statusIdle: 'Inativo',
  statusConnecting: 'Conectando...',
  statusConnected: 'Conectado',
  statusListening: 'Ouvindo...',
  statusThinking: 'Pensando...',
  statusSpeaking: 'Falando...',
  statusError: 'Erro',
  statusDisconnected: 'Desconectado',

  // Settings Page
  settingsTitle: 'Configurações',
  apiKeyByok: 'Chave API (BYOK)',
  apiKeyDescription: 'Sua chave API é armazenada apenas na memória. Opcionalmente, criptografe e persista com uma senha.',
  saveToMemory: 'Salvar na Memória',
  encryptionPassphrase: 'Senha de criptografia',
  encryptAndSave: 'Criptografar e Salvar',
  loadSavedKey: 'Carregar Chave Salva',
  clearAllKeyData: 'Limpar Todos os Dados da Chave',
  about: 'Sobre',
  aboutDescription: 'Voice AI App usa WebRTC para conectar diretamente à API Realtime da OpenAI. Sem backend, sem dados armazenados em servidores. Sua chave API nunca sai do seu navegador.',
  aboutEncryption: 'A criptografia usa AES-256-GCM com derivação de chave PBKDF2 (100K iterações).',
  apiKeySaved: 'Chave API salva na memória.',
  enterPassphrase: 'Por favor, insira uma senha.',
  apiKeyEncrypted: 'Chave API criptografada e salva no localStorage.',
  enterYourPassphrase: 'Por favor, insira sua senha.',
  apiKeyLoaded: 'Chave API carregada do armazenamento criptografado.',
  decryptFailed: 'Falha ao descriptografar. Senha incorreta ou nenhuma chave salva.',
  apiKeyCleared: 'Chave API removida da memória e do armazenamento.',

  // Conversation Settings
  apiKey: 'Chave API',
  model: 'Modelo',
  voice: 'Voz',
  vad: 'VAD',
  personality: 'Personalidade',
  newPersonality: '+ Nova Personalidade',
  helpModel: 'Escolha o modelo de IA para conversação por voz.\n\n• GPT Realtime — Modelo completo, mais capaz\n• GPT Realtime Mini — Mais rápido, menor custo\n• GPT Realtime 1.5 — Última geração',
  helpVoice: 'Selecione a voz da IA. Cada voz tem um tom e caráter distintos. Experimente diferentes vozes para encontrar a que melhor se adapta à sua personalidade.',
  helpVad: 'A Detecção de Atividade de Voz (VAD) controla a agressividade com que a IA detecta que você parou de falar.\n\n• Baixo — Espera mais antes de responder (bom para conversas reflexivas)\n• Médio — Timing equilibrado\n• Alto — Responde rapidamente (bom para perguntas e respostas rápidas)\n• Auto — Deixa o modelo decidir',
  helpPersonality: 'Escolha um perfil de personalidade que define como a IA se comporta, fala e responde. Você pode criar personalidades customizadas com contexto de arquivos no editor.',
  vadAuto: 'Auto',
  vadLow: 'Baixo',
  vadMedium: 'Médio',
  vadHigh: 'Alto',

  // History Page
  sessionHistory: 'Histórico de Sessões',
  noSessions: 'Nenhuma sessão ainda. Inicie uma conversa!',
  deleteSession: 'Excluir sessão',
  messages: 'mensagens',

  // Personality Editor
  personalityEditor: 'Editor de Personalidade',
  basicInfo: 'Informações Básicas',
  personalityName: 'Nome da personalidade',
  basicInfoDescription: 'Dê à sua personalidade um nome memorável que reflita seu caráter e propósito.',
  identity: 'Identidade',
  identityDescription: 'Defina quem é o personagem da IA. Isso molda como ele se apresenta e interage com os usuários.',
  characterName: 'Nome do personagem',
  rolePlaceholder: "Função (ex: 'Especialista em Suporte Técnico')",
  backstory: 'História de Fundo',
  backstoryPlaceholder: 'Escreva uma breve história que dê contexto a esta personalidade...',
  addExpertise: 'Adicionar especialidade (Enter)',
  voiceSection: 'Voz e Estilo',
  voiceDescription: 'Configure como a IA soa e se comunica. O modelo de voz afeta a voz real, enquanto o tom e a verbosidade moldam o estilo de fala.',
  tonePlaceholder: "Tom (ex: 'amigável, claro, empático')",
  verbosityConcise: 'Conciso',
  verbosityModerate: 'Moderado',
  verbosityDetailed: 'Detalhado',
  rules: 'Regras e Limites',
  rulesDescription: 'Defina diretrizes claras do que a IA deve sempre ou nunca fazer. Isso garante um comportamento consistente.',
  scopePlaceholder: 'Defina o escopo e propósito deste assistente...',
  alwaysDoPlaceholder: 'Sempre fazer... (Enter)',
  neverDoPlaceholder: 'Nunca fazer... (Enter)',
  fileContext: 'Contexto de Arquivos',
  fileContextDescription: 'Anexe arquivos legíveis (txt, md, json, csv, código, etc.) como contexto de referência para esta personalidade. Máximo de 500KB por arquivo.',
  attachFiles: '+ Anexar Arquivos',
  deflectionResponses: 'Respostas de Deflexão',
  deflectionDescription: 'Defina como a IA responde quando perguntada sobre tópicos fora do seu escopo, quando desafiada sobre sua identidade, ou quando não sabe a resposta.',
  outOfScopePlaceholder: 'Resposta fora do escopo',
  jailbreakPlaceholder: 'Resposta a desafio de identidade',
  unknownPlaceholder: 'Resposta para resposta desconhecida',
  fileNotReadable: 'O arquivo "{name}" não é um arquivo de texto legível.',
  fileTooBig: 'O arquivo "{name}" excede o limite de 500KB.',

  // FAQ
  faq: 'FAQ',
  faqTitle: 'Perguntas Frequentes',
  faqItems: [
    {
      question: 'O que é o RealtimeTalk?',
      answer: 'RealtimeTalk é uma aplicação web 100% client-side que permite conversas por voz em tempo real com modelos de IA da OpenAI. Conecta diretamente do seu navegador via WebRTC — sem backend, sem banco de dados remoto, sem autenticação no servidor.',
    },
    {
      question: 'Minha chave API está segura?',
      answer: 'Sim. Sua chave API nunca sai do seu navegador. Ela é armazenada apenas na memória durante a sessão. Você pode opcionalmente criptografá-la com AES-256-GCM usando uma senha e armazená-la localmente. Nenhum dado é enviado para qualquer servidor além da OpenAI.',
    },
    {
      question: 'O que significa BYOK?',
      answer: 'BYOK significa "Bring Your Own Key" (Traga Sua Própria Chave). Você precisa da sua própria chave API da OpenAI com acesso à API Realtime para usar esta aplicação. Isso significa que você paga a OpenAI diretamente pelo uso — não há custos intermediários.',
    },
    {
      question: 'Quais navegadores são suportados?',
      answer: 'Qualquer navegador moderno com suporte a WebRTC e getUserMedia: Chrome, Edge, Firefox e Safari 15+. HTTPS é necessário em produção para acesso ao microfone e à API Web Crypto.',
    },
    {
      question: 'Posso usar isso offline?',
      answer: 'O app em si funciona como PWA e pode ser instalado no seu dispositivo. No entanto, as conversas por voz requerem uma conexão com a internet para se comunicar com a API Realtime da OpenAI.',
    },
    {
      question: 'Como funciona a estimativa de custo?',
      answer: 'O custo é estimado por sessão com base nos tokens de texto e áudio de entrada/saída. O cálculo usa os preços publicados pela OpenAI para cada modelo. Nota: são estimativas e podem diferir ligeiramente da sua fatura real da OpenAI.',
    },
    {
      question: 'Posso criar personalidades de IA customizadas?',
      answer: 'Sim! Use o Editor de Personalidade para criar personalidades customizadas com identidade, configurações de voz, regras, contextos de arquivos e respostas de deflexão. Você também pode anexar arquivos de referência para dar à IA contexto adicional.',
    },
    {
      question: 'Meus dados de conversa são armazenados em algum lugar?',
      answer: 'Todos os dados são armazenados localmente no seu navegador usando IndexedDB e localStorage. O áudio nunca é gravado — apenas as transcrições de texto são salvas. Você pode exportar/importar seus dados como JSON para backup.',
    },
  ],

  // Context Modal
  contextModalTitle: 'Contexto da Conversa',
  contextModalDescription: 'Forneça um contexto opcional para esta conversa. Isso ajuda a IA a entender a situação e responder com mais precisão.',
  contextModalPlaceholder: 'Ex.: "Preciso de ajuda para debugar um componente React" ou "Vamos praticar conversação em francês sobre viagens"...',
  contextModalStart: 'Iniciar Conversa',
  contextModalSkip: 'Pular',

  // Resume conversation
  resumeSession: 'Continuar',
  resumeSessionTooltip: 'Continuar esta conversa',

  // Edit personality
  editPersonality: 'Editar',

  // Settings descriptions
  settingsSecurityTitle: 'Segurança e Privacidade',
  settingsSecurityDescription: 'Sua chave API é armazenada apenas na memória do navegador durante a sessão ativa. Ela nunca é enviada para nenhum servidor além da OpenAI. Para armazenamento persistente, você pode criptografá-la com AES-256-GCM usando uma senha de sua escolha. A criptografia usa derivação de chave PBKDF2 com 100.000 iterações, um salt aleatório de 16 bytes e um IV aleatório de 12 bytes — tornando-a extremamente resistente a ataques de força bruta.',
  settingsHowItWorks: 'Como Funciona',
  settingsHowItWorksDescription: 'O RealtimeTalk conecta seu navegador diretamente à API Realtime da OpenAI via WebRTC. Não há backend, proxy ou servidor intermediário. O áudio do seu microfone é transmitido diretamente para a OpenAI, e a resposta de voz da IA é reproduzida em tempo real. Todos os dados de sessão (transcrições, memórias, personalidades) são armazenados localmente no seu navegador usando IndexedDB e localStorage.',
  settingsDataOwnership: 'Propriedade dos Dados',
  settingsDataOwnershipDescription: 'Você é dono de 100% dos seus dados. Nada é armazenado em servidores externos. Você pode exportar todos os seus dados (sessões, memórias, personalidades) como um arquivo JSON a qualquer momento pela página de Histórico, e importá-los de volta para restaurar seus dados em qualquer dispositivo.',

  // Language selector
  languageEnglish: 'English',
  languagePortuguese: 'Português',

  // Teacher Page
  teacherWelcome: 'Olá! Sou a Sofia, sua tutora de inglês',
  teacherWelcomeDesc: 'Pratique inglês através de conversas por voz em tempo real. Vou me adaptar ao seu nível e ajudá-lo a melhorar passo a passo.',
  teacherChooseActivity: 'O que você gostaria de praticar?',
  teacherYourLevel: 'Seu nível',
  teacherDayStreak: 'dias seguidos',
  teacherActivities: 'Atividades',
  teacherSelectAnswer: 'Toque sua resposta:',
  teacherRepeatPhrase: 'Repita esta frase:',
  teacherSpeakNow: 'Fale agora no microfone...',
  teacherDictationActive: 'Ditado em andamento',
  teacherListening: 'Ouvindo...',
  teacherSkipTutorial: 'Pular',
  teacherNext: 'Próximo',
  teacherGetStarted: 'Começar',

  // Teacher Actions
  teacherAction_free: 'Conversa Livre',
  teacherAction_quiz: 'Quiz de Vocabulário',
  teacherAction_roleplay: 'Simulação',
  teacherAction_pronunciation: 'Pronúncia',
  teacherAction_dictation: 'Ditado',
  teacherAction_flashcards: 'Flashcards',
  teacherAction_debate: 'Debate',

  // Teacher Speech Detection
  teacherSpeechDetection: 'Detecção de Fala',
  teacherSpeechDetectionDesc: 'Controla a sensibilidade com que a IA detecta sua fala. Sensibilidade mais baixa reduz interrupções falsas quando você está em silêncio.',
  teacherExerciseModeActive: 'Modo exercício — interrupção da IA desativada para evitar falsos positivos',

  // Teacher Quick Action Commands
  teacherQuiz: 'Começar um quiz de vocabulário',
  teacherRoleplay: 'Vamos fazer uma simulação',
  teacherPronunciation: 'Quero praticar pronúncia',
  teacherDictation: 'Vamos fazer um exercício de ditado',
  teacherFlashcards: 'Vamos revisar meus flashcards',
  teacherDebate: 'Vamos ter um debate',

  // Tutorial Steps
  tutorialStep1Title: 'Bem-vindo à Sofia English Tutor!',
  tutorialStep1Desc: 'Sofia é sua tutora de inglês com IA. Ela vai ajudá-lo a praticar fala, melhorar gramática, expandir vocabulário e construir confiança — tudo através de conversas naturais por voz.',
  tutorialStep2Title: 'Configure sua Chave API',
  tutorialStep2Desc: 'Clique no ícone de configurações (engrenagem) para inserir sua chave API da OpenAI. Sua chave fica no navegador e nunca é enviada para nenhum servidor além da OpenAI.',
  tutorialStep3Title: 'Escolha uma Atividade',
  tutorialStep3Desc: 'Inicie uma conversa livre ou escolha uma atividade específica: quizzes de vocabulário, simulações, exercícios de pronúncia, ditado, flashcards ou debates.',
  tutorialStep4Title: 'Desafios Interativos',
  tutorialStep4Desc: 'Durante os quizzes, botões de resposta aparecerão na tela. Você pode tocá-los ou responder por voz — o que for mais natural!',
  tutorialStep5Title: 'Acompanhe seu Progresso',
  tutorialStep5Desc: 'Sofia lembra seu nível, acompanha sua sequência de dias e dá pontos. Seu progresso é salvo automaticamente entre sessões. Vamos começar a aprender!',
};
