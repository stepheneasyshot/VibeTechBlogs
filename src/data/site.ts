export const site = {
  name: "Stephen's Blog",
  title: "Stephen's Blog | 技术博客",
  description:
    'Android 应用层开发者的技术笔记 — 智能座舱 IVI、移动端 AI 应用与个人效率工具。',
  tagline: 'Android 应用开发与移动端 AI 的探索与实践。',
  url: 'https://stephens-blog.example.com',
  author: {
    name: 'Stephen',
    role: 'Android / AI 应用开发者',
    bio: 'Android 应用层开发者，目前聚焦移动端 AI 应用。2018—2022 年本科就读于武汉理工大学自动化学院物联网工程专业，在校期间主要做嵌入式软件开发。2022 年 6 月至 2025 年 9 月在某国企新能源厂从事智能座舱 Android 应用开发，负责车控方向的 IVI 软件。2022 年 11 月至今在头部手机厂 AI 中心做移动端 AI 软件，负责个人记忆助理类应用与 AI 效率工具研发。',
    avatar: '/images/avatar/avatar_512.png',
    sidebarBio: 'Android 应用层开发，目前在做移动端 AI 与效率工具。',
  },
  hero: {
    eyebrow: 'Android 应用层 · 智能座舱 · 移动端 AI',
    title: '以应用层视角，联接座舱系统与 AI 原生移动体验',
    description:
      '聚焦 Android 应用层与移动端 AI，曾参与智能座舱车控 IVI 系统研发，现探索 AI 原生个人记忆与效率应用。本站汇集跨车载与消费级场景的工程实践、架构洞察，以及对智能化交互演进的前瞻思考。',
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
    Android: 'phone_android',
    Frontend: 'article',
    Backend: 'dns',
    'System Design': 'architecture',
    default: 'article',
  } as Record<string, string>,
};
