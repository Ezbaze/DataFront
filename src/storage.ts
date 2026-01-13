export function readPersistedString(key: string): string | null {
  if (typeof GM_getValue !== "function") {
    return null;
  }

  try {
    const value = GM_getValue(key, null);
    if (value === null || value === undefined) {
      return null;
    }
    return typeof value === "string" ? value : null;
  } catch {
    return null;
  }
}

export function writePersistedString(key: string, value: string): boolean {
  if (typeof GM_setValue !== "function") {
    return false;
  }

  try {
    GM_setValue(key, value);
    return true;
  } catch {
    return false;
  }
}
