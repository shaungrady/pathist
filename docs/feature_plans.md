# Feature Plans

This document captures planned features and design decisions for future implementation.

## Tree Navigation Support

### Overview

Support for navigating tree data structures with convenience methods for finding node indices in paths.

### Configuration

Add `nodeChildrenProperties` config option that defines property names indicating child node arrays:

```typescript
interface PathistConfig {
  notation?: Notation;
  indices?: Indices;
  nodeChildrenProperties?: ReadonlySet<string> | string[] | string;
}

// Class-level default
Pathist.defaultNodeChildrenProperties = new Set(['children']);

// Instance-level config
const path = new Pathist('items[0].items[1]', {
  nodeChildrenProperties: new Set(['items', 'children'])
});
```

### Concepts

**Tree Path**: A contiguous sequence following the pattern `[index].childProperty[index].childProperty[index]...`

**Contiguous Sequence**: Once a non-child property appears, the contiguous tree sequence ends:
- `children[2].children[3].foo.bar` - sequence ends at `[3]`, before `.foo`
- `[0].children[1].foo.bar.children[2]` - sequence ends at `[1]`, `.children[2]` is ignored

**Node Index**: The numeric segment (array index) in a tree path

### Methods

#### `firstNodeIndex(): number | null`

Returns the segment index of the first numeric index in the contiguous tree path.

Returns `null` if no tree path is found.

**Examples:**

```typescript
// Path starts with tree at root
new Pathist('children[2].children[3].foo.bar', config)
  .firstNodeIndex() // → 1 (segment index of `2`)

// Tree nested within path
new Pathist('foo.bar.content[0].children[1]', config)
  .firstNodeIndex() // → 3 (segment index of `0`)

// Path ends on index without child property
new Pathist('foo.bar.content[0]', config)
  .firstNodeIndex() // → 3 (segment index of `0`)

// No tree found
new Pathist('foo.bar.baz', config)
  .firstNodeIndex() // → null
```

#### `lastNodeIndex(): number | null`

Returns the segment index of the last numeric index in the contiguous tree path (starting from the beginning).

Returns `null` if no tree path is found.

**Examples:**

```typescript
// Contiguous sequence ends before .foo
new Pathist('children[2].children[3].foo.bar', config)
  .lastNodeIndex() // → 3 (segment index of `3`)

// Ignores children[2] after .foo.bar breaks contiguity
new Pathist('[0].children[1].foo.bar.children[2]', config)
  .lastNodeIndex() // → 2 (segment index of `1`)

// Full contiguous tree path
new Pathist('items[5].items[3].items[1]', config)
  .lastNodeIndex() // → 5 (segment index of `1`)
```

### Use Cases

- **AST/Parser trees**: Navigate `body[0].declarations[2].arguments[1]`
- **DOM-like structures**: Traverse `children[0].shadowRoot[0].slots[1]`
- **Component trees**: Work with `children[5].items[2].children[0]`
- **File systems**: Navigate `directories[0].files[2].subdirectories[1]`

### Implementation Notes

- Config propagates through `cloneConfig()` to derived instances (e.g., `slice()`, `concat()`)
- Returns segment indices (0-based position in segments array), not the index values themselves
- Developer context: Users know whether they're working with a collection root vs. nested tree, so no special `-1` return value needed for "root" cases

---

## Path Manipulation Methods

### Overview

Methods for extracting sub-paths and combining paths, enabling workflows like extracting node-relative paths from absolute error paths.

### Methods

#### `slice(start?: number, end?: number): Pathist`

Extract a sub-path using Array.prototype.slice semantics. Config is propagated to the new instance.

**Examples:**

```typescript
const path = new Pathist('children[2].children[3].foo.bar');

// Extract node path
path.slice(0, 4);  // → new Pathist('children[2].children[3]')

// Extract node-relative path
path.slice(4);     // → new Pathist('foo.bar')

// Negative indices
path.slice(-2);    // → new Pathist('foo.bar')

// Copy entire path
path.slice();      // → new Pathist('children[2].children[3].foo.bar')
```

#### `concat(...paths: Array<Pathist | PathInput>): Pathist`

Combine multiple paths into one. Accepts Pathist instances, strings, or arrays. Config is propagated to the new instance.

**Examples:**

```typescript
const nodePath = new Pathist('children[2].children[3]');
const relativePath = new Pathist('foo.bar');

// Reconstruct absolute path
nodePath.concat(relativePath);  // → children[2].children[3].foo.bar

// Multiple arguments
const p = new Pathist('a');
p.concat('b', ['c'], new Pathist('d'));  // → a.b.c.d

// String notation
nodePath.concat('baz.qux');  // → children[2].children[3].baz.qux
```

#### `merge(path: Pathist | PathInput): Pathist`

Intelligently combine paths by detecting overlaps at the suffix/prefix boundary. If the end of the first path overlaps with the beginning of the second path, the overlap is deduplicated. If no overlap exists, behaves like `concat()`. Config is propagated to the new instance.

**Examples:**

```typescript
// With overlap - finds longest common suffix/prefix
new Pathist('a.b.c').merge('b.c.d');  // → a.b.c.d (overlap: b.c)
new Pathist('a.b.c').merge('c.d.e');  // → a.b.c.d.e (overlap: c)

// Without overlap - acts like concat
new Pathist('a.b.c').merge('d.e.f');  // → a.b.c.d.e.f

// Works with indices
new Pathist('items[0].items[1]').merge('items[1].name');  // → items[0].items[1].name

// No overlap if segments don't match
new Pathist('a.b.c').merge('b.d.e');  // → a.b.c.b.d.e (b doesn't match b.c)

// Wildcard handling: concrete value wins
new Pathist('items[-1].name').merge('items[5].name.value');  // → items[5].name.value
new Pathist('items[5].name').merge('items[-1].name.value');  // → items[5].name.value
new Pathist('items[-1].name').merge('items[-1].name.value'); // → items[-1].name.value (both wildcards)
```

### Use Cases

**Error Path Transformation:**
```typescript
// ArkType error path: children[2].children[3].foo.bar[0].baz
const errorPath = new Pathist(arkError.path, {
  nodeChildrenProperties: ['children']
});

// Find node boundary
const nodeIdx = errorPath.lastNodeIndex();  // → 3

// Extract paths
const nodePath = errorPath.slice(0, nodeIdx + 1);      // children[2].children[3]
const relativePath = errorPath.slice(nodeIdx + 1);     // foo.bar[0].baz

// Later: reconstruct if needed
const reconstructed = nodePath.concat(relativePath);
```

**Path Building:**
```typescript
const base = new Pathist('api.users[0]');
const detail = base.concat('profile.settings');  // api.users[0].profile.settings
```

### Implementation Notes

- All methods use `cloneConfig()` to propagate instance config
- `slice()` delegates to `Array.prototype.slice` on segments
- `concat()` uses `#toSegments()` helper to accept multiple input types
- `concat()` throws TypeError for invalid inputs (null, undefined, etc.)
- `merge()` finds the longest common overlap by checking if the suffix of the first path matches the prefix of the second path
- `merge()` uses segment-by-segment comparison (respects the current comparison logic)
- `merge()` wildcard handling: When overlapping segments contain wildcards, concrete values take precedence
  - Both wildcards → preserve wildcard
  - One wildcard, one concrete → use concrete value (concrete is more specific)
  - Both concrete and equal → use the concrete value
