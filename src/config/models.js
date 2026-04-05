/**
 * AI Model Registry — Single source of truth for all supported models
 *
 * Future-proof: To add a new model, just add an entry to MODEL_REGISTRY.
 * Everything else (UI, service, store) picks it up automatically.
 *
 * Each model entry contains:
 *   - id: Ollama model tag (used in API calls)
 *   - name: Human-friendly display name
 *   - family: Model family for grouping (e.g., 'gemma4', 'gemma3')
 *   - params: Parameter count string
 *   - description: Short capability description
 *   - tags: Feature tags for filtering
 *   - context: Max context window size
 *   - multimodal: Whether the model supports image input
 *   - thinking: Whether the model supports thinking/reasoning mode
 *   - tier: Device tier recommendation ('low', 'medium', 'high')
 *   - priority: Auto-selection priority (lower = preferred)
 */

export const MODEL_FAMILIES = {
  gemma4: { label: 'Gemma 4', color: '#6366f1', badge: 'Latest' },
  gemma3: { label: 'Gemma 3', color: '#8b5cf6', badge: null },
  llama:  { label: 'Llama',   color: '#f59e0b', badge: null },
  mistral:{ label: 'Mistral', color: '#06b6d4', badge: null },
  phi:    { label: 'Phi',     color: '#10b981', badge: null },
  qwen:   { label: 'Qwen',   color: '#ef4444', badge: null },
  custom: { label: 'Other',   color: '#64748b', badge: null },
};

export const MODEL_REGISTRY = [
  // ─── Gemma 4 Family ───
  {
    id: 'gemma4:e2b',
    name: 'Gemma 4 E2B',
    family: 'gemma4',
    params: '2B',
    description: 'Fastest on-device model. Great for quick explanations.',
    tags: ['fast', 'on-device', 'multimodal'],
    context: 128_000,
    multimodal: true,
    thinking: true,
    tier: 'low',
    priority: 2,
  },
  {
    id: 'gemma4:e4b',
    name: 'Gemma 4 E4B',
    family: 'gemma4',
    params: '4B',
    description: 'Best balance of speed and quality. Recommended for most devices.',
    tags: ['balanced', 'on-device', 'multimodal', 'recommended'],
    context: 128_000,
    multimodal: true,
    thinking: true,
    tier: 'low',
    priority: 1,
  },
  {
    id: 'gemma4:27b',
    name: 'Gemma 4 27B MoE',
    family: 'gemma4',
    params: '27B',
    description: 'High-quality with optimized latency. Needs 16GB+ RAM.',
    tags: ['quality', 'moe', 'multimodal'],
    context: 256_000,
    multimodal: true,
    thinking: true,
    tier: 'medium',
    priority: 3,
  },
  {
    id: 'gemma4:12b',
    name: 'Gemma 4 12B',
    family: 'gemma4',
    params: '12B',
    description: 'Dense model with excellent quality. Needs 16GB+ RAM.',
    tags: ['quality', 'dense', 'multimodal'],
    context: 256_000,
    multimodal: true,
    thinking: true,
    tier: 'medium',
    priority: 4,
  },
  // ─── Gemma 3 Family (Fallback) ───
  {
    id: 'gemma3:4b',
    name: 'Gemma 3 4B',
    family: 'gemma3',
    params: '4B',
    description: 'Previous generation. Lighter but less capable.',
    tags: ['legacy', 'on-device'],
    context: 32_000,
    multimodal: true,
    thinking: false,
    tier: 'low',
    priority: 10,
  },
  {
    id: 'gemma3:12b',
    name: 'Gemma 3 12B',
    family: 'gemma3',
    params: '12B',
    description: 'Previous generation with good quality.',
    tags: ['legacy'],
    context: 32_000,
    multimodal: true,
    thinking: false,
    tier: 'medium',
    priority: 11,
  },
];

/**
 * Get a model config by ID. Falls back to a generic entry for unknown models.
 */
