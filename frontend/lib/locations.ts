const STORAGE_KEY = "daily-report-locations";
const DEFAULT_LOCATIONS: string[] = ["Banadir", "Xamar Bile"];

export function getLocations(): string[] {
  if (typeof window === "undefined") return DEFAULT_LOCATIONS;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed: string[] = JSON.parse(stored);
      const merged = [...DEFAULT_LOCATIONS, ...parsed];
      return [...new Set(merged)];
    }
  } catch {
    // ignore parse errors
  }
  return [...DEFAULT_LOCATIONS];
}

export function addLocation(name: string): string[] {
  const trimmed = name.trim();
  if (!trimmed) return getLocations();
  const locations = getLocations();
  if (locations.some((l) => l.toLowerCase() === trimmed.toLowerCase())) {
    return locations;
  }
  const stored = getCustomLocations();
  stored.push(trimmed);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  } catch {
    // storage may be full
  }
  return getLocations();
}

function getCustomLocations(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {
    // ignore
  }
  return [];
}
