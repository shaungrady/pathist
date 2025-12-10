# ["Path"].ist

###### Package: [GitHub](https://github.com/shaungrady/pathist), [npm](https://www.npmjs.com/package/pathist)  |  Releases: [Changelog](https://github.com/shaungrady/pathist/releases)  |  Author: [Shaun Grady](https://shaungrady.com/)

Pathist is a TypeScript library for parsing, manipulating, and comparing object property paths with support for multiple notations, wildcards, and tree traversal.

## Features

- **Multiple notation styles**: Mixed (`foo.bar[0]`), Dot (`foo.bar.0`), and Bracket (`["foo"]["bar"][0]`)
- **Path parsing**: Convert strings and arrays to structured path objects
- **Path comparison**: Check equality, prefixes, suffixes, and containment
- **Path manipulation**: Slice, concat, and intelligently merge paths
- **Pattern matching**: Match paths with wildcards and extract concrete values
- **Tree traversal**: Navigate hierarchical structures with node-aware methods
- **JSONPath conversion**: Export paths to RFC 9535 JSONPath format
- **JSON Pointer support**: Parse and convert to/from RFC 6901 JSON Pointer format
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
path.length; // 5
path.array; // ['user', 'profile', 'settings', 0, 'name']

// Convert between notations
path.string; // 'user.profile.settings[0].name' (default: Mixed)
path.toString(Pathist.Notation.Dot); // 'user.profile.settings.0.name'
path.toString(Pathist.Notation.Bracket); // '["user"]["profile"]["settings"][0]["name"]'

// JSONPath export (RFC 9535)
path.jsonPath; // '$.user.profile.settings[0].name'

// JSON Pointer export (RFC 6901)
path.jsonPointer; // '/user/profile/settings/0/name'

// Parse JSON Pointer
const fromPointer = Pathist.fromJSONPointer('/user/profile/settings/0/name');
fromPointer.string; // 'user.profile.settings[0].name'
```

## Common Use Cases

### Path Comparison

```typescript
const basePath = Pathist.from('users.preferences');
const fullPath = Pathist.from('users.preferences.theme.color');

// Check relationships
fullPath.startsWith(basePath); // true
fullPath.endsWith('color'); // true
fullPath.includes('preferences.theme'); // true

// Exact equality
const path1 = Pathist.from('items[0].name');
const path2 = Pathist.from('items[5].name');
path1.equals(path2); // false
path1.equals(path2, { indices: Pathist.Indices.Ignore }); // true
```

### Path Manipulation

```typescript
// Slicing
const path = Pathist.from('foo.bar.baz.qux');
path.slice(1, 3).string; // 'bar.baz'
path.slice(2).string; // 'baz.qux'

// Parent paths
const errorPath = Pathist.from('users[0].profile.settings.theme');
errorPath.parentPath().string; // 'users[0].profile.settings'
errorPath.parentPath(2).string; // 'users[0].profile'
errorPath.parentPath(10).string; // '' (returns empty path)

// Concatenation
const base = Pathist.from('api.users');
const extended = base.concat('profile', 'avatar');
extended.string; // 'api.users.profile.avatar'

// Intelligent merging with overlap detection
const left = Pathist.from('data.users[0].profile');
const right = Pathist.from('profile.settings.theme');
left.merge(right).string; // 'data.users[0].profile.settings.theme'
```

### Wildcards and Index Matching

```typescript
// Configure wildcards
Pathist.indexWildcards = new Set(['*', -1]);

// Use wildcards in paths
const template = Pathist.from('items[*].metadata');
const concrete = Pathist.from('items[5].metadata');

// Wildcards match any numeric index
template.equals(concrete); // true (wildcard matches numbers)
Pathist.from('items[*]').equals(Pathist.from('items[5]')); // true

// Wildcards do NOT match string properties
Pathist.from('items[*]').equals(Pathist.from('items.foo')); // false

// Wildcards work in all comparison methods
const path1 = Pathist.from('users[*].name');
const path2 = Pathist.from('users[0].name');
path1.equals(path2); // true
path1.positionOf(path2); // 0

