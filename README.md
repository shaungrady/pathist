# ["Path"].ist

Pathist is a TypeScript library for parsing, manipulating, and comparing object property paths with support for multiple notations, wildcards, and tree traversal.

## Features

- **Multiple notation styles**: Mixed (`foo.bar[0]`), Dot (`foo.bar.0`), and Bracket (`["foo"]["bar"][0]`)
- **Path parsing**: Convert strings and arrays to structured path objects
- **Path comparison**: Check equality, prefixes, suffixes, and containment
- **Path manipulation**: Slice, concat, and intelligently merge paths
- **Tree traversal**: Navigate hierarchical structures with node-aware methods
- **JSONPath conversion**: Export paths to RFC 9535 JSONPath format
- **Wildcard support**: Use wildcards for flexible matching
- **TypeScript-first**: Full type safety with comprehensive type definitions
- **Composable design**: Works seamlessly with [lodash][lodash], [jsonpath-plus][jsonpath-plus], [type-fest][type-fest], [ArkType][arktype], and other path-based libraries

## Why Pathist?

While libraries like [lodash][lodash] and [jsonpath-plus][jsonpath-plus] excel at accessing data, they don't provide rich path manipulation capabilities. Pathist fills this gap with a practical API for building, comparing, and transforming paths before passing them to your existing tools—whether that's lodash's `get/set`, JSONPath queries, or validation libraries like [ArkType][arktype].

## Installation

```bash
npm install pathist
# or
pnpm add pathist
# or
yarn add pathist
```

## Quick Start

```typescript
import { Pathist } from 'pathist';

// Parse a path string
const path = Pathist.from('user.profile.settings[0].name');
console.log(path.length); // 5
console.log(path.toArray()); // ['user', 'profile', 'settings', 0, 'name']

// Convert between notations
console.log(path.toString()); // 'user.profile.settings[0].name' (default: Mixed)
console.log(path.toString(Pathist.Notation.Dot)); // 'user.profile.settings.0.name'
console.log(path.toString(Pathist.Notation.Bracket)); // '["user"]["profile"]["settings"][0]["name"]'

// JSONPath export
console.log(path.toJSONPath()); // '$.user.profile.settings[0].name'
```

## Common Use Cases

### Path Comparison

```typescript
const basePath = Pathist.from('users.preferences');
const fullPath = Pathist.from('users.preferences.theme.color');

// Check relationships
console.log(fullPath.startsWith(basePath)); // true
console.log(fullPath.endsWith('color')); // true
console.log(fullPath.includes('preferences.theme')); // true

// Exact equality
const path1 = Pathist.from('items[0].name');
const path2 = Pathist.from('items[5].name');
console.log(path1.equals(path2)); // false
console.log(path1.equals(path2, { indices: Pathist.Indices.Ignore })); // true
```

### Path Manipulation

```typescript
// Slicing
const path = Pathist.from('foo.bar.baz.qux');
console.log(path.slice(1, 3).toString()); // 'bar.baz'
console.log(path.slice(2).toString()); // 'baz.qux'

// Parent paths
const errorPath = Pathist.from('users[0].profile.settings.theme');
console.log(errorPath.parent().toString()); // 'users[0].profile.settings'
console.log(errorPath.parent(2).toString()); // 'users[0].profile'
console.log(errorPath.parent(10).toString()); // '' (returns empty path)

// Concatenation
const base = Pathist.from('api.users');
const extended = base.concat('profile', 'avatar');
console.log(extended.toString()); // 'api.users.profile.avatar'

// Intelligent merging with overlap detection
const left = Pathist.from('data.users[0].profile');
const right = Pathist.from('profile.settings.theme');
console.log(left.merge(right).toString()); // 'data.users[0].profile.settings.theme'
```

### Wildcards and Index Matching

```typescript
// Configure wildcards
Pathist.indexWildcards = new Set(['*', -1]);

// Use wildcards in paths
const template = Pathist.from('items[*].metadata');
const concrete = Pathist.from('items[5].metadata');

// Wildcards match any index
console.log(template.equals(concrete)); // false (exact match)
console.log(Pathist.from('items[*]').equals(Pathist.from('items[5]'))); // false

// But they work in comparisons
const path1 = Pathist.from('users[*].name');
const path2 = Pathist.from('users[0].name');
console.log(path1.positionOf(path2)); // 0 (wildcards match numbers)
```

### Tree/Node Navigation

For working with hierarchical tree structures:

