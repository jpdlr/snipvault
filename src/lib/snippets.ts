import type { Snippet } from "./types";

export function parseTags(input: string): string[] {
  return input
    .split(",")
    .map((tag) => tag.trim().toLowerCase())
    .filter((tag) => tag.length > 0);
}

export function filterSnippets(snippets: Snippet[], query: string, tag: string): Snippet[] {
  const lowerQuery = query.trim().toLowerCase();
  return snippets.filter((snippet) => {
    if (tag !== "all" && !snippet.tags.includes(tag)) return false;
    if (!lowerQuery) return true;
    const haystack = `${snippet.title} ${snippet.code} ${snippet.tags.join(" ")}`.toLowerCase();
    return haystack.includes(lowerQuery);
  });
}

export function isSnippet(value: unknown): value is Snippet {
  if (!value || typeof value !== "object") return false;
  const snippet = value as Partial<Snippet>;
  return (
    typeof snippet.id === "string" &&
    typeof snippet.title === "string" &&
    typeof snippet.code === "string" &&
    Array.isArray(snippet.tags) &&
    snippet.tags.every((tag) => typeof tag === "string")
  );
}

export function parseImportedSnippetsJson(input: string): Snippet[] {
  const parsed = JSON.parse(input) as unknown;
  if (!Array.isArray(parsed)) {
    throw new Error("Imported JSON must be an array.");
  }

  const snippets = parsed.filter(isSnippet);
  if (snippets.length === 0 && parsed.length > 0) {
    throw new Error("No valid snippets found.");
  }

  return snippets.slice(0, 500);
}
