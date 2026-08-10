---
title: "端侧 AI 之 LiteRT 提速"
description: "梳理 Android 端 LiteRT 全栈推理提速路径。"
pubDate: 2026-08-10
category: ["AI", "Android"]
featured: false
draft: false
image: "/images/blog/blogs_litert_performance_cover.webp"
---

# 端侧AI框架——LiteRT提速
如果你关注的是 **Android 端 Edge AI / LiteRT 推理性能**，现在 LiteRT 生态里真正有效的提速手段，已经不只是以前 TFLite 那种“开 XNNPACK / GPU Delegate”了。到 2026 年，Google 的主线明显变成：

**模型优化 → CompiledModel → CPU / GPU / NPU 自动或显式调度 → AOT 编译 → 厂商 NPU Accelerator。** LiteRT 目前已经把 CPU、GPU、NPU 加速统一到一套运行时体系里。[Google AI for Developers](https://ai.google.dev/edge/litert)

我按照“实际收益”和 Android 落地价值给你分一下。

### 1. NPU 加速：目前最值得关注

这是现在 LiteRT 提速最大的方向。

LiteRT 已经支持通过 `CompiledModel API` 调用不同 SoC 的 NPU，并且 Google 正在逐步把 Qualcomm、MediaTek、Google Tensor 这些平台统一起来。[Google AI for Developers](https://ai.google.dev/edge/litert/android/npu/overview)

以 Qualcomm 为例，现在已经有新的 **LiteRT Qualcomm AI Engine Direct / QNN Accelerator**，支持两种方式：

* On-device compilation：模型首次运行时在设备端针对 SoC 编译
* AOT compilation：开发阶段直接针对目标 SoC 预编译

Google 自己给出的部分 benchmark 中，QNN NPU 相对 CPU 最高达到约 **100×**，相对 GPU 最高约 **10×**；当然这是特定模型、特定旗舰 SoC 下的上限，不应该理解成普遍性能倍率。[Google 开发者博客](https://developers.googleblog.com/unlocking-peak-performance-on-qualcomm-npu-with-litert/)

对于手机厂或者能够控制设备 SKU 的场景，我会把优先级排成：

**NPU AOT > NPU JIT > GPU > CPU/XNNPACK**

特别是你们这种 Android 手机侧项目，如果知道目标 SoC，比如 Snapdragon 8 Elite 系列，直接针对芯片做 AOT，收益非常大。

---

### 2. AOT Compilation：经常被低估

AOT 是 LiteRT 这一代架构非常重要的变化。

以前典型流程：

`TFLite Model → Runtime → Delegate → runtime compile`

现在可以变成：

`TFLite Model → LiteRT AOT Compiler → SoC-specific binary → NPU`

这样可以减少：

* delegate graph partition
* shader / kernel 编译
* NPU graph compilation
* 首次加载 latency

Google 现在甚至支持把不同 SoC 的编译产物封装进 **AI Pack**，然后通过 Google Play for On-device AI 根据设备下发对应版本。[Google 开发者博客](https://developers.googleblog.com/unlocking-peak-performance-on-qualcomm-npu-with-litert/)

这对商业 App 很重要，因为端侧 AI 不只是关注 `tokens/s` 或单次 inference latency，还要考虑：

**cold start + model initialization + compilation latency。**

---

### 3. GPU：仍然是通用性最好的加速方案

如果不能保证 NPU 支持，我反而会优先考虑 GPU。

LiteRT 新的 GPU backend 相比旧 TFLite GPU delegate 也在继续优化。Google 2026 年公开资料中给出的指标是，新 LiteRT GPU 路径相比旧 TFLite GPU 最多大约 **1.4×** 性能提升。[Google 开发者博客](https://developers.googleblog.com/litert-the-universal-framework-for-on-device-ai/)

GPU 比 NPU 最大的优势是：

**覆盖面。**

Android 手机上：

`CPU ≈ 几乎100%`

`GPU ≈ 绝大多数设备`

`NPU ≈ 高端设备性能最好，但碎片化最大`

因此普通 App 的生产策略通常比较合理的是：

**NPU → GPU → CPU fallback**

LiteRT 自己现在也在往自动硬件选择方向发展。[Google AI for Developers](https://ai.google.dev/edge/litert/inference)

---

### 4. CPU：XNNPACK 仍然非常重要

不要因为现在都在讲 NPU，就忽略 CPU。

LiteRT CPU backend 的核心优化之一仍然是 **XNNPACK**。特别是：

* 小模型
* embedding
* preprocessing
* 小 batch
* latency-sensitive operator
* NPU/GPU 不支持的 fallback operator

CPU 经常反而是最快的。

典型错误是：

```text
Conv → GPU
reshape → CPU
attention op → GPU
unsupported op → CPU
```

如果一个模型频繁：

**GPU → CPU → GPU → CPU**

硬件切换和 tensor copy 的成本可能把加速收益全部吃掉。

所以 LiteRT 性能优化有一个很重要的原则：

> **full delegation 往往比理论算力更重要。**

Google 在 Qualcomm NPU benchmark 里也特别强调了 full model delegation：支持更多 LiteRT op 后，72 个模型里有 64 个可以完整委托给 NPU，这也是性能提升的重要来源。[Google 开发者博客](https://developers.googleblog.com/unlocking-peak-performance-on-qualcomm-npu-with-litert/)

---

### 5. Quantization：通常是 ROI 最高的一步

硬件之外，模型量化往往是最简单直接的优化。

常见：

```text
FP32
 ↓
FP16
 ↓
INT8
 ↓
INT4
```

传统视觉模型通常可以重点考虑：

**FP32 → FP16 / INT8**

LLM 则通常重点考虑：

**FP16 → INT8 → INT4**

比如一个 3B 模型：

```text
FP16 ≈ 6 GB
INT8 ≈ 3 GB
INT4 ≈ 1.5 GB
```

对手机来说，减少的不只是存储。

更重要的是降低：

**DRAM bandwidth**

端侧 LLM 很多时候不是纯 FLOPS bound，而是：

**memory bandwidth bound。**

因此 INT4 经常会同时改善：

* 模型加载
* RAM
* cache
* bandwidth
* token latency

Google 的 AI Edge Quantizer 目前也提供 layer-level quantization 配置，用来在精度和性能之间做权衡。[Google 开发者博客](https://developers.googleblog.com/litertjs-googles-high-performance-web-ai-inference/)

---

### 6. LiteRT-LM：如果你做 LLM，不要直接裸跑 LiteRT

如果你现在研究的是：

> 手机上的 Gemma / Qwen / Phi / 自研 Transformer

那我会建议直接重点研究 **LiteRT-LM**。

LiteRT-LM 本质上是在 LiteRT runtime 上面增加了一整套针对 GenAI 的优化。Google 目前重点强调：

* CPU/GPU/NPU backend
* KV cache 管理
* memory-efficient dynamic loading
* optimized attention
* constrained decoding
* multimodal pipeline
* Multi-Token Prediction

其中 Google 对其新的 Multi-Token Prediction 路径公开宣称，在适用条件下可以达到最高约 **2.2×** 的生成速度提升。[Google 开发者博客](https://developers.googleblog.com/blazing-fast-on-device-genai-with-litert-lm/)

因此：

```text
传统 CV / Audio / NLP
        ↓
      LiteRT

LLM / VLM / GenAI
        ↓
    LiteRT-LM
        ↓
      LiteRT
        ↓
CPU / GPU / NPU
```

会更符合现在 Google 的技术栈。

---

### 7. LLM 更关键的是 KV Cache

如果讨论 LLM 推理速度，我甚至会把优化重点拆成两部分：

```text
Prefill
Decode
```

Prefill 更偏：

**compute-bound**

Decode 很多时候更偏：

**memory-bandwidth-bound**

所以优化方法是不一样的。

例如：

```text
Prompt 2048 tokens
      ↓
Prefill
      ↓
生成 token 1
      ↓
KV Cache
      ↓
生成 token 2
      ↓
KV Cache
      ↓
...
```

没有高效 KV Cache，就需要不断重复计算历史 token。

所以对于 LiteRT-LM / 手机 LLM 来说：

**KV cache + quantization + backend**

往往比单纯调线程数重要得多。

---

### 8. Android 侧还有一层容易忽略：内存拷贝

很多端侧 AI benchmark 看起来 inference 只有：

```text
8 ms
```

但 App 实际：

```text
Bitmap
 ↓
RGB conversion      4ms
 ↓
Tensor copy         3ms
 ↓
Inference           8ms
 ↓
Tensor copy         3ms
 ↓
Post-processing     4ms

Total = 22ms
```

这时候优化 inference 8 → 6ms，只提高一点点。

而如果做到：

**zero-copy / shared buffer / hardware buffer**

可能收益更明显。

尤其 Camera 场景：

```text
Camera
 ↓
AHardwareBuffer
 ↓
GPU / NPU
 ↓
LiteRT
```

而不是：

```text
Camera
↓
YUV
↓
Bitmap
↓
ByteBuffer
↓
Tensor
↓
GPU
```

这属于 Edge AI 系统工程里非常关键的一环。

---

## 我会把 LiteRT 提速手段分成这 5 层

```text
                Edge AI Performance
                       │
        ┌──────────────┼──────────────┐
        ↓              ↓              ↓
      Model          Runtime        Hardware
        │              │              │
 Quantization     LiteRT-LM       CPU/XNNPACK
 Pruning          CompiledModel   GPU
 Distillation     KV Cache        NPU
 Architecture     AOT Compile     Vendor Accelerator
        │
        ↓
   System Optimization
        │
 Zero-copy / mmap
 memory planning
 thread affinity
 thermal control
 model caching
```

如果只看“哪个最值得做”，对 Android 端我大致会排：

**NPU/AOT > INT4/INT8量化 > LiteRT-LM/KV Cache > GPU > XNNPACK > zero-copy/内存优化 > threading 调优。**

不过实际顺序应该根据模型类型调整。

比如你之前关注的是 **LiteRT 下端侧 LLM 的速度**，如果目标是让一个 0.5B～3B LLM 真正达到可交互速度，我反而建议重点研究这一条完整链路：

**Transformer → INT4/INT8 → LiteRT-LM → KV Cache → CompiledModel → QNN/MediaTek NPU → AOT → AI Pack**

这基本就是目前 Google Edge AI 技术栈里性能上限最高的一条路线。[Google 开发者博客](https://developers.googleblog.com/blazing-fast-on-device-genai-with-litert-lm/)

如果你的目标设备是 **骁龙 Android 手机**，我还可以进一步给你拆成一张「LiteRT CPU / GPU / QNN NPU / llama.cpp / MNN / ExecuTorch」端侧 LLM 性能技术路线对比，会更适合你现在做手机端 EdgeAI 的选型。

## 参考资料

1. [LiteRT：面向端侧机器学习的高性能运行时](https://ai.google.dev/edge/litert)
2. [LiteRT NPU Delegate 概览](https://ai.google.dev/edge/litert/android/npu/overview)
3. [使用 LiteRT 释放 Qualcomm NPU 的峰值性能](https://developers.googleblog.com/unlocking-peak-performance-on-qualcomm-npu-with-litert/)
4. [LiteRT：通用端侧 AI 框架](https://developers.googleblog.com/litert-the-universal-framework-for-on-device-ai/)
5. [LiteRT 端侧推理](https://ai.google.dev/edge/litert/inference)
6. [LiteRT.js：Google 的高性能 Web AI 推理方案](https://developers.googleblog.com/litertjs-googles-high-performance-web-ai-inference/)
7. [使用 LiteRT-LM 加速端侧生成式 AI](https://developers.googleblog.com/blazing-fast-on-device-genai-with-litert-lm/)
