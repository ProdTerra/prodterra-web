export type KeyValueStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export function getBrowserStorage(): KeyValueStorage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function readJson(storage: KeyValueStorage, key: string): unknown {
  try {
    const raw = storage.getItem(key);
    return raw === null ? null : JSON.parse(raw);
  } catch {
    return null;
  }
}

export function writeJson(storage: KeyValueStorage, key: string, value: unknown): void {
  try {
    storage.setItem(key, JSON.stringify(value));
  } catch {
    return;
  }
}
