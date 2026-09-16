'use client';

import Link from 'next/link';
import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from 'react';
import {
  ArrowDownRight,
  ArrowUpRight,
  BookOpen,
  Check,
  CircleDashed,
  Code2,
  GitBranch,
  GraduationCap,
  Layers3,
  List,
  Network,
  Search,
  X,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import {
  domains,
  sources,
  concepts as allConcepts,
  meta,
  courseCount,
  selfCount,
  startLabel,
  type Concept,
} from '@/lib/catalog';
import { SourceCatalog } from '@/components/atlas/source-catalog';
import { SourceReference } from '@/components/atlas/source-reference';

const domainById = new Map(domains.map((d) => [d.id, d]));
const conceptById = new Map(allConcepts.map((c) => [c.id, c]));
const masteryLabels: Record<string, string> = {
  unassessed: '待自评',
  encountered: '接触过',
  explain: '能解释',
  apply: '能应用',
  transfer: '能迁移',
};
const recorded = allConcepts.filter((c) => c.coverage === 'recorded');
const selectedSources = [
  { value: 'all', label: '全部学习来源' },
  { value: 'course', label: '课程学习' },
  { value: 'self', label: '自主学习' },
  ...sources.map((s) => ({ value: s.id, label: s.label })),
];
const connected = (a: Concept, b: Concept) =>
  a.related.includes(b.id) || b.related.includes(a.id);

function KnowledgeMap({
  concepts,
  onOpen,
}: {
  concepts: Concept[];
  onOpen: (c: Concept) => void;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [paths, setPaths] = useState<
    { id: string; d: string; from: string; to: string }[]
  >([]);
  const [focus, setFocus] = useState<string | null>(null);
  const visibleDomains = domains.filter((d) =>
    concepts.some((c) => c.domain === d.id),
  );
  useLayoutEffect(() => {
    const root = mapRef.current;
    if (!root) return;
    function draw() {
      if (!root) return;
      const bounds = root.getBoundingClientRect();
      const edges: typeof paths = [];
      const seen = new Set<string>();
      concepts.forEach((c) =>
        c.related.forEach((id) => {
          if (!concepts.some((n) => n.id === id)) return;
          const key = [c.id, id].sort().join(':');
          if (seen.has(key)) return;
          seen.add(key);
          const a = root.querySelector<HTMLElement>(`[data-node="${c.id}"]`);
          const b = root.querySelector<HTMLElement>(`[data-node="${id}"]`);
          if (!a || !b) return;
          const ar = a.getBoundingClientRect(),
            br = b.getBoundingClientRect();
          let ax = ar.right - bounds.left,
            ay = ar.top + ar.height / 2 - bounds.top,
            bx = br.left - bounds.left,
            by = br.top + br.height / 2 - bounds.top;
          if (Math.abs(ar.left - br.left) < 5) {
            ax = ar.left - bounds.left + ar.width / 2;
            bx = ax;
            ay = ar.bottom - bounds.top;
            by = br.top - bounds.top;
            edges.push({
              id: key,
              from: c.id,
              to: id,
              d: `M${ax},${ay} L${bx},${by}`,
            });
          } else {
            if (ar.left > br.left) {
              ax = ar.left - bounds.left;
              bx = br.right - bounds.left;
            }
            const mid = (ax + bx) / 2;
            edges.push({
              id: key,
              from: c.id,
              to: id,
              d: `M${ax},${ay} C${mid},${ay} ${mid},${by} ${bx},${by}`,
            });
          }
        }),
      );
      setPaths(edges);
    }
    draw();
    const resize = new ResizeObserver(draw);
    resize.observe(root);
    return () => resize.disconnect();
  }, [concepts]);
  return (
    <div
      ref={mapRef}
      className="knowledge-map"
      style={
        { '--columns': Math.min(5, visibleDomains.length) } as CSSProperties
      }
    >
      <svg className="connections" aria-hidden="true">
        {paths.map((p) => (
          <path
            key={p.id}
            d={p.d}
            className={
              focus && (p.from === focus || p.to === focus) ? 'lit' : ''
            }
          />
        ))}
      </svg>
      {visibleDomains.map((d, i) => (
        <section
          className="domain-column"
          key={d.id}
          style={{ '--domain-color': d.color } as CSSProperties}
        >
          <div className="domain-heading">
            <span className="domain-index">
              0{domains.findIndex((v) => v.id === d.id) + 1}
            </span>
            <div>
              <h3>{d.name}</h3>
              <span>{d.english}</span>
            </div>
            <span className="domain-count">
              {concepts.filter((c) => c.domain === d.id).length}
            </span>
          </div>
          <div
            className="domain-nodes"
            style={
              { '--offset': `${[15, 62, 0, 45, 15][i]}px` } as CSSProperties
            }
          >
            {concepts
              .filter((c) => c.domain === d.id)
              .map((c) => (
                <button
                  type="button"
                  key={c.id}
                  data-node={c.id}
                  className={`concept-node ${c.coverage === 'planned' ? 'is-planned' : ''} ${focus === c.id ? 'is-focused' : ''} ${focus && connected(c, conceptById.get(focus)!) ? 'is-related' : ''}`}
                  onClick={() => onOpen(c)}
                  onMouseEnter={() => setFocus(c.id)}
                  onMouseLeave={() => setFocus(null)}
                  onFocus={() => setFocus(c.id)}
                  onBlur={() => setFocus(null)}
                  aria-label={`${c.title}，${c.coverage === 'planned' ? '后续主题' : '已收录'}，查看详情`}
                >
                  <div className="node-top">
                    <span className="node-dot" />
                    <span>{c.topic}</span>
                    <ArrowUpRight size={14} />
                  </div>
                  <h4>{c.title}</h4>
                  <p>{c.english}</p>
                  <div className="node-foot">
                    <span>
                      {sources.find((s) => s.id === c.sources[0])?.label ||
                        '自主学习'}
                    </span>
                    {c.coverage === 'planned' ? (
                      <CircleDashed size={13} />
                    ) : (
                      <span className="tiny-line" />
                    )}
                  </div>
                </button>
              ))}
          </div>
        </section>
      ))}
    </div>
  );
}

export default function Home() {
  const [tab, setTab] = useState('map');
  const [domain, setDomain] = useState('all');
  const [source, setSource] = useState('all');
  const [query, setQuery] = useState('');
  const [includePlanned, setIncludePlanned] = useState(false);
  const [detail, setDetail] = useState<Concept | null>(null);
  useEffect(() => {
    const readHash = () => {
      const id = window.location.hash.replace('#concept/', '');
      setDetail(conceptById.get(id) || null);
    };
    readHash();
    window.addEventListener('hashchange', readHash);
    return () => window.removeEventListener('hashchange', readHash);
  }, []);
  const openConcept = (c: Concept) => {
    setDetail(c);
    window.history.replaceState(
      null,
      '',
      `${window.location.pathname}${window.location.search}#concept/${c.id}`,
    );
  };
  const closeConcept = () => {
    setDetail(null);
    window.history.replaceState(
      null,
      '',
      `${window.location.pathname}${window.location.search}`,
    );
  };
  const filtered = useMemo(
    () =>
      allConcepts.filter((c) => {
        const sourceMatch =
          source === 'all' ||
          (source === 'course' &&
            c.sources.some((id) =>
              sources.some((s) => s.id === id && s.kind === 'course'),
            )) ||
          (source === 'self' &&
            c.sources.some((id) =>
              sources.some((s) => s.id === id && s.kind === 'self'),
            )) ||
          c.sources.includes(source);
        return (
          (includePlanned || c.coverage === 'recorded') &&
          (domain === 'all' ||
            c.domain === domain ||
            c.tags.includes(domain)) &&
          sourceMatch &&
          `${c.title} ${c.english} ${c.topic}`
            .toLowerCase()
            .includes(query.toLowerCase().trim())
        );
      }),
    [domain, source, includePlanned, query],
  );
  const clear = () => {
    setDomain('all');
    setSource('all');
    setQuery('');
    setIncludePlanned(false);
  };
  const filterSource = (id: string) => {
    setSource(id);
    setDomain('all');
    setQuery('');
    setTab('map');
  };
  const detailDomain = detail ? domainById.get(detail.domain) : null;
  const related = detail
    ? allConcepts.filter((c) => c.id !== detail.id && connected(detail, c))
    : [];

  return (
    <main className="atlas-shell">
      <header className="topbar">
        <Link className="wordmark" href="/" aria-label="知识图谱首页">
          <Network size={23} strokeWidth={1.6} /> ATLAS<span>/ Jianchen</span>
        </Link>
        <div className="top-right">
          <span className="edition">个人知识档案 · 持续积累</span>
          <a
            href="https://github.com/Autumn-cyber-aka/knowledge-atlas"
            target="_blank"
            rel="noreferrer"
          >
            GitHub <ArrowUpRight size={16} />
          </a>
        </div>
      </header>
      <section className="page-heading">
        <div>
          <p className="eyebrow">PERSONAL KNOWLEDGE ATLAS</p>
          <h1>
            我的知识图谱<span>.</span>
          </h1>
          <p>从课程到自学，把知识连接成自己的体系。</p>
        </div>
        <div className="date-stamp">
          SINCE <strong>{meta.startedAt.replace('-', '.')}</strong>
          <span>从这里开始，逐步生长</span>
        </div>
      </section>
      <div className="scope-note">
        <span className="scope-dot" />
        <span>
          记录始于 <strong>{startLabel}</strong>，此前的学习经历后续补充。
        </span>
        <span className="scope-secondary">
          已收录 ≠ 已掌握 · 掌握程度待自评
        </span>
      </div>
      <Tabs
        value={tab}
        onValueChange={(v) => setTab(String(v))}
        className="atlas-tabs"
      >
        <div className="view-bar">
          <TabsList
            variant="line"
            className="view-tabs"
            aria-label="知识浏览方式"
          >
            <TabsTrigger value="map">
              <Network />
              知识地图
            </TabsTrigger>
            <TabsTrigger value="list">
              <List />
              知识点目录
            </TabsTrigger>
            <TabsTrigger value="sources">
              <BookOpen />
              学习来源
            </TabsTrigger>
          </TabsList>
          <div className="totals">
            <strong>{recorded.length}</strong> 个已收录知识点<span>/</span>
            <strong>{courseCount}</strong> 门课程
            {selfCount > 0 && (
              <>
                <span>/</span>
                <strong>{selfCount}</strong> 个自学来源
              </>
            )}
          </div>
        </div>
        {tab !== 'sources' && (
          <section className="filters" aria-label="筛选知识点">
            <div className="domain-filters">
              <button
                type="button"
                onClick={() => setDomain('all')}
                aria-pressed={domain === 'all'}
              >
                <Layers3 size={15} />
                全部领域
              </button>
              {domains.map((d) => (
                <button
                  type="button"
                  key={d.id}
                  onClick={() => setDomain(d.id)}
                  aria-pressed={domain === d.id}
                >
                  <span
                    className="filter-dot"
                    style={{ background: d.color }}
                  />
                  {d.name}
                </button>
              ))}
            </div>
            <div className="filter-row">
              <div className="search-field">
                <Search size={17} />
                <Input
                  aria-label="搜索知识点"
                  placeholder="搜索知识点 / Search concepts"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                {query && (
                  <button
                    type="button"
                    aria-label="清空搜索"
                    onClick={() => setQuery('')}
                  >
                    <X size={15} />
                  </button>
                )}
              </div>
              <Select
                value={source}
                onValueChange={(v) => setSource(v || 'all')}
                items={selectedSources}
              >
                <SelectTrigger
                  className="source-picker"
                  aria-label="按学习来源筛选"
                >
                  <GraduationCap size={17} />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {selectedSources.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <label className="planned-toggle" htmlFor="include-planned">
                <Switch
                  id="include-planned"
                  checked={includePlanned}
                  onCheckedChange={setIncludePlanned}
                  aria-label="包含后续课程主题"
                />
                包含后续主题
              </label>
            </div>
          </section>
        )}
        <TabsContent value="map">
          <section className="map-surface">
            <div className="surface-header">
              <div>
                <span className="eyebrow">THE CONNECTIONS</span>
                <h2>
                  {domain === 'all'
                    ? '知识在这里相遇'
                    : domainById.get(domain)?.name}
                </h2>
              </div>
              <span className="surface-hint">
                <GitBranch size={15} />
                连线表示知识关联，不代表先修要求
              </span>
            </div>
            {filtered.length ? (
              <KnowledgeMap concepts={filtered} onOpen={openConcept} />
            ) : (
              <EmptyResults
                self={source === 'self' && selfCount === 0}
                clear={clear}
              />
            )}
            <div className="surface-footer">
              <span aria-live="polite">显示 {filtered.length} 个知识点</span>
              <span>
                点击查看概念与来源 <ArrowDownRight size={14} />
              </span>
            </div>
          </section>
        </TabsContent>
        <TabsContent value="list">
          <section className="directory">
            {filtered.length ? (
              domains.map((d) => {
                const group = filtered.filter((c) => c.domain === d.id);
                return group.length ? (
                  <section key={d.id} className="directory-group">
                    <div className="directory-heading">
                      <span
                        className="filter-dot"
                        style={{ background: d.color }}
                      />
                      <h2>{d.name}</h2>
                      <span>{group.length}</span>
                    </div>
                    {group.map((c) => (
                      <button
                        type="button"
                        className="directory-row"
                        key={c.id}
                        onClick={() => openConcept(c)}
                      >
                        <div>
                          <h3>{c.title}</h3>
                          <span>{c.english}</span>
                        </div>
                        <span className="row-topic">{c.topic}</span>
                        <span className="row-source">
                          {c.sources
                            .map(
                              (id) => sources.find((s) => s.id === id)?.label,
                            )
                            .join(' / ')}
                        </span>
                        <span className={`coverage ${c.coverage}`}>
                          {c.coverage === 'planned' ? '后续主题' : '已收录'}
                        </span>
                        <ArrowUpRight size={17} />
                      </button>
                    ))}
                  </section>
                ) : null;
              })
            ) : (
              <EmptyResults
                self={source === 'self' && selfCount === 0}
                clear={clear}
              />
            )}
            <div className="surface-footer" aria-live="polite">
              显示 {filtered.length} 个知识点
            </div>
          </section>
        </TabsContent>
        <TabsContent value="sources">
          <SourceCatalog
            sources={sources}
            concepts={allConcepts}
            onSelect={filterSource}
          />
        </TabsContent>
      </Tabs>
      <footer>
        <div>
          <Network size={15} />
          <span>Jianchen’s Learning Atlas</span>
        </div>
        <span>{meta.scope}</span>
        <span>更新于 {meta.updatedAt.replaceAll('-', '.')}</span>
      </footer>
      <Sheet
        open={!!detail}
        onOpenChange={(open) => {
          if (!open) closeConcept();
        }}
      >
        <SheetContent
          className="concept-sheet"
          aria-describedby="concept-description"
        >
          {detail && (
            <>
              <SheetHeader className="detail-header">
                <div
                  className="detail-domain"
                  style={{ color: detailDomain?.color }}
                >
                  <span
                    className="filter-dot"
                    style={{ background: detailDomain?.color }}
                  />
                  {detailDomain?.name} / {detail.topic}
                </div>
                <SheetTitle className="detail-title">{detail.title}</SheetTitle>
                <SheetDescription
                  id="concept-description"
                  className="detail-english"
                >
                  {detail.english}
                </SheetDescription>
                <div className="detail-badges">
                  <span className={`coverage ${detail.coverage}`}>
                    {detail.coverage === 'planned' ? '后续主题' : '已收录'}
                  </span>
                  <span className="mastery-badge">
                    <CircleDashed size={14} />
                    {masteryLabels[detail.mastery]}
                  </span>
                </div>
              </SheetHeader>
              <div className="detail-body">
                <section>
                  <h3>概念摘要</h3>
                  <p>{detail.summary || '概念摘要待补充。'}</p>
                </section>
                <section>
                  <h3>我的理解</h3>
                  <p className={detail.personalNote ? '' : 'unwritten'}>
                    {detail.personalNote ||
                      '还没有添加个人笔记。等真正理解或用过后，在这里留下自己的解释。'}
                  </p>
                </section>
                <section>
                  <h3>学习来源</h3>
                  {detail.sources.map((id) => {
                    const s = sources.find((v) => v.id === id);
                    return s ? <SourceReference key={id} source={s} /> : null;
                  })}
                  <p className="detail-note">{detail.evidence}</p>
                  {detail.sources.some(
                    (id) => sources.find((s) => s.id === id)?.private,
                  ) && (
                    <p className="detail-note">
                      部分来源为私有资料，访问需相应权限。
                    </p>
                  )}
                </section>
                <section>
                  <h3>
                    关联知识 <span>{related.length}</span>
                  </h3>
                  <div className="related-concepts">
                    {related.map((c) => (
                      <button
                        type="button"
                        key={c.id}
                        onClick={() => openConcept(c)}
                      >
                        <span
                          className="filter-dot"
                          style={{
                            background: domainById.get(c.domain)?.color,
                          }}
                        />
                        {c.title}
                        {c.coverage === 'planned' && <small>后续</small>}
                        <ArrowUpRight size={14} />
                      </button>
                    ))}
                  </div>
                </section>
                <div className="detail-bottom">
                  <Check size={14} />
                  <span>
                    收录于 {detail.recordedAt} · 概念摘要由 AI
                    辅助整理，掌握程度由本人确认。
                  </span>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </main>
  );
}
function EmptyResults({ self, clear }: { self: boolean; clear: () => void }) {
  return (
    <div className="empty-results">
      <Code2 size={30} strokeWidth={1.4} />
      <h3>{self ? '自学的部分，慢慢补上。' : '没有找到匹配的知识点'}</h3>
      <p>
        {self
          ? '目前还没有收录自主学习来源。新的书籍、文章与项目可以随时加入。'
          : '试试其他关键词、学习来源，或打开后续主题。'}
      </p>
      <button type="button" onClick={clear}>
        返回全部知识点 <ArrowUpRight size={16} />
      </button>
    </div>
  );
}
