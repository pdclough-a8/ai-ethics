// Centralised progress/interaction tracking.
//
// Today this only persists to the browser's localStorage - this course is
// most likely going to be used standalone, without an LMS. If that changes
// and SCORM reporting is ever needed, THIS is the file that should change:
// every component calls these functions rather than touching localStorage
// (or a future LMS API) directly, so adding a `wrapper.setValue(...)` call
// inside each function here is the only change required - no hunting
// through every page/component.

// Distinct from the Data Ethics course's 'a8-data-ethics' namespace - both
// sites share the pdclough-a8.github.io origin, so localStorage would
// otherwise be shared between them despite living at different paths.
const NAMESPACE = 'a8-ai-ethics';
const PAGE_PROGRESS_KEY = `${NAMESPACE}-progress`;
const INTERACTION_PREFIX = `${NAMESPACE}-mcq:`;

export function normalisePath(pathname: string): string {
  return pathname.length > 1 ? pathname.replace(/\/$/, '') : pathname;
}

/** Marks a page visited and returns the full visited-pages list. */
export function recordPageVisit(pathname: string): string[] {
  const current = normalisePath(pathname);
  const visited = new Set(getVisitedPages());
  visited.add(current);
  const list = Array.from(visited);
  localStorage.setItem(PAGE_PROGRESS_KEY, JSON.stringify(list));
  return list;
}

export function getVisitedPages(): string[] {
  try {
    return JSON.parse(localStorage.getItem(PAGE_PROGRESS_KEY) ?? '[]');
  } catch {
    return [];
  }
}

export type McqResult = 'correct' | 'partlyCorrect' | 'incorrect';

export interface McqResultRecord {
  selected: number[];
  result: McqResult;
}

/** Records a single-attempt quiz answer, keyed by the question's id. */
export function recordInteraction(id: string, data: McqResultRecord): void {
  localStorage.setItem(`${INTERACTION_PREFIX}${id}`, JSON.stringify(data));
}

/** Returns a previously-recorded answer for this question, if any. */
export function getInteraction(id: string): McqResultRecord | null {
  const saved = localStorage.getItem(`${INTERACTION_PREFIX}${id}`);
  if (!saved) return null;
  try {
    return JSON.parse(saved) as McqResultRecord;
  } catch {
    return null;
  }
}

/**
 * Clears all page-progress and quiz-answer state for this course. Only
 * removes keys under our own namespace prefix, not the whole origin's
 * localStorage — this site doesn't share the origin with anything else
 * today, but no reason to be less careful than that costs.
 */
export function resetProgress(): void {
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(NAMESPACE)) keysToRemove.push(key);
  }
  keysToRemove.forEach((key) => localStorage.removeItem(key));
}
