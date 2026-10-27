# ACM 入门指南

面向新生的算法竞赛学习网站。第一板块为招新前的 31 天入门路线，第二板块为“入队后—寒假前”。使用 C++17 + Dev-C++。

- 网站：<https://llzzxx-712.github.io/ACMguide/>
- 已提供：前言、31 天路线与第一至九章共 25 节教程，完整覆盖第 1—31 天。第 29—30 天学习网格 DP 与背包，第 31 天学习简单博弈论。
- 第二板块：已整理“入队后—寒假前”的 24 章、104 个小节大纲，补充二叉树、集合和图的基础，并覆盖《深入浅出进阶篇》的 22 组专题，不安排推荐天数。
- 后续例题优先参考[自编入门题单](https://www.luogu.com.cn/training/1126196)，按当前章节与教学范围选题。
- 参考布局：[AIInfraGuide](https://caomaolufei.github.io/AIInfraGuide/guides/ai-infra学习路线/)，本项目独立实现页面与内容。

## 第一板块：招新前

洛谷《深入浅出基础篇》中的语言基础、模拟、排序、暴力枚举、递推与递归、贪心、二分、搜索、线性表、基础数学，补充简单动态规划、简单博弈论。

排除高精度、二叉树、集合及图的基本应用。模拟保留；搜索中的网格 / 状态 BFS 保留。题单中跨范围的题不作为首轮必做题。

新生组：洛谷红—黄、CF 800—1500。

## 第二板块：入队后—寒假前

学习基础篇中的二叉树、集合、图的基本应用，再按知识依赖组织算法与数据结构、图论、动态规划、数学和线段树进阶。大纲见网站 `/after-joining/`，每章有独立概览和对应题单；章节与小节标题集中在 `src/data/after-joining.ts`，具体正文后续逐节编写。

## 本地运行

需要 Node.js 24 或更高版本。

Windows 上双击 `preview.cmd` 即可启动本地预览并打开浏览器。保持终端窗口开启，修改文件后页面会自动更新；按 `Ctrl+C` 结束预览。

本地预览不会上传 GitHub。可以多次修改，确定后再统一发布。GitHub 也支持反复提交更新，每次都有历史记录。

```sh
npm ci
npm run dev
```

打开终端显示的 `http://127.0.0.1:4321/ACMguide/`。

```sh
npm run build
npm run preview
```

`build` 会进行类型检查、静态构建、内部链接与锚点校验。搜索索引随构建生成，全部为静态文件，不需要后端。

已安装支持 C++17 的 g++ 时，运行 `node scripts/check-examples.mjs` 可从教程原文提取并验证全部完整 C++ 示例。它也会在 GitHub Actions 中自动运行，覆盖样例、分界值、零、单元素与同分等情况。

## 怎样改内容

| 文件 | 用途 |
| --- | --- |
| `src/content/language/*.md` | 第一章的 9 节教程，每节一个 Markdown 文件 |
| `src/content/basic-algorithms/*.md` | 第二章的模拟、排序与枚举教程 |
| `src/content/recursion-greedy/*.md` | 第三章的递推、递归与贪心教程 |
| `src/content/binary-search/*.md` | 第四章的二分查找与二分答案教程 |
| `src/content/linear-tables/*.md` | 第五章的线性表、栈与队列教程 |
| `src/content/search/*.md` | 第六章的 DFS 与 BFS 教程 |
| `src/content/math/*.md` | 第七章的整除、质数、gcd、进制、快速幂与计数教程 |
| `src/content/dynamic-programming/*.md` | 第八章的线性 DP、数字三角形与背包教程 |
| `src/content/game-theory/*.md` | 第九章的胜负状态、巴什博弈与 Nim 游戏教程 |
| `public/animations/dfs-enumeration/` | DFS 枚举、调用与返回的交互动图，含两层、三层与四皇后三种模式 |
| `public/animations/knapsack/` | 0/1 背包的二维转移与一维正序、倒序对照动图 |
| `src/data/content.ts` | 自动加载正文，并为目录、搜索和进度提供发布状态 |
| `src/data/course.ts` | 所有章节标题、日程与提纲 |
| `src/data/after-joining.ts` | 第二板块的分组、章节与知识点大纲及对应题单 |
| `src/pages/after-joining.astro` | 入队后—寒假前的大纲列表 |
| `src/pages/after-joining/chapter/[slug].astro` | 第二板块每章的概览、小节列表和对应题单 |
| `src/pages/index.astro` | 前言 |
| `src/pages/roadmap.astro` | 31 天路线与新生组目标 |
| `src/pages/summary.astro` | 31 天学习总结与按知识点继续巩固的题单入口 |
| `src/styles/global.css` | 全站样式和移动端布局 |
| `astro.config.mjs` | GitHub Pages 账号、仓库子路径 |

后续发布新章节时，将正文放入 `src/content/章节目录/`，文件名与 `src/data/course.ts` 中的 slug 对应。正文存在才发布为可学习状态，目录、搜索、路线和学习进度会一起更新。

学习进度与主题只保存在读者的本地浏览器，不创建账号、不跨设备同步。

## GitHub Pages

仓库 Settings → Pages → Build and deployment → Source 选择 **GitHub Actions**。推送到 `main` 后，`.github/workflows/deploy.yml` 自动构建并发布；拉取请求只构建检查，不发布。

部署使用 Astro 官方 Action。更改账号或仓库名时，同步修改 `astro.config.mjs` 的 `site`、`base` 和 `src/data/course.ts` 的仓库链接，并重新构建。

教程内容是可继续编辑的初稿。练习仅链接原平台，不复制题目全文；本指南自编练习已在正文标注。
