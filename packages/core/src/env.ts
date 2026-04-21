/**
 * Normalise a string for fuzzy key matching: strip non-alphanumeric chars and
 * lower-case. Used when mapping env var names → config key paths.
 *
 * e.g. "API_BASE" → "apibase", "apiBase" → "apibase"
 */
function normalise(s: string): string {
  return s.replace(/[-_]/g, '').toLowerCase()
}

/**
 * Given a config object and an array of SCREAMING_SNAKE_CASE segments
 * (already split on a delimiter), find the matching nested key path inside
 * the config.
 *
 * Strategy (Nuxt-inspired): try all prefix lengths at each depth level so that
 * multi-word camelCase keys like "apiBase" match ["API", "BASE"] or ["API_BASE"].
 */
function findPath(
  config: Record<string, unknown>,
  segments: string[],
): string[] | null {
  if (segments.length === 0) return []

  for (const key of Object.keys(config)) {
    const normKey = normalise(key)

    // Try matching segments[0..i] to this key
    for (let i = 1; i <= segments.length; i++) {
      const candidate = normalise(segments.slice(0, i).join(''))
      if (candidate !== normKey) continue

      const remaining = segments.slice(i)
      if (remaining.length === 0) return [key]

      const value = config[key]
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        const sub = findPath(value as Record<string, unknown>, remaining)
        if (sub !== null) return [key, ...sub]
      }
    }
  }

  return null
}

function setIn(obj: Record<string, unknown>, path: string[], value: unknown): void {
  let cur = obj
  for (let i = 0; i < path.length - 1; i++) {
    if (typeof cur[path[i]] !== 'object' || cur[path[i]] === null) cur[path[i]] = {}
    cur = cur[path[i]] as Record<string, unknown>
  }
  cur[path[path.length - 1]] = value
}

function coerce(raw: string): unknown {
  if (raw === 'true') return true
  if (raw === 'false') return false
  const n = Number(raw)
  if (!Number.isNaN(n) && raw.trim() !== '') return n
  try {
    return JSON.parse(raw)
  } catch {
    return raw
  }
}

/**
 * Walk `env` and apply matching overrides onto a deep-clone of `config`.
 *
 * Env var naming convention:
 *   {prefix}PUBLIC_{KEY}  →  config.public.key
 *   {prefix}{KEY}         →  config.key  (private / server-only)
 *
 * Double-underscore (`__`) is the nesting separator.
 * Single underscores inside a segment map to camelCase word boundaries.
 *
 * Examples (prefix = 'RUNTIME_'):
 *   RUNTIME_PUBLIC_API_BASE            → config.public.apiBase
 *   RUNTIME_PUBLIC_FEATURE_FLAGS__DARK_MODE → config.public.featureFlags.darkMode
 *   RUNTIME_DB_URL                     → config.dbUrl
 */
export function applyEnvOverrides<T extends Record<string, unknown>>(
  config: T,
  env: Record<string, string | undefined> = process.env as Record<string, string | undefined>,
  prefix = 'RUNTIME_',
): T {
  const result = JSON.parse(JSON.stringify(config)) as T

  for (const [envKey, envValue] of Object.entries(env)) {
    if (!envKey.startsWith(prefix) || envValue === undefined) continue

    const withoutPrefix = envKey.slice(prefix.length)

    let rootKey: 'public' | null = null
    let rest: string

    if (withoutPrefix.startsWith('PUBLIC_')) {
      rootKey = 'public'
      rest = withoutPrefix.slice('PUBLIC_'.length)
    } else {
      rest = withoutPrefix
    }

    // Split on __ first (nesting), then single _ within each segment
    const nestedSegments = rest.split('__')
    const flatSegments = nestedSegments.flatMap(s => s.split('_').filter(Boolean))

    const searchRoot = rootKey
      ? ((result as Record<string, unknown>)[rootKey] as Record<string, unknown> | undefined ?? {})
      : (result as Record<string, unknown>)

    const innerPath = findPath(searchRoot, flatSegments)
    if (!innerPath) continue

    const fullPath: string[] = rootKey ? [rootKey, ...innerPath] : innerPath
    setIn(result as Record<string, unknown>, fullPath, coerce(envValue))
  }

  return result
}
