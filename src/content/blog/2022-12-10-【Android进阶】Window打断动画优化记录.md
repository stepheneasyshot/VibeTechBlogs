---
title: "【Android进阶】Window打断动画优化记录"
description: >
  本文记录了Android平台上Window打断动画优化的记录
pubDate: 2022-12-10
category: "Android"
featured: false
draft: false
image: "/images/blog/blogs_android_common_cover.png"
---
# 【Android进阶】Window打断动画优化记录
在Android系统中，绝大多数应用的界面逻辑承载于Activity组件之中，有一些需要在特殊层级显覆盖示的界面，需要使用WindowManager来添加某些特殊type的Window，显示页面内容。

并且，Activity应用的页面进场出场动画，不指定的情况下，都有系统默认的Transition处理。而使用WindowManager来添加和移除的页面，是没有默认动画效果的。

