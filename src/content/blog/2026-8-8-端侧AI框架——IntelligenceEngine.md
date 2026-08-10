---
title: "端侧 AI 框架——IntelligenceEngine"
description: "记录端侧 AI 推理引擎的架构设计与性能调优实践。"
pubDate: 2026-08-08
category: ["AI", "Android"]
featured: false
draft: false
image: "/images/blog/blogs_intelligence_engine_cover.webp"
---

# 端侧AI框架——IntelligenceEngine
本文记录一下我的端侧AI框架协作系统中的“大脑”部分，IntelligenceEngine是集成端侧LLM的模块，承接其他模块的推理请求，返回生成处理的结果。

本应用使用了Google的LiteRT框架，LiteRT 是 Google 面向端侧设备推出的高性能机器学习运行时，前身为 TensorFlow Lite。它支持在 Android、iOS、桌面及嵌入式设备上运行模型，并可利用 CPU、GPU、NPU 等硬件加速。LiteRT-LM 在其基础上面向大语言模型提供模型加载、会话管理和文本生成能力，适合低延迟、隐私友好且无需联网的本地 AI 场景。

## 零散任务 提速
直接使用LiteRT运行一个模型，提交推理任务，生成速度几乎不可以用于生产环境，在端侧上的默认配置需要调整，才可以满足速度要求。

IntelligenceEngine 面向的主要是意图识别、标签分类、摘要和画像归纳等一次性任务，而不是需要长上下文和多轮推理的聊天场景。因此，优化目标不是让模型尽可能生成更多内容，而是在保证任务结果可用的前提下，降低首轮响应时间、总推理耗时、内存占用和设备功耗。

当前主要采用了以下策略：

1. 根据设备平台自动选择推理后端：物理 ARM64 设备优先尝试 GPU，初始化失败后自动回退 CPU；模拟器和非 ARM64 设备直接使用 CPU；
2. 默认关闭 thinking 模式，让输出 token 尽量用于最终答案；
3. 根据任务类型设置不同的最大输出 token 数：意图识别 64、分类标签 96、习惯归纳 192、摘要和用户画像 256、笔记整理 320、通用推理 512；
4. 每个任务使用独立 Conversation，不保留跨请求聊天历史，并串行执行推理，控制端侧模型的峰值资源占用。

### 1. 推理后端如何选择

IntelligenceEngine 当前使用的是“候选后端依次尝试”策略：

```text
物理 ARM64 设备
    → 尝试 GPU
        → 初始化成功：使用 GPU
        → 初始化失败：关闭失败的 Engine，回退 CPU

模拟器或非 ARM64 设备
    → 直接使用 CPU
```

代码首先通过设备支持的 ABI 判断是否包含 `arm64-v8a`，同时排除模拟器。满足这两个条件，只代表设备具备尝试 GPU 的基本条件，并不保证 GPU 一定能够成功运行。

最终是否能够启用 GPU，还取决于：

- 设备是否提供兼容的 OpenCL/GPU 驱动；
- LiteRT-LM 所需的原生库能否正常加载；
- 模型是否支持当前 GPU 后端；
- GPU 可用内存是否足够；
- 厂商驱动是否存在兼容性或稳定性问题。

