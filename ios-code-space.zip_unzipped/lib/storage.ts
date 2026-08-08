import { defaultProject, type Project } from "./types";

const KEY = "ios-code-space:project:v1";
const LOG_KEY = "ios-code-space:terminal:v1";

export function loadProject(): Project {
  if (typeof window === "undefined") return defaultProject();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultProject();
    const parsed = JSON.parse(raw) as Project;
    if (!parsed?.files?.length) return defaultProject();
    return parsed;
  } catch {
    return defaultProject();
  }
}

export function saveProject(project: Project): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      KEY,
      JSON.stringify({ ...project, updatedAt: Date.now() })
    );
  } catch {
    // quota / private mode
  }
}

export function loadTerminalLines(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOG_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as string[];
    return Array.isArray(arr) ? arr.slice(-200) : [];
  } catch {
    return [];
  }
}

export function saveTerminalLines(lines: string[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOG_KEY, JSON.stringify(lines.slice(-200)));
  } catch {
    // ignore
  }
}
