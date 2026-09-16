import data from '@/.generated/catalog.json';
export type Source = {
  id: string;
  label: string;
  title: string;
  name?: string;
  kind: 'course' | 'self';
  format:
    | 'course'
    | 'book'
    | 'article'
    | 'project'
    | 'repository'
    | 'video'
    | 'notes';
  term?: string;
  institution?: string;
  url?: string;
  referenceUrl?: string;
  private: boolean;
  accessNote?: string;
  order?: number;
};
export type Concept = {
  id: string;
  title: string;
  english: string;
  domain: string;
  tags: string[];
  topic: string;
  sources: string[];
  coverage: 'recorded' | 'planned';
  mastery: 'unassessed' | 'encountered' | 'explain' | 'apply' | 'transfer';
  summary: string;
  personalNote: string;
  related: string[];
  evidence: string;
  recordedAt: string;
  order?: number;
};
export const domains = data.domains;
export const sources = data.sources as Source[];
export const concepts = data.concepts as Concept[];
export const meta = data.meta;
export const sourceKinds = { course: '课程', self: '自主学习' };
export const sourceFormats = {
  course: '课程',
  book: '书籍',
  article: '文章',
  project: '项目实践',
  repository: '代码仓库',
  video: '视频',
  notes: '个人笔记',
};
export const sourceLabel = (s: Source) =>
  s.kind === 'course'
    ? `${s.institution ? `${s.institution} · ` : ''}课程`
    : `自主学习 · ${sourceFormats[s.format]}`;
export const sourceContext = (s: Source) =>
  [s.title, s.term].filter(Boolean).join(' · ');
export const courseCount = sources.filter((s) => s.kind === 'course').length;
export const selfCount = sources.filter((s) => s.kind === 'self').length;
export const startLabel = `${meta.startedAt.slice(0, 4)} 年 ${Number(meta.startedAt.slice(5))} 月`;
