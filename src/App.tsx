import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { filterSnippets, parseImportedSnippetsJson, parseTags } from "./lib/snippets";
import { loadFilters, loadSnippets, saveFilters, saveSnippets } from "./lib/storage";
import type { Snippet } from "./lib/types";
import "./styles/app.css";

const initial: Snippet[] = [
  {
    id: "s1",
    title: "Fetch JSON",
    code: "const response = await fetch(url);\nconst data = await response.json();",
    tags: ["api", "javascript"]
  },
  {
    id: "s2",
    title: "Fastify health route",
    code: "app.get('/health', async () => ({ status: 'ok' }));",
    tags: ["node", "fastify"]
  }
];

export default function App() {
  const [snippets, setSnippets] = useState<Snippet[]>(() => loadSnippets(initial));
  const [query, setQuery] = useState(() => loadFilters().query);
  const [tagFilter, setTagFilter] = useState(() => loadFilters().tagFilter);
  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  const [tags, setTags] = useState("");
  const [status, setStatus] = useState("");
  const searchRef = useRef<HTMLInputElement | null>(null);
  const importInputRef = useRef<HTMLInputElement | null>(null);

  const tagsAvailable = useMemo(() => {
    return Array.from(new Set(snippets.flatMap((snippet) => snippet.tags))).sort((a, b) => a.localeCompare(b));
  }, [snippets]);

  const visible = useMemo(() => filterSnippets(snippets, query, tagFilter), [snippets, query, tagFilter]);

  useEffect(() => {
    saveSnippets(snippets);
  }, [snippets]);

  useEffect(() => {
    saveFilters({ query, tagFilter });
  }, [query, tagFilter]);

  const addSnippet = useCallback(() => {
    if (!title.trim() || !code.trim()) {
      setStatus("Title and code are required.");
      return;
    }

    const next: Snippet = {
      id: `s-${Date.now()}`,
      title: title.trim(),
      code,
      tags: parseTags(tags)
    };

    setSnippets((current) => [next, ...current]);
    setTitle("");
    setCode("");
    setTags("");
    setStatus("Snippet added.");
  }, [title, code, tags]);

  const exportSnippets = useCallback(() => {
    const blob = new Blob([JSON.stringify(snippets, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "snipvault-snippets.json";
    link.click();
    URL.revokeObjectURL(url);
    setStatus("Exported snippets to JSON.");
  }, [snippets]);

  const importSnippets = useCallback(async (file: File | null) => {
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = parseImportedSnippetsJson(text);
      setSnippets(parsed);
      setStatus(`Imported ${parsed.length} snippets.`);
    } catch (error) {
      setStatus(`Import failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }, []);

  const copySnippet = async (snippet: Snippet) => {
    try {
      await navigator.clipboard.writeText(snippet.code);
      setStatus(`Copied: ${snippet.title}`);
    } catch {
      setStatus("Clipboard not available.");
    }
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
        event.preventDefault();
        addSnippet();
        return;
      }

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "f") {
        event.preventDefault();
        searchRef.current?.focus();
        return;
      }

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "e") {
        event.preventDefault();
        exportSnippets();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [addSnippet, exportSnippets]);

  return (
    <div className="app">
      <header>
        <p className="eyebrow">SnipVault</p>
        <h1>Snippet API for Teams</h1>
        <p className="subtitle">Save, filter, and copy reusable code snippets with tags.</p>
      </header>

      <section className="panel add">
        <h2>Add snippet</h2>
        <input aria-label="Snippet title" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Title" />
        <textarea aria-label="Snippet code" value={code} onChange={(event) => setCode(event.target.value)} placeholder="Code" />
        <input aria-label="Snippet tags" value={tags} onChange={(event) => setTags(event.target.value)} placeholder="Tags (comma separated)" />
        <button type="button" onClick={addSnippet}>Save snippet</button>
      </section>

      <section className="panel filter">
        <h2>Filter</h2>
        <input
          ref={searchRef}
          aria-label="Search snippets"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search snippets"
        />
        <select aria-label="Tag filter" value={tagFilter} onChange={(event) => setTagFilter(event.target.value)}>
          <option value="all">All tags</option>
          {tagsAvailable.map((tag) => (
            <option key={tag} value={tag}>{tag}</option>
          ))}
        </select>
        <div className="row">
          <button type="button" onClick={exportSnippets}>Export JSON</button>
          <button type="button" className="ghost" onClick={() => importInputRef.current?.click()}>Import JSON</button>
          <button type="button" className="ghost" onClick={() => { setQuery(""); setTagFilter("all"); }}>Reset filters</button>
          <input
            ref={importInputRef}
            className="hidden-input"
            type="file"
            accept=".json,application/json"
            onChange={(event) => void importSnippets(event.target.files?.[0] ?? null)}
          />
        </div>
      </section>

      <section className="panel list">
        <h2>Library ({visible.length})</h2>
        <div className="snippets">
          {visible.map((snippet) => (
            <article key={snippet.id} className="snippet-card">
              <h3>{snippet.title}</h3>
              <p>{snippet.tags.join(" • ") || "untagged"}</p>
              <pre>{snippet.code}</pre>
              <button type="button" onClick={() => void copySnippet(snippet)}>Copy</button>
            </article>
          ))}
          {visible.length === 0 ? <p className="empty">No snippets match this filter.</p> : null}
        </div>
      </section>

      {status ? <p className="status">{status}</p> : null}
      <p className="hint">Shortcuts: `Cmd/Ctrl+Enter` save, `Cmd/Ctrl+F` focus search, `Cmd/Ctrl+E` export.</p>
    </div>
  );
}
