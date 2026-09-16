'use client';
import {
  ArrowUpRight,
  ExternalLink,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import { sourceLabel, type Source, type Concept } from '@/lib/catalog';
export function SourceCatalog({
  sources,
  concepts,
  onSelect,
}: {
  sources: Source[];
  concepts: Concept[];
  onSelect: (id: string) => void;
}) {
  const hasSelf = sources.some((s) => s.kind === 'self');
  return (
    <section className="sources-view">
      <div className="source-intro">
        <div>
          <p className="eyebrow">WHERE IT STARTED</p>
          <h2>不同来源，同一张地图。</h2>
          <p>每加入一门课程、一本书或一个项目，都能接入已有的知识。</p>
        </div>
        <span className="term-chip">{sources.length} 个学习来源</span>
      </div>
      <div className="source-grid">
        {sources.map((s, i) => (
          <article className="source-card" key={s.id}>
            <div className="source-card-top">
              <span className="source-number">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="course-tag">
                {s.kind === 'course' ? (
                  <GraduationCap size={14} />
                ) : (
                  <Sparkles size={14} />
                )}{' '}
                {sourceLabel(s)}
              </span>
            </div>
            <p className="source-code">
              {s.label}
              {s.term ? ` / ${s.term}` : ''}
            </p>
            <h3>{s.title}</h3>
            {s.name && <p className="source-name">{s.name}</p>}
            <div className="source-stats">
              <span>
                <strong>
                  {
                    concepts.filter(
                      (c) =>
                        c.sources.includes(s.id) && c.coverage === 'recorded',
                    ).length
                  }
                </strong>{' '}
                已收录
              </span>
              <span>
                {
                  concepts.filter(
                    (c) => c.sources.includes(s.id) && c.coverage === 'planned',
                  ).length
                }{' '}
                后续主题
              </span>
            </div>
            <div className="source-actions">
              <button type="button" onClick={() => onSelect(s.id)}>
                在图谱中查看 <ArrowUpRight size={16} />
              </button>
              {s.url && (
                <a
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`打开 ${s.label} 的学习来源`}
                >
                  {s.format === 'repository' || s.url.includes('github.com/')
                    ? '来源仓库'
                    : '查看来源'}{' '}
                  <ExternalLink size={14} />
                </a>
              )}
            </div>
            {s.private && (
              <span className="private-note">
                {s.accessNote || '私有来源 · 需要相应访问权限'}
              </span>
            )}
          </article>
        ))}
        {!hasSelf && (
          <article className="self-study-card">
            <div className="self-icon">
              <Sparkles size={23} strokeWidth={1.5} />
            </div>
            <div>
              <p className="eyebrow">SELF-DIRECTED LEARNING</p>
              <h3>给好奇心留一个位置。</h3>
              <p>书籍、文章、在线课程与项目实践，都可以成为新的学习来源。</p>
              <span>暂无自学记录，后续持续补充。</span>
            </div>
          </article>
        )}
      </div>
    </section>
  );
}
