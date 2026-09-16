import { ArrowUpRight, BookOpen } from 'lucide-react';
import { sourceContext, type Source } from '@/lib/catalog';
export function SourceReference({ source }: { source: Source }) {
  const content = (
    <>
      <BookOpen size={18} />
      <div>
        <strong>{source.label}</strong>
        <span>{sourceContext(source)}</span>
      </div>
    </>
  );
  const url = source.referenceUrl || source.url;
  return url ? (
    <a className="detail-source" href={url} target="_blank" rel="noreferrer">
      {content}
      <ArrowUpRight size={17} />
    </a>
  ) : (
    <div className="detail-source">{content}</div>
  );
}
