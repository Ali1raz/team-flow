<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

When the user types `/graphify`, use the installed graphify skill or instructions before doing anything else.

Rules:

- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- Dirty graphify-out/ files are expected after hooks or incremental updates; dirty graph files are not a reason to skip graphify. Only skip graphify if the task is about stale or incorrect graph output, or the user explicitly says not to use it.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).

### Contributor Workflow

**After pulling changes:**

```bash
pnpm graph:update    # Incremental update (fast, no LLM cost)
```

**Before starting work on a feature:**

```bash
pnpm graph:query "How does X work?"   # Orient yourself first
```

**After making significant changes:**

```bash
pnpm graph:update    # Rebuilds only changed files
# OR if you refactored heavily:
pnpm graph:build     # Full rebuild with deep mode
```

**Key principles:**

1. Never commit `graphify-out/` - it's in `.gitignore`
2. Run `graph:update` after `git pull` - keeps graph fresh
3. Query before grep - `graph:query` returns scoped subgraph, not 200 files
4. `graph:build` = deep mode - use when adding new patterns/libraries

### Available Scripts

```bash
pnpm graph:build      # Full rebuild with deep mode
pnpm graph:update     # Incremental update after code changes
pnpm graph:query "question"  # Query the graph
pnpm graph:cluster    # Re-cluster and regenerate report
pnpm graph:path "A" "B"    # Shortest path between nodes
pnpm graph:explain "concept"  # Explain a node
```
