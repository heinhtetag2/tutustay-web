/**
 * MOCK persistence: a tiny localStorage-backed store. Nothing here reaches a server.
 * Reads are safe where storage is blocked or empty (private windows, SSR, thumbnails).
 */
export interface LocalStore<T> {
  get: () => T;
  set: (next: T) => void;
  subscribe: (cb: () => void) => () => void;
  getServerSnapshot: () => T;
}

const listeners = new Map<string, Set<() => void>>();

export function createLocalStore<T>(key: string, initial: T): LocalStore<T> {
  const storageKey = `tutustay.mock.${key}`;
  let cache: { raw: string | null; value: T } | null = null;

  const read = (): T => {
    let raw: string | null = null;
    try { raw = window.localStorage.getItem(storageKey); } catch { /* storage unavailable */ }
    if (cache && cache.raw === raw) return cache.value; // stable reference for useSyncExternalStore
    let value = initial;
    if (raw) { try { value = JSON.parse(raw) as T; } catch { value = initial; } }
    cache = { raw, value };
    return value;
  };

  const set = (next: T) => {
    try { window.localStorage.setItem(storageKey, JSON.stringify(next)); } catch { /* ignore */ }
    cache = null;
    listeners.get(storageKey)?.forEach((cb) => cb());
  };

  const subscribe = (cb: () => void) => {
    const set_ = listeners.get(storageKey) ?? new Set();
    set_.add(cb);
    listeners.set(storageKey, set_);
    const onStorage = (e: StorageEvent) => { if (e.key === storageKey) { cache = null; cb(); } };
    window.addEventListener("storage", onStorage);
    return () => { set_.delete(cb); window.removeEventListener("storage", onStorage); };
  };

  return { get: read, set, subscribe, getServerSnapshot: () => initial };
}
