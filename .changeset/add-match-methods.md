---
"pathist": minor
---

Add `match()`, `matchStart()`, and `matchEnd()` methods for efficient pattern matching with wildcard support.

These new methods return the matched portion of the path with concrete values (not wildcards from the pattern), avoiding redundant parsing compared to manually calling comparison methods and then slicing. All methods return `null` when no match is found.

- `match()`: Returns the first matched subsequence anywhere in the path
- `matchStart()`: Returns the matched prefix if the path starts with the pattern
- `matchEnd()`: Returns the matched suffix if the path ends with the pattern

These methods are particularly useful for matching error paths against wildcard configuration patterns, such as mapping ArkType error paths to transform configurations.

Example:
```typescript
const errorPath = Pathist.from(['foo', 2, 'bar', 'baz']);
const match = errorPath.matchStart('foo[-1].bar');
// Returns: Pathist with ['foo', 2, 'bar'] - preserves concrete index!

const remaining = errorPath.slice(match.length);
// Returns: Pathist with ['baz']
```