因此，不能简单地按手机品牌或芯片型号静态判断 GPU 一定可用。更稳妥的方式是先尝试初始化 GPU Engine，把初始化结果作为最终兼容性检查；失败后回退 CPU，保证推理能力仍然可用。LiteRT-LM 的 Android GPU 接入也要求声明相关 OpenCL 原生库，项目已经完成了这部分配置。[LiteRT-LM Kotlin 接入文档](https://github.com/google-ai-edge/LiteRT-LM/blob/main/docs/api/kotlin/getting_started.md)

CPU 的性能通常低于 GPU，但兼容性更好，适合作为保底后端。当前以下设备会直接使用 CPU：

- Android 模拟器，包括 ARM64 模拟器；
- x86、x86_64 等非 ARM64 设备；
- GPU Engine 初始化失败的物理 ARM64 设备。

这里还需要区分“GPU prefill 更快”和“整个任务一定更快”。官方基准中，GPU 对输入阶段的 prefill 加速通常非常明显，但逐 token 的 decode 速度不一定同比提升。因此，对于输入较长、输出较短的摘要和分类任务，GPU 往往更容易体现优势；对于输入很短的任务，Engine 初始化、数据准备和调度开销也可能占据较大比例。[LiteRT-LM 官方模型与性能数据](https://github.com/google-ai-edge/LiteRT-LM)

#### 关于 NPU

LiteRT-LM 本身提供 NPU 后端接口，但 IntelligenceEngine 当前尚未接入 NPU，实际候选后端中只有 GPU 和 CPU。

NPU 其可用性通常取决于芯片平台、厂商运行库、模型编译产物以及 LiteRT-LM 版本。接入时还可能需要向 `Backend.NPU` 提供 NPU 原生库目录，并在目标设备上逐项验证。

### 2. Thinking 模式的优缺点

Thinking 模式允许模型在给出最终答案之前生成一段额外的内部推理内容。它更适合数学、代码、复杂逻辑、多约束规划等需要多步推导的任务。Qwen3 官方也将 thinking 定位于复杂推理，将 non-thinking 定位于高效的通用对话和任务处理。

开启 thinking 模式，面对复杂问题时，模型有更多空间拆解步骤和检查条件；数学、代码和多步逻辑任务通常更容易获得正确结果；对约束较多、需要规划的任务，结果可能更加完整。

缺点则主要体现在端侧资源消耗：

- 思考过程本身也需要逐 token 生成，会直接增加响应时间和功耗；
- thinking token 会占用输出预算，最大 token 较小时可能还没生成最终答案就触及上限；
- 对意图识别、标签分类等简单任务，额外推理通常收益很小；
- 小模型的长推理过程未必可靠，可能出现重复、自我纠结或错误推导；
- 如果思考内容混入最终结果，还会破坏下游所要求的短文本或 JSON 格式。

IntelligenceEngine 的任务以短输出、低延迟为主，因此在 `ConversationConfig` 中设置：

```text
enableThinking = false
thinkingTokenBudget = 0
```

对于 Qwen3 还需要特殊适配，项目还会在 prompt 末尾添加 `/no_think` 软指令，并在生成结束后清理可能残留的 `<think>...</think>` 内容。这样做的目的不是说明 thinking 没有价值，而是让有限的端侧计算预算优先用于最终结果。

更合理的长期策略可以是按任务分类：

```text
意图识别、标签分类、简单摘要
    → 关闭 thinking

复杂规划、代码生成、多步推理
    → 允许 thinking，并单独设置思考预算
```

### 3. 限制最大输出 token 的优缺点

最大输出 token 数表示模型最多可以生成多少 token，它是上限而不是目标值。模型如果提前生成结束标记，实际输出可以远少于该上限。

按任务限制输出长度的优点包括：

- 限制最坏情况下的生成时间和能耗；
- 防止小模型重复输出或无限扩写；
- 减少无关解释，使结果更符合下游接口契约；
- 避免 thinking 或冗长前言耗尽整个输出预算；
- 让意图、标签等短任务更快完成；
- 控制 AIDL 返回内容大小，降低 IPC 传输风险；
- 使不同任务的性能和资源占用更容易预测。

缺点包括：

- 上限过小时，回答可能被截断；
- 摘要可能丢失关键事实；
- JSON、代码或结构化结果可能在闭合前被截断，导致格式无效；
- 复杂问题没有足够空间完成推导；
- 不同模型的分词器不同，相同 token 数并不对应相同的中文字数；
- 输入复杂度不同，固定上限不一定适合所有内容。

因此，最大输出 token 不能越小越好，而应该通过任务的最小充分输出确定。当前配置如下：

| 任务 | 最大输出 token |
|---|---:|
| 意图识别 | 64 |
| 分类标签 | 96 |
| 习惯归纳 | 192 |
| 摘要 | 256 |
| 用户画像 | 256 |
| 笔记标题与摘要 | 320 |
| 通用推理 | 512 |

这些数值限制的是输出，不是模型的输入上下文窗口。实际调优时，应同时记录：

- 首 token 延迟；
- 总推理耗时；
- prefill 和 decode 的 tokens/s；
- 峰值内存；
- 输出被截断的比例；
- JSON 或业务格式通过率；
- 任务结果准确率。

最终目标不是单纯减少 token，而是在延迟、功耗与结果质量之间找到适合端侧场景的平衡点。

### 4. 模型选型

我先后测试了 Qwen3 0.6B、Gemma 3n E2B、Gemma 3 270M 和 Gemma 4 E2B 等模型。在本次测试所使用的设备、量化版本、GPU 后端和任务集下，Gemma 4 E2B 在响应速度与任务结果质量之间表现最好，因此被选作当前阶段的主要模型。这个结论只代表当前测试环境，不意味着它在所有设备和后端上都必然领先。

## 零散任务 JSON格式化
问题总结：

1. 最初只靠提示词要求模型输出 JSON，模型可能只生成 ` ```json ` 后提前结束。
2. 启用 LiteRT-LM 的 JSON Schema 后，异步流式接口会在部分模型/后端上混入原生响应包装，形成类似：
   ```text
   {"{"title":"…","summary":"…"}],"}"
   ```
   内层 JSON 正确，但整体不是合法 JSON，导致 FreeNotes 解析失败。
3. FreeNotes 正确拒绝了无效响应，因此问题实际位于 IntelligenceEngine 的输出边界。

解决方案：

- 为笔记整理启用 `ResponseFormat.json(schema)` 和 `enableResponseFormat = true`，从生成阶段约束 `title`、`summary` 结构。
- 结构化任务改用非流式 `sendMessage()` 获取完整响应；普通任务继续使用 `sendMessageAsync()`。
- IntelligenceEngine 返回前增加 JSON 规范化与校验：
  - 直接解析合法 JSON；
  - 对异常原生包装提取内部有效对象；
  - 重新序列化为纯 JSON；
  - 缺少非空 `title` 或 `summary` 时返回推理失败，不标记为 DONE。
- FreeNotes 继续做最终 JSON 校验，并在同一 Room 事务中更新标题、摘要和处理状态。

最终契约：

```json
{
  "title": "不超过20字的标题",
  "summary": "笔记摘要"
}
```

核心经验：结构化输出不能只依赖提示词，也不能假设流式 SDK 返回值天然是业务 JSON；服务端必须在 IPC 边界完成规范化和验证，客户端仍需保留防御性校验。
