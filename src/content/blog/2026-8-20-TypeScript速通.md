---
title: "TypeScript 速通"
description: "建立类型系统、多端运行时与工程化的实战心智模型。"
pubDate: 2026-08-20
category: ["Web", "工程实践"]
featured: false
draft: false
image: "/images/blog/blogs_typescript_crash_course_cover.webp"
---

# TypeScript 速通

最近研究 AI Coding 和 Harness Engineering 时，我发现很多前沿工具都选择 TypeScript 编写 UI、业务编排和工具调用层，再用 Rust 等语言承担对性能、系统能力和发行体积更敏感的部分。

我原本主要做 Android 和 Kotlin 开发。为了看懂这些 AI 工程的产品形态，并能驱使 AI 工具做出类似的 Agent 工具，TypeScript 是一块必须补齐的拼图。

这篇文章不试图穷举语法，而是建立一套能继续自学和实战的心智模型：

- TypeScript 和 JavaScript 到底是什么关系；
- 类型系统解决了什么，又解决不了什么；
- Browser、Node.js、Electron 和 React 各自处在哪一层；
- 怎样组织一个能稳定迭代的 TypeScript 工程。

## 先理清 JavaScript、TypeScript 和 Runtime

学 TypeScript 最容易混淆的地方，往往不是语法，而是这三者的边界。

### JavaScript 才是真正运行的语言

JavaScript 定义了值、对象、函数、闭包、原型链、Promise 和模块等核心语义。浏览器中的 JavaScript 引擎、Node.js 中的 V8，最终执行的都是 JavaScript。

TypeScript 是 JavaScript 的超集，主要在代码运行前增加静态类型检查。TypeScript 官方对它的定位很直接：JavaScript 程序的静态类型检查器。

```ts
function greet(name: string): string {
  return `Hello, ${name}`;
}
```

交给常规编译流程后，类型会被擦除，运行时看到的大致是：

```js
function greet(name) {
  return `Hello, ${name}`;
}
```

这带来第一个重要结论：

> **TypeScript 类型是开发期契约，不是运行时护城河。**

接口返回的 JSON、用户输入、本地文件和 LLM 输出，都不会因为你写了 `interface` 就自动变得可信。外部数据进入系统时，仍需要运行时校验。

### Runtime 决定代码拥有哪些能力

JavaScript 语言本身不负责提供所有 API。`document.querySelector` 由浏览器提供，`node:fs` 由 Node.js 提供，`BrowserWindow` 由 Electron 提供。

```text
TypeScript 源码
      ↓ 类型检查 / 转换
JavaScript 模块
      ↓
运行时（Browser / Node.js / Electron）
      ↓
DOM、文件、网络、进程、桌面窗口
```

所以“这段 TypeScript 能不能跑”，不只由语法决定，还要看编译目标、模块规则和最终 Runtime。

## 用最小工程跑通链路

学习语言不能只看语法页面。先让一个最小项目完成“编写—检查—构建—运行”闭环，后面的每个概念才有落点。

```bash
mkdir ts-quickstart
cd ts-quickstart
npm init -y
npm install --save-dev typescript @types/node
npx tsc --init
```

在 `package.json` 中声明 ESM 并增加脚本：

```json
{
  "type": "module",
  "scripts": {
    "check": "tsc --noEmit",
    "build": "tsc",
    "start": "node dist/index.js"
  }
}
```

