# Jianchen · 个人知识图谱

从 **2026 年 9 月** 开始，记录哥大课程与自主学习中的知识点、学习来源和关联。此前的学习经历以后补充。

## 浏览网站

- **知识地图**：按数学基础、概率与统计、计算机基础、编程与工程、机器学习与 AI 浏览，点击知识点查看概念和来源。
- **知识点目录**：用列表查找条目；支持中英文搜索、领域与学习来源筛选。
- **学习来源**：课程仓库作为来源链接，不复制 Lecture、课件或作业。
- **后续主题**：课程大纲中尚待学习或确认的主题，默认隐藏。

首批来源为 2026 Fall 的 COMS3134、COMS3261、COMS6998（LLM）和 STAT4207。按本人要求排除 STAT4205。

**已收录不代表已学会。** 首批内容由 AI 根据现有课程仓库的大纲与摘要整理；掌握程度均为 `unassessed`，个人理解留空。知识关联是编辑整理的主题关系，不是官方先修要求。不要依据日期自动提升学习状态。

## 更新内容

内容与界面分离，日常只需编辑 `content/`：

| 文件 | 用途 |
| --- | --- |
| `concepts.json` | 知识点：名称、领域、来源、摘要、个人笔记、掌握程度、关联 |
| `sources.json` | 学习来源：哥大课程或自主学习 |
| `domains.json` | 五个领域及其说明 |
| `meta.json` | 记录起点、更新日期及排除项 |

新增知识点时使用稳定且唯一的 `id`，`related` 填其他知识点 ID；每个知识点只保留一份，跨领域归属放入 `tags`。新增自学来源时，`kind` 设为 `self`，并把知识点的 `sources` 关联到它。现有界面会自动纳入“自主学习”筛选。

`coverage`：`recorded`（已收录）或 `planned`（后续主题）。

`mastery`：`unassessed`（待自评）、`encountered`（接触过）、`explain`（能解释）、`apply`（能应用）、`transfer`（能迁移）。只根据本人确认或具体实践证据更新。

`summary` 是概念摘要，`personalNote` 是本人理解。不要把 AI 生成的摘要冒充本人掌握的证据。

私有课程仓库链接需要 GitHub 相应访问权限。公开网站只含独立撰写的概念摘要和来源标识，不含原始课件、作业、答案、成绩或个人课程管理信息。

## 开发与发布

Node.js 22.13+，pnpm 11.19.0。

```sh
pnpm install --frozen-lockfile
pnpm dev
pnpm check
pnpm build
```

界面使用 React、Vinext 与 Shadcn。静态输出目录为 `dist/client/`；GitHub Pages 工作流设置 `PAGES_BASE_PATH=/knowledge-atlas`，确保项目路径下资源正确加载。Sites 预览使用根路径。

`.github/workflows/pages.yml` 在 `main` 更新后校验内容、检查类型、构建并部署 GitHub Pages。阅读型网站无数据库、登录表单或外部运行时 API；不会在访客打开网页时访问你的私有课程仓库。

`prepare-static.mjs` 修正当前固定 Vinext 版本在项目子路径下的导出路径：请求正确的项目首页生成 HTML/RSC，并把静态资源移到 Pages 挂载目录。根路径导出保持原样。
