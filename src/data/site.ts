export const site = {
  name: 'Syntactic Clarity',
  title: 'Syntactic Clarity | 技术博客',
  description: '探索逻辑与代码的交汇 — 分布式系统、高性能架构与 AI 的深度分析。',
  url: 'https://syntactic-clarity.example.com',
  author: {
    name: 'Julian Chen',
    role: '系统架构师',
    bio: '我搭建复杂系统架构与人类可读文字之间的桥梁。在分布式系统与函数式编程领域拥有超过十年经验，创立 Syntactic Clarity 以分享工程卓越与整洁代码哲学。',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBZmtiSKh9L5EFx2tyju8jUcfx4VG-ozCiSZwQszwOB5MaWY7MPgQ8APZmK0h_7vmBS3hlceQ919DmPcLo2H9cHB7JiW_N2ZOaUKfsleyHfDSgAUQpTzbR0wY-reRL2yRKk8vbUIy1DNK65io4KUc-r2Uly_ZEh3fWZ_tjlQG_qqIl16wpMmFgNW5yQ-M_ey3dpWa3a_HRuaID3NZWzQ9FiTLv73BqETCNl9VyxDH-jR0odjKI7cr50',
    sidebarBio: '分享在构建可扩展系统与优化开发者体验方面的见解。',
  },
  hero: {
    eyebrow: '系统架构与工程哲学',
    title: '探索逻辑与代码的交汇。',
    description:
      '深入分析分布式系统、高性能前端架构，以及通过清晰表达实现人机协作的未来。',
    primaryCta: '最新文章',
    secondaryCta: '阅读宣言',
  },
  nav: [
    { href: '/', label: '博客' },
    { href: '/about', label: '关于' },
    { href: '/links', label: '链接' },
  ],
  social: {
    github: '#',
    linkedin: '#',
    twitter: '#',
  },
  skills: [
    'Rust & WebAssembly',
    '分布式系统',
    'TypeScript',
    '云基础设施',
    '技术写作',
  ],
  timeline: [
    {
      title: '首席工程师',
      period: '2021 — 至今',
      description:
        '领导金融科技独角兽的核心架构团队，将微服务扩展至每秒 10k+ 交易，同时保持 99.99% 可用性。',
      active: true,
    },
    {
      title: '高级解决方案架构师',
      period: '2017 — 2021',
      description:
        '为企业客户设计云原生迁移方案，倡导「文档即代码」，将开发者效率提升 40%。',
      active: false,
    },
    {
      title: '全栈开发者',
      period: '2013 — 2017',
      description:
        '在创意机构开启职业生涯，构建高性能 Web 应用，深入理解浏览器引擎原理。',
      active: false,
    },
  ],
  categoryIcons: {
    AI: 'neurology',
    Android: 'phone_android',
    Frontend: 'article',
    Backend: 'dns',
    'System Design': 'architecture',
    default: 'article',
  } as Record<string, string>,
};
