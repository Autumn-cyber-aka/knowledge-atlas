# 可持续扩展的知识图谱

## 三层结构

```text
独立内容条目 → 统一校验与汇总 → 地图 / 目录 / 学习来源
content/       scripts/atlas/   app/ + components/atlas/
```

- **内容层**：一个概念或来源一个 JSON。课程随学期增加，自学来源随兴趣增加；概念不按课程复制。
- **目录层**：自动发现条目，检查引用，生成确定顺序的目录。开发时监听内容变化，构建和检查时重新生成。错误内容会阻止构建；开发时保留上一次有效目录并提示错误。
- **展示层**：读取统一目录。增加内容不用修改界面；以后增加时间线等视图，也复用同一份内容。

## 增长规则

先从四门课程起步。以后学习一本书、一个项目或新的课程，添加来源；碰到已有概念就增加来源和理解，碰到新概念再创建节点。`related` 连接主题相关的概念，并不声明官方先修关系。

例如“条件概率”已经来自随机过程课，自学资料再次涉及它时，更新原条目的 `sources` 数组即可。原始收录日期和本人掌握状态不会因此改变。

## 内容契约（schemaVersion 1）

**来源**：`id`、`label`、`title`、`kind`（course/self）、`format`、`private` 必填。`format` 支持 course、book、article、project、repository、video、notes。`url`、`referenceUrl`、`institution`、`term`、`accessNote` 为可选信息；没有网址的来源仍可收录。

**概念**：`id`、`title`、`english`、`domain`、`tags`、`topic`、`sources`、`coverage`、`mastery`、`summary`、`personalNote`、`related`、`evidence`、`recordedAt`。文本笔记可以为空；来源至少一个。五个领域 ID 是 math、statistics、cs、engineering、ai。

**顺序**：可选 `order` 决定展示顺序，之后按 ID 排序。文件名必须等于 ID；ID 使用小写字母、数字和连字符，避免重命名破坏引用。

**状态**：收录、来源、掌握程度互相独立。新增知识点只代表收录；时间流逝和新增来源都不自动提升掌握状态。内容起点固定为 2026-09。

## 以后怎样加能力

- 新课程/书/项目：只添加来源条目与所需概念。
- 新视图：读取 `lib/catalog.ts`，不另存一套内容。
- 新字段或来源类型：先更新目录校验和类型，再适配展示；有不兼容结构变更时明确迁移与 schemaVersion。
- 新导入器：生成待审阅条目，复用校验；不得自动宣称学习完成或掌握。

`pnpm atlas:new` 提供安全的新建入口，`pnpm check` 校验全库，`pnpm test` 验证跨学期、自学扩展和引用安全。提交后现有 GitHub Pages 流程自动发布。
