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
    const p = new Pathist(input);
    t.deepEqual(p.toArray(), expected);
  });
}

// ❌ Avoid: Repetitive individual tests
test('parses dot notation', (t) => {
  const p = new Pathist('foo.bar');
  t.deepEqual(p.toArray(), ['foo', 'bar']);
});

test('parses bracket notation', (t) => {
  const p = new Pathist('foo[0]');
  t.deepEqual(p.toArray(), ['foo', 0]);
});
```

**Benefits:**
- Easier to add new test cases
- Reduces code duplication
- Clearer test intent through structured data
- Maintains test readability with descriptive labels

See `test/unit/parsing.test.ts` for comprehensive examples.

## Documentation

Project documentation is located in `./docs`:
- `./docs/feature_plans.md` - Planned and implemented features
- `./docs/shelved_ideas.md` - Ideas that have been postponed or rejected
