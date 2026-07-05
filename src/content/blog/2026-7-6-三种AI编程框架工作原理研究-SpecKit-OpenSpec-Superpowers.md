---
title: "三种 AI 编程框架工作原理研究：Spec Kit / OpenSpec / Superpowers"
description: "拆解三种 AI 编程框架的设计哲学与工作流。"
pubDate: 2026-07-06
category: ["AI", "工程实践"]
featured: false
draft: false
image: "/images/blog/blogs_ai_coding_frameworks.webp"
---

# 三种 AI 编程框架工作原理研究：Spec Kit / OpenSpec / Superpowers

> 这是一篇研究性笔记。过去一年里，"用 AI 写代码"已经从聊天框里的 prompt 拼凑，演化出了若干个有完整工作流的"框架"。本文拆解其中三个最具代表性的开源项目——GitHub Spec Kit、Fission-AI OpenSpec、obra Superpowers——它们各自的核心理念、命令流水线、产物结构，以及适合什么样的项目。三者都把"先想清楚再写代码"作为出发点，但实现路径截然不同。

## 一、为什么需要"AI 编程框架"

把 Cursor、Claude Code、Copilot 这类工具用上半年，几乎所有人都会撞到同一面墙：

- **上下文漂移**：会话一长，AI 忘了三小时前自己定的接口约定；
- **需求蒸发**：你昨天写的"用户登录要带 Remember Me"今天在重构里被悄悄删掉，没人发现；
- **不可复现**：同样的需求让 AI 写两次，两次架构完全不一样，下次新成员加入还得从头解释；
- **质量盲盒**：写完能跑 ≠ 写得对，尤其在没有测试的项目里，AI 改一行能炸三处。

这些问题本质上都不是"AI 不够聪明"，而是**没有一种让人类与 AI 共享上下文、并对结果负责的中间形态**。早期大家用更长的 prompt、更详细的 `.cursorrules`、`CLAUDE.md`、`AGENTS.md` 来缓解，但那只是约定，不是流程。

2025 年下半年开始，社区出现了三种思路接近、形态差异巨大的开源框架：

