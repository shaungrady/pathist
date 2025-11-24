# Shelved Ideas

This document captures feature ideas that were considered but ultimately shelved—either deferred indefinitely or rejected in favor of keeping Pathist focused on its core competency.

---

## Object Navigation Method

### Idea

Add a `navigate(obj, defaultValue?)` method for traversing objects using Pathist paths.

### Why Shelved

**Crosses conceptual boundary**: Every method in Pathist currently operates on the *path itself* (parsing, formatting, comparing, slicing, merging). Adding `navigate()` would be the first method requiring an actual object as input, shifting from "path manipulation" to "object manipulation."

**Slippery slope**: Once `get()` exists, natural follow-up requests would be:
- `set()`, `has()`, `delete()`
- Wildcard/array support in navigation
- Edge case handling (prototypes, getters, symbols, circular references)

Each pulls further from the core competency and into territory already well-covered by specialized libraries.

**Weak value proposition**: Users needing object navigation likely already have Lodash, Ramda, or similar. For those who don't, dedicated micro-libraries like `object-get` (2kb) provide better, battle-tested implementations.

**Better alternative**: Pathist excels at being composable with existing tools:

```typescript
// Pathist + Lodash
import get from 'lodash/get';
const value = get(obj, path.array);

// Pathist + object-get
import objectGet from 'object-get';
const value = objectGet(obj, path.array);

// Pathist + JSONPath (for wildcards)
import { JSONPath } from 'jsonpath-plus';
const values = JSONPath({ path: path.toJSONPath(), json: obj });
```

This keeps Pathist **focused, composable, and zero-dependency** while seamlessly integrating with tools users already trust.

**Decision**: Keep Pathist pure. Its strength is being *really good* at path manipulation—not reimplementing functionality already solved by specialized libraries.

---

## Property Wildcard Support

### Idea

Support property wildcards to match any property name at a given position, complementing the existing index wildcard support.

**JSONPath distinction:**
- `[*]` - array/index wildcard (all array elements)
- `.*` - property wildcard (all object properties)

### Use Cases

**Path pattern matching:**
```typescript
const pattern = new Pathist('users.*.settings');
pattern.equals('users.alice.settings'); // → true?
pattern.equals('users.bob.settings');   // → true?
```

**JSONPath conversion parity:**
```typescript
new Pathist('users.*.settings').toJSONPath();
// → '$.users.*.settings'  (property wildcard)

new Pathist('users[*].settings').toJSONPath();
// → '$.users[*].settings'  (index wildcard)
```

### Why Shelved

**Ambiguity**: How to distinguish wildcard `*` from a property literally named `"*"`?
```typescript
new Pathist('users.*');      // Wildcard or literal "*" property?
new Pathist(['users', '*']); // Same problem
```

**Scope creep**: Supporting property wildcards starts making Pathist look like a query language rather than a path manipulation library. Next logical requests:
- Recursive descent (`..`)
- Filters (`[?(@.price < 10)]`)
- Multiple selectors (`['name','id']`)

This is JSONPath's domain, not Pathist's.

**Current workaround**: For wildcard queries, use Pathist for path building then delegate to JSONPath:
```typescript
const basePath = new Pathist('store.books');
const query = basePath.concat('*', 'author').toJSONPath();
// User's intent: property vs index wildcard is explicit in concat() call

import { JSONPath } from 'jsonpath-plus';
const authors = JSONPath({ path: query, json: data });
```

**Possible future solutions** (if revisited):
- **Explicit API**: `new Pathist('users').concat(Pathist.PROPERTY_WILDCARD, 'settings')`
- **Type markers**: Symbol-based segment types to distinguish wildcards from literals
- **Opt-in config**: `propertyWildcards: true` (disabled by default)

**Decision**: Keep Pathist focused on concrete paths. Pattern matching and querying are better handled by JSONPath libraries that specialize in this domain. If users need wildcards for queries, they can use `toJSONPath()` to bridge into the JSONPath ecosystem.

---

## Future Consideration Criteria

Before adding ideas to the shelved list, ask:
1. Does this operate on paths themselves, or does it require external data (objects, schemas, etc.)?
2. Is this functionality already well-solved by specialized libraries?
3. Does this create a slippery slope toward features outside Pathist's core competency?
4. Can this be achieved through composition with existing tools?

If the answer to questions 1-3 suggests scope creep, or question 4 is "yes," the idea likely belongs here.