一份适合 Node.js 入门项目的 `tsconfig.json` 可以从以下配置起步：

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "rootDir": "src",
    "outDir": "dist",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "verbatimModuleSyntax": true,
    "sourceMap": true,
    "skipLibCheck": true
  },
  "include": ["src"]
}
```

然后新建 `src/index.ts`：

```ts
const message: string = "TypeScript is ready";
console.log(message);
```

```bash
npm run check
npm run build
npm start
```

`check` 只做类型检查，`build` 产生 JavaScript，`start` 交给 Node.js 执行。一定要打开 `dist/index.js` 看一眼，“类型最终会被擦除”会立刻变得具体。

> 较新的 Node.js 已能直接运行部分只需擦除类型的 TypeScript 语法，但这不代表所有 Runtime 都能直接执行 `.ts`，也不代表可以略过编译和打包知识。

## 基础类型：让推断先工作

TypeScript 会根据初始值和上下文推断类型。能清晰推断时，没必要把每个类型都手动写出来。

```ts
const projectName = "agent-console"; // string
const retryCount = 3;                // number
const enabled = true;                // boolean
const tags = ["ai", "tooling"];     // string[]
```

显式标注更适合函数边界、公共 API 和不容易推断的空容器：

```ts
const taskIds: string[] = [];

function add(a: number, b: number): number {
  return a + b;
}
```

### 对象、interface 和 type

```ts
type TaskId = string;

interface Task {
  readonly id: TaskId;
  title: string;
  status: "pending" | "running" | "done";
  description?: string;
}

const task: Task = {
  id: "task-001",
  title: "Index repository",
  status: "pending",
};
```

- `readonly` 禁止通过这个类型修改字段，但不等于运行时深度不可变；
- `description?` 表示属性可以不存在；
- 字面量联合类型把 `status` 限制在三个合法值内。

`interface` 适合表达可扩展的对象形状，`type` 擅长别名、联合、交叉以及类型运算。在普通业务对象上两者经常都能完成任务，统一项目风格比争论“谁永远更好”更有价值。

### 数组、元组和函数

```ts
const models: string[] = ["small", "large"];
const point: [number, number] = [120, 80];
const roles: readonly string[] = ["reader", "writer"];

interface RunOptions {
  timeoutMs?: number;
  signal?: AbortSignal;
}

async function runTask(
  task: Task,
  options: RunOptions = {},
): Promise<Task> {
  const { timeoutMs = 30_000 } = options;
  console.log(`run ${task.id}, timeout=${timeoutMs}`);
  return { ...task, status: "done" };
}
```

对熟悉 Kotlin 的开发者来说，箭头函数、闭包和高阶函数并不陌生。需要特别补课的是 JavaScript 的 `this`、原型链、异步任务和模块语义，而不是只把 Kotlin 语法逐句翻译成 TypeScript。

## 联合类型与收窄：TypeScript 的核心手感

动态数据经常“可能是 A，也可能是 B”。TypeScript 的关键能力不是用 `any` 把这个事实藏起来，而是先如实表达为联合类型，再通过控制流程逐步收窄范围。

```ts
function normalizeId(id: string | number): string {
  if (typeof id === "number") {
    return id.toString();
  }

  return id.trim();
}
```

对状态机和 Agent 事件，可辨识联合类型尤其好用：

```ts
type AgentEvent =
  | { type: "text"; content: string }
  | { type: "tool_call"; name: string; arguments: unknown }
  | { type: "completed"; usage: { input: number; output: number } }
  | { type: "failed"; error: Error };

function renderEvent(event: AgentEvent): string {
  switch (event.type) {
    case "text":
      return event.content;
    case "tool_call":
      return `Calling ${event.name}`;
    case "completed":
      return `Used ${event.usage.input + event.usage.output} tokens`;
    case "failed":
      return event.error.message;
    default: {
      const unreachable: never = event;
      return unreachable;
    }
  }
}
```

`type` 字段是判别键。进入每个 `case` 后，TypeScript 会自动知道当前数据的具体形状。`never` 则把“漏处理了新状态”从潜在运行时 Bug 变成编译错误。

## any、unknown、never 和 null

这几个类型决定了一份 TypeScript 代码到底是安全，还是只把 JavaScript 换了后缀。

`any` 相当于告诉编译器“放弃检查”。它对渐进迁移旧 JavaScript 项目有用，但不应该是新代码的默认选择。

`unknown` 表示“确实有一个值，但现在还不知道它的类型”。使用前必须先检查：

```ts
function isTask(value: unknown): value is Task {
  if (typeof value !== "object" || value === null) return false;

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.title === "string" &&
    ["pending", "running", "done"].includes(String(candidate.status))
  );
}

