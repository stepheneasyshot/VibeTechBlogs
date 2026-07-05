# VibeTechBlogs

基于 [Astro](https://astro.build) 的个人技术博客，设计系统为 **Syntactic Clarity** —— 面向长文阅读的高密度信息界面，强调代码与正文的清晰呈现。

生产站点：[https://stepheneasyshot.cn](https://stepheneasyshot.cn)

## 特性

- **Markdown 驱动**：文章存放在 `src/content/blog/`，构建时静态生成
- **多分类标签**：单篇文章可归属多个分类，自动出现在对应分类页
- **中文界面**：导航、按钮、元数据等 UI 文案为中文
- **设计系统**：Tailwind CSS 4 + 自定义 design token（颜色、字体、间距）
- **全文搜索**：[Pagefind](https://pagefind.app/) 构建时索引，Command Palette 搜索入口
- **RSS 订阅**：`/rss.xml`
- **暗色模式**：localStorage 持久化，跟随系统偏好
- **页面过渡**：Astro View Transitions，list / post / category 三种过渡模式
- **文章体验**：阅读进度条、目录、代码复制、Shiki 语法高亮、KaTeX 数学公式
- **列表分页**：`/blog/` 与 `/category/` 页支持客户端「加载更多」

## 技术栈

| 模块 | 选型 |
|------|------|
| 框架 | Astro 5 |
| 样式 | Tailwind CSS 4 + `@tailwindcss/typography` |
| 内容 | Astro Content Collections |
| 搜索 | Pagefind |
| 数学公式 | `remark-math` + `rehype-katex` |
| RSS / Sitemap | `@astrojs/rss`、`@astrojs/sitemap` |

## 快速开始

```bash
# 安装依赖
npm install

# 本地开发（http://localhost:4321）
npm run dev

# 生产构建（含 Pagefind 索引 + 页面过渡校验）
npm run build

# 预览构建结果
npm run preview
```

> **注意**：全文搜索依赖 Pagefind 索引，仅在 `npm run build` 之后可用；开发模式下搜索框会提示需先构建。

## 项目结构

```
├── public/
│   ├── fonts/                 # MiSans 自托管字体
│   ├── favicon-*.png          # 多尺寸站点图标
│   └── images/blog/           # 文章封面（推荐 WebP）
├── scripts/                   # 迁移与构建校验脚本
├── src/
│   ├── components/            # UI 组件（Header、BlogCard、CommandPalette 等）
│   ├── content/blog/          # 博客文章 Markdown（唯一文章源）
│   ├── data/                  # 站点配置（site.ts、links.ts）
│   ├── layouts/               # 页面布局（BaseLayout、PostLayout）
│   ├── pages/
│   │   ├── index.astro        # 首页
│   │   ├── blog/              # 文章列表、详情、posts.json
│   │   └── category/          # 分类页
│   ├── scripts/               # 客户端交互（categoryNav、loadMore）
│   ├── styles/global.css      # 全局样式与设计 token
│   └── utils/                 # posts.ts、pageTransitions.ts、cn.ts
├── astro.config.mjs
├── src/content.config.ts      # Content Collection schema
└── package.json
```

## 页面路由

| 路径 | 说明 |
|------|------|
| `/` | 首页：Hero、最新文章轮播、资源链接 |
| `/blog/` | 全部文章列表（分页加载） |
| `/category/[name]` | 分类页，如 `/category/cpp/` |
| `/blog/[slug]` | 文章详情 |
| `/about` | 关于页 |
| `/rss.xml` | RSS Feed |

## 发布新文章

1. 在 `src/content/blog/` 新建 Markdown 文件（建议命名：`YYYY-M-D-简短标题.md`）
2. 填写 frontmatter：

```yaml
---
title: "文章标题"
description: "摘要，用于 SEO 和列表展示"
pubDate: 2026-07-01
category: "AI"                      # 单分类
# category: ["Android", "跨平台"]   # 或多分类
featured: false                     # true 时在首页轮播中优先展示
draft: false                        # true 时不参与构建与列表
image: "/images/blog/封面.webp"     # 可选，封面图路径
---

正文内容…
```

3. 封面图放入 `public/images/blog/`，`image` 字段填写以 `/` 开头的 public 路径（推荐 WebP）
4. 运行 `npm run dev` 预览，确认无误后 `npm run build`

### Slug 规则

文章 URL 由文件名决定（去掉 `.md` 后缀），例如：

- 文件 `2026-7-1-vibecoding最佳姿势.md` → `/blog/2026-7-1-vibecoding最佳姿势/`

## 站点配置

全局品牌、作者、导航、Hero 文案等集中在 [`src/data/site.ts`](src/data/site.ts)：

- 站点名称、描述、URL
- 作者信息与头像
- 导航链接
- 关于页技能标签、时间线
- 分类图标映射（Material Symbols）

首页资源链接（友链与推荐阅读）在 [`src/data/links.ts`](src/data/links.ts)。

Fork 或自行部署时，请将 `astro.config.mjs` 和 `src/data/site.ts` 中的 `site` URL 改为实际域名。

## 设计系统

视觉规范源自 **Syntactic Clarity** 设计稿：

- **字体**：MiSans（标题/正文/UI，自托管 woff2）、JetBrains Mono（代码）
- **强调色**：Cyan `#4cd7f6`（`tertiary-fixed-dim`）
- **布局**：最大宽度 1200px，正文列 720px
- **Token 定义**：[`src/styles/global.css`](src/styles/global.css) 的 `@theme` 块

## 部署

构建产物输出至 `dist/`，可部署到任意静态托管平台（Vercel、Netlify、GitHub Pages、Cloudflare Pages 等）。

```bash
npm run build
# 上传 dist/ 目录
```

## License

Private — 仅供个人使用。

## 待完善文章列表

1. 性能优化相关，持续记录，2025-1-3 附近
2. [KMP 闲谈](/blog/2025-5-31-Kotlin%20Multiplatform闲谈/) 继续学习与更新
3. [腾讯基于 KMP 实现的双鸿蒙方案介绍](/blog/2025-6-12-腾讯基于KMP实现的双鸿蒙方案介绍/)
4. Binder 继续深入：[Binder 机制通信原理简介](/blog/2022-12-30-Binder机制通信原理简介/)
5. [ijkPlayer 相关](/blog/2022-12-16-视频播放库%20ijkPlayer%20解析/)
6. Android 图片显示流程与原理总结（待撰写）
7. 实操实例 [Compose Desktop 进行 JNI 开发](/blog/2025-6-17-Compose%20Desktop进行JNI开发/)
8. Python 基础相关，2025-9-4 附近
9. Kotlin 2.2.0 通篇阅读记录
10. Android 平台 Kotlin 开发的一些知识点（初级到深入）
11. Android Window 打断动画优化记录
