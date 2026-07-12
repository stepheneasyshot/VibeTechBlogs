# AGENTS.md — Cursor Agent 项目指南

本文档供 Cursor Agent 快速理解 VibeTechBlogs 代码库结构与约定，后续修改请优先遵循此处说明。

## 项目概述

- **类型**：Astro 5 静态博客站点
- **品牌名**：Syntactic Clarity（npm 包名 `vibetechblogs`）
- **生产域名**：`https://stepheneasyshot.cn`
- **语言**：UI 中文；文章内容主要为中文
- **设计目标**：高定制自由度 — Astro 路由 + Tailwind token + 组件化，便于改样式与动效

## 常用命令

```bash
npm run generate:themes  # 从 src/styles/themes 生成 generated/themes.css
npm run verify:themes    # 校验每个色板 light/dark 角色齐全
npm run dev              # 开发服务器（predev 会先 generate:themes），默认 :4321
npm run build            # generate → astro build → pagefind → verify:themes → verify-transitions
npm run preview          # 预览 dist/
```

不要在未请求时执行 git commit / push。

## 目录与职责

| 路径 | 用途 |
|------|------|
| `src/content/blog/*.md` | **唯一文章源**，Content Collection |
| `src/content.config.ts` | 文章 schema（title、pubDate、category、image 等） |
| `src/data/site.ts` | 站点/作者/导航/Hero/关于页数据 — 改品牌信息首选此文件 |
| `src/data/links.ts` | 首页资源链接区块数据（友链与推荐阅读） |
| `src/utils/posts.ts` | 文章查询、slug、分类、阅读时间 |
| `src/utils/pageTransitions.ts` | View Transitions 页面类型与动画配置 |
| `src/utils/cn.ts` | `clsx` + `tailwind-merge` |
| `src/styles/themes/` | **色板契约与注册表**（`roles.ts` / `default.ts` / `index.ts`） |
| `src/styles/generated/themes.css` | 由 `generate:themes` 生成，勿手改 |
| `src/styles/global.css` | Tailwind `@theme`（非颜色 token）、MD3 elevation/shape、`.prose-blog` |
| `src/layouts/BaseLayout.astro` | HTML 壳、字体、主题 FOUC 脚本、View Transitions、Header/Footer |
| `src/layouts/PostLayout.astro` | 文章页：头图、作者、TOC 槽、代码复制脚本 |
| `src/pages/index.astro` | 首页：Hero、文章轮播、资源链接 |
| `src/pages/blog/index.astro` | 全部文章列表，客户端分页加载 |
| `src/pages/blog/[slug].astro` | 文章动态路由，`getStaticPaths` + `render()` |
| `src/pages/blog/posts.json.ts` | 预渲染 JSON，供 loadMore 客户端分页 |
| `src/pages/category/[name].astro` | 分类静态路由 |
| `src/pages/rss.xml.ts` | RSS endpoint |
| `src/scripts/categoryNav.ts` | 分类导航客户端交互 |
| `src/scripts/loadMore.ts` | 列表页「加载更多」逻辑 |
| `public/images/blog/` | 文章封面静态文件（推荐 WebP） |
| `public/fonts/` | MiSans 自托管字体 |
| `scripts/` | `generate-themes.ts`、`verify-themes.ts`、`verify-transitions.mjs` 等 |

## 内容模型

文章 frontmatter schema（`src/content.config.ts`）：

```yaml
title: string              # 必填
description: string          # 必填，列表摘要 + SEO
pubDate: date                # 必填
category: string | string[]  # 必填，内部归一化为数组；一篇文章可属多分类
featured: boolean            # 默认 false；首页轮播优先展示
draft: boolean               # 默认 false；true 则不出现在构建中
image: string?               # 可选，public 路径如 /images/blog/xxx.webp
```

- **Slug** = 文件名去掉 `.md`/`.mdx`（见 `getPostSlug()`），非 frontmatter 字段
- **URL** = `/blog/${slug}/`
- **分类 URL** = `/category/${slug}/`，特殊 slug 映射见 `getCategorySlug()`（如 `C++` → `cpp`）
- 封面：`image` → `CoverImage.astro`；缺失时显示 CSS 渐变占位

## 组件约定

- **Astro 为主**：默认零 JS；交互用 `<script>` 或 `is:inline`（CommandPalette、ThemeToggle、代码复制）
- **Pagefind**：`CommandPalette.astro` 用 `is:inline` 动态 `import('/pagefind/pagefind.js')`，构建前不存在，勿改为 Vite 静态 import
- **View Transitions**：`BaseLayout` 含 `<ClientRouter />`；通过 `pageKind` / `pageTransition` props 区分 list / post / category 过渡；文章标题用 `transition:name={`title-${slug}`}`
- **分类导航**：`CategoryNav.astro` 链到 `/category/{slug}`（`getCategoryUrl()`），服务端 `filterByCategory()`
- **新 UI 组件**：复用 `cn()` 与 design token class（`bg-surface-*`、`elevation-*`），**禁止**业务组件写死品牌 hex

## 主题架构（色板 × 明暗）

采用二维模型，便于后期多色板扩展且不易漏 token：

| 维度 | DOM | localStorage | 说明 |
|------|-----|--------------|------|
| 色板 | `html[data-theme="…"]` | `palette`（默认 `forest`） | 仅品牌色（primary / accent 等） |
| 明暗 | `html.dark` | `theme`（`light` / `dark`，默认 `light`） | 仅中性背景 / 文字 / surface，**不改色板选中与品牌色** |

**契约源**在 `src/styles/themes/`：