const raw: unknown = JSON.parse(
  '{"id":"1","title":"demo","status":"pending"}',
);

if (!isTask(raw)) {
  throw new Error("Invalid task payload");
}

console.log(raw.title); // 此时 raw 已缩小为 Task
```

生产项目可以使用成熟的 Schema 校验库减少手写判断，但原理不变：

```text
不可信数据 → Runtime Validation → 可信的 TypeScript 类型
```

在 `strict` 模式下，`null` 和 `undefined` 不会被当作任意类型的值。可选链和空值合并可以清晰处理缺失数据：

```ts
const displayName = user.profile?.nickname ?? "Anonymous";
```

## 泛型：保留类型之间的关系

泛型不只是为了“一份代码兼容多种类型”，更重要的是它能保留输入和输出之间的关系。

```ts
interface ApiResponse<T> {
  data: T;
  requestId: string;
}

async function requestJson<T>(
  url: string,
  validate: (value: unknown) => value is T,
): Promise<ApiResponse<T>> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);

  const value: unknown = await response.json();
  if (!validate(value)) throw new Error("Unexpected response shape");

  return {
    data: value,
    requestId: response.headers.get("x-request-id") ?? "unknown",
  };
}
```

这里 `T` 把校验器、响应数据和返回值连在一起。如果用 `any`，这种关系就消失了。

常用内置工具类型也是在既有类型上做变换：

```ts
type TaskPatch = Partial<Pick<Task, "title" | "description" | "status">>;
type StoredTask = Required<Omit<Task, "description">> & {
  description: string | null;
};
type TaskMap = Record<TaskId, Task>;
```

初学时先掌握 `Partial`、`Pick`、`Omit`、`Required`、`Readonly` 和 `Record` 已经足够。条件类型、映射类型和模板字面量类型，等真正遇到库 API 设计问题时再深入。

## 异步编程：先理解 Promise

`async` 函数总是返回 `Promise`。`await` 让异步控制流看起来更像同步代码，但并不会把异步 I/O 变成阻塞调用。

```ts
async function loadTasks(signal?: AbortSignal): Promise<Task[]> {
  const response = await fetch("/api/tasks", { signal });

  if (!response.ok) {
    throw new Error(`Failed to load tasks: ${response.status}`);
  }

  return response.json() as Promise<Task[]>;
}
```

上面的类型断言只是为了展示异步语法，它并没有校验响应。真正的业务代码应该复用上一节的边界校验思路。

异步编程要关注的不只是“怎么等待结果”，还包括：

- 错误怎样传播；
- 任务怎样取消；
- 哪些任务可以 `Promise.all` 并发；
- 超时、重试和幂等由哪一层负责；
- UI 或 Agent 状态如何表达 `idle / running / success / error`。

## 模块系统：工程报错的高发区

现代 TypeScript 代码优先使用 ES Modules：

```ts
// task.ts
export interface Task {
  id: string;
  title: string;
}

export function createTask(title: string): Task {
  return { id: crypto.randomUUID(), title };
}
```

```ts
// index.ts
import { createTask } from "./task.js";
import type { Task } from "./task.js";

const task: Task = createTask("Read TypeScript handbook");
```

在 Node.js 的 `NodeNext` 配置下，源码里的相对导入通常写最终运行时会看到的 `.js` 扩展名，即使当前文件是 `.ts`。`import type` 则明确说明这个导入只用于类型检查。

模块问题难在它横跨多层：

```text
源码 import 写法
       + TypeScript module / moduleResolution
       + package.json type / exports
       + bundler 规则
       + Runtime 的 ESM / CommonJS 支持
