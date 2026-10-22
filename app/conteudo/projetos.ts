import type { Projeto } from './tipos';

// Projetos aprovados na issue 2.2 (Docs/conteudo/projetos-candidatos.md),
// escritos a partir das notas do vault. Ordem: em andamento, em produção,
// pausados e entregues. Só entram links de repositórios públicos.
export const projetos: readonly Projeto[] = [
  {
    id: 'memento',
    titulo: { pt: 'Memento', en: 'Memento' },
    papel: {
      pt: 'Autor e desenvolvedor, com agentes de IA',
      en: 'Author and developer, working with AI agents',
    },
    resumo: {
      pt: 'Servidor MCP local que indexa um vault do Obsidian e a documentação dos projetos e devolve aos agentes de IA o contexto de cada tarefa. Busca híbrida (texto e embeddings locais), notas privadas sempre recusadas e o vault em Markdown como fonte da verdade.',
      en: 'Local MCP server that indexes an Obsidian vault and project documentation and gives AI agents the context of each task. Hybrid search (full-text and local embeddings), private notes always refused, and the Markdown vault as the source of truth.',
    },
    stack: ['TypeScript', 'Node.js', 'SQLite', 'MCP', 'Ollama', 'Jest'],
    estado: 'em-andamento',
    privacidade: 'completo',
    destaque: true,
  },
  {
    id: 'morpheus',
    titulo: { pt: 'Morpheus', en: 'Morpheus' },
    papel: {
      pt: 'Autor e desenvolvedor, com agentes de IA',
      en: 'Author and developer, working with AI agents',
    },
    resumo: {
      pt: 'Interface mobile que o usuário altera por prompts. O prompt vira um comando de uma DSL, validado e aplicado como patch sobre um documento de layout, e o app desenha o resultado com um catálogo fechado de componentes. Nenhum código gerado é executado.',
      en: 'Mobile interface that users change through prompts. Each prompt becomes a DSL command, validated and applied as a patch to a layout document, and the app renders the result with a closed component catalog. No generated code is ever executed.',
    },
    stack: ['TypeScript', 'React Native', 'Expo', 'SQLite', 'Jest', 'Maestro'],
    estado: 'em-andamento',
    privacidade: 'completo',
    destaque: false,
  },
  {
    id: 'the-forge-br',
    titulo: { pt: 'The Forge BR', en: 'The Forge BR' },
    papel: {
      pt: 'Autor e desenvolvedor, com agentes de IA',
      en: 'Author and developer, working with AI agents',
    },
    resumo: {
      pt: 'Este site: uma forja mágica em que cada página é uma sala. Pré-renderizado, em português e inglês, com a marca gerada de um arquivo de tokens e verificações de orçamento de JavaScript, idioma e privacidade em cada commit.',
      en: 'This website: a magical forge where each page is a room. Prerendered, in Portuguese and English, with the brand generated from a tokens file and checks for JavaScript budget, language and privacy on every commit.',
    },
    stack: ['TypeScript', 'React', 'React Router', 'Vitest'],
    links: {
      repositorio: 'https://github.com/TheForgeBr/the-forge',
      site: 'https://the-forge-96d7.onrender.com',
    },
    estado: 'em-andamento',
    privacidade: 'completo',
    destaque: false,
  },
  {
    id: 'sakura-shop',
    titulo: { pt: 'SakuraShop', en: 'SakuraShop' },
    papel: {
      pt: 'Desenvolvedor, do projeto herdado até a publicação',
      en: 'Developer, from the inherited project to launch',
    },
    resumo: {
      pt: 'Loja virtual de uma comunidade de K-pop, em produção. Reúne catálogo, reservas, cobranças e envios, que antes ficavam no WhatsApp e em planilhas, num plugin e num tema próprios, com um painel pensado para administradoras sem conhecimento técnico.',
      en: 'Online store for a K-pop community, live in production. It brings together catalog, reservations, payments and shipping, which used to live in WhatsApp and spreadsheets, in a custom plugin and theme, with an admin panel designed for non-technical staff.',
    },
    stack: ['PHP', 'WordPress', 'WooCommerce', 'MariaDB', 'Docker'],
    estado: 'em-producao',
    privacidade: 'completo',
    destaque: true,
  },
  {
    id: 'rumo',
    titulo: { pt: 'Rumo', en: 'Rumo' },
    papel: {
      pt: 'Desenvolvedor: requisitos, testes manuais e revisão do código feito com IA',
      en: 'Developer: requirements, manual testing and review of AI-written code',
    },
    resumo: {
      pt: 'Plataforma de estudos para concursos que liga metas, sessões de estudo, revisões espaçadas, avaliações e progresso. API em NestJS, app em Expo que funciona offline e versão web em React, com testes de unidade, integração e ponta a ponta.',
      en: 'Study platform for civil service exams that connects goals, study sessions, spaced reviews, assessments and progress. NestJS API, offline-capable Expo app and React web version, with unit, integration and end-to-end tests.',
    },
    stack: [
      'TypeScript',
      'NestJS',
      'PostgreSQL',
      'Prisma',
      'React',
      'React Native',
      'Expo',
    ],
    estado: 'pausado',
    privacidade: 'completo',
    destaque: true,
  },
  {
    id: 'healthyview',
    titulo: { pt: 'HealthyView', en: 'HealthyView' },
    papel: {
      pt: 'Desenvolvedor, sem IA, ensinando programação a um amigo',
      en: 'Developer, without AI, teaching programming to a friend',
    },
    resumo: {
      pt: 'Sistema que guarda o histórico médico de um paciente, com exames, laudos e comentários de médicos, para acompanhar tratamentos ao longo dos anos. Usado para ensinar boas práticas de programação.',
      en: "System that keeps a patient's medical history, with exams, reports and doctors' comments, to follow treatments over the years. Used to teach good programming practices.",
    },
    stack: ['TypeScript', 'Supabase'],
    links: { repositorio: 'https://github.com/TheForgeBr/HealthyView' },
    estado: 'pausado',
    privacidade: 'completo',
    destaque: false,
  },
  {
    id: 'jobzin',
    titulo: { pt: 'jobzin', en: 'jobzin' },
    papel: { pt: 'Autor e desenvolvedor', en: 'Author and developer' },
    resumo: {
      pt: 'Agregador local de vagas: lê, com a conta do próprio usuário, as mensagens recentes de grupos de vagas do Telegram, extrai e normaliza os dados de cada vaga e gera uma planilha para pesquisar e se candidatar uma a uma.',
      en: 'Local job aggregator: it reads, with the user’s own account, recent messages from Telegram job groups, extracts and normalizes each posting and builds a spreadsheet to search and apply one by one.',
    },
    stack: ['TypeScript', 'Node.js', 'React', 'Vite'],
    // O link do repositório entra quando o código subir para o GitHub.
    estado: 'pausado',
    privacidade: 'completo',
    destaque: false,
  },
  {
    id: 'pawhub',
    titulo: { pt: 'PawHub', en: 'PawHub' },
    papel: {
      pt: 'Desenvolvedor full-stack, sozinho, dos requisitos ao treinamento',
      en: 'Full-stack developer, solo, from requirements to training',
    },
    resumo: {
      pt: 'Aplicação web para uma ONG de proteção animal gerenciar animais, adoções, voluntários e doadores e divulgar campanhas. Projeto de extensão na Católica de Brasília, com Scrum, validação com usuários e capacitação da equipe da ONG.',
      en: 'Web app for an animal welfare NGO to manage animals, adoptions, volunteers and donors and promote campaigns. Extension project at Católica de Brasília, with Scrum, user validation and training for the NGO team.',
    },
    stack: ['TypeScript', 'React', 'Node.js', 'Supabase', 'Material UI'],
    links: { repositorio: 'https://github.com/RhuanMr/Lar-dos-Anjos' },
    estado: 'entregue',
    privacidade: 'completo',
    destaque: false,
  },
  {
    id: 'fitloop',
    titulo: { pt: 'Fitloop', en: 'Fitloop' },
    papel: {
      pt: 'Desenvolvedor full-stack, sozinho',
      en: 'Full-stack developer, solo',
    },
    resumo: {
      pt: 'Plataforma que exibe banners de saúde e bem-estar nas telas de uma rede de academias, com painel web, app que mostra os banners e captura automática de notícias. Projeto de extensão na Católica de Brasília.',
      en: 'Platform that shows health and wellness banners on the screens of a gym chain, with a web admin panel, a display app and automatic news scraping. Extension project at Católica de Brasília.',
    },
    stack: ['TypeScript', 'Node.js', 'React', 'React Native', 'Supabase'],
    links: { repositorio: 'https://github.com/RhuanMr/FitLoop' },
    estado: 'entregue',
    privacidade: 'completo',
    destaque: false,
  },
  {
    id: 'conecta-ensina',
    titulo: { pt: 'Conecta Ensina', en: 'Conecta Ensina' },
    papel: {
      pt: 'Desenvolvedor numa equipe de 9 pessoas, no backend e no frontend',
      en: 'Developer in a team of 9, on backend and frontend',
    },
    resumo: {
      pt: 'App Android em que alunos encontram aulas particulares por disciplina e agendam com professores, online ou presencial. Feito na disciplina de Métodos de Desenvolvimento de Software da UnB, com Scrum em 17 sprints e integração contínua.',
      en: 'Android app where students find private lessons by subject and book teachers, online or in person. Built in the Software Development Methods course at UnB, with Scrum over 17 sprints and continuous integration.',
    },
    stack: ['React Native', 'Python', 'Docker'],
    links: {
      repositorio:
        'https://github.com/fga-eps-mds/2020.1-Conecta-Ensina-Mobile',
      site: 'https://fga-eps-mds.github.io/2020.1-Conecta-Ensina-Wiki/',
    },
    estado: 'entregue',
    privacidade: 'completo',
    destaque: false,
  },
];
