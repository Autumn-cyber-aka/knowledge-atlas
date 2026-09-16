'use client';
import { ArrowUpRight, BookOpen, GraduationCap } from 'lucide-react';
import { sources, concepts } from '@/lib/catalog';

export function CourseOverview({
  onSelect,
}: {
  onSelect: (id: string) => void;
}) {
  return (
    <div className="course-overview">
      {(['course', 'self'] as const).map((kind) => {
        const group = sources.filter((s) => s.kind === kind);
        if (!group.length) return null;
        return (
          <section
            key={kind}
            aria-label={kind === 'course' ? '课程' : '自主学习'}
          >
            <div className="course-section-heading">
              <h2>{kind === 'course' ? '我的课程' : '自主学习'}</h2>
              <span>{group.length} 个学习模块</span>
            </div>
            <div className="course-block-grid">
              {group.map((s) => {
                const entries = concepts.filter((c) =>
                  c.sources.includes(s.id),
                );
                const recorded = entries.filter(
                  (c) => c.coverage === 'recorded',
                );
                const topics = [...new Set(recorded.map((c) => c.topic))];
                return (
                  <button
                    type="button"
                    className="course-block"
                    key={s.id}
                    onClick={() => onSelect(s.id)}
                  >
                    <div className="course-block-meta">
                      <span>
                        {kind === 'course' ? (
                          <GraduationCap size={18} />
                        ) : (
                          <BookOpen size={18} />
                        )}{' '}
                        {s.label}
                      </span>
                      <span>{s.term}</span>
                    </div>
                    <h3>{s.title}</h3>
                    {s.name && <p>{s.name}</p>}
                    <div className="course-topic-preview">
                      {topics.slice(0, 4).map((topic) => (
                        <span key={topic}>{topic}</span>
                      ))}
                      {topics.length > 4 && (
                        <span>+{topics.length - 4} 个主题</span>
                      )}
                      {!topics.length && <span>知识点待补充</span>}
                    </div>
                    <div className="course-block-footer">
                      <span>
                        {recorded.length} 个已收录知识点
                        {entries.length > recorded.length
                          ? ` · ${entries.length - recorded.length} 个后续主题`
                          : ''}
                      </span>
                      <span>
                        进入学习模块 <ArrowUpRight size={16} />
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
