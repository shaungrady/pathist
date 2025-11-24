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
