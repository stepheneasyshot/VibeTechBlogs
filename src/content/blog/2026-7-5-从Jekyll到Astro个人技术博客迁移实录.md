---
title: "从 Jekyll 到 Astro：个人技术博客的迁移实录"
description: "Jekyll 博客迁移至 Astro 5 的完整记录。"
pubDate: 2026-07-05
category: ["Web", "工程实践"]
featured: true
draft: false
image: "/images/blog/blogs_jekyll_to_astro_cover.webp"
---

# 从 Jekyll 到 Astro：个人技术博客的迁移实录

> 声明：本次迁移没有在中间状态留存截图，过程比较迅速，所以博客素材不是很多，这篇迁移介绍文章就让 **Cursor+GLM5.2** 自动写了一篇，封面图是Google的 **Nano Banana** 生成，主要标记一个节点，为了获得更高的自定义设计权限，我的博客系统迁移了。

我的个人技术博客最早托管在 [stepheneasyshot.github.io](https://stepheneasyshot.github.io/)，基于 Jekyll + Hydejack 主题，由 GitHub Action 编译后部署到 GitHub Pages。为了让国内访问也能凑合用，我会把 GitHub Action 产出的 `_site/` 中间产物手动上传到自己的国内服务器，相当于在 GitHub Pages 之外再镜像出第二个站点。

这套方案用了很久，稳定但越来越别扭：

- 主题是别人的，想动效、布局、卡片样式做深度定制，得在 Hydejack 的 SCSS 体系里"打补丁"，越改越拧巴；
- 国内访问依赖手动同步 `_site/`，没有真正意义上的"推送即生效"；
- Jekyll 的 Ruby 工具链与我现在日常的 Node/Android 栈并不亲近，每次本地预览都要重装依赖。

趁着周末，我把博客整体迁移到了 [Astro 5](https://astro.build) + Tailwind CSS 4，搭建了属于自己的设计系统 **Syntactic Clarity**，并规划了"自建 Git 仓库 + 服务器端编译 + 直接生效"的部署链路。这篇文章记录这两天的迁移历程，关键节点对应仓库里的实际 commit，方便日后回看。

## 一、为什么是 Astro

迁移前我列过几个候选：Hexo、VitePress、Next.js、Astro。

- **Hexo**：老牌、生态成熟，但模板引擎仍是传统 MVC 风格，写交互组件不如现代框架顺手；
- **VitePress**：文档站定位，做博客要"魔改"不少地方；
- **Next.js**：能力当然够，但博客静态站用 React SSR 偏重，overkill；
- **Astro**：默认零 JS、Content Collections 原生支持 Markdown、Islands 按需 hydrate、View Transitions 内置、Tailwind 4 一等公民。对"内容站 + 想要丰富动效"这个需求几乎是量身定做。

最终选择 Astro 5 + Tailwind 4 + `@tailwindcss/typography`，配合 Pagefind 做全文搜索、`@astrojs/rss` 与 `@astrojs/sitemap` 处理订阅与站点地图。

## 二、整体迁移路线

按时间线梳理，关键节点如下（commit 引用自新仓库）：

| 阶段 | 关键 commit | 说明 |
|------|------------|------|
| 1. 起骨架 | `254a412` initial commit | 搭起 Astro + Tailwind 4 + BaseLayout/PostLayout 与首批组件 |
| 2. 立规范 | `0343049` docs：配置 README 和 AGENTS 文档 | 先写 AGENTS.md，让后续 AI 协作有统一约定 |
| 3. 调样式 | `41a2f3d` / `b1a3bf1` 优化网页样式与动画 | 建立 design token、Hero、BlogCard、CoverImage |
| 4. 搬内容 | `4f7345a` 移植所有博客和图片文件 | 145 篇文章 + 封面图一次性迁入 |
| 5. 清数据 | `4d1cb69` 删除重复文章 / `0e7d3ed` 待完善文章移到 README / `67ad730` 文件重命名 | 数据清洗与命名规范化 |
| 6. 多分类 | `5731ce7` 支持多分类 | `category` 从字符串扩展为 `string \| string[]` |
| 7. 资源链接 | `ca13d8c` 加入资源链接 | 友链与推荐阅读区块 |
| 8. 生产域名 | `dc21e75` 配置生产环境域名 | `stepheneasyshot.cn` 写入 `astro.config.mjs` 与 `site.ts` |
| 9. 交互打磨 | `15ed43d` / `7561a89` / `98fc0b8` / `83339c1` 优化动效、详情页、搜索与列表刷新 | View Transitions + 加载更多 + Command Palette |
| 10. 体积优化 | `4492b45` 压缩图片 / `1427d45` 替换字体 / `bd42d8f` 图片转 WebP | 自托管 MiSans + WebP |
| 11. 收尾 | `57e9d0a` 底部链接使用实际地址 / `34b7929` 配置网站图标 & 摘要去刻板化 | 站点身份与文案打磨 |

下面挑几个值得展开的节点聊一聊。

## 三、起骨架：先约定，再写代码

`initial commit` 之外，我做的第一件事是写 `AGENTS.md` 与 `README.md`（`0343049`）。这看起来很"形式主义"，但实际收益很大：

- AGENTS.md 给 Cursor Agent 一个统一入口：目录职责、内容模型、组件约定、设计 token、禁止事项、验证清单都在一处；
- 后续 AI 协作时，Agent 不会再问"文章放哪里"、"为什么不用 Vite 静态 import Pagefind"这类问题；
- 也等于给自己定了一份"宪法"，后面所有改动都对照它来 review，避免设计漂移。

> 经验：**先写约定，再写代码**。尤其是设计系统类项目，token、命名、目录结构一旦定下来，后面所有 PR 都有依据。

骨架阶段的关键产物：

```text
src/
├── components/   Header / Footer / BlogCard / CoverImage / CategoryNav
├── layouts/      BaseLayout.astro / PostLayout.astro
├── pages/        index.astro / blog/[slug].astro / rss.xml.ts
├── styles/       global.css（@theme token）
└── utils/        posts.ts / cn.ts
```

`cn.ts` 是 `clsx + tailwind-merge` 的小封装，全局复用，避免硬编码 className 字符串拼接。

## 四、搬内容：145 篇文章一次性迁移

旧仓库的文章放在 `example/_posts/`，文件名形如 `2024-9-18-【Compose】自定义视图.md`，frontmatter 是 Jekyll 风格：

```yaml
layout: post
description: >
  本文介绍了 Jetpack Compose 里如何自定义视图
image:
  path: /assets/img/blog/blogs_compose_cover.png
  srcset: { 1920w: ..., 960w: ..., 480w: ... }
excerpt_separator: <!--more-->
sitemap: false
```

新仓库的 Content Collection schema 完全不同：

```yaml
title: string
description: string
pubDate: date
category: string | string[]
featured: boolean
draft: boolean
image: string?
```

迁移要做的转换：

1. **路径**：`example/_posts/*.md` → `src/content/blog/*.md`，图片从 `/assets/img/blog/` 迁到 `public/images/blog/`；
2. **frontmatter**：去掉 `layout`、`excerpt_separator`、`srcset` 等 Jekyll 专有字段，`description` 保留，新增 `pubDate`、`category`、`featured`；
3. **命名**：去掉文件名里的 `【分类】` 前缀（分类信息已进 frontmatter），统一为 `YYYY-M-D-标题.md`；
4. **图片**：封面路径改为 `/images/blog/xxx.png`，正文里的图片路径同步替换。

这一步对应 `4f7345a feat:移植所有博客和图片文件`，一次性把 145 篇文章和所有图片搬入。随后 `4d1cb69`、`0e7d3ed`、`67ad730` 做了重复文章清理、待完善列表外迁 README、文件重命名等数据清洗。

> 经验：**大批量数据迁移，先一次性搬完，再分批清洗**。不要边搬边改，否则容易陷入"改一篇忘了另一篇"的循环。

## 五、多分类：从"标签前缀"到真正的多分类

旧仓库把分类写死在文件名前缀里（`【Android进阶】xxx.md`），一篇文章只能有一个分类。新仓库我直接把 `category` 升级为支持数组（`5731ce7`）：

```ts
// src/content.config.ts
category: z
  .union([z.string(), z.array(z.string()).min(1)])
  .transform((value) => (typeof value === 'string' ? [value] : value)),
```

内部统一归一化为数组，`getCategories()`、`filterByCategory()`、`CategoryNav` 都基于数组遍历。一篇文章可以同时出现在 `Android` 和 `跨平台` 两个分类页，不再需要靠"前缀Hack"。

分类页本身也升级为静态路由 `/category/[name]/`，通过 `getStaticPaths` 为每个分类预渲染。对于带特殊字符的分类名（比如 `C++`），在 `posts.ts` 里维护了 `CATEGORY_SLUG_OVERRIDES`：

```ts
const CATEGORY_SLUG_OVERRIDES = {
  'C++': 'cpp',
};
```

这样 `C++` 分类页就是 `/category/cpp/`，避免 URL 里出现 `+` 这种需要 encode 的字符。

## 六、域名与部署链路：从"镜像同步"到"自托管编译"

旧链路：

```text
push → GitHub Action (Jekyll build) → GitHub Pages
                                       └─→ 我手动下载 _site/ 上传到国内服务器
```

新链路的目标：

```text
push 到自建 Git 仓库 → 服务器 webhook 触发 → 服务器端 npm run build → dist/ 直接上线
```

这次先完成了第一半：`dc21e75` 把生产域名 `https://stepheneasyshot.cn` 写入 `astro.config.mjs` 与 `src/data/site.ts`，让 sitemap、RSS、canonical 都用上正式域名。自建 Git 仓库与 webhook 部分留到下一阶段——之所以先做这一步，是因为 RSS/sitemap 里的绝对 URL 一旦定下来，后续切换部署链路就不需要再回头改内容。

为什么从"GitHub Pages + 手动镜像"换成"服务器自托管编译"？

- **国内访问速度**：GitHub Pages 在国内不稳定，手动同步 `_site/` 既不实时也容易遗漏；
- **链路可控**：在自己的服务器上跑 `npm run build`，Pagefind 索引、View Transitions 校验脚本都能在部署前最后跑一次；
- **未来扩展**：服务器自托管后，可以接入 CDN、自定义 header、做 A/B 测试，自由度远高于 GitHub Pages。

## 七、交互打磨：View Transitions 与加载更多

迁移的初衷之一就是"自定义更丰富的样式和动画"，所以这一阶段投入最多。Astro 的 View Transitions API 让"页面切换动效"这件事从 GSAP/Barba.js 那种重型方案，变成了几个 `transition:name` + CSS keyframes 的事。

我抽象了一个 `pageTransitions.ts`，把页面分成三类：

- `list`：列表页（首页、`/blog/`），淡入 + 轻微上移；
- `post`：文章详情，标题元素带 `transition:name={`title-${slug}`}`，列表卡片到详情标题之间有 morph 动画；
- `category`：分类页，左右滑入，与列表页区分。

```ts
// src/utils/pageTransitions.ts
export type PageKind = 'list' | 'post' | 'category' | 'static';
export interface PageTransition { /* ... */ }
export const listTransition: PageTransition = { /* ... */ };
```

`BaseLayout` 接受 `pageKind` 与 `pageTransition` 两个 props，把 `data-page-kind` 写到 `<html>` 上，CSS 用 `[data-page-kind="post"]` 之类的选择器匹配不同的 keyframes。

为了保证动效不被破坏，我写了一个 `scripts/verify-transitions.mjs`，在 `npm run build` 末尾扫一遍 `dist/`，检查：

- 每个页面的 `data-page-kind` 是否正确；
- 用到的 `@keyframes`（`page-fade-in`、`page-list-out`、`page-post-in`、`page-category-in` 等）是否都出现在 CSS bundle 里。

```jsonc
// package.json
"build": "astro build && pagefind --site dist && node scripts/verify-transitions.mjs"
```

最近一次 `npm run build` 输出：

```text
=== Route transition verification ===
✓ index.html → data-page-kind="list"
✓ blog/index.html → data-page-kind="list"
✓ about/index.html → data-page-kind="static"
✓ category/cpp/index.html → data-page-kind="category"
✓ blog/[slug] → data-page-kind="post"
✓ @keyframes page-fade-in / page-list-out / page-post-in / ... in CSS bundle
PASSED — 156 HTML pages scanned
```

列表页的「加载更多」则是另一段交互打磨。`/blog/` 与 `/category/[name]/` 首屏只渲染前 12 篇，剩余通过 `src/pages/blog/posts.json.ts` 预渲染的 JSON 接口，由 `src/scripts/loadMore.ts` 在客户端按需拉取并插入。这样首屏 HTML 体量可控，Pagefind 索引也能在构建期一次性建完，搜索与分页互不影响。

搜索部分用 Pagefind + Command Palette：`CommandPalette.astro` 用 `is:inline` 动态 `import('/pagefind/pagefind.js')`。这里有个坑——Pagefind 的产物在 `npm run build` 之后才存在，dev 模式下根本没有 `/pagefind/` 路径，所以**绝不能改成 Vite 静态 import**，否则 dev 服务器直接报 404。这点也写进了 AGENTS.md 的"禁止"里。

## 八、体积优化：自托管字体 + WebP

迁移后期做了一轮体积优化（`4492b45` → `1427d45` → `bd42d8f`）：

- **字体自托管**：原本打算用 Google Fonts 的 Hanken Grotesk + Source Serif 4，国内访问 Google Fonts 不稳定。换成 **MiSans**（小米开源字体）后，把 `MiSans-Regular.woff2` 与 `MiSans-Bold.woff2` 放到 `public/fonts/`，在 `global.css` 里 `@font-face` 声明，`BaseLayout` 里 `<link rel="preload">` 预加载。一次加载，全站 `font-headline` / `font-body` / `font-label` 共用，不再走外网。
- **图片压缩与 WebP 化**：旧仓库的封面都是 PNG，单张几百 KB 不罕见。`scripts/convert-images-to-webp.mjs` 批量转 WebP，正文里的 `![]()` 引用同步替换。转完后单张体积普遍下降 60% 以上。
- **图标体系**：`34b7929` 配置了多尺寸 favicon（16/32/192/512）+ apple-touch-icon + mask-icon，配合 `favicon.svg` 在不同设备上都有合适资源。

体积优化完成后，整站首次加载明显变轻，配合 View Transitions 的"页面局部持久化"，二次导航几乎无感。

## 九、AI 协作经验：AGENTS.md 是项目宪法

这次迁移大量使用了 Cursor Agent。两天的协作下来，最大的体会是：**AGENTS.md 是项目宪法**。

- 它让 Agent 知道：文章只能放 `src/content/blog/`，不能用 Vite 静态 import Pagefind，新组件必须用 `cn()` 和 design token，不能硬编码颜色……
- 它也让"我未来回看"这件事变得简单——半年后我忘了为什么 Pagefind 用 `is:inline`，AGENTS.md 第一段就写着原因。
- 维护方式：每次有新的"踩坑"或"约定"产生，第一时间回头补进 AGENTS.md。比如这次迁移完成后，我把"Pagefind zh-cn 无词干提取"、"CategoryNav 链到 `/category/{slug}` 而非 `?category=`"这些都更新进去了。

## 十、最终形态与新仓库目录

迁移完成后的目录结构（精简版）：

```text
VibeTechBlogs/
├── public/
│   ├── fonts/              MiSans 自托管字体
│   ├── favicon-*.png       多尺寸站点图标
│   └── images/blog/        文章封面（WebP）
├── scripts/                迁移与构建校验脚本
│   ├── verify-transitions.mjs
│   ├── convert-images-to-webp.mjs
│   └── assign-post-tags.mjs
├── src/
│   ├── components/         Header / CommandPalette / BlogCard / CategoryNav ...
│   ├── content/blog/       145 篇文章（唯一文章源）
│   ├── data/               site.ts / links.ts
│   ├── layouts/            BaseLayout / PostLayout
│   ├── pages/
│   │   ├── index.astro          首页：Hero + 轮播 + 资源链接
│   │   ├── blog/index.astro     全部文章（加载更多）
│   │   ├── blog/[slug].astro    文章详情
│   │   ├── blog/posts.json.ts   分页 JSON 数据源
│   │   ├── category/[name].astro 分类页
│   │   └── rss.xml.ts
│   ├── scripts/            categoryNav.ts / loadMore.ts
│   ├── styles/global.css   @theme token + .prose-blog
│   └── utils/              posts.ts / pageTransitions.ts / cn.ts
├── AGENTS.md               AI 协作约定（项目宪法）
├── README.md               项目说明 + 待完善文章列表
└── astro.config.mjs        site = https://stepheneasyshot.cn
```

构建结果：156 个 HTML 页面（145 篇文章 + 首页/列表/分类/关于/RSS 等），Pagefind 索引成功生成，View Transitions 校验通过。

## 十一、下一步：自托管 CI

迁移到 Astro 只是第一步，第二阶段是真正把"推送即生效"的部署链路搭起来：

1. 在国内服务器上建 Git 仓库（Gitea 或裸 git + webhook）；
2. 配置 webhook，收到 push 后触发构建脚本：`npm ci && npm run build`；
3. 构建产物 `dist/` 直接软链到 Nginx/Caddy 的站点根目录，刷新即生效；
4. GitHub 上的仓库作为镜像备份，不再承担编译职责。

这样国内推送 → 编译 → 上线全在自己的服务器上闭环，不依赖 GitHub Action 的可用性，也不用再手动同步 `_site/`。等这套跑顺了，再考虑接 CDN、做缓存策略、加访问统计。

## 小结

这次迁移表面上是换一个静态站生成器，实际上是把"借来的主题"换成"自己的设计系统"，把"靠 GitHub 施舍的部署"换成"自己掌控的链路"。两天内完成 145 篇文章迁移、设计系统重建、动效与交互打磨、体积优化，AI 协作 + 一份认真的 AGENTS.md 功不可没。

如果你也在维护一个老博客、想迁移到现代静态站框架，我的建议是：

1. **先写 AGENTS.md / README**，把目录、约定、token 定下来；
2. **一次性搬数据，再分批清洗**；
3. **动效与交互优先用框架原生能力**（Astro View Transitions、Tailwind），别一上来就引 GSAP；
4. **构建期校验脚本化**（`verify-transitions.mjs` 这种），让"破坏"在 build 时就暴露；
5. **字体与图片自托管 + WebP**，国内访问体验立刻拉开差距。

新博客地址：[https://stepheneasyshot.cn](https://stepheneasyshot.cn)，旧站 [stepheneasyshot.github.io](https://stepheneasyshot.github.io/) 暂时保留作为镜像，等自托管 CI 跑顺后逐步退役。

迁移相关 commit 全部在 `2026-07-04` ~ `2026-07-05` 两天内完成，可在仓库 git log 中按日期回溯完整链路。