// Check if a path contains wildcards
path1.hasIndexWildcards; // true (contains wildcard *)
path2.hasIndexWildcards; // false (no wildcards)
Pathist.from('foo.bar.baz').hasIndexWildcards; // false
```

### Pattern Matching with Wildcards

The `match`, `matchStart`, and `matchEnd` methods extract matched path segments with concrete values:

```typescript
const path = Pathist.from(['items', 5, 'metadata', 'tags', 2]);

// Match with wildcards - returns concrete values
const match = path.matchStart('items[*].metadata');
match?.array; // ['items', 5, 'metadata'] - wildcard replaced with 5

// Extract remaining path after match
const remaining = path.slice(match!.length);
remaining.array; // ['tags', 2]

// Wildcards work with all match methods
path.match('[*].metadata')?.array; // [5, 'metadata']
path.matchEnd('tags[*]')?.array; // ['tags', 2]

// Match concrete paths against wildcard patterns
const concrete = Pathist.from(['users', 0, 'profile', 'name']);
concrete.equals('users[*].profile.name'); // true
```

### Tree/Node Navigation

For working with hierarchical tree structures:

```typescript
// Configure children property names
const path = Pathist.from('children[0].children[1].children[2].value', {
  nodeChildrenProperties: ['children'] // This is the default value
});

// Extract node paths
path.firstNodePath().string; // '' (root)
path.lastNodePath().string; // 'children[0].children[1].children[2]'
path.afterNodePath().string; // 'value'

// Get node indices
path.nodeIndices(); // [0, 1, 2]

// Navigate to parent nodes
path.parentNode().string; // 'children[0].children[1]' (parent of last node)
path.parentNode(2).string; // 'children[0]' (grandparent)
path.parentNode(3).string; // '' (root)

// Iterate through each node level
for (const nodePath of path.nodePaths()) {
  nodePath.string;
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
path.positionOf('bar'); // 1 (first occurrence)
path.lastPositionOf('bar'); // 3 (last occurrence)

// Extract up to a match
path.pathTo('bar').string; // 'foo.bar'
path.pathToLast('bar').string; // 'foo.bar.baz.bar'

// Extract matched portion (returns null if no match)
path.match('bar.baz')?.array; // ['bar', 'baz'] (first matched subsequence)
path.matchStart('foo.bar')?.array; // ['foo', 'bar'] (matched prefix)
path.matchEnd('bar.qux')?.array; // ['bar', 'qux'] (matched suffix)
```

### Configuration

```typescript
// These are the global defaults
Pathist.defaultNotation = Pathist.Notation.Bracket;
Pathist.defaultIndices = Pathist.Indices.Preserve;
Pathist.defaultNodeChildrenProperties = new Set(['children']);
// Can be any negative or non-finite number, or a non-numeric string
Pathist.indexWildcards = new Set([-1, '*']);

// Instance-specific configuration
const path = Pathist.from('foo.bar[9]', {
  notation: Pathist.Notation.Dot,
  indices: Pathist.Indices.Ignore,
  nodeChildrenProperties: ['nodes', 'items', 'kiddos']
});

path.string; // 'foo.bar.9' (uses Dot notation)
```

## Special Characters and Edge Cases

```typescript
// Properties with dots, brackets, or spaces
const path1 = Pathist.from(['foo.bar', 'baz']);
path1.string; // '["foo.bar"].baz'

const path2 = Pathist.from(['foo[0]', 'qux']);
path2.string; // '["foo[0]"].qux'

// Empty string properties
const path3 = Pathist.from(['', 'value']);
path3.string; // '[""].value'

// Escaped dots in string paths
const path4 = Pathist.from('foo\\.bar.baz');
path4.array; // ['foo.bar', 'baz']
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
value; // 'dark'

// Handle missing paths gracefully
const missing = Pathist.from('users[5].profile.name');
const name = missing.reduce((obj, seg) => obj?.[seg], data);
name; // undefined

// Provide default fallback values
const withDefault = missing.reduce((obj, seg) => obj?.[seg] ?? {}, data);
withDefault; // {}
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
const theme = get(data, settingsPath.string); // 'dark'
set(data, settingsPath.string, 'auto');

// Convert between notations for different libraries
const lodashPath = settingsPath.string; // 'users[0].profile.settings.theme'
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
const jsonPath = path.jsonPath; // '$.store.books[0].title'

const result = JSONPath({ path: jsonPath, json: data });
result; // ['Book 1']

// Use wildcards for multiple matches
const wildcardPath = Pathist.from('store.books[*].price');
const allPrices = JSONPath({ path: wildcardPath.jsonPath, json: data });
allPrices; // [10, 15]
```

### JSON Pointer (RFC 6901) Support

Pathist supports both parsing and converting to [JSON Pointer](https://datatracker.ietf.org/doc/html/rfc6901) format, which is commonly used in JSON Patch (RFC 6902), JSON Schema, and various API specifications:

```typescript
import { Pathist } from 'pathist';

// Parse JSON Pointer strings
const path = Pathist.fromJSONPointer('/store/books/0/title');
path.array; // ['store', 'books', 0, 'title']
path.string; // 'store.books[0].title'

// Convert paths to JSON Pointer format
const userPath = Pathist.from('user.profile.settings.theme');
userPath.jsonPointer; // '/user/profile/settings/theme'

// Handle special characters (~ and / are escaped per RFC 6901)
const specialPath = Pathist.from(['foo~bar', 'baz/qux']);
specialPath.jsonPointer; // '/foo~0bar/baz~1qux'

// Round-trip conversion
const original = Pathist.from('items[0].metadata.tags[2]');
const pointer = original.jsonPointer; // '/items/0/metadata/tags/2'
const parsed = Pathist.fromJSONPointer(pointer);
parsed.equals(original); // true

// Root reference (empty path)
const root = Pathist.fromJSONPointer('');
root.length; // 0
root.jsonPointer; // ''
```

**Key differences from JSONPath:**
- JSON Pointer uses `/` as separator (vs. `.` in JSONPath)
- JSON Pointer uses `/0` for array indices (vs. `[0]` in JSONPath)
- JSON Pointer starts with `/` (vs. `$` in JSONPath)
- JSON Pointer is simpler - no query expressions, just direct path references

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
  return path.concat(...extensions).string;
}

// Type-safe path construction
const themePath = buildUserPath('profile.settings', 'theme');
// const invalid = buildUserPath('invalid.path'); // TypeScript error!
```

### With [ArkType][arktype] Validation Errors

ArkType provides error paths as arrays - use Pathist to match them against wildcard patterns for custom error handling:

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
  },
  'tags?': 'string[]'
});