```

出现“编译通过但运行时找不到模块”时，不要只盯着 TypeScript 语法。先确定项目是交给 Node.js 直接运行，还是交给 Vite 等 bundler 处理，再按对应环境选择 `tsconfig`。

JavaScript 库还可以通过 `.d.ts` 声明文件提供类型信息。有些 npm 包自带类型，有些则通过 `@types/*` 包提供。“类型存在”和“运行时实现存在”仍然是两件事。

## Browser、Node.js、Electron 和 React 怎样拼在一起

| 名称 | 它是什么 | 主要提供 | 常见产物 |
|---|---|---|---|
| Browser | JavaScript Runtime + Web 平台 | DOM、Fetch、Storage、Web Worker | 网页、PWA |
| Node.js | 服务端/工具 Runtime | 文件、进程、网络、CLI | 服务、构建工具、Agent CLI |
| Electron | Chromium + Node.js 的桌面应用框架 | 窗口、桌面 API、多进程 | 跨平台客户端 |
| React | UI 库，不是 Runtime | 组件、状态到 UI 的映射 | Web 或 Electron Renderer UI |

### Browser

浏览器代码可以操作 DOM，但出于安全边界，不能像 Node.js 一样随意读写用户文件。

```ts
const button = document.querySelector<HTMLButtonElement>("#run");

button?.addEventListener("click", () => {
  button.disabled = true;
});
```

### Node.js

Node.js 适合服务、CLI、构建工具和 Agent 的工具调用层。

```ts
import { readFile } from "node:fs/promises";

const config = await readFile("./agent.config.json", "utf8");
console.log(config);
```

这段代码在普通浏览器中不能运行，因为浏览器没有 `node:fs` API。

### Electron

Electron 应用不是一个“拥有所有权限的大网页”。它的核心是进程边界：

```text
Main Process（Node.js / 系统权限）
          ↕ IPC
Preload（最小化、受控的能力桥接）
          ↕
Renderer（Web UI / React）
```

Main Process 负责应用生命周期、窗口和桌面 API；Renderer 按 Web 安全模型运行 UI；Preload 只暴露真正需要的类型化能力。不要为了方便就让 Renderer 直接获得完整 Node.js 权限。

### React

React 的 JSX 文件使用 `.tsx`。Props 和状态都可以成为可检查的 UI 契约：

```tsx
interface TaskRowProps {
  task: Task;
  onRun: (id: TaskId) => void;
}

export function TaskRow({ task, onRun }: TaskRowProps) {
  return (
    <button disabled={task.status === "running"} onClick={() => onRun(task.id)}>
      {task.title}
    </button>
  );
}
```

React 负责组织 UI，但不会替你解决文件访问、客户端打包、进程通信或运行时数据校验。

## 从 TypeScript 走向 Agent 工具

Agent 系统很适合练习 TypeScript，因为它包含很多必须清晰建模的边界：模型事件、工具参数、执行结果、权限、取消和错误。

```ts
interface ToolContext {
  cwd: string;
  signal: AbortSignal;
}

interface Tool<I, O> {
  name: string;
  description: string;
  validate(input: unknown): input is I;
  execute(input: I, context: ToolContext): Promise<O>;
}

type ToolResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: { code: string; message: string } };

async function invokeTool<I, O>(
  tool: Tool<I, O>,
  rawInput: unknown,
  context: ToolContext,
): Promise<ToolResult<O>> {
  if (!tool.validate(rawInput)) {
    return {
      ok: false,
      error: { code: "INVALID_INPUT", message: "Tool arguments are invalid" },
    };
  }

  try {
    return { ok: true, value: await tool.execute(rawInput, context) };
  } catch (error: unknown) {
    return {
      ok: false,
      error: {
        code: "TOOL_FAILED",
        message: error instanceof Error ? error.message : String(error),
      },
    };
  }
}
```

这个小例子已经串起了文章中大部分重要概念：

- 泛型保留工具输入和输出的关系；
- `unknown` 承接 LLM 产生的不可信参数；
- 类型谓词在运行时校验后缩小类型；
- 可辨识联合类型统一表达成功与失败；
- `AbortSignal` 把取消作为正式能力传入执行层。

真正的 Agent 工具还需要 Schema、权限、沙箱、日志、重试和可观测性。TypeScript 的价值不是自动提供这些能力，而是让这些能力的边界可以被清晰描述、组合和检查。

## 适合转语言开发者的学习顺序

我不再把“先看完 JavaScript 教程，再看完 TypeScript 教程”当作两个完全串行的阶段。更高效的方式是以小项目为主线，交叉补齐知识。

### 第一阶段：JavaScript 语义

优先搞懂：

- `let` / `const`、对象、数组和解构；
- 函数、闭包、`this` 和原型链；
- Promise、`async/await` 和事件循环；
- ES Modules；
- JavaScript 的真值、类型转换和相等性规则。

可以从 [MDN JavaScript Guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide) 开始，边看边在小项目里实验。

### 第二阶段：TypeScript 日常类型

按以下顺序学习官方 Handbook：

1. Basics 和 Everyday Types；
2. Narrowing；
3. Functions 和 Object Types；
4. Generics；
5. Modules；
6. 最后再看类型操作和工具类型。

官方 [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html) 比只查零散语法项更适合建立系统认知。

### 第三阶段：Runtime 和工程链路

为每个环境做一个小作品：

1. Browser：一个调用 API 并渲染列表的页面；
2. Node.js：一个读取配置、调用网络并写入结果的 CLI；
3. React：一个带有联合状态的工具执行面板；
4. Electron：把面板放入桌面窗口，用 preload + IPC 暴露一个最小文件能力；
5. Agent：把模型流式事件、工具调用和取消串成完整闭环。

学习时重点观察每一步增加了什么 Runtime 能力，而不是只记新框架的 API。

## 常见误区

### 把 TypeScript 当成有类型的 Java

TypeScript 的类型系统是结构化的。两个对象只要形状兼容，就可以在很多场景下互相赋值，不需要显式 `implements` 同一个声明。用名义类型的直觉硬套，很容易写出过度面向对象的 TypeScript。

### 到处写类型断言

```ts
const element = document.querySelector("#save") as HTMLButtonElement;
```

`as` 不是运行时转换，只是对编译器的承诺。如果元素不存在，这个承诺不会救你。优先让推断、类型缩小和运行时检查完成工作。

### 把类型错误当作麻烦

如果 AI 生成了一堆类型错误，不要第一时间让它添加 `any` 或 `@ts-ignore`。类型错误常常在暴露边界模糊、数据建模矛盾或模块配置错位。先问“是哪个契约不一致”，再决定怎么修。

### 用一份 tsconfig 统治所有环境

Browser UI、Node.js Server、Electron Main、Electron Renderer 和测试代码的全局 API 与模块规则不完全相同。工程扩大后，用独立 `tsconfig` 和 Project References 明确分区，比在一个配置里混入所有 `lib` 更可靠。

## 总结

TypeScript 的学习主线不是“记住所有类型语法”，而是逐步回答三个问题：

1. **运行时真正可能出现哪些值？**
2. **这些可能性如何在类型系统中被如实表达？**
3. **外部世界进入系统时，在哪里完成验证和能力隔离？**

类型可以不确定，但不能含糊；数据可以来自动态世界，但进入核心业务前要经过校验；同一份语言可以走向 Web、Server 和 Desktop，但必须尊重每个 Runtime 的边界。

当这三点真正连起来时，TypeScript 就不再只是“为 JavaScript 加了类型”，而是一套很适合构建现代工具、跨平台客户端和 Agent Harness 的工程语言。

## 延伸阅读

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [TypeScript Modules：Choosing Compiler Options](https://www.typescriptlang.org/docs/handbook/modules/guides/choosing-compiler-options.html)
- [Node.js：Modules - TypeScript](https://nodejs.org/api/typescript.html)
- [React：Using TypeScript](https://react.dev/learn/typescript)
- [Electron Process Model](https://www.electronjs.org/docs/latest/tutorial/process-model)
- [MDN JavaScript Guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide)
