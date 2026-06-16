export const LAST_SESSION_KEY = "courtflow:lastSession";

export type LastSession = {
  id: string;
  name: string;
  savedAt: string; // ISO
};

export function saveLastSession(session: { id: string; name: string }) {
  if (typeof window === "undefined") return;
  const payload: LastSession = {
    id: session.id,
    name: session.name,
    savedAt: new Date().toISOString(),
  };
  window.localStorage.setItem(LAST_SESSION_KEY, JSON.stringify(payload));
}

export function loadLastSession(): LastSession | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(LAST_SESSION_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<LastSession>;
    if (!parsed.id || !parsed.name || !parsed.savedAt) return null;
    return { id: parsed.id, name: parsed.name, savedAt: parsed.savedAt };
  } catch {
    return null;
  }
}

export function clearLastSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(LAST_SESSION_KEY);
}

