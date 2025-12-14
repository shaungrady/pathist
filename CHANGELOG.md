# pathist

## 1.3.0

### Minor Changes

- 0d998dd: Add three new path relationship methods for analyzing and decomposing paths:

  - `relativeTo(base)` - Extracts the relative path from a base path. Returns the segments that need to be concatenated to the base to produce the full path. Returns `null` if the path doesn't start with the base. This is the inverse operation of `concat()`.

  - `commonStart(other)` - Finds the common prefix path shared between two paths. Returns the longest sequence of segments that both paths start with, or an empty path if no common prefix exists.

  - `commonEnd(other)` - Finds the common suffix path shared between two paths. Returns the longest sequence of segments that both paths end with, or an empty path if no common suffix exists.

  These methods enable powerful path decomposition and analysis workflows, such as extracting relative paths for display, finding shared parent paths, and identifying structural similarities between paths.

### Patch Changes

- f9a11f5: Add comprehensive property-based tests using fast-check. Complements existing parametric tests with tests that verify algebraic properties and invariants across thousands of automatically-generated test cases, including round-trip parsing, comparison properties (reflexivity, symmetry, transitivity), manipulation properties (slice/concat identity, associativity), and configuration propagation.

## 1.2.0

### Minor Changes

- 275d656: Add `hasIndexWildcards` boolean property to Pathist instances. This property indicates whether the path contains any wildcard index tokens (like `*` or `-1` by default), making it easy to check for wildcards without manually inspecting segments.

### Patch Changes

- ab68e0c: Optimize path string parsing by moving character code constants to module level. This provides ~20% faster constant access compared to class static properties, contributing to an overall ~24% improvement in parsing performance.

## 1.1.1

### Patch Changes

- dda8b5f: Optimize path string parsing with substring slicing instead of character-by-character concatenation. This improves performance by up to 3x for paths with long property names, with an average 14% improvement across all parsing operations and no regressions in bracket notation performance.

## 1.1.0

### Minor Changes

- f4ab1c3: Add `match()`, `matchStart()`, and `matchEnd()` methods for efficient pattern matching with wildcard support.

  These new methods return the matched portion of the path with concrete values (not wildcards from the pattern), avoiding redundant parsing compared to manually calling comparison methods and then slicing. All methods return `null` when no match is found.

  - `match()`: Returns the first matched subsequence anywhere in the path
  - `matchStart()`: Returns the matched prefix if the path starts with the pattern
  - `matchEnd()`: Returns the matched suffix if the path ends with the pattern

  These methods are particularly useful for matching error paths against wildcard configuration patterns, such as mapping ArkType error paths to transform configurations.

  Example:

  ```typescript
  const errorPath = Pathist.from(["foo", 2, "bar", "baz"]);
  const match = errorPath.matchStart("foo[-1].bar");
  // Returns: Pathist with ['foo', 2, 'bar'] - preserves concrete index!

  const remaining = errorPath.slice(match.length);
  // Returns: Pathist with ['baz']
  ```

## 1.0.0

### Major Changes

- d891205: - Fix ./docs
  - Improve clarity of README
  - Rename `parent` method to `parentPath`

## 0.1.1

### Patch Changes

- 45936a8: Add internal caching for improved performance:

  - Cache `toJSONPointer()` and `toJSONPath()` results (minimal memory overhead, avoids string building and character escaping on repeated calls)
  - Cache tree node position lookups using single-scan approach for `firstNodePath()`, `lastNodePath()`, `afterNodePath()`, `nodeIndices()`, `nodePaths()`, and `parentNode()` (tiny memory footprint with cumulative speedups across 6+ methods)

  These optimizations maintain tiny memory usage while providing noticeable performance improvements for common operations, especially in serialization workflows and tree navigation scenarios. The single-scan node position caching computes both first and last node indices together, avoiding redundant segment array iterations.
