import { useState, useMemo, useEffect } from 'react';
import {
  Calculator, Microscope, Scroll, Globe, BookMarked, Dna, Flame, Zap, Code,
  Languages, HelpCircle, TrendingUp, Target, BookOpen, ChevronRight, Star,
  Award, BarChart3, X, Heart, Search, Grid3X3, List, LayoutGrid,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useHistoryStore, useSettingsStore } from '../store';
import Card from '../lib/components/Card';
import Button from '../lib/components/Button';
import Badge from '../lib/components/Badge';
import EmptyState from '../lib/components/EmptyState';
import { SUBJECT_REGISTRY, SUBJECT_LIST, SUBJECT_CATEGORIES, normalizeSubject as normalizeSubjectConfig } from '../config/subjects';

// ── Icon map ──
const ICON_MAP = {
  Calculator, Microscope, Scroll, Globe, BookMarked, Dna, Flame, Zap,
  Code, Languages, HelpCircle, BarChart3, Heart,
};

function getIcon(name) {
  const reg = SUBJECT_REGISTRY[name?.toLowerCase?.()];
  return (reg && ICON_MAP[reg.iconName]) || HelpCircle;
}

function getConfig(name) {
  const lower = name?.toLowerCase?.() || '';
  return SUBJECT_REGISTRY[lower]
    || Object.values(SUBJECT_REGISTRY).find(s => s.shortName.toLowerCase() === lower || s.name.toLowerCase().includes(lower))
    || { color: '#64748b', gradient: 'linear-gradient(135deg, rgba(100,116,139,0.15), rgba(100,116,139,0.05))' };
}

// ── Inject responsive CSS ──
const CSS_ID = 'subjects-page-css';
function ensureCSS() {
  if (document.getElementById(CSS_ID)) return;
  const el = document.createElement('style');
  el.id = CSS_ID;
  el.textContent = `
    /* ── GRID VIEW ── */
    .sp-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
    }
    @media (min-width: 640px)  { .sp-grid { grid-template-columns: repeat(3, 1fr); } }
    @media (min-width: 900px)  { .sp-grid { grid-template-columns: repeat(4, 1fr); gap: 14px; } }
    @media (min-width: 1200px) { .sp-grid { grid-template-columns: repeat(5, 1fr); } }

    /* ── COMPACT VIEW ── */
    .sp-compact {
      display: grid;
      grid-template-columns: 1fr;
      gap: 8px;
    }
    @media (min-width: 640px)  { .sp-compact { grid-template-columns: repeat(2, 1fr); } }
    @media (min-width: 1024px) { .sp-compact { grid-template-columns: repeat(3, 1fr); } }

    /* ── LIST VIEW ── */
    .sp-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    /* ── Scrollbar hide for tabs ── */
    .sp-tabs::-webkit-scrollbar { display: none; }
    .sp-tabs { scrollbar-width: none; }

    /* ── Hover effects ── */
    .sp-card-hover { transition: all 0.2s ease; }
    .sp-card-hover:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(0,0,0,0.3) !important;
    }
  `;
  document.head.appendChild(el);
}

