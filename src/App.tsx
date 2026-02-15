import { useMemo, useState } from "react";
import { filterSnippets, parseTags } from "./lib/snippets";
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
  const [snippets, setSnippets] = useState<Snippet[]>(initial);
  const [query, setQuery] = useState("");
  const [tagFilter, setTagFilter] = useState("all");
  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  const [tags, setTags] = useState("");
  const [status, setStatus] = useState("");

  const tagsAvailable = useMemo(() => {
    return Array.from(new Set(snippets.flatMap((snippet) => snippet.tags))).sort((a, b) => a.localeCompare(b));
  }, [snippets]);

  const visible = useMemo(() => filterSnippets(snippets, query, tagFilter), [snippets, query, tagFilter]);

  const addSnippet = () => {
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
  };

  const copySnippet = async (snippet: Snippet) => {
    try {
      await navigator.clipboard.writeText(snippet.code);
      setStatus(`Copied: ${snippet.title}`);
    } catch {
      setStatus("Clipboard not available.");
    }
  };

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
        <input aria-label="Search snippets" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search snippets" />
        <select aria-label="Tag filter" value={tagFilter} onChange={(event) => setTagFilter(event.target.value)}>
          <option value="all">All tags</option>
          {tagsAvailable.map((tag) => (
            <option key={tag} value={tag}>{tag}</option>
          ))}
        </select>
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
    </div>
  );
}