export function getModelById(id) {
  const found = MODEL_REGISTRY.find(m => m.id === id);
  if (found) return found;

  // Build generic entry for unregistered models (e.g., user-pulled custom models)
  const family = detectFamily(id);
  return {
    id,
    name: formatModelName(id),
    family,
    params: '?',
    description: 'Custom model pulled into Ollama.',
    tags: ['custom'],
    context: 0,
    multimodal: false,
    thinking: false,
    tier: 'medium',
    priority: 99,
  };
}

/**
 * Detect model family from an Ollama model ID string
 */
export function detectFamily(modelId) {
  const lower = (modelId || '').toLowerCase();
  if (lower.startsWith('gemma4') || lower.startsWith('gemma-4')) return 'gemma4';
  if (lower.startsWith('gemma3') || lower.startsWith('gemma-3') || lower.startsWith('gemma')) return 'gemma3';
  if (lower.startsWith('llama')) return 'llama';
  if (lower.startsWith('mistral') || lower.startsWith('mixtral')) return 'mistral';
  if (lower.startsWith('phi')) return 'phi';
  if (lower.startsWith('qwen')) return 'qwen';
  return 'custom';
}

/**
 * Format a raw Ollama model name into a human-friendly string
 */
export function formatModelName(modelId) {
  if (!modelId) return 'Unknown';

  // Check registry first
  const registered = MODEL_REGISTRY.find(m => m.id === modelId);
  if (registered) return registered.name;

  // Fallback: prettify the raw name
  const parts = modelId.split(':');
  const base = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
  const variant = parts[1] ? ` ${parts[1].toUpperCase()}` : '';
  return `${base}${variant}`;
}

/**
 * Pick the best model from a list of available models.
 * Prefers the user's preferred model, then falls back by priority.
 */
export function selectBestModel(availableModels, preferredModelId) {
  if (!availableModels || availableModels.length === 0) return null;

  // 1. Exact match on preferred
  if (preferredModelId && availableModels.includes(preferredModelId)) {
    return preferredModelId;
  }

  // 2. Partial match on preferred (e.g., 'gemma4:e4b' matches 'gemma4:e4b:latest')
  if (preferredModelId) {
    const partial = availableModels.find(m =>
      m.startsWith(preferredModelId) || m === preferredModelId.split(':')[0]
    );
    if (partial) return partial;
  }

  // 3. Sort available by registry priority and return the best
  const scored = availableModels.map(m => {
    const reg = MODEL_REGISTRY.find(r =>
      m === r.id || m.startsWith(r.id + ':') || m.startsWith(r.id)
    );
    return { model: m, priority: reg ? reg.priority : 50 };
  });
  scored.sort((a, b) => a.priority - b.priority);
  return scored[0].model;
}

/**
 * Build the display list: merge registry models with actually available ones.
 * Available models appear first (sorted by priority), then unavailable ones dimmed.
 */
export function buildModelList(availableModels = []) {
  const available = [];
  const unavailable = [];

  // Add all registry models, marking availability
  for (const model of MODEL_REGISTRY) {
    const isAvailable = availableModels.some(m =>
      m === model.id || m.startsWith(model.id + ':') || m.startsWith(model.id)
    );
    const resolvedId = isAvailable
      ? availableModels.find(m => m === model.id || m.startsWith(model.id + ':') || m.startsWith(model.id))
      : model.id;

    const entry = { ...model, id: resolvedId, available: isAvailable };
    if (isAvailable) available.push(entry);
    else unavailable.push(entry);
  }

  // Add any available models NOT in the registry (custom pulls)
  for (const m of availableModels) {
    const alreadyListed = available.some(a => a.id === m);
    if (!alreadyListed) {
      available.push(getModelById(m));
    }
  }

  available.sort((a, b) => a.priority - b.priority);
  unavailable.sort((a, b) => a.priority - b.priority);

  return { available, unavailable };
}