- `roles.ts` — `COLOR_ROLES` 全部 MD3 颜色角色（漏写会在 TS / verify 失败）
- `default.ts` — 青绿 + cyan accent（Grid 中的「青绿」）
- `palettes.ts` — 海洋/森林/樱花等；**站点基础色板为 `forest`**（`SITE_BASE_THEME_ID`）
- `index.ts` — 色板注册表；新主题只在此追加

构建时 `generate:themes` 写出 `html[data-theme="id"]` / `.dark` 的 `--color-*` 覆盖；`verify:themes` 在 `npm run build` 中强制校验。

### 新增色板

1. 用 `buildTheme()` 在 `palettes.ts`（或独立文件）定义 light/dark + surfaces
2. 在 `index.ts` 的 `themes` 数组中注册
3. 运行 `npm run generate:themes`（或 `dev`/`build` 的 pre 钩子）
4. 缺任一 `COLOR_ROLES` 键 → TypeScript / `verify:themes` 失败

色板切换：右上角调色盘——「浅色 / 深色」只切换中性底与文字；「主题色」只切换品牌色。页面背景为**叠加**：`color-mix(primary × 低透明, background)`，切色板时底色会带淡 tint。默认：森林 + 浅色。

## 设计系统速查

- **颜色**：走 `data-theme` 生成的 MD3 角色（`primary`、`tertiary-fixed-dim`、`surface-container-*`、`outline-variant` 等）；`@theme` 中的色值为 default light 回退
- **表面语言**：优先 `surface-container-*` + `elevation-1/2/3`；边框仅作 outline 分割，非默认卡片描边
- **Shape**：`rounded-sm/md/lg/xl/full`（MD3 对齐的 radius token）
- **字体 class**：`font-headline`、`font-body`、`font-label`、`font-code`
- **字体文件**：MiSans（`public/fonts/*.woff2`）、JetBrains Mono（Google Fonts）
- **间距**：`stack-sm/md/lg/xl`、`gutter`、`content-width`（720px 正文宽保留）
- **正文样式**：`.prose-blog`（含 dropcap、代码块）
- **明暗**：`html.dark`，由调色盘 + `BaseLayout` 内联脚本初始化（**默认浅色 + forest**）

Material Symbols Outlined 已通过 Google Fonts 引入，图标名见 `site.categoryIcons`。

## 添加功能时的模式

### 新文章

只需新增 `src/content/blog/xxx.md` + 可选 `public/images/blog/` 封面，**无需改路由**。

**frontmatter `description` 规则**：10–30 字（中文计字数，英文单词按 1 字计），用于列表摘要与 SEO。简练概括文章主题即可，不要罗列具体名词/工具名（标题已包含），不要写成完整句外的长串。示例：

- ✅ `拆解三种 AI 编程框架的设计哲学与工作流。`
- ✅ `Android 智能座舱车控 IVI 的架构实践与反思。`
- ❌ `从 Spec-Driven Development 到方法论即代码，拆解 GitHub Spec Kit、OpenSpec、Superpowers 三种 AI 编程框架的设计哲学与工作流。`（过长、重复标题已点名工具）

### 新页面

1. 在 `src/pages/` 添加 `.astro`
2. 使用 `BaseLayout` 包裹，按需传入 `pageKind` / `pageTransition`
3. 静态文案优先放 `src/data/`，避免散落 magic string
4. 若需搜索，给正文容器加 `data-pagefind-body`

### 新分类

frontmatter 里写新 `category`（字符串或数组元素）即可；侧栏与 `/category/` 路由自动出现。若需自定义图标，在 `site.categoryIcons` 添加映射；若分类名含特殊字符，在 `posts.ts` 的 `CATEGORY_SLUG_OVERRIDES` 添加 slug 映射。

### 改样式

1. 改颜色 → 编辑 `src/styles/themes/*.ts` 后 regenerate；改间距/字体/elevation → `global.css` `@theme`
2. 保持 MD3 表面语言：elevation + surface 层级；720px 正文宽不变
3. 动效优先 CSS transition + View Transitions；GSAP 尚未引入
4. 业务组件与 JS 字符串模板（`loadMore.ts`、`CommandPalette`、`categoryNav.ts`）勿写死品牌 hex

## 禁止 / 注意

- **不要**把文章放在根目录 `posts/`（已废弃，唯一源是 `src/content/blog/`）
- **不要**修改 `dist/`、`node_modules/`、`.astro/` 生成文件
- **不要**手改 `src/styles/generated/themes.css`（由脚本生成）
- **不要**在 dev 模式下期望 Pagefind 搜索可用
- **不要**过度抽象：单文件内联优于为小功能新建 util（主题契约除外）
- Fork 或自行部署时更新 `astro.config.mjs` 的 `site` 与 `src/data/site.ts` 的 `url`
- 用户未明确要求时，不要创建 commit、不要添加无关测试或文档

## 已知限制

- Newsletter 订阅、Privacy/Terms 为占位链接
- 文章内相对链接（如 `./other-post.md`）若目标不存在会 404
- Pagefind 对 zh-cn 无词干提取，搜索为字面匹配
- `recommendedReading` 中部分链接仍为占位 `#`
- 多色板切换：调色盘弹窗（浅色/深色默认行 + 主题色 Grid）

## 验证清单

修改后建议运行：

```bash
npm run build
```

确认：

- 无 TypeScript / Astro 构建报错
- `generate:themes` / `verify:themes` 通过
- Pagefind 索引成功生成
- `verify-transitions.mjs` 通过（检查 `data-page-kind` 与 CSS 动画 keyframes）
- 明暗切换与 `data-theme="default"` 下抽查首页、`/blog/`、分类页、文章详情页渲染正常