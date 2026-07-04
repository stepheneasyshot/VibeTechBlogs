# AGENTS.md — Cursor Agent 项目指南

本文档供 Cursor Agent 快速理解 VibeTechBlogs 代码库结构与约定，后续修改请优先遵循此处说明。

## 项目概述

- **类型**：Astro 5 静态博客站点
- **品牌名**：Syntactic Clarity（npm 包名 `vibetechblogs`）
- **语言**：UI 中文；文章内容主要为中文
- **设计目标**：高定制自由度 — Astro 路由 + Tailwind token + 组件化，便于改样式与动效

## 常用命令

```bash
npm run dev       # 开发服务器，默认 :4321
npm run build     # astro build + pagefind 索引（搜索依赖此步骤）
npm run preview   # 预览 dist/
```

不要在未请求时执行 git commit / push。

## 目录与职责

| 路径 | 用途 |
|------|------|
| `src/content/blog/*.md` | **唯一文章源**，Content Collection |
| `src/content.config.ts` | 文章 schema（title、pubDate、category、image 等） |
| `src/data/site.ts` | 站点/作者/导航/Hero/关于页数据 — 改品牌信息首选此文件 |
| `src/data/links.ts` | 友链页静态数据 |
| `src/utils/posts.ts` | 文章查询、slug、分类、阅读时间 |
| `src/utils/cn.ts` | `clsx` + `tailwind-merge` |
| `src/styles/global.css` | Tailwind 4 `@theme` token、`.prose-blog`、暗色模式变量 |
| `src/layouts/BaseLayout.astro` | HTML 壳、字体、View Transitions、Header/Footer |
| `src/layouts/PostLayout.astro` | 文章页：头图、作者、TOC 槽、代码复制脚本 |
| `src/pages/index.astro` | 首页，分类筛选 via `?category=` query |
| `src/pages/blog/[slug].astro` | 文章动态路由，`getStaticPaths` + `render()` |
| `src/pages/rss.xml.ts` | RSS endpoint |
| `public/images/blog/` | 文章封面静态文件 |

## 内容模型

文章 frontmatter schema（`src/content.config.ts`）：

```yaml
title: string          # 必填
description: string    # 必填，列表摘要 + SEO
pubDate: date          # 必填
category: string       # 必填，首页侧栏动态聚合
featured: boolean      # 默认 false；首页大卡片，无 featured 时取最新一篇
draft: boolean         # 默认 false；true 则不出现在构建中
image: string?         # 可选，public 路径如 /images/blog/xxx.png
```

- **Slug** = 文件名去掉 `.md`/`.mdx`（见 `getPostSlug()`），非 frontmatter 字段
- **URL** = `/blog/${slug}/`
- 封面：`image` → `CoverImage.astro`；缺失时显示 CSS 渐变占位

## 组件约定

- **Astro 为主**：默认零 JS；交互用 `<script>` 或 `is:inline`（Search、ThemeToggle、代码复制）
- **Pagefind**：`Search.astro` 用 `is:inline` 动态 `import('/pagefind/pagefind.js')`，构建前不存在，勿改为 Vite 静态 import
- **View Transitions**：`BaseLayout` 含 `<ClientRouter />`；文章标题用 `transition:name={`title-${slug}`}`
- **分类导航**：`CategoryNav.astro` 链到 `/?category=Name`，服务端 `filterByCategory()`
- **新 UI 组件**：复用 `cn()` 与 `global.css` 中的 design token，勿硬编码颜色

## 设计系统速查

Token 在 `src/styles/global.css` `@theme`：

- 颜色：`primary`、`tertiary-fixed-dim`（cyan accent）、`surface-*`、`outline-variant`
- 字体 class：`font-headline`、`font-body`、`font-label`、`font-code`
- 间距：`stack-sm/md/lg/xl`、`gutter`、`content-width`
- 正文样式：`.prose-blog`（含 dropcap、暗色代码块）
- 暗色模式：`html.dark`，由 `ThemeToggle` + inline 脚本初始化

Material Symbols Outlined 已通过 Google Fonts 引入，图标名见 `site.categoryIcons`。

## 添加功能时的模式

### 新文章

只需新增 `src/content/blog/xxx.md` + 可选 `public/images/blog/` 封面，**无需改路由**。

### 新页面

1. 在 `src/pages/` 添加 `.astro`
2. 使用 `BaseLayout` 包裹
3. 静态文案优先放 `src/data/`，避免散落 magic string
4. 若需搜索，给正文容器加 `data-pagefind-body`

### 新分类

frontmatter 里写新 `category` 即可；侧栏自动出现。若需自定义图标，在 `site.categoryIcons` 添加映射。

### 改样式

1. 优先改 `global.css` `@theme` 或 Tailwind class
2. 保持与 Syntactic Clarity 极简风格：1px 边框、低阴影、720px 正文宽
3. 动效优先 CSS transition + View Transitions；GSAP 尚未引入

## 禁止 / 注意

- **不要**把文章放在根目录 `posts/`（已废弃，唯一源是 `src/content/blog/`）
- **不要**修改 `dist/`、`node_modules/`、`.astro/` 生成文件
- **不要**在 dev 模式下期望 Pagefind 搜索可用
- **不要**过度抽象：单文件内联优于为小功能新建 util
- 部署前更新 `astro.config.mjs` 的 `site` 与 `src/data/site.ts` 的 `url`
- 用户未明确要求时，不要创建 commit、不要添加无关测试或文档

## 已知限制（v1）

- Newsletter 订阅、Privacy/Terms 为占位链接
- 文章内相对链接（如 `./other-post.md`）若目标不存在会 404
- Pagefind 对 zh-cn 无词干提取，搜索为字面匹配
- Geist 字体 fallback 到 system-ui（非 Google Fonts）

## 验证清单

修改后建议运行：

```bash
npm run build
```

确认：6 个 HTML 页面 + RSS、3 篇文章路由、Pagefind 索引 3 pages、无 TypeScript/Astro 报错。