```typescript
// Configure children property names
const path = Pathist.from('children[0].children[1].children[2].value', {
  nodeChildrenProperties: ['children'] // This is the default value
});

// Extract node paths
console.log(path.firstNodePath().toString()); // '' (root)
console.log(path.lastNodePath().toString()); // 'children[0].children[1].children[2]'
console.log(path.afterNodePath().toString()); // 'value'

// Get node indices
console.log(path.nodeIndices()); // [0, 1, 2]

// Navigate to parent nodes
console.log(path.parentNode().toString()); // 'children[0].children[1]' (parent of last node)
console.log(path.parentNode(2).toString()); // 'children[0]' (grandparent)
console.log(path.parentNode(3).toString()); // '' (root)

// Iterate through each node level
for (const nodePath of path.nodePaths()) {
  console.log(nodePath.toString());
}
// Output:
// '' (root)
// 'children[0]'
// 'children[0].children[1]'
// 'children[0].children[1].children[2]'
```

### Search and Position

```typescript
const path = Pathist.from('foo.bar.baz.bar.qux');

// Find positions
console.log(path.positionOf('bar')); // 1 (first occurrence)
console.log(path.lastPositionOf('bar')); // 3 (last occurrence)

// Extract up to a match
console.log(path.pathTo('bar').toString()); // 'foo.bar'
console.log(path.pathToLast('bar').toString()); // 'foo.bar.baz.bar'
```

### Configuration

```typescript
// Global defaults
Pathist.defaultNotation = Pathist.Notation.Bracket;
Pathist.defaultIndices = Pathist.Indices.Ignore;
Pathist.defaultNodeChildrenProperties = new Set(['children', 'items']);

// Instance-specific configuration
const path = Pathist.from('foo.bar', {
  notation: Pathist.Notation.Dot,
  indices: Pathist.Indices.Preserve,
  nodeChildrenProperties: ['nodes']
});

console.log(path.toString()); // 'foo.bar' (uses Dot notation)
```

## Special Characters and Edge Cases

```typescript
// Properties with dots, brackets, or spaces
const path1 = Pathist.from(['foo.bar', 'baz']);
console.log(path1.toString()); // '["foo.bar"].baz'

const path2 = Pathist.from(['foo[0]', 'qux']);
console.log(path2.toString()); // '["foo[0]"].qux'

// Empty string properties
const path3 = Pathist.from(['', 'value']);
console.log(path3.toString()); // '[""].value'

// Escaped dots in string paths
const path4 = Pathist.from('foo\\.bar.baz');
console.log(path4.toArray()); // ['foo.bar', 'baz']
```

## Integration with Other Libraries

Pathist is designed to work seamlessly with popular path-based libraries and tools.

### Navigating Objects Without Dependencies

Use the `reduce()` method (a thin wrapper around `Array.reduce()`) to navigate objects:

```typescript
import { Pathist } from 'pathist';

const data = {
  users: [
    { profile: { name: 'Alice', settings: { theme: 'dark' } } },
    { profile: { name: 'Bob', settings: { theme: 'light' } } }
  ]
};

// Navigate through an object
const path = Pathist.from('users[0].profile.settings.theme');
const value = path.reduce((obj, segment) => obj?.[segment], data);
console.log(value); // 'dark'

// Handle missing paths gracefully
const missing = Pathist.from('users[5].profile.name');
const name = missing.reduce((obj, seg) => obj?.[seg], data);
console.log(name); // undefined

// Provide default fallback values
const withDefault = missing.reduce((obj, seg) => obj?.[seg] ?? {}, data);
console.log(withDefault); // {}
```

This is equivalent to `path.toArray().reduce(...)` but more concise. You have full control over the reduction logic. For more advanced features like setting values or complex transformations, consider using established libraries like lodash.

### With [lodash][lodash] get/set

Use Pathist to manipulate paths before passing them to lodash:

```typescript
import { get, set } from 'lodash';
import { Pathist } from 'pathist';

const data = {
  users: [
    { profile: { name: 'Alice', settings: { theme: 'dark' } } },
    { profile: { name: 'Bob', settings: { theme: 'light' } } }
  ]
};

// Build and manipulate paths with Pathist
const basePath = Pathist.from('users[0].profile');
const settingsPath = basePath.concat('settings', 'theme');

// Use with lodash
const theme = get(data, settingsPath.toString()); // 'dark'
set(data, settingsPath.toString(), 'auto');

// Convert between notations for different libraries
const lodashPath = settingsPath.toString(); // 'users[0].profile.settings.theme'
const dotPath = settingsPath.toString(Pathist.Notation.Dot); // 'users.0.profile.settings.theme'
```

### With [jsonpath-plus][jsonpath-plus]

Convert Pathist paths to JSONPath format for querying:

```typescript
import { JSONPath } from 'jsonpath-plus';
import { Pathist } from 'pathist';

const data = {
  store: {
    books: [
      { title: 'Book 1', price: 10 },
      { title: 'Book 2', price: 15 }
    ]
  }
};

// Build path with Pathist and convert to JSONPath
const path = Pathist.from('store.books[0].title');
const jsonPath = path.toJSONPath(); // '$.store.books[0].title'

const result = JSONPath({ path: jsonPath, json: data });
console.log(result); // ['Book 1']

// Use wildcards for multiple matches
const wildcardPath = Pathist.from('store.books[*].price');
const allPrices = JSONPath({ path: wildcardPath.toJSONPath(), json: data });
console.log(allPrices); // [10, 15]
```