// Define error transforms with wildcard patterns
const errorConfig = {
  'profile.name': { message: 'Please provide your name' },
  'profile.age': { message: 'Age must be a number' },
  'profile.settings.theme': { message: 'Theme must be dark or light' },
  'tags[-1]': { message: 'Each tag must be a string' }, // Matches any array index
};

const result = User({
  profile: {
    name: 'Alice',
    age: 'invalid', // Should be number
    settings: { theme: 'blue' } // Should be 'dark' | 'light'
  },
  tags: ['valid', 123] // Second tag is invalid
});

if (result instanceof type.errors) {
  for (const error of result) {
    // ArkType provides path as array: ['profile', 'age'] or ['tags', 1]
    const errorPath = Pathist.from(error.path);

    // Match against wildcard patterns
    for (const [pattern, config] of Object.entries(errorConfig)) {
      if (errorPath.equals(pattern)) {
        console.log(`${errorPath.string}: ${config.message}`);
        break;
      }
    }

    // Or match descendant paths for broader error handling
    const match = errorPath.matchStart('profile.settings');
    if (match) {
      console.log(`Settings error at: ${match.string}`);
    }

    // Navigate to parent for context
    const parentPath = errorPath.parentPath();
    console.log(`Error in ${parentPath.string}: ${error.message}`);
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
const forLodash = normalized.string; // 'users[0].profile.name'
const forMongo = normalized.toString(Pathist.Notation.Dot); // 'users.0.profile.name'
const forJSONPath = normalized.jsonPath; // '$.users[0].profile.name'

// Compare paths regardless of original format
const path1 = Pathist.from('users[0].name');
const path2 = Pathist.from('users.0.name');
path1.equals(path2); // true (same path, different notation)
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
  segment; // 'foo', 'bar', 'baz'
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
