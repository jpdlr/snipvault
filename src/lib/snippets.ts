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
