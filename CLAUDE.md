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

## Documentation

Project documentation is located in `./docs`:
- `./docs/feature_plans.md` - Planned and implemented features
- `./docs/shelved_ideas.md` - Ideas that have been postponed or rejected
