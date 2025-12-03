# Project Setup

## Session Initialization

Always start a new session by running:

```bash
pnpm install
```

This ensures all dependencies are properly installed and up-to-date before beginning work.

## Testing Guidelines

### Parametric Tests

Prefer **parametric tests** (data-driven tests) over writing repetitive test cases:

```typescript
// ✅ Good: Parametric approach
const cases = [
  { input: 'foo.bar', expected: ['foo', 'bar'], desc: 'dot notation' },
  { input: 'foo[0]', expected: ['foo', 0], desc: 'bracket notation' },
  { input: 'foo[*]', expected: ['foo', '*'], desc: 'wildcard' },
];

for (const { input, expected, desc } of cases) {
  test(`parses: ${desc}`, (t) => {
    const p = Pathist.from(input);
    t.deepEqual(p.toArray(), expected);
  });
}

// ❌ Avoid: Repetitive individual tests
test('parses dot notation', (t) => {
  const p = Pathist.from('foo.bar');
  t.deepEqual(p.toArray(), ['foo', 'bar']);
});

test('parses bracket notation', (t) => {
  const p = Pathist.from('foo[0]');
  t.deepEqual(p.toArray(), ['foo', 0]);
});
```

**Benefits:**
- Easier to add new test cases
- Reduces code duplication
- Clearer test intent through structured data
- Maintains test readability with descriptive labels

See `test/unit/parsing.test.ts` for comprehensive examples.

## Coding Conventions

### Path Naming

When working with two paths in comparisons or operations, use **"left"** and **"right"** terminology:

```typescript
// ✅ Good: Clear left/right naming
static #segmentsMatch(segL: PathSegment, segR: PathSegment, indices: Indices): boolean {
  // left segment vs right segment
}

// Comments should use left/right terminology
// Check if the last `len` segments of the left path match
// the first `len` segments of the right path

// ✅ Good: Variable naming in merge operations
const leftSegment = this.segments[this.segments.length - overlapLength + i];
const rightSegment = otherSegments[i];
```

**Benefits:**
- Consistent terminology across the codebase
- Clear differentiation when comparing paths
- Reduces cognitive load (no mixing "this/other", "first/second", etc.)

### Method Organization

Instance methods in the `Pathist` class must follow a **logical order** for consistent API documentation. The sections are:

1. **Static Constants** - `Notation`, `Indices`
2. **Static Configuration** - `defaultNotation`, `defaultIndices`, `indexWildcards`, `defaultNodeChildrenProperties`
3. **Static Factory & Helper Methods** - `from()`, internal helpers
4. **Instance Fields & Properties** - Private fields, getters
5. **Constructor** - `constructor()`
6. **Conversion & Accessors** - `toArray()`, `toString()`, `toJSONPath()`, and their getter aliases
7. **Iteration** - `Symbol.iterator`, `reduce()`
8. **Comparison Methods** - `equals()`, `startsWith()`, `endsWith()`, `includes()`
9. **Search Methods** - `positionOf()`, `lastPositionOf()`, `pathTo()`, `pathToLast()`
10. **Manipulation Methods** - `slice()`, `parent()`, `concat()`, `merge()`
11. **Tree/Node Navigation Methods** - `firstNodePath()`, `lastNodePath()`, `afterNodePath()`, `parentNode()`, `nodeIndices()`, `nodePaths()`
12. **Private Helper Methods** - Internal implementation details

**When adding new methods:**
- Place them in the appropriate logical section
- Group related functionality together
- Consider discoverability: developers should find methods where they expect them
- Methods that wrap or delegate to native JavaScript (like `reduce()`) go near related iteration methods

**Why this matters:**
- TypeDoc generates API documentation in source order
- Logical grouping improves developer experience
- Consistency makes the codebase easier to navigate

### Commit Message Style

Follow [Conventional Commits](https://www.conventionalcommits.org/) format with these type prefixes:

**Common types:**
- `feat:` - New features (minor version bump)
- `fix:` - Bug fixes (patch version bump)
- `perf:` - Performance improvements (patch version bump)
- `refactor:` - Code refactoring with no behavior change
- `test:` - Adding or updating tests
- `docs:` - Documentation changes
- `chore:` - Maintenance tasks (dependencies, build, release)
- `style:` - Code style changes (formatting, whitespace)

**Examples:**
```
feat: add match(), matchStart(), and matchEnd() methods
fix: handle edge case in bracket notation parsing
perf: optimize path string parsing with substring slicing
refactor: consolidate instance caches under #cache property
test: add parametric tests for wildcard matching
docs: update API examples in README
chore: add changeset for path parsing optimization
```

**Guidelines:**
- Use lowercase for type and description
- Keep the subject line under 72 characters
- Use imperative mood ("add" not "added" or "adds")
- Don't end subject line with a period
- Multi-line messages should have a blank line after the subject

## Release Management

This project uses [Changesets](https://github.com/changesets/changesets) for automated releases. See `RELEASE.md` for complete documentation.

### When to Create Changesets

**ALWAYS create a changeset when your changes affect:**
- Public API (new methods, changed signatures, removed features)
- Behavior (bug fixes, performance improvements)
- Types (TypeScript definitions users depend on)
- Dependencies (if they affect user experience)

**DO NOT create changesets for:**
- Internal refactoring with no user impact
- Test changes only
- Documentation updates
- Development tooling changes (unless they affect contributors)
- CI/CD configuration

### How to Create Changesets

After making your changes, create a changeset:

```bash
pnpm changeset
```

**Select the appropriate bump type:**
- **`patch`** - Bug fixes, performance improvements, internal changes
  - Examples: fixing parsing edge cases, optimizing algorithms, updating dependencies
- **`minor`** - New features, new methods, backward-compatible additions
  - Examples: adding new methods, new configuration options
- **`major`** - Breaking changes, removed features, changed behavior
  - Examples: removing deprecated methods, changing method signatures, changing defaults

**Write a user-facing summary:**
- Focus on WHAT changed and WHY it matters to users
- Be concise but descriptive (1-3 sentences)
- Avoid implementation details unless relevant to users
- Good: "Optimize path string parsing with substring slicing. Improves performance by up to 3x for paths with long property names."
- Bad: "Changed from character concatenation to substring slicing in #parseString method"

**Commit the changeset file:**
```bash
git add .changeset/*.md
git commit -m "chore: add changeset for <feature description>"
```

**Important:** Always commit changeset files alongside code changes. Don't merge PRs without changesets if they contain user-facing changes.

### Releasing

**To cut a release:**

The simplest approach is to run `pnpm version-packages` locally, review the changes, commit, and push to `main`. GitHub Actions will automatically publish to npm.

Alternatively, push changesets to `main` and GitHub Actions will create a "Version Packages" PR automatically. Merge that PR when ready to release.

**Notes:**
- GitHub Actions creates the "Version Packages" PR automatically - you don't create it manually
- The Release PR shows what will be released before you merge it
- Merging the Release PR triggers automatic publishing to npm
- See `RELEASE.md` for troubleshooting and advanced workflows

## Documentation

Project documentation is located in `./docs`:
- `./docs/feature_plans.md` - Planned and implemented features
- `./docs/shelved_ideas.md` - Ideas that have been postponed or rejected