| 框架 | 出品方 | 语言/形态 | 核心抽象 |
|------|--------|-----------|----------|
| [GitHub Spec Kit](https://github.com/github/spec-kit) | GitHub | Python CLI + Markdown 产物 | 宪法（constitution）+ 多阶段命令 |
| [OpenSpec](https://github.com/fission-ai/openspec) | Fission AI | Node.js CLI + spec delta | 提案（change folder）+ 需求增量 |
| [Superpowers](https://github.com/obra/superpowers) | Jesse Vincent / Prime Radiant | 一组 Markdown skills + plugin | 自动触发的"方法论技能" |

它们共同回答一个问题：**在 AI 帮你写代码之前，先帮它把"要写什么"固定下来**。但各自的解法差异，决定了它们适合的项目体量、团队规模和开发节奏完全不同。下面逐个拆。

## 二、GitHub Spec Kit：以"宪法"为根的多阶段流水线

### 2.1 定位

Spec Kit 是 GitHub 在 2025 年 9 月开源的 Python 工具包，截至 2026 年 7 月已经累积 **11.8 万 star、240 位贡献者、180 个 release**，迭代节奏极快。它对自己的一句话定位是：

> Define what to build before building it — with any AI coding agent.

关键词是 **any AI coding agent**。Spec Kit 不绑定具体编码工具，已支持 30+ Agent（Claude Code、Copilot、Gemini CLI、Codex、Kilo Code、Zed、Forge、Kiro、Cursor 等），切换 Agent 只需一条命令。这是它和后两者最大的不同——**Spec Kit 把自己定位成跨 Agent 的"流程层"**，而不是某个 Agent 的伴侣工具。

### 2.2 工作原理：四个 Markdown 产物 + 六个 slash 命令

Spec Kit 的核心是 **Spec-Driven Development（SDD）**，把一次开发拆成几个固定阶段，每个阶段产出一个 Markdown 文档，下一个阶段把它当输入：

```text
constitution  →  specify  →  plan  →  tasks  →  implement  →  converge
   项目宪法       需求规格    技术方案   任务清单    执行实现     对账收敛尾
```

对应的 slash 命令（在不同 Agent 里都叫这个名字）：

| 命令 | 作用 |
|------|------|
| `/speckit.constitution` | 创建/更新项目的"宪法"——编码规范、合规约束、TDD 要求等长期原则 |
| `/speckit.specify` | 写需求规格，用户故事、验收标准、范围与非范围 |
| `/speckit.plan` | 基于 constitution 与 specify 产物，出技术实现方案 |
| `/speckit.tasks` | 把 plan 拆成可执行任务清单 |
| `/speckit.taskstoissues` | 把任务清单转成 GitHub issues（可选） |
| `/speckit.implement` | Agent 按 tasks 顺序实现 |
| `/speckit.converge` | **关键**：实现完后，把代码库与 spec/plan/tasks 对账，把遗漏的工作追加为新任务 |

`converge` 这一步是 Spec Kit 区别于"先写文档然后忘掉"的关键。它强制要求**实现完成后回过头比对规格**，把"代码漂移"重新拉回 spec 上。这一点在团队协作里非常值钱——它能阻止 AI 偷偷改架构。

### 2.3 安装与初始化

依赖 Python 3.11+ 与 `uv`：

```bash
uvx --from git+https://github.com/github/spec-kit.git specify init my-project --ai claude
```

`--ai` 参数决定生成哪种 Agent 的命令文件与上下文规则（Claude 是 `CLAUDE.md`，Copilot 是 `.github/copilot-instructions.md`，等等）。从 v0.6.0 起改为打包资源，离线也能 init。

### 2.4 扩展生态

Spec Kit 不只卖核心流程，还建了一个 **105 个社区扩展 + 22 个 preset** 的生态。几个有代表性的 preset：

- **AIDE**：7 步 AI 驱动的工程生命周期；
- **Canon**：基线驱动的工作流（spec-first / code-first / spec-drift 三种模式可切）；
- **Product Forge**：偏产品管理的 SDD；
- **MAQA**：多 Agent 编排 + 质量门禁；
- **FX→.NET**：跨 7 个阶段的 .NET Framework 迁移专用流程。

也就是说，Spec Kit 的核心是个**"流程引擎"**，preset/extension/workflow 都可以替换。这也是它"重"的原因——好处是治理能力强，代价是上手成本不低。

### 2.5 适合谁

- 中大型团队、合规要求高、需要可审计开发过程的项目；
- 绿地项目（greenfield），或者要做大规模重构的存量项目；
- 多 Agent 并存、想随时切换 Claude / Copilot / Gemini 的团队；
- 希望规格成为"活文档"而不是写完就扔的团队。

不适合：个人项目、原型验证、5 分钟内就要出 demo 的场景——单是写 constitution 就够你坐半小时。

## 三、OpenSpec：以 delta 为中心的轻量级 brownfield 框架

### 3.1 定位

OpenSpec 是 Fission AI 出品的 Node.js CLI（`@fission-ai/openspec`），官方对自己的定位直接对标 Spec Kit：

> vs. Spec Kit (GitHub) — Thorough but heavyweight. Rigid phase gates, lots of Markdown, Python setup. OpenSpec is lighter and lets you iterate freely.

它强调三件事：**Lightweight（轻量）、Brownfield-first（存量项目优先）、Specs live in your code（规格和代码同仓库共存）**。第三个点尤其重要——OpenSpec 不像 Spec Kit 把规格当"过程产物"，而是当成"持续活着的代码伴侣"。

### 3.2 工作原理：change folder + spec delta

OpenSpec 的核心抽象是 **change folder** 与 **spec delta**。

仓库里有一个 `openspec/specs/` 目录，按能力（capability）组织活规格：

```text
openspec/specs/
├── auth-login/
│   └── spec.md
├── auth-session/
│   └── spec.md
├── checkout-cart/
│   └── spec.md
└── checkout-payment/
    └── spec.md
```

每个 `spec.md` 是用 SHALL/SHALL NOT 关键字写的需求规格，带 GIVEN/WHEN/THEN 的场景描述，读起来像 BDD：

```markdown
### Requirement: Session expiration
The system SHALL expire sessions after a configured duration.

#### Scenario: Default session timeout
- GIVEN a user has authenticated
- WHEN 24 hours pass without activity
- THEN invalidate the session token
- AND require re-authentication
```

当你描述一个变更（"加一个 Remember Me + 30 天会话"），OpenSpec 不会去重写整份 spec，而是创建一个 **change folder**，里面装这次变更的全部产物：

```text
openspec/changes/add-remember-me/
├── proposal.md      # 这次变更是什么、为什么
├── design.md        # 技术决策
├── tasks.md         # 拆解后的实现任务
└── specs/           # spec delta：相对当前规格的增/改/删
    └── auth-session/
        └── spec.md
```

`specs/` 下的 delta 文件直接用 diff 风格标出本次变更（`+` 新增、`-` 删除）：

```markdown
### Requirement: Session expiration
- The system SHALL expire sessions after a configured duration.
+ The system SHALL support configurable session expiration periods.

#### Scenario: Default session timeout
- - WHEN 24 hours pass without activity
+ - WHEN 24 hours pass without "Remember me"
- THEN invalidate the session token
+ #### Scenario: Extended session with remember me
+ - GIVEN user checks "Remember me" at login
+ - WHEN 30 days have passed
+ - THEN invalidate the session token
```

**这种 delta 设计是 OpenSpec 的灵魂**。Reviewer 不用读 1000 行规格，只要扫一眼 diff 就知道这次 PR 改了什么行为意图。规格本身则是团队共识的"系统当前态"。

### 3.3 三阶段循环

OpenSpec 的流程比 Spec Kit 短得多：

```text
propose  →  apply  →  archive
  提案       实现       归档合并
```

- **propose**：`/opsx:propose "your idea"`，自动生成 change folder；
- **apply**：Agent 按 `tasks.md` 实现，期间可以反复改 proposal/design/specs，**没有强制的 phase gate**；
- **archive**：变更完成后，delta 合并回 `openspec/specs/` 的源规格，change folder 归档或删除。

注意这里和 Spec Kit 的本质差异：Spec Kit 是**单向流水线**（specify → plan → tasks → implement → converge），OpenSpec 是**可任意往返的循环**。你可以在 apply 阶段发现 spec 不对，回去改 proposal，再继续写代码，没人拦你。

### 3.4 安装与使用

只要 Node.js 20.19+：

```bash
npm install -g @fission-ai/openspec@latest
cd your-project
openspec init
```

之后在支持的 Agent 里直接用 slash 命令（OpenSpec 原生支持 20+ Agent：Claude Code、Cursor、Codex、Copilot、Windsurf、Gemini CLI、Cline、RooCode、Amazon Q 等）。它没有 MCP、没有 API key、不收费，纯本地 CLI + Markdown。

### 3.5 适合谁

- **存量项目（brownfield）**：这是 OpenSpec 反复强调的主场。你不用先把整个系统反向出规格，新需求来一次就建一个 capability 的 spec，慢慢长出规格库；
- 偏好快速迭代、不喜欢被 phase gate 拦住的团队；
- 希望规格成为"系统当前应该是什么样子"的活文档，而不是"开发过程副产品"；
- 评审者需要快速理解 PR 意图而非翻代码——delta diff 是天然的 review 工具。

OpenSpec 自己也诚实地说：如果你是"纯 vibe coder，希望工具替你想清楚一切"，它不适合你。Spec 只有在你**真的会去读、去改、去对照**时才有价值。

## 四、Superpowers：方法论即代码的 Skills 框架

### 4.1 定位

前两个框架都把"规格"作为核心产物，Superpowers 走的是另一条路：**它不让你写规格文档，而是把"一个资深工程师的工作习惯"编码成一组可被 Agent 自动触发的 skills**。

作者是 Jesse Vincent（@obra，Keyboardio 创始人），2025 年 10 月开源，截至 2026 年 6 月已经 **22.4 万 star、v5.1.0**，是这三个里增长最猛的。官方定位：

> Superpowers is a complete software development methodology for your coding agents, built on top of a set of composable skills and some initial instructions that make sure your agent uses them.

关键词是 **methodology**——它不是工具，是"方法论即代码"。

### 4.2 工作原理：14 个 Markdown skills + 自动触发

Superpowers 的核心是 14 个用 Markdown 写的 skill 文件，分布在 `skills/` 目录：

| 类别 | Skill | 作用 |
|------|-------|------|
| 协作 | brainstorming | Socratic 式提问，把模糊想法逼成清晰设计，分块呈现供你确认 |
| 协作 | writing-plans | 把设计拆成 2–5 分钟一个的小任务，每个任务带文件路径、完整代码、验证步骤 |
| 协作 | executing-plans | 分批执行计划，带人工 checkpoint |
| 协作 | subagent-driven-development | 每个任务派一个 fresh subagent 实现，再做**两阶段 review**（spec 合规 + 代码质量） |
| 协作 | dispatching-parallel-agents | 并行 subagent 工作流 |
| 协作 | requesting-code-review / receiving-code-review | 任务间强制 code review，critical 问题阻断流程 |
| 协作 | using-git-worktrees | 设计批准后自动在 worktree 上开新分支，保证隔离 |
| 协作 | finishing-a-development-branch | 任务完成后给出 merge/PR/保留/丢弃选项，清理 worktree |
| 测试 | test-driven-development | **强制 RED-GREEN-REFACTOR**：先写失败的测试 → 看它失败 → 写最少代码 → 看它通过 → commit。**测试之前写的实现代码会被删掉** |
| 调试 | systematic-debugging | 4 阶段根因分析 |
| 调试 | verification-before-completion | "声称完成"之前必须验证 |
| Meta | using-superpowers | 整个 skills 系统的入口规则 |
| Meta | writing-skills | 教你怎么写新 skill |

关键机制是 **session-start hook + 强制首答协议**：插件装好之后，每次 Agent 启动会自动注入 `using-superpowers` 这个 skill，它规定了一条铁律——

> **Agent 在响应任何任务之前，必须先检查是否有可用的 skill，有则强制调用。**

也就是说，你不需要记 `/brainstorm`、`/write-plan` 这种命令（这些 slash 命令已经被官方标记 deprecated）。你只要自然地说"帮我做一个 X"，Agent 自己就会先进入 brainstorming，然后 worktree，然后 plan，然后 subagent-driven 实现，每个任务 TDD，最后 code review。

### 4.3 一个典型会话长什么样

按照官方描述的"basic workflow"：

1. 你说"我想做一个 RSS 聚合器"；
2. Agent 不写代码，进入 **brainstorming**：连续问你"要不要支持自托管？订阅源上限？多用户？"等，分块给你看设计稿；
3. 你点头，Agent 进入 **using-git-worktrees**，开新分支装好依赖，跑一遍基线测试确保干净；
4. 进入 **writing-plans**，产出一份"每任务 2–5 分钟、带文件路径与完整代码"的计划；
5. 你说 go，进入 **subagent-driven-development**：每任务派一个 fresh subagent 实现，主 Agent 做 spec 合规 review + 代码质量 review，critical 问题阻断；
6. 实现期间 **test-driven-development** 强制 RED-GREEN-REFACTOR，先写失败测试，没测试的代码会被删；
7. 任务间 **requesting-code-review**；
8. 全部完成进入 **finishing-a-development-branch**，给你 merge / PR / 保留 / 丢弃四个选项。

> 官方原话："It's not uncommon for your agent to work autonomously for a couple hours at a time without deviating from the plan."

也就是说，Superpowers 的目标是**让 Agent 能脱离你独立工作两小时**，靠的不是模型多强，而是 plan 足够细 + subagent 隔离 + 两阶段 review + TDD 兜底。

### 4.4 安装

Superpowers 现在分发在 8 个 harness 上：Claude Code、Codex CLI/App、Factory Droid、Gemini CLI、OpenCode、Cursor、GitHub Copilot CLI、Kimi Code。

Cursor 上最简单：

```text
/add-plugin superpowers
```

Claude Code 走官方插件市场：

```bash
/plugin install superpowers@claude-plugins-official
```

装完之后开新会话问一句"Tell me about your superpowers"就能验证是否生效。

### 4.5 适合谁

- 个人开发者或小团队，特别是不想写大段规格文档、希望"Agent 自己按方法论走"的人；
- 重视 TDD、希望 AI 写出来的代码自带测试的项目；
- 希望把"资深工程师的工作习惯"传染给团队所有人——skill 是 Markdown，团队可以 fork 改写；
- 单仓库、能接受 worktree 隔离工作流的项目。

不适合：不爱写测试的项目（TDD 是强制的，会和现有非 TDD 代码冲突）、不能用 git worktree 的环境、希望完全手动控制每一步的人。

## 五、三者横向对比

把三个框架放在同一张表上：

| 维度 | Spec Kit | OpenSpec | Superpowers |
|------|----------|----------|-------------|
| 核心抽象 | 宪法 + 多阶段产物 | change folder + spec delta | 14 个自动触发 skills |
| 产物形态 | 多份 Markdown 文档 | spec.md + delta diff | 几乎不产生独立文档，直接驱动 Agent |
| 流程模型 | 单向流水线 + converge 对账 | 可任意往返的三阶段循环 | 方法论 skill 链，Agent 自动按序触发 |
| 强制程度 | 高（phase gate） | 低（自由迭代） | 高（skill 强制触发 + TDD 强制） |
| brownfield 友好度 | 中（要先写 constitution） | **高（专为主战场）** | 中（依赖 worktree，需 git 友好） |
| Agent 兼容 | 30+ | 20+ | 8 个 harness |
| 语言/依赖 | Python 3.11+ + uv | Node.js 20.19+ | 各 Agent 的 plugin 系统 |
| 团队协作 | 强（GitHub issues、governance） | 中（git PR review） | 弱（偏个人方法论） |
| 上手成本 | 30 分钟+ | 5 分钟 | 装完即用，但要适应强约束 |
| 代码质量保障 | converge 对账 + 模板 checklist | delta diff review | TDD + 两阶段 subagent review |
| 生态 | 105 扩展 + 22 preset | 较少 | 14 skills，社区贡献新 skill 一般不收 |
| License | MIT | MIT | MIT |

三者其实在回答不同的层次的问题：

- **Spec Kit** 回答："团队怎么对'要做什么'达成共识并留痕？"
- **OpenSpec** 回答："存量项目里，怎么让规格和代码一起演化、让 PR review 看意图？"
- **Superpowers** 回答："Agent 自己怎么按资深工程师的方法论工作？"

它们并不互斥。理论上你完全可以在 Spec Kit 的 `implement` 阶段里让装了 Superpowers 的 Cursor 去执行任务，再用 OpenSpec 的 delta 格式做 PR review——但这会把三套约束叠在一起，对个人项目是过度设计。

## 六、怎么选

给你三条决策路径：

**1. 如果你是团队 Tech Lead，项目有合规/审计要求**

选 Spec Kit。它的 constitution + converge 对账是三者里唯一能撑起"可审计开发过程"的。配 preset（比如 MAQA）能加多 Agent 质量门禁。代价是团队都要学一套命令，初期 ROI 不会立刻显现。

**2. 如果你接手了一个老项目，需求零散，希望规格慢慢长出来**

选 OpenSpec。它的 brownfield-first + delta 模型几乎是为这种场景设计的。你不用一次性反向出全部规格，每做一次变更就建一个 change folder，半年后 `openspec/specs/` 自然成为系统的活文档。Reviewer 看 PR 时读 delta diff 就够了，不用读全规格。

**3. 如果你是个人开发者或小团队，重视 TDD，希望 Agent 能独立工作几小时**

选 Superpowers。装上插件之后什么都不用记，Agent 自己按方法论走。它的 subagent-driven-development + 两阶段 review + 强制 TDD 是目前把"AI 长时间自主编码"做出来最完整的一套。代价是必须接受它的工作流——尤其 TDD 强制，会让非 TDD 项目不太舒服。

**4. 如果你只是想试试 SDD，不想被任何东西绑住**

先 OpenSpec。5 分钟装好，写一个 change folder 跑一遍 propose → apply → archive，感受"规格作为活文档"是什么样子。觉得不够再考虑 Spec Kit，觉得"我想让 Agent 自己按方法论跑"再考虑 Superpowers。

## 七、共性观察：三个框架教会我的事

研究完这三个项目，有几件事是它们共同在说的，值得记下来：

**1. "上下文工程"正在取代"prompt 工程"。**

三个框架都不教你写更精妙的 prompt，而是教你**怎么把上下文结构化**——constitution、spec、delta、skill 都是上下文的容器。AI 时代的工程能力，越来越像"把模糊意图变成 Agent 能反复读取的结构化上下文"。

**2. 规格不是过程副产品，是项目的源代码之一。**

OpenSpec 把 spec 放进 `openspec/specs/` 跟代码同仓共存，Spec Kit 用 converge 强制代码回到 spec，Superpowers 用 plan + TDD 把"该做什么"显式化。三者都在反对"写完代码丢掉文档"。

**3. 流程必须被代码强制，否则 Agent 会绕过去。**

Spec Kit 用 slash 命令 + converge、OpenSpec 用 change folder + archive、Superpowers 用 session-start hook + 强制首答协议。**光靠 `.cursorrules` 写"请先做计划"是没用的**——Agent 第三轮就会忘了。真正能起作用的流程，都是被代码（hook、命令、目录结构）硬绑住的。

**4. TDD 在 AI 编码里有了新意义。**

以前 TDD 是"保证代码质量"，现在它是"AI 能不能独立工作的安全绳"。Superpowers 强制 RED-GREEN-REFACTOR 的真正动机是——**没有测试，subagent 就没法判断自己写对了，两小时自主就无从谈起**。

**5. Agent-agnostic 是趋势。**

Spec Kit 和 OpenSpec 都强调"不绑 Agent"，Superpowers 也分发在 8 个 harness 上。原因很简单：Agent 半年一换，规格和方法论不该跟着换。

## 小结

| 框架 | 一句话 |
|------|--------|
| **Spec Kit** | 给团队的"可审计 SDD 流水线"，重但有治理能力 |
| **OpenSpec** | 给存量项目的"轻量 spec delta 框架"，5 分钟上手 |
| **Superpowers** | 给 Agent 的"方法论 skill 套装"，让 AI 按资深工程师习惯自主跑 |

这三个项目对应的其实是 AI 编程走向成熟的三个方向：**流程化、文档化、自主化**。它们目前都还在快速迭代（Spec Kit 半年 180 个 release、Superpowers 一年 22 万 star），最终形态远未稳定。但无论哪一个胜出，"先想清楚再让 AI 写"这件事已经被钉死在 AI 编程的工程实践里了。

如果你正在用 Cursor 或 Claude Code 但还没试过任何一个，建议这周末挑一个跑一遍——你会发现，真正改变生产力的不是更强的模型，而是**让模型能在结构化上下文里工作**的那层薄薄的约束。

## 参考链接

- GitHub Spec Kit：[github.com/github/spec-kit](https://github.com/github/spec-kit) · [文档站](https://github.github.com/spec-kit/)
- OpenSpec：[github.com/fission-ai/openspec](https://github.com/fission-ai/openspec) · [openspec.dev](https://openspec.dev/)
- Superpowers：[github.com/obra/superpowers](https://github.com/obra/superpowers) · [发布说明](https://blog.fsck.com/2025/10/09/superpowers/)
- 对比资料：[Spec Kit vs OpenSpec](https://intent-driven.dev/knowledge/spec-kit-vs-openspec/) · [OpenSpec vs Spec Kit (Big Hat Group)](https://www.bighatgroup.com/blog/openspec-vs-speckit-spec-driven-ai-development/)
