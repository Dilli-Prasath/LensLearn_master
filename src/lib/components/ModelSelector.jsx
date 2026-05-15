/**
 * ModelSelector — Reusable AI model picker component
 *
 * Displays available and unavailable models with status indicators,
 * grouped by family. Supports compact (inline) and full (settings) modes.
 *
 * Usage:
 *   <ModelSelector
 *     models={availableModels}       // string[] from Ollama
 *     activeModel="gemma4:e4b"       // currently active model ID
 *     preferredModel="gemma4:e4b"    // user's preferred model ID
 *     onSelect={(modelId) => {}}     // callback when model selected
 *     connected={true}               // Ollama connection status
 *     variant="compact"              // 'compact' | 'full'
 *   />
 */
import { memo, useState, useMemo, useCallback, isValidElement, createElement } from 'react';
import {
  buildModelList, getModelById, MODEL_FAMILIES, formatModelName,
} from '../../config/models';

// ─── Compact Variant: Dropdown-style for HomePage ──────────────
function CompactSelector({ models, activeModel, preferredModel, onSelect, connected }) {
  const [open, setOpen] = useState(false);
  const { available } = useMemo(() => buildModelList(models), [models]);
  const current = getModelById(activeModel || preferredModel);
  const family = MODEL_FAMILIES[current.family] || MODEL_FAMILIES.custom;

  const handleSelect = useCallback((id) => {
    onSelect(id);
    setOpen(false);
  }, [onSelect]);

  return (
    <div style={compactStyles.wrapper}>
      <button
        style={compactStyles.trigger}
        onClick={() => setOpen(!open)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Select AI model"
      >
        <span style={{ ...compactStyles.dot, background: connected ? family.color : '#64748b' }} />
        <span style={compactStyles.modelName}>{current.name}</span>
        <span style={compactStyles.params}>{current.params}</span>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{
          transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
        }}>
          <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <>
          <div style={compactStyles.backdrop} onClick={() => setOpen(false)} />
          <div style={compactStyles.dropdown} role="listbox" aria-label="Available models">
            {available.length === 0 ? (
              <div style={compactStyles.emptyMsg}>
                No models available. Start Ollama and pull a model.
              </div>
            ) : (
              available.map((m) => {
                const isActive = m.id === activeModel;
                const fam = MODEL_FAMILIES[m.family] || MODEL_FAMILIES.custom;
                return (
                  <button
                    key={m.id}
                    role="option"
                    aria-selected={isActive}
                    style={{
                      ...compactStyles.option,
                      ...(isActive ? compactStyles.optionActive : {}),
                    }}
                    onClick={() => handleSelect(m.id)}
                  >
                    <span style={{ ...compactStyles.dot, background: fam.color }} />
                    <div style={compactStyles.optionInfo}>
                      <span style={compactStyles.optionName}>{m.name}</span>
                      <span style={compactStyles.optionDesc}>{m.params} · {m.tags.includes('recommended') ? 'Recommended' : m.description.split('.')[0]}</span>
                    </div>
                    {isActive && (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="var(--accent-main, #6366f1)">
                        <path d="M6.5 11.5L3 8l1-1 2.5 2.5L12 4l1 1-6.5 6.5z" />
                      </svg>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Accordion Section ────────────────────────────────────────
function FamilyAccordion({ familyKey, familyMeta, models, activeModel, onSelect, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen);
  const availCount = models.filter(m => m.available).length;
  const hasActive = models.some(m => m.id === activeModel);

  return (
    <div style={fullStyles.accordion}>
      <button
        style={fullStyles.accordionHeader}
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ ...fullStyles.familyDot, background: familyMeta.color }} />
          <span style={fullStyles.accordionTitle}>{familyMeta.label}</span>
          {familyMeta.badge && (
            <span style={{ ...fullStyles.recBadge, background: `${familyMeta.color}22`, color: familyMeta.color }}>
              {familyMeta.badge}
            </span>
          )}
          {hasActive && (
            <span style={fullStyles.activeBadge}>Active</span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={fullStyles.accordionCount}>
            {availCount > 0 ? `${availCount} available` : 'Not installed'}
          </span>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{
            transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          }}>
            <path d="M3.5 5.25L7 8.75L10.5 5.25" stroke="var(--text-tertiary, #64748b)"
              strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </button>

      {open && (
        <div style={fullStyles.accordionBody}>
          {models.map((m) => {
            const isActive = m.id === activeModel;
            const fam = MODEL_FAMILIES[m.family] || MODEL_FAMILIES.custom;
            if (m.available) {
              return (
                <button
                  key={m.id}
                  style={{
                    ...fullStyles.modelCard,
                    ...(isActive ? { ...fullStyles.modelCardActive, border: `1.5px solid ${fam.color}` } : {}),
                  }}
                  onClick={() => onSelect(m.id)}
                  aria-pressed={isActive}
                >
                  <div style={fullStyles.modelHeader}>
                    <div style={fullStyles.modelNameRow}>
                      <span style={{ ...fullStyles.familyDot, background: fam.color }} />
                      <span style={fullStyles.modelName}>{m.name}</span>
                    </div>
                    <div style={fullStyles.modelBadges}>
                      <span style={fullStyles.paramsBadge}>{m.params}</span>
                      {m.tags.includes('recommended') && (
                        <span style={fullStyles.recBadge}>Recommended</span>
                      )}
                      {isActive && (
                        <span style={fullStyles.activeBadge}>Active</span>
                      )}
                    </div>
                  </div>
                  <p style={fullStyles.modelDesc}>{m.description}</p>
                  <div style={fullStyles.modelTags}>
                    {m.multimodal && <span style={fullStyles.tag}>Vision</span>}
                    {m.thinking && <span style={fullStyles.tag}>Thinking</span>}
                    {m.context > 100_000 && <span style={fullStyles.tag}>{Math.round(m.context / 1000)}K ctx</span>}
                    <span style={fullStyles.tag}>{m.tier === 'low' ? 'Light' : m.tier === 'medium' ? '16GB+' : '32GB+'}</span>
                  </div>
                </button>
              );
            }
            return (
              <div key={m.id} style={fullStyles.modelCardDisabled}>
                <div style={fullStyles.modelHeader}>
                  <div style={fullStyles.modelNameRow}>
                    <span style={{ ...fullStyles.familyDot, background: fam.color, opacity: 0.5 }} />
                    <span style={{ ...fullStyles.modelName, opacity: 0.5 }}>{m.name}</span>
                  </div>
                  <span style={fullStyles.paramsBadge}>{m.params}</span>
                </div>
                <p style={{ ...fullStyles.modelDesc, opacity: 0.5 }}>{m.description}</p>
                <code style={fullStyles.pullCmd}>ollama pull {m.id}</code>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Full Variant: Card list for Settings page ─────────────────
function FullSelector({ models, activeModel, preferredModel, onSelect, connected }) {
  const { available, unavailable } = useMemo(() => buildModelList(models), [models]);

  // Group all models by family for accordion display
  const familyGroups = useMemo(() => {
    const allModels = [
      ...available.map(m => ({ ...m, available: true })),
      ...unavailable.map(m => ({ ...m, available: false })),
    ];
    const groups = {};
    for (const m of allModels) {
      const fam = m.family || 'custom';
      if (!groups[fam]) groups[fam] = [];
      // Avoid duplicates (same id)
      if (!groups[fam].some(x => x.id === m.id)) {
        groups[fam].push(m);
      }
    }
    // Sort models within each group: available first, then by priority
    for (const fam of Object.keys(groups)) {
      groups[fam].sort((a, b) => {
        if (a.available !== b.available) return a.available ? -1 : 1;
        return (a.priority || 50) - (b.priority || 50);
      });
    }
    // Define family display order: gemma4 first, then gemma3, gemini, then rest alphabetically
    const order = ['gemma4', 'gemma3', 'gemini', 'llama', 'mistral', 'phi', 'qwen', 'custom'];
    const sorted = order.filter(f => groups[f]?.length > 0);
    // Add any families not in the predefined order
    for (const f of Object.keys(groups)) {
      if (!sorted.includes(f)) sorted.push(f);
    }
    return sorted.map(f => ({ key: f, models: groups[f] }));
  }, [available, unavailable]);

  return (
    <div style={fullStyles.container}>
      {/* Connection Status */}
      <div style={fullStyles.statusRow}>
        <span style={fullStyles.statusLabel}>Status</span>
        <span style={{
          ...fullStyles.statusBadge,
          background: connected ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
          color: connected ? '#34d399' : '#f87171',
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: '50%', display: 'inline-block',
            background: connected ? '#10b981' : '#ef4444',
            marginRight: 6,
          }} />
          {connected ? 'Connected' : 'Disconnected'}
        </span>
      </div>

      {connected && activeModel && (
        <div style={fullStyles.statusRow}>
          <span style={fullStyles.statusLabel}>Active Model</span>
          <span style={fullStyles.statusValue}>{formatModelName(activeModel)}</span>
        </div>
      )}

      {/* Model Families — Accordion groups */}
      {familyGroups.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {familyGroups.map((group) => {
            const familyMeta = MODEL_FAMILIES[group.key] || MODEL_FAMILIES.custom;
            // Auto-expand Gemma 4, or the family containing the active model
            const hasActive = group.models.some(m => m.id === activeModel);
            const defaultOpen = group.key === 'gemma4' || hasActive;
            return (
              <FamilyAccordion
                key={group.key}
                familyKey={group.key}
                familyMeta={familyMeta}
                models={group.models}
                activeModel={activeModel}
                onSelect={onSelect}
                defaultOpen={defaultOpen}
              />
            );
          })}
        </div>
      )}

      {/* Help text when disconnected */}
      {!connected && (
        <div style={fullStyles.helpCard}>
          <p style={fullStyles.helpText}>No AI backend connected. You can either:</p>
          <p style={{ ...fullStyles.helpText, marginTop: 8, fontWeight: 600 }}>Option 1: Cloud AI (easiest)</p>
          <p style={{ ...fullStyles.helpText, marginTop: 4 }}>Set a Google AI API key in your environment variables.</p>
          <p style={{ ...fullStyles.helpText, marginTop: 8, fontWeight: 600 }}>Option 2: Local Ollama</p>
          <code style={fullStyles.pullCmd}>ollama serve</code>
          <p style={{ ...fullStyles.helpText, marginTop: 4 }}>Then pull a model:</p>
          <code style={fullStyles.pullCmd}>ollama pull gemma4:e4b</code>
        </div>
      )}
    </div>
  );
}

// ─── Main Export ────────────────────────────────────────────────
function ModelSelector({ variant = 'compact', ...props }) {
  if (variant === 'full') return <FullSelector {...props} />;
  return <CompactSelector {...props} />;
}

export default memo(ModelSelector);

// ─── Compact Styles ────────────────────────────────────────────
const compactStyles = {
  wrapper: { position: 'relative', display: 'inline-flex' },
  trigger: {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '6px 12px', borderRadius: 10,
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.08)',
    color: 'var(--text-primary, #f1f5f9)',
    cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 500,
    fontFamily: 'inherit',
    transition: 'all 200ms ease',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
  },
  dot: { width: 8, height: 8, borderRadius: '50%', flexShrink: 0 },
  modelName: { fontSize: '0.8125rem', fontWeight: 600 },
  params: {
    fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-tertiary, #64748b)',
    background: 'rgba(255,255,255,0.06)', padding: '1px 6px', borderRadius: 4,
  },
  backdrop: {
    position: 'fixed', inset: 0, zIndex: 99,
  },
  dropdown: {
    position: 'absolute', top: 'calc(100% + 6px)', left: 0, minWidth: 280,
    maxHeight: '60vh', overflowY: 'auto',
    background: 'var(--bg-secondary, #1e293b)',
    border: '1px solid var(--border-primary, rgba(255,255,255,0.1))',
    borderRadius: 12, padding: 4, zIndex: 100,
    boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
  },
  option: {
    display: 'flex', alignItems: 'center', gap: 10, width: '100%',
    padding: '10px 12px', border: 'none', borderRadius: 8,
    background: 'transparent', color: 'var(--text-primary, #f1f5f9)',
    cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
    transition: 'background 150ms ease',
  },
  optionActive: {
    background: 'rgba(99,102,241,0.1)',
  },
  optionInfo: { flex: 1, display: 'flex', flexDirection: 'column', gap: 2 },
  optionName: { fontSize: '0.8125rem', fontWeight: 600 },
  optionDesc: { fontSize: '0.6875rem', color: 'var(--text-tertiary, #64748b)' },
  emptyMsg: {
    padding: '16px 12px', textAlign: 'center',
    fontSize: '0.8125rem', color: 'var(--text-tertiary, #64748b)',
  },
};

// ─── Full Styles ───────────────────────────────────────────────
const fullStyles = {
  container: { display: 'flex', flexDirection: 'column', gap: 16 },
  accordion: {
    borderRadius: 12,
    border: '1px solid rgba(255,255,255,0.06)',
    background: 'rgba(255,255,255,0.02)',
    overflow: 'hidden',
  },
  accordionHeader: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    width: '100%', padding: '12px 14px',
    background: 'rgba(255,255,255,0.04)',
    border: 'none', cursor: 'pointer',
    fontFamily: 'inherit', color: 'var(--text-primary, #f1f5f9)',
    transition: 'background 150ms ease',
  },
  accordionTitle: {
    fontSize: '0.875rem', fontWeight: 700,
    color: 'var(--text-primary, #f1f5f9)',
  },
  accordionCount: {
    fontSize: '0.6875rem', fontWeight: 600,
    color: 'var(--text-tertiary, #64748b)',
  },
  accordionBody: {
    display: 'flex', flexDirection: 'column', gap: 6,
    padding: '8px 10px',
  },
  statusRow: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '10px 14px', borderRadius: 10,
    background: 'rgba(255,255,255,0.03)',
  },
  statusLabel: { fontSize: '0.8125rem', color: 'var(--text-secondary, #94a3b8)', fontWeight: 500 },
  statusBadge: {
    display: 'inline-flex', alignItems: 'center',
    padding: '3px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600,
  },
  statusValue: { fontSize: '0.8125rem', color: 'var(--text-primary, #f1f5f9)', fontWeight: 600 },
  group: { display: 'flex', flexDirection: 'column', gap: 8 },
  groupTitle: {
    margin: 0, fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase',
    letterSpacing: '0.05em', color: 'var(--text-tertiary, #64748b)',
  },
  modelGrid: { display: 'flex', flexDirection: 'column', gap: 6 },
  modelCard: {
    display: 'flex', flexDirection: 'column', gap: 8,
    padding: '12px 14px', borderRadius: 12,
    background: 'rgba(255,255,255,0.04)',
    border: '1.5px solid var(--border-primary, rgba(255,255,255,0.08))',
    cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
    transition: 'all 200ms ease',
    width: '100%',
  },
  modelCardActive: {
    background: 'rgba(99,102,241,0.08)',
    boxShadow: '0 0 0 1px rgba(99,102,241,0.3), 0 2px 8px rgba(99,102,241,0.1)',
  },
  modelCardDisabled: {
    display: 'flex', flexDirection: 'column', gap: 8,
    padding: '12px 14px', borderRadius: 12,
    background: 'rgba(255,255,255,0.02)',
    border: '1px dashed rgba(255,255,255,0.06)',
  },
  modelHeader: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
  },
  modelNameRow: { display: 'flex', alignItems: 'center', gap: 8 },
  familyDot: { width: 10, height: 10, borderRadius: '50%', flexShrink: 0 },
  modelName: { fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary, #f1f5f9)' },
  modelBadges: { display: 'flex', alignItems: 'center', gap: 6 },
  paramsBadge: {
    fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-tertiary, #64748b)',
    background: 'rgba(255,255,255,0.06)', padding: '2px 8px', borderRadius: 6,
  },
  recBadge: {
    fontSize: '0.625rem', fontWeight: 700, color: '#6366f1',
    background: 'rgba(99,102,241,0.15)', padding: '2px 8px', borderRadius: 6,
  },
  activeBadge: {
    fontSize: '0.625rem', fontWeight: 700, color: '#34d399',
    background: 'rgba(16,185,129,0.15)', padding: '2px 8px', borderRadius: 6,
  },
  modelDesc: {
    margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary, #94a3b8)', lineHeight: 1.4,
  },
  modelTags: { display: 'flex', flexWrap: 'wrap', gap: 4 },
  tag: {
    fontSize: '0.625rem', fontWeight: 600, padding: '2px 6px', borderRadius: 4,
    background: 'rgba(255,255,255,0.06)', color: 'var(--text-tertiary, #64748b)',
  },
  pullCmd: {
    display: 'block', fontSize: '0.75rem', fontFamily: 'monospace',
    background: 'rgba(0,0,0,0.3)', color: 'var(--text-secondary, #94a3b8)',
    padding: '6px 10px', borderRadius: 6, marginTop: 4,
    wordBreak: 'break-all',
  },
  helpCard: {
    padding: '16px', borderRadius: 12,
    background: 'rgba(255,255,255,0.03)',
    border: '1px dashed rgba(255,255,255,0.08)',
  },
  helpText: {
    margin: 0, fontSize: '0.8125rem', color: 'var(--text-secondary, #94a3b8)',
  },
};