### With [type-fest][type-fest] Paths Type

Combine Pathist with type-fest for end-to-end type safety:

```typescript
import type { Paths } from 'type-fest';
import { Pathist } from 'pathist';

interface User {
  profile: {
    name: string;
    settings: {
      theme: 'dark' | 'light';
      notifications: boolean;
    };
  };
  tags: string[];
}

// Type-fest ensures the path string is valid
type UserPaths = Paths<User>;
// 'profile' | 'profile.name' | 'profile.settings' |
// 'profile.settings.theme' | 'profile.settings.notifications' | 'tags'

// Use Pathist to manipulate type-safe paths
function buildUserPath<T extends UserPaths>(
  base: T,
  ...extensions: string[]
): string {
  const path = Pathist.from(base);
  return path.concat(...extensions).toString();
}

// Type-safe path construction
const themePath = buildUserPath('profile.settings', 'theme');
// const invalid = buildUserPath('invalid.path'); // TypeScript error!
```

### With [ArkType][arktype] Validation Errors

ArkType provides both string and array formats for error paths - Pathist handles both:

```typescript
import { type } from 'arktype';
import { Pathist } from 'pathist';

const User = type({
  profile: {
    name: 'string',
    age: 'number',
    'settings?': {
      theme: "'dark' | 'light'"
    }
  }
});

const result = User({
  profile: {
    name: 'Alice',
    age: 'invalid', // Should be number
    settings: { theme: 'blue' } // Should be 'dark' | 'light'
  }
});

if (result instanceof type.errors) {
  for (const error of result) {
    // ArkType provides path as array: ['profile', 'age']
    const path = Pathist.from(error.path);

    console.log(path.toString()); // 'profile.age'
    console.log(path.toJSONPath()); // '$.profile.age'

    // Navigate to parent path for nested errors
    const parentPath = path.parent();
    console.log(`Error in ${parentPath.toString()}: ${error.message}`);

    // Compare error paths
    const settingsErrors = error.path.some(segment =>
      Pathist.from(error.path).includes('settings')
    );
  }
}
```

### Path Normalization for Libraries

Use Pathist as a normalization layer between different path formats:

```typescript
import { Pathist } from 'pathist';

// Different libraries use different formats
const lodashPath = 'users[0].profile.name';
const mongoPath = 'users.0.profile.name';
const jsonPath = '$.users[0].profile.name';

// Normalize all to a common format
const normalized = Pathist.from(lodashPath);

// Convert to whatever format you need
const forLodash = normalized.toString(); // 'users[0].profile.name'
const forMongo = normalized.toString(Pathist.Notation.Dot); // 'users.0.profile.name'
const forJSONPath = normalized.toJSONPath(); // '$.users[0].profile.name'

// Compare paths regardless of original format
const path1 = Pathist.from('users[0].name');
const path2 = Pathist.from('users.0.name');
console.log(path1.equals(path2)); // true (same path, different notation)
```

## API Documentation

For complete API documentation with all methods, properties, and options, see:

- **[API Overview](docs/README.md)** - All classes, interfaces, and types
- **[Pathist Class](docs/classes/Pathist.md)** - Complete method reference
- **[Interfaces](docs/interfaces/)** - Configuration and options interfaces
- **[Type Aliases](docs/type-aliases/)** - Type definitions

## TypeScript Support

Pathist is written in TypeScript and provides full type definitions:

```typescript
import { Pathist, PathSegment, PathistInput, Notation, Indices } from 'pathist';

// Type-safe segment handling
const segments: PathSegment[] = ['foo', 'bar', 0, 'baz'];
const path: Pathist = Pathist.from(segments);

// Type-safe input
const input: PathistInput = 'foo.bar'; // string | PathSegment[]
const notation: Notation = Pathist.Notation.Mixed;
const indices: Indices = Pathist.Indices.Preserve;
```

## Iteration

Pathist instances are iterable:

```typescript
const path = Pathist.from('foo.bar.baz');

// for...of loop
for (const segment of path) {
  console.log(segment); // 'foo', 'bar', 'baz'
}

// Spread operator
const segments = [...path]; // ['foo', 'bar', 'baz']

// Array destructuring
const [first, second] = path; // 'foo', 'bar'
```

## License

MIT

## Links

- [API Documentation](docs/README.md)
- [GitHub Repository](https://github.com/yourusername/pathist)

[lodash]: https://lodash.com/
[jsonpath-plus]: https://github.com/JSONPath-Plus/JSONPath
[type-fest]: https://github.com/sindresorhus/type-fest
[arktype]: https://arktype.io/
