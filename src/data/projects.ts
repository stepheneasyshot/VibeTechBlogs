/** GitHub pinned 开源项目 — 关于页展示 */
export const openSourceProjects = [
  {
    title: 'DebugManager',
    language: 'Kotlin',
    icon: 'bug_report',
    url: 'https://github.com/stepheneasyshot/DebugManager',
    summary: 'Compose Multiplatform 桌面端 Android 调试工具，面向车机与真机场景。',
    detail:
      '基于 Compose Multiplatform 的跨平台桌面应用，支持 Windows / macOS / Linux，面向 Android 真机与智能座舱调试场景。内置 scrcpy 与 ADB，覆盖设备信息、Root/Remount、投屏录屏、截图、按键与文本模拟等能力。\n\n应用管理支持 APK 安装、启动、强停与提取；文件管理提供 Push/Pull 与拖拽传输；另含终端/ADB 命令页、性能监控，以及面向车机的语音与 CarService 信号模拟。已接入 Kimi、DeepSeek 对话，并支持多语言与明暗主题。',
    gradient:
      'radial-gradient(circle at 18% 22%, rgba(122, 86, 232, 0.72), transparent 55%), radial-gradient(circle at 82% 78%, rgba(236, 81, 134, 0.72), transparent 55%), linear-gradient(135deg, #7A56E8, #EC5186)',
  },
  {
    title: 'PeachAssistant',
    language: 'Kotlin',
    icon: 'smart_toy',
    url: 'https://github.com/stepheneasyshot/PeachAssistant',
    summary: 'Compose Multiplatform 跨端 AI 助手，覆盖 Android 与 iOS。',
    detail:
      '基于 Compose Multiplatform 的 Android / iOS 跨端 AI 功能合集。当前模块包括：按主题与风格生成社交文案；相册或相机拍照后由多模态模型估算菜品重量与卡路里；以及结合系统语音识别的英语口语练习。\n\n基础对话接入 DeepSeek API，图像理解使用字节豆包 Vision。工程侧采用 Ktor、Koin、Coil，并集成权限、文件选取与相机等跨端能力，用于探索 CMP + 云端大模型的移动端落地。',
    gradient:
      'radial-gradient(circle at 18% 22%, rgba(236, 81, 134, 0.72), transparent 55%), radial-gradient(circle at 82% 78%, rgba(122, 86, 232, 0.72), transparent 55%), linear-gradient(135deg, #EC5186, #7A56E8)',
  },
  {
    title: 'VibeTechBlogs',
    language: 'Astro',
    icon: 'article',
    url: 'https://github.com/stepheneasyshot/VibeTechBlogs',
    summary: 'Astro 5 静态技术博客，本站开源实现。',
    detail:
      '基于 Astro 5 的个人技术博客，设计系统为 Syntactic Clarity，面向长文阅读的高密度信息界面。文章以 Markdown Content Collections 管理，支持多分类、Pagefind 全文搜索、RSS、多色板明暗主题，以及 list / post / category 三套 View Transitions。\n\n样式层使用 Tailwind CSS 4 与自托管 MiSans；文章页提供阅读进度、目录、代码复制、Shiki 高亮与 KaTeX。列表支持客户端「加载更多」。本站即由此仓库构建部署。',
    gradient:
      'radial-gradient(circle at 18% 22%, rgba(255, 93, 61, 0.72), transparent 55%), radial-gradient(circle at 82% 78%, rgba(74, 47, 140, 0.72), transparent 55%), linear-gradient(135deg, #FF5D3D, #4A2F8C)',
  },
  {
    title: 'PythonTools',
    language: 'Python',
    icon: 'terminal',
    url: 'https://github.com/stepheneasyshot/PythonTools',
    summary: '日常积累的 Python 实用脚本合集，带统一图形入口。',
    detail:
      '按日常需求沉淀的 Python 脚本合集，通过 tkinter 统一入口启动。图片视频工具覆盖格式转换、WebP、PNG 量化压缩、负片转正片与截图；AI 工具含本地 HuggingFace 对话、DeepSeek 流式聊天与 Gemini Veo 视频生成。\n\n文件与系统侧提供批量重命名、Markdown 转 PDF、macOS 垃圾清理、代码行统计、网易云 NCM 解密，以及基于 VoxCPM 的 TTS。依赖按模块按需安装，包初始化采用懒加载，避免缺依赖拖垮整个工具集。',
    gradient:
      'radial-gradient(circle at 18% 22%, rgba(239, 200, 73, 0.72), transparent 55%), radial-gradient(circle at 82% 78%, rgba(56, 112, 160, 0.72), transparent 55%), linear-gradient(135deg, #EFC849, #3870A0)',
  },
  {
    title: 'TravelAgent',
    language: 'Python',
    icon: 'travel_explore',
    url: 'https://github.com/stepheneasyshot/TravelAgent',
    summary: 'LangChain + LangGraph 旅行规划 Agent，支持 CLI 与 SSE API。',
    detail:
      '基于 LangChain + LangGraph 的旅行规划 Agent：通用联网问答（搜索 + 网页抓取）与结构化行程规划。旅行链路采用两阶段 Plan-and-Execute——先并行检索 POI/美食/交通并补全详情，再一次结构化生成 TravelPlan JSON，供移动端直接渲染。\n\n提供 CLI 与 FastAPI SSE 进度推送；模型层可切换 Ollama 本地与 DeepSeek 云端。每次推理动态注入真实时间，避免相对日期搜索偏差。输出含日程、交通、餐饮、预算与天气提示等字段。',
    gradient:
      'radial-gradient(circle at 18% 22%, rgba(52, 160, 86, 0.72), transparent 55%), radial-gradient(circle at 82% 78%, rgba(56, 112, 160, 0.72), transparent 55%), linear-gradient(135deg, #34A056, #3870A0)',
  },
  {
    title: 'EdgeAIDemo',
    language: 'Kotlin',
    icon: 'developer_board',
    url: 'https://github.com/stepheneasyshot/EdgeAIDemo',
    summary: '端侧 AI 集成实验：llama.cpp、LiteRT、AI Core 与端侧 RAG。',
    detail:
      '面向 Android 的端侧 AI 集成实验仓库，用四个 Demo 对比不同落地路径：以 llama.cpp 加载 GGUF 本地推理；经 LiteRT / MediaPipe Tasks 跑端侧模型；在 Pixel 上通过 AI Core 跨进程调用 Gemini Nano；以及端侧 RAG——Embedder 向量化知识库，Cross-Encoder 对查询与文档打分后返回 Top-K。\n\n用于梳理端侧推理、系统级模型通道与本地检索增强的工程差异，为移动端 AI 应用选型提供可对照的样例实现。',
    gradient:
      'radial-gradient(circle at 18% 22%, rgba(74, 133, 224, 0.72), transparent 55%), radial-gradient(circle at 82% 78%, rgba(52, 160, 86, 0.72), transparent 55%), linear-gradient(135deg, #4A85E0, #34A056)',
  },
] as const;
