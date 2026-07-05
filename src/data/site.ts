export const site = {
  name: "Stephen's Blog",
  title: "Stephen's Blog | 技术博客",
  description:
    'Android 应用层开发者的技术笔记 — 智能座舱 IVI、移动端 AI 应用与个人效率工具。',
  tagline: 'Android 应用开发与移动端 AI 的探索与实践。',
  url: 'https://stepheneasyshot.cn',
  author: {
    name: 'Stephen',
    role: 'Android / AI 应用开发者',
    bio: '我相信扎实的技术理解，是应对变化最可靠的底气。无论框架如何迭代、工具如何智能化，对系统设计、工程边界与代码质量的尊重，都不应被 shortcuts 替代——理解「为什么这样写」，永远比复制「能跑就行」更重要。\n\nAI 时代于我，不是被动等待被替代，而是主动重新定义自己的位置：把重复劳动交给模型，把判断力留给架构、体验与可靠性；让 Agent 成为协作伙伴，而非绕过思考的捷径。从车载 IVI 到移动端 AI 应用，我在做的，是把能力沉淀为可交付的产品，并在快速演进中保持学习的节奏。',
    avatar: '/images/avatar/avatar_512.png',
    sidebarBio: 'Android 应用层开发，目前在做移动端 AI 与效率工具。',
  },
  hero: {
    eyebrow: 'Android 应用层 · 智能座舱 · 移动端 AI',
    title: '以应用层视角，联接 Agent 系统与 AI 原生移动体验',
    description:
      '聚焦 Android 应用层与移动端 AI，曾参与智能座舱车控 IVI 系统研发，现探索 AI 原生个人记忆与效率应用。本站汇集跨车载与消费级场景的工程实践、架构洞察，以及对智能化交互演进的前瞻思考。',
  },
  nav: [
    { href: '/', label: '首页' },
    { href: '/blog', label: '博客' },
    { href: '/about', label: '关于' },
  ],
  social: {
    github: 'https://github.com/stepheneasyshot',
    linkedin: '#',
    juejin: 'https://juejin.cn/user/1227473764497976',
  },
  skills: [
    'Android / Kotlin',
    '智能座舱 IVI',
    '移动端 AI 应用',
    'AI 效率工具',
    '嵌入式开发',
  ],
  timeline: [
    {
      title: '移动端 AI 软件工程师',
      period: '2025.11 — 至今',
      description:
        '头部手机厂 AI 中心，负责个人记忆助理类应用与 AI 效率工具研发。',
      active: true,
    },
    {
      title: '智能座舱 Android 开发',
      period: '2022.6 — 2025.9',
      description:
        '某国企新能源厂，从事智能座舱 Android 应用开发，负责车控方向的 IVI 软件。',
      active: false,
    },
    {
      title: '本科 · 物联网工程',
      period: '2018 — 2022',
      description:
        '武汉理工大学自动化学院，在校期间主做嵌入式软件开发。',
      active: false,
    },
  ],
  categoryIcons: {
    AI: 'neurology',
    Android: 'android',
    跨平台: 'devices',
    网络: 'lan',
    通用开发: 'terminal',
    算法: 'functions',
    'C++': 'developer_board',
    Python: 'code_blocks',
    Frontend: 'web',
    Backend: 'dns',
    'System Design': 'architecture',
    default: 'article',
  } as Record<string, string>,
};
