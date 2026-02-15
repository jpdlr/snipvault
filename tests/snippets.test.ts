import { describe, expect, it } from "vitest";
import { filterSnippets, parseImportedSnippetsJson, parseTags } from "../src/lib/snippets";

describe("snippet utilities", () => {
  it("parses tags cleanly", () => {
    expect(parseTags("API, auth , node")).toEqual(["api", "auth", "node"]);
  });

  it("filters snippets by query and tag", () => {
    const items = [
      { id: "1", title: "Auth helper", code: "verify jwt", tags: ["auth", "node"] },
      { id: "2", title: "Table formatter", code: "to table", tags: ["ui"] }
    ];
    const result = filterSnippets(items, "jwt", "auth");
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("Auth helper");
  });

  it("parses snippet JSON import", () => {
    const parsed = parseImportedSnippetsJson(
      JSON.stringify([{ id: "1", title: "Fetch", code: "await fetch()", tags: ["api"] }])
    );
    expect(parsed).toHaveLength(1);
    expect(parsed[0].title).toBe("Fetch");
  });
});
