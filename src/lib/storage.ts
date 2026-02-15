import type { Snippet } from "./types";
import { isSnippet } from "./snippets";

const SNIPPETS_KEY = "snipvault:snippets";
const FILTERS_KEY = "snipvault:filters";

export type SnipFiltersState = {
  query: string;
  tagFilter: string;
};

export function loadSnippets(fallback: Snippet[]): Snippet[] {
  const raw = localStorage.getItem(SNIPPETS_KEY);
  if (!raw) return fallback;

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return fallback;
    const valid = parsed.filter(isSnippet);
    return valid.length > 0 ? valid.slice(0, 500) : fallback;
  } catch {
    return fallback;
  }
}

export function saveSnippets(snippets: Snippet[]): void {
  localStorage.setItem(SNIPPETS_KEY, JSON.stringify(snippets.slice(0, 500)));
}

export function loadFilters(): SnipFiltersState {
  const raw = localStorage.getItem(FILTERS_KEY);
  if (!raw) return { query: "", tagFilter: "all" };
  try {
    const parsed = JSON.parse(raw) as Partial<SnipFiltersState>;
    return {
      query: typeof parsed.query === "string" ? parsed.query : "",
      tagFilter: typeof parsed.tagFilter === "string" ? parsed.tagFilter : "all"
    };
  } catch {
    return { query: "", tagFilter: "all" };
  }
}

export function saveFilters(state: SnipFiltersState): void {
  localStorage.setItem(FILTERS_KEY, JSON.stringify(state));
}