export default function SubjectsPage() {
  const navigate = useNavigate();
  const onScan = (name) => {
    if (name) useSettingsStore.getState().setSetting('subject', name.toLowerCase());
    navigate('/scan');
  };

  const [expandedSubject, setExpandedSubject] = useState(null);
  const [viewMode, setViewMode] = useState(() => {
    try { return localStorage.getItem('ll-subjects-view') || 'grid'; } catch { return 'grid'; }
  });
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const sessions = useHistoryStore((s) => s.sessions);

  useEffect(() => { ensureCSS(); }, []);
  useEffect(() => {
    try { localStorage.setItem('ll-subjects-view', viewMode); } catch {}
  }, [viewMode]);

  // ── Studied subjects ──
  const { studied, totalScans, avgProgress, topSubject } = useMemo(() => {
    const grouped = {};
    sessions.forEach(s => {
      const sub = normalizeSubjectConfig(s.subject);
      (grouped[sub] ??= []).push(s);
    });
    const cards = Object.entries(grouped).map(([subject, list]) => {
      const quizzes = list.filter(s => s.quiz).map(s => {
        const c = s.quiz.questions?.filter(q => q.userAnswer === q.correct).length || 0;
        return (c / (s.quiz.questions?.length || 1)) * 100;
      });
      const progress = quizzes.length ? Math.round(quizzes.reduce((a, b) => a + b) / quizzes.length) : 0;
      let level = 'Beginner';
      if (list.length >= 10 && progress >= 80) level = 'Master';
      else if (list.length >= 5 && progress >= 60) level = 'Advanced';
      else if (list.length >= 3) level = 'Intermediate';
      return { subject, sessions: list, progress, lastStudied: new Date(list[0].timestamp), count: list.length, level };
    });
    cards.sort((a, b) => b.count - a.count);
    return {
      studied: cards,
      totalScans: cards.reduce((n, c) => n + c.count, 0),
      avgProgress: cards.length ? Math.round(cards.reduce((n, c) => n + c.progress, 0) / cards.length) : 0,
      topSubject: cards[0]?.subject || null,
    };
  }, [sessions]);

  // ── Filter explore subjects ──
  const filtered = useMemo(() =>
    SUBJECT_LIST
      .filter(s => category === 'All' || s.category === category)
      .filter(s => !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.description.toLowerCase().includes(search.toLowerCase())),
    [category, search]
  );

  const VIEW_MODES = [
    { id: 'grid', icon: LayoutGrid, label: 'Grid' },
    { id: 'compact', icon: Grid3X3, label: 'Compact' },
    { id: 'list', icon: List, label: 'List' },
  ];

  const containerClass = viewMode === 'grid' ? 'sp-grid' : viewMode === 'compact' ? 'sp-compact' : 'sp-list';

  return (
    <div style={S.page}>
      {/* ── Category tabs ── */}
      <div className="sp-tabs" style={S.tabs}>
        {['All', ...Object.keys(SUBJECT_CATEGORIES)].map(c => (
          <button key={c} style={{ ...S.tab, ...(category === c ? S.tabActive : {}) }} onClick={() => setCategory(c)}>
            {c}
          </button>
        ))}
      </div>

      {/* ── Toolbar: search + view toggle ── */}
      <div style={S.toolbar}>
        <div style={S.searchWrap}>
          <Search size={16} color="var(--text-muted)" />
          <input type="text" placeholder="Search subjects..." value={search} onChange={e => setSearch(e.target.value)} style={S.searchInput} />
          {search && <button style={S.clearBtn} onClick={() => setSearch('')}><X size={14} /></button>}
        </div>
        <div style={S.viewToggle}>
          {VIEW_MODES.map(v => {
            const VIcon = v.icon;
            return (
              <button key={v.id} style={{ ...S.vBtn, ...(viewMode === v.id ? S.vBtnActive : {}) }} onClick={() => setViewMode(v.id)} title={v.label}>
                <VIcon size={16} />
              </button>
            );
          })}
        </div>
      </div>

      {studied.length === 0 ? (
        /* ══════ EMPTY STATE ══════ */
        <>
          <EmptyState icon={BookOpen} title="Start Your Learning Journey" />
          <Button variant="primary" icon={Target} fullWidth onClick={() => onScan()} style={{ marginTop: 16, marginBottom: 24 }}>
            Start Scanning
          </Button>

          <div style={S.sectionHead}>
            <BookOpen size={18} color="var(--primary-light)" />
            <h3 style={S.sectionTitle}>Subjects to Explore</h3>
            <span style={S.sectionCount}>{filtered.length}</span>
          </div>

          <div className={containerClass}>
            {filtered.map(sub => (
              <SubjectExploreCard key={sub.id} subject={sub} view={viewMode} onClick={() => onScan(sub.shortName)} />
            ))}
          </div>
        </>
      ) : (
        /* ══════ HAS HISTORY ══════ */
        <>
          {/* Stats */}
          <div style={S.statsRow}>
            <MiniStat icon={BarChart3} label="Scans" value={totalScans} color="var(--primary-light)" />
            <MiniStat icon={TrendingUp} label="Avg Score" value={`${avgProgress}%`} color="#10b981" />
            <MiniStat icon={Star} label="Subjects" value={studied.length} color="#f59e0b" />
          </div>

          {topSubject && (
            <div style={S.topBanner}>
              <Award size={18} color="var(--accent, #f59e0b)" />
              <span style={S.topText}><strong>{topSubject}</strong> is your top subject!</span>
            </div>
          )}

          {/* Studied subjects */}
          <div className={containerClass} style={{ marginBottom: 28 }}>
            {studied.map(sub => (
              <StudiedCard
                key={sub.subject}
                data={sub}
                view={viewMode}
                expanded={expandedSubject === sub.subject}
                onToggle={() => setExpandedSubject(expandedSubject === sub.subject ? null : sub.subject)}
              />
            ))}
          </div>

          {/* Explore more */}
          {filtered.filter(s => !studied.find(c => c.subject.toLowerCase() === s.shortName.toLowerCase())).length > 0 && (
            <>
              <div style={S.sectionHead}>
                <BookOpen size={18} color="var(--primary-light)" />
                <h3 style={S.sectionTitle}>Explore More</h3>
              </div>
              <div className={containerClass}>
                {filtered
                  .filter(s => !studied.find(c => c.subject.toLowerCase() === s.shortName.toLowerCase()))
                  .map(sub => (
                    <SubjectExploreCard key={sub.id} subject={sub} view={viewMode} onClick={() => onScan(sub.shortName)} />
                  ))}
              </div>
            </>
          )}
        </>
      )}

      <div style={{ height: 24 }} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// COMPONENTS
// ═══════════════════════════════════════════════════════════

function SubjectExploreCard({ subject, view, onClick }) {
  const Icon = ICON_MAP[subject.iconName] || HelpCircle;

  if (view === 'list') {
    return (
      <div className="sp-card-hover" style={S.listRow} onClick={onClick} role="button" tabIndex={0}>
        <div style={{ ...S.iconCircle, background: `${subject.color}18`, color: subject.color }}>
          <Icon size={22} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={S.cardName}>{subject.shortName}</div>
          <div style={S.cardDesc}>{subject.tip}</div>
        </div>
        <Badge style={{ background: `${subject.color}12`, color: subject.color, fontSize: 10, flexShrink: 0 }}>{subject.category}</Badge>
        <ChevronRight size={16} color="var(--text-muted)" />
      </div>
    );
  }

  if (view === 'compact') {
    return (
      <div className="sp-card-hover" style={{ ...S.compactRow, borderLeftColor: subject.color }} onClick={onClick} role="button" tabIndex={0}>
        <div style={{ ...S.iconCircleSm, background: `${subject.color}18`, color: subject.color }}>
          <Icon size={18} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={S.cardName}>{subject.shortName}</div>
          <div style={S.cardDescSm}>{subject.description}</div>
        </div>
        <Badge style={{ background: `${subject.color}12`, color: subject.color, fontSize: 9, flexShrink: 0 }}>{subject.category}</Badge>
      </div>
    );
  }

  // Grid view
  return (
    <div className="sp-card-hover" style={S.gridCard} onClick={onClick} role="button" tabIndex={0}>
      <div style={{ ...S.iconCircleLg, background: `${subject.color}15`, color: subject.color }}>
        <Icon size={28} />
      </div>
      <div style={S.gridName}>{subject.shortName}</div>
      <div style={S.gridTip}>{subject.tip}</div>
      <div style={S.gridDesc}>{subject.description}</div>
      <Badge style={{ background: `${subject.color}12`, color: subject.color, fontSize: 10, marginTop: 4 }}>{subject.category}</Badge>
    </div>
  );
}

function StudiedCard({ data, view, expanded, onToggle }) {
  const config = getConfig(data.subject);
  const Icon = getIcon(data.subject);
  const lc = { Beginner: '#64748b', Intermediate: '#06b6d4', Advanced: '#8b5cf6', Master: '#f59e0b' };

  const ago = (d) => {
    const ms = Date.now() - d;
    if (ms < 3600000) return `${Math.floor(ms / 60000)}m ago`;
    if (ms < 86400000) return `${Math.floor(ms / 3600000)}h ago`;
    if (ms < 604800000) return `${Math.floor(ms / 86400000)}d ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (view === 'grid') {
    return (
      <div className="sp-card-hover" style={{ ...S.gridCard, borderColor: `${config.color}25` }} onClick={onToggle}>
        <div style={{ ...S.iconCircleLg, background: `${config.color}15`, color: config.color }}><Icon size={28} /></div>
        <div style={S.gridName}>{data.subject}</div>
        <div style={S.gridTip}>{data.count} scan{data.count !== 1 ? 's' : ''}</div>
        <Badge style={{ background: `${lc[data.level]}20`, color: lc[data.level] }}>{data.level}</Badge>
        <svg width="44" height="44" viewBox="0 0 44 44" style={{ margin: '4px auto 0' }}>
          <circle cx="22" cy="22" r="18" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
          <circle cx="22" cy="22" r="18" fill="none" stroke={config.color} strokeWidth="3"
            strokeDasharray={`${113 * (data.progress / 100)} 113`}
            style={{ transform: 'rotate(-90deg)', transformOrigin: 'center', transition: 'stroke-dasharray 0.8s ease' }} />
          <text x="22" y="22" textAnchor="middle" dominantBaseline="central" style={{ fontSize: 11, fontWeight: 700, fill: 'var(--text-primary)' }}>{data.progress}%</text>
        </svg>
      </div>
    );
  }

  if (view === 'compact') {
    return (
      <div className="sp-card-hover" style={{ ...S.compactRow, borderLeftColor: config.color }} onClick={onToggle}>
        <div style={{ ...S.iconCircleSm, background: `${config.color}15`, color: config.color }}><Icon size={18} /></div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={S.cardName}>{data.subject}</div>
          <div style={S.cardDescSm}>{data.count} scans · {data.progress}% · {ago(data.lastStudied)}</div>
        </div>
        <Badge style={{ background: `${lc[data.level]}20`, color: lc[data.level], fontSize: 10, flexShrink: 0 }}>{data.level}</Badge>
      </div>
    );
  }

  // List view — full detail
  return (
    <div className="sp-card-hover" style={{ ...S.listCard, borderLeftColor: config.color, background: config.gradient }}>
      <div style={S.listCardHead} onClick={onToggle}>
        <div style={{ display: 'flex', gap: 14, flex: 1, alignItems: 'center' }}>
          <div style={{ ...S.iconCircle, color: config.color, background: 'rgba(255,255,255,0.05)' }}><Icon size={26} /></div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <h3 style={S.listTitle}>{data.subject}</h3>
              <Badge style={{ background: `${lc[data.level]}20`, color: lc[data.level] }}>{data.level}</Badge>
            </div>
            <p style={S.cardDescSm}>{data.count} scan{data.count !== 1 ? 's' : ''} · Last {ago(data.lastStudied)}</p>
          </div>
        </div>
        <div style={{ color: 'var(--text-muted)', transform: expanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }}>
          <ChevronRight size={18} />
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ marginTop: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Quiz Score</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>{data.progress}%</span>
        </div>
        <div style={{ height: 6, borderRadius: 3, background: 'rgba(0,0,0,0.15)', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${data.progress}%`, background: `linear-gradient(90deg, ${config.color}, ${config.color}88)`, transition: 'width 0.8s ease' }} />
        </div>
      </div>

      {/* Expanded sessions */}
      {expanded && (
        <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {data.sessions.map((s, i) => (
            <div key={s.id} style={{ display: 'flex', gap: 10, padding: 10, background: 'rgba(0,0,0,0.12)', borderRadius: 10, alignItems: 'center' }}>
              <div style={{ ...S.sessionNum, background: `${config.color}20`, color: config.color }}>{i + 1}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                  {new Date(s.timestamp).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>
                {s.quiz && (() => {
                  const c = s.quiz.questions?.filter(q => q.userAnswer === q.correct).length || 0;
                  const t = s.quiz.questions?.length || 0;
                  return <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Quiz: {t > 0 ? Math.round((c / t) * 100) : 0}% ({c}/{t})</div>;
                })()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MiniStat({ icon: Icon, label, value, color }) {
  return (
    <div style={S.statBox}>
      <Icon size={16} color={color} />
      <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: -0.5 }}>{value}</div>
      <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 }}>{label}</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════
const S = {
  page: { padding: '16px 20px 100px', maxWidth: 1200, margin: '0 auto', width: '100%' },

  // Tabs
  tabs: { display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 6, marginBottom: 10 },
  tab: {
    padding: '7px 16px', borderRadius: 20, border: '1px solid rgba(255,255,255,0.08)',
    background: 'rgba(255,255,255,0.03)', color: 'var(--text-muted)', fontSize: 12, fontWeight: 600,
    cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap', transition: 'all 0.2s',
  },
  tabActive: { background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', color: '#a5b4fc' },

  // Toolbar
  toolbar: { display: 'flex', gap: 10, alignItems: 'center', marginBottom: 16 },
  searchWrap: {
    flex: 1, display: 'flex', alignItems: 'center', gap: 8, padding: '9px 14px',
    borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
  },
  searchInput: { flex: 1, background: 'none', border: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: 14, fontFamily: 'inherit' },
  clearBtn: { background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4, display: 'flex' },
  viewToggle: { display: 'flex', gap: 2, background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: 3, border: '1px solid rgba(255,255,255,0.08)', flexShrink: 0 },
  vBtn: { padding: 7, border: 'none', borderRadius: 8, background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', transition: 'all 0.15s' },
  vBtnActive: { background: 'rgba(99,102,241,0.2)', color: '#a5b4fc' },

  // Section header
  sectionHead: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 },
  sectionTitle: { fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: 0, flex: 1 },
  sectionCount: { fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, background: 'rgba(255,255,255,0.06)', padding: '2px 10px', borderRadius: 10 },

  // ── GRID card ──
  gridCard: {
    padding: 18, borderRadius: 14, textAlign: 'center', cursor: 'pointer',
    background: 'rgba(30,41,59,0.5)', border: '1.5px solid rgba(255,255,255,0.08)',
    backdropFilter: 'blur(12px)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
    transition: 'all 0.2s ease',
  },
  gridName: { fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' },
  gridTip: { fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.4 },
  gridDesc: { fontSize: 11, color: 'var(--text-muted)', opacity: 0.6, lineHeight: 1.3 },

  // ── COMPACT card ──
  compactRow: {
    display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 12,
    background: 'rgba(30,41,59,0.5)', border: '1px solid rgba(255,255,255,0.08)',
    borderLeft: '4px solid', cursor: 'pointer', transition: 'all 0.2s ease',
  },

  // ── LIST row (explore) ──
  listRow: {
    display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderRadius: 12,
    background: 'rgba(30,41,59,0.5)', border: '1px solid rgba(255,255,255,0.08)',
    cursor: 'pointer', transition: 'all 0.2s ease',
  },

  // ── LIST card (studied, expandable) ──
  listCard: {
    padding: 18, borderRadius: 14, border: '1px solid rgba(255,255,255,0.08)', borderLeft: '4px solid',
    cursor: 'pointer', transition: 'all 0.2s ease', background: 'rgba(30,41,59,0.5)',
  },
  listCardHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  listTitle: { fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: 0 },

  // ── Shared ──
  iconCircleLg: { width: 56, height: 56, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  iconCircle: { width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  iconCircleSm: { width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  cardName: { fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' },
  cardDesc: { fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.4 },
  cardDescSm: { fontSize: 12, color: 'var(--text-muted)' },
  sessionNum: { fontSize: 11, fontWeight: 700, width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },

  // Stats
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 },
  statBox: {
    padding: '14px 8px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
    borderRadius: 12, background: 'rgba(30,41,59,0.5)', border: '1px solid rgba(255,255,255,0.08)',
  },

  // Top banner
  topBanner: {
    display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', marginBottom: 16,
    background: 'linear-gradient(135deg, rgba(245,158,11,0.1), rgba(245,158,11,0.03))',
    border: '1px solid rgba(245,158,11,0.2)', borderRadius: 12,
  },
  topText: { fontSize: 13, color: 'var(--text-secondary)' },
};
