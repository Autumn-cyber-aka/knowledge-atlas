# Jianchen · 个人知识图谱

从 **2026 年 9 月** 开始，记录哥大课程与自主学习中的知识点、学习来源和关联。此前的学习经历以后补充。

## 浏览网站

- **课程与自学**：首页先展示独立学习模块，进入课程后按主题浏览知识点，可返回总览。
- **知识地图**：按数学基础、概率与统计、计算机基础、编程与工程、机器学习与 AI 浏览，点击知识点查看概念和来源。
- **知识点目录**：用列表查找条目；支持中英文搜索、领域与学习来源筛选。
- **学习来源**：课程仓库作为来源链接，不复制 Lecture、课件或作业。
- **后续主题**：课程大纲中尚待学习或确认的主题，默认隐藏。

首批来源为 2026 Fall 的 COMS3134、COMS3261、COMS6998（LLM）和 STAT4207。按本人要求排除 STAT4205。

**已收录不代表已学会。** 首批内容由 AI 根据现有课程仓库的大纲与摘要整理；掌握程度均为 `unassessed`，个人理解留空。知识关联是编辑整理的主题关系，不是官方先修要求。不要依据日期自动提升学习状态。

## 更新内容

内容按条目独立保存，界面自动汇总。后续添加课程、书、文章或项目，无需修改页面代码。

| 路径 | 用途 |
| --- | --- |
| `content/concepts/<id>.json` | 每个知识点一份，持续补充理解与关联 |
| `content/sources/<id>.json` | 每个课程或自学来源一份 |
| `content/domains.json` | 固定的五个领域 |
| `content/meta.json` | 记录起点、更新日期和内容版本 |
| `.generated/catalog.json` | 自动生成，勿手改、不提交 |

### 逐步积累

1. 新增学习来源，比如一本自学书（以下仅为操作示例）：

```sh
pnpm atlas:new source --id example-book --title "我的自学书" --kind self --format book
```

2. 先搜索现有知识点。已有的概念，只需在其 `sources` 数组增加 `example-book`，再补充个人笔记；不要重复创建。
3. 确实是新概念时创建条目：

```sh
pnpm atlas:new concept --id example-concept --title "新概念" --domain math --source example-book
```

4. 编辑生成的 JSON，补充摘要、关联和本人理解；更新 `content/meta.json` 的 `updatedAt`，运行 `pnpm check`。

新增课程使用 `--kind course --format course --term "2027 Spring" --institution "哥大" --url <课程仓库地址>`；私有来源加 `--private`。书或个人笔记可以没有网址。完整选项见 `pnpm atlas:new --help`。

每个条目有稳定且唯一的 `id`，`related` 填其他知识点 ID，跨领域归属放入 `tags`。课程与自学是来源类别，不是领域；同一知识点可以同时来自二者。课程、学期、来源数量与自学入口由数据自动汇总。

新增命令不会覆盖已有条目，也不会发布网站。它让掌握状态保持 `unassessed`，摘要和个人理解留空。手动添加 JSON 同样支持；校验会检查 ID、来源、知识关联和日期。

详见 [扩展设计](docs/architecture.md)。

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
pnpm test
pnpm build
```

界面使用 React、Vinext 与 Shadcn。静态输出目录为 `dist/client/`；GitHub Pages 工作流设置 `PAGES_BASE_PATH=/knowledge-atlas`，确保项目路径下资源正确加载。Sites 预览使用根路径。

`.github/workflows/pages.yml` 在 `main` 更新后校验内容、检查类型、运行扩展测试、构建并部署 GitHub Pages。阅读型网站无数据库、登录表单或外部运行时 API；不会在访客打开网页时访问你的私有课程仓库。

`prepare-static.mjs` 修正当前固定 Vinext 版本在项目子路径下的导出路径：请求正确的项目首页生成 HTML/RSC，并把静态资源移到 Pages 挂载目录。根路径导出保持原样。
