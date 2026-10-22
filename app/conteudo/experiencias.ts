import type { Experiencia } from './tipos';

// Linha do tempo de 2021 até hoje (issue 2.4), das notas de empresas do vault
// e do currículo, em ordem cronológica reversa. Datas e textos que divergem
// entre as fontes estão em Docs/conteudo/divergencias.md para o usuário decidir.
// SETA-AI: só papel e stack (CLAUDE.md).
export const experiencias: readonly Experiencia[] = [
  {
    id: 'seta-ai',
    empresa: 'SETA-AI',
    papel: { pt: 'Desenvolvedor', en: 'Developer' },
    stack: [
      'TypeScript',
      'Fastify',
      'Zod',
      'Drizzle',
      'PostgreSQL',
      'pgvector',
      'Next.js',
      'React',
      'LangGraph.js',
      'Vitest',
    ],
    periodo: { inicio: '2026-09', fim: 'atual' },
    privacidade: 'papel-e-stack',
    destaque: true,
  },
  {
    id: 'nava',
    empresa: 'NAVA Technology for Business',
    papel: {
      pt: 'Desenvolvedor React sênior, em consultoria para o Banco BMG',
      en: 'Senior React developer, consulting for Banco BMG',
    },
    resumo: {
      pt: 'Plataforma web interna de crédito consignado, num código de alta complexidade, trabalhando em squads.',
      en: 'Internal payroll-loan web platform, in a highly complex codebase, working in squads.',
    },
    entregas: {
      pt: [
        'Evolução e sustentação com React, Material UI, Atomic Design e arquitetura hexagonal, integradas a GraphQL e a um BFF em NestJS.',
        'Correção de bugs e incidentes e a troca do envio de arquivos de base64 para multipart.',
        'Trabalho com design, produto e backend, usando Figma e Jira.',
      ],
      en: [
        'Evolved and maintained the platform with React, Material UI, Atomic Design and hexagonal architecture, integrated with GraphQL and a NestJS BFF.',
        'Fixed bugs and incidents and switched file uploads from base64 to multipart.',
        'Worked with design, product and backend teams, using Figma and Jira.',
      ],
    },
    stack: ['React', 'Material UI', 'GraphQL', 'NestJS', 'Jest'],
    periodo: { inicio: '2026-05', fim: '2026-09' },
    privacidade: 'completo',
    destaque: true,
  },
  {
    id: 'natural-fluency',
    empresa: 'Natural Fluency',
    papel: {
      pt: 'Desenvolvedor mobile e web, responsável pelo produto inteiro',
      en: 'Mobile and web developer, in charge of the whole product',
    },
    resumo: {
      pt: 'Plataforma de ensino de 13 idiomas com uma IA conversacional que atua como professor.',
      en: 'Platform for learning 13 languages with a conversational AI that acts as a teacher.',
    },
    entregas: {
      pt: [
        'Entrei no mobile e, quando a equipe foi reduzida, assumi backend, frontend, mobile, deploy e publicação.',
        'App em React Native com Expo, publicado na Google Play e na App Store com EAS Build e Submit.',
        'Funcionalidades com IA integrando ChatGPT e Azure AI Speech, com Firebase Crashlytics e Cloud Messaging.',
      ],
      en: [
        'Joined on mobile and, when the team was reduced, took over backend, frontend, mobile, deployment and releases.',
        'React Native app with Expo, published on Google Play and the App Store with EAS Build and Submit.',
        'AI features integrating ChatGPT and Azure AI Speech, with Firebase Crashlytics and Cloud Messaging.',
      ],
    },
    stack: ['React Native', 'Expo', 'TypeScript', 'React', 'Vite', 'Python'],
    periodo: { inicio: '2024-12', fim: '2026-04' },
    privacidade: 'completo',
    destaque: true,
  },
  {
    id: 'freelancer-web',
    empresa: 'Freelancer',
    papel: { pt: 'Desenvolvedor web', en: 'Web developer' },
    resumo: {
      pt: 'Aplicações e sites sob demanda para clientes diferentes, do levantamento de requisitos ao deploy.',
      en: 'On-demand web apps and sites for different clients, from requirements to deployment.',
    },
    entregas: {
      pt: [
        'Aplicações em React e Next.js com Firebase (Cloud Functions e Realtime Database).',
        'Sites para clientes como a SIG BR e um artista de NFTs, com deploy em Netlify, Firebase Hosting e HostGator.',
        'Levantamento de requisitos e relacionamento direto com os clientes.',
      ],
      en: [
        'React and Next.js apps with Firebase (Cloud Functions and Realtime Database).',
        'Websites for clients such as SIG BR and an NFT artist, deployed on Netlify, Firebase Hosting and HostGator.',
        'Requirements gathering and direct relationship with clients.',
      ],
    },
    stack: ['React', 'Next.js', 'JavaScript', 'Firebase', 'WordPress'],
    periodo: { inicio: '2022-05', fim: '2023-02' },
    privacidade: 'completo',
    destaque: false,
  },
  {
    id: 'medipreco',
    empresa: 'MediPreço',
    papel: { pt: 'Desenvolvedor mobile júnior', en: 'Junior mobile developer' },
    resumo: {
      pt: 'Apps de venda e entrega de remédios, em produção.',
      en: 'Apps for selling and delivering medicine, in production.',
    },
    entregas: {
      pt: [
        'Desenvolvimento e manutenção dos apps MediPreço Usuário e Entregador em React Native.',
        'Transição de código legado para uma arquitetura mais organizada, com refatorações e correção de bugs críticos.',
      ],
      en: [
        'Built and maintained the MediPreço Customer and Courier apps in React Native.',
        'Moved legacy code to a cleaner architecture, with refactoring and critical bug fixes.',
      ],
    },
    stack: ['React Native', 'Node.js'],
    periodo: { inicio: '2022-05', fim: '2022-09' },
    privacidade: 'completo',
    destaque: false,
  },
  {
    id: 'cit',
    empresa: 'CIT',
    papel: {
      pt: 'Desenvolvedor mobile pleno',
      en: 'Mid-level mobile developer',
    },
    resumo: {
      pt: 'Fábrica de software com produtos para clientes corporativos.',
      en: 'Software house building products for corporate clients.',
    },
    entregas: {
      pt: [
        'Apps em React Native e portais web, com destaque para um banco digital para funcionários.',
        'Participação na definição de UI e UX, em vários projetos ao mesmo tempo.',
      ],
      en: [
        'React Native apps and web portals, most notably a digital bank for employees.',
        'Took part in UI and UX decisions, across several projects at once.',
      ],
    },
    stack: ['React Native', 'WordPress', 'PHP', 'SCSS'],
    periodo: { inicio: '2021-11', fim: '2022-04' },
    privacidade: 'completo',
    destaque: false,
  },
  {
    id: 'contele',
    empresa: 'Contele Soluções Tecnológicas',
    papel: { pt: 'Desenvolvedor mobile', en: 'Mobile developer' },
    resumo: {
      pt: 'Quatro produtos de rastreamento e gestão de equipes, em time remoto.',
      en: 'Four tracking and team management products, in a remote team.',
    },
    entregas: {
      pt: [
        'Novas funcionalidades e correções em React Native nos quatro produtos.',
        'Trabalho remoto com times distribuídos, em código legado bem estruturado.',
      ],
      en: [
        'New features and fixes in React Native across the four products.',
        'Remote work with distributed teams, in a well-structured legacy codebase.',
      ],
    },
    stack: ['React Native'],
    periodo: { inicio: '2021-10', fim: '2021-11' },
    privacidade: 'completo',
    destaque: false,
  },
  {
    id: 'pap',
    empresa: 'Ponto a Ponto (PaP)',
    papel: {
      pt: 'Tester e desenvolvedor mobile júnior',
      en: 'Tester and junior mobile developer',
    },
    resumo: {
      pt: 'App de mobilidade com várias categorias (carro, moto, táxi, ônibus, guincho e lancha). Primeiro emprego.',
      en: 'Ride-hailing app with several categories (car, motorcycle, taxi, bus, tow truck and boat). First job.',
    },
    entregas: {
      pt: [
        'Criei os testes automatizados da empresa em Java com Selenium, Appium e Maven, com relatório de execução.',
        'Testes unitários e de componentes com Jest e React Testing Library.',
        'Desenvolvimento em React Native nos apps PaP e PaP Motorista e no portal administrador em React.',
      ],
      en: [
        "Built the company's automated tests in Java with Selenium, Appium and Maven, with execution reports.",
        'Unit and component tests with Jest and React Testing Library.',
        'React Native development on the PaP and PaP Driver apps and on the React admin portal.',
      ],
    },
    stack: ['React Native', 'React', 'Java', 'Selenium', 'Appium', 'Jest'],
    periodo: { inicio: '2021-04', fim: '2021-09' },
    privacidade: 'completo',
    destaque: false,
  },
];
