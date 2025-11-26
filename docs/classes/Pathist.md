[**Pathist v1.0.0**](../README.md)

***

[Pathist](../README.md) / Pathist

# Class: Pathist

Defined in: pathist.ts:74

A path utility class for parsing, manipulating, and comparing object property paths.

Pathist provides a comprehensive API for working with property paths in JavaScript objects.
It supports multiple notation styles (dot, bracket, and mixed), handles numeric indices,
and offers powerful comparison and manipulation methods.

## Quick Reference

### Methods

| Method | Description |
| ------ | ----------- |
| [from()](#from) | Creates a new Pathist instance from various input types |
| [toArray()](#toarray) | Returns the path as an array of segments |
| [toString()](#tostring) | Converts the path to a string representation using the specified notation |
| [toJSONPath()](#tojsonpath) | Converts the path to JSONPath format (RFC 9535) |
| [\[iterator]\()](#iterator) | Makes the Pathist instance iterable, allowing use in for...of loops and spread operators |
| [equals()](#equals) | Checks if this path is equal to another path |
| [startsWith()](#startswith) | Checks if this path starts with the specified path segment sequence |
| [endsWith()](#endswith) | Checks if this path ends with the specified path segment sequence |
| [includes()](#includes) | Checks if this path contains the specified path segment sequence anywhere within it |
| [positionOf()](#positionof) | Finds the first position where the specified path segment sequence occurs within this path |
| [lastPositionOf()](#lastpositionof) | Finds the last position where the specified path segment sequence occurs within this path |
| [pathTo()](#pathto) | Returns the path up to and including the first occurrence of the specified path segment sequence |
| [pathToLast()](#pathtolast) | Returns the path up to and including the last occurrence of the specified path segment sequence |
| [slice()](#slice) | Returns a new path containing a subset of this path's segments |
| [concat()](#concat) | Returns a new path that combines this path with one or more other paths |
| [nodeIndices()](#nodeindices) | Returns the numeric index values from the contiguous tree structure |
| [nodePaths()](#nodepaths) | Generates paths to each successive node in the tree structure |
| [firstNodePath()](#firstnodepath) | Returns the path to the first node |
| [lastNodePath()](#lastnodepath) | Returns the full path to the last node in the contiguous tree structure |
| [afterNodePath()](#afternodepath) | Returns the path segments after the last node in the tree |
| [merge()](#merge) | Intelligently merges another path with this path by detecting overlapping segments |

### Accessors

| Accessor | Description |
| -------- | ----------- |
| [defaultNotation](#defaultnotation) | No description |
| [defaultIndices](#defaultindices) | No description |
| [indexWildcards](#indexwildcards) | No description |
| [defaultNodeChildrenProperties](#defaultnodechildrenproperties) | No description |
| [notation](#notation) | No description |
| [indices](#indices) | No description |
| [nodeChildrenProperties](#nodechildrenproperties) | No description |
| [array](#array) | No description |
| [string](#string) | No description |


## Examples

Basic usage

```typescript
const path = Pathist.from('foo.bar.baz');
console.log(path.length); // 3
console.log(path.toArray()); // ['foo', 'bar', 'baz']
```

Path comparison

```typescript
const path1 = Pathist.from('foo.bar');
const path2 = Pathist.from('foo.bar.baz');
console.log(path2.startsWith(path1)); // true
```

## Constructors

### Constructor

> **new Pathist**(`input`, `config?`): `Pathist`

Defined in: pathist.ts:555

Creates a new Pathist instance from a string, array, or existing Pathist.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `input` | [`PathistInput`](../type-aliases/PathistInput.md) | The path input (string like "foo.bar", array like \['foo', 'bar'], or Pathist instance) |
| `config?` | [`PathistConfig`](../interfaces/PathistConfig.md) | Optional configuration for notation, indices mode, and node children properties |

#### Returns

`Pathist`

#### Throws

If the string path contains syntax errors (unclosed brackets, mismatched quotes, etc.)

#### Throws

If array segments contain invalid types (must be string or number)

#### Examples

From string

```typescript
const path = Pathist.from('foo.bar.baz');
```

From array

```typescript
const path = Pathist.from(['foo', 'bar', 0, 'baz']);
```

With custom configuration

```typescript
const path = Pathist.from('foo.bar', {
  notation: Pathist.Notation.Bracket,
  indices: Pathist.Indices.Ignore
});
```

## Properties

| Property | Modifier | Type | Description | Defined in |
| ------ | ------ | ------ | ------ | ------ |
| <a id="notation"></a> `Notation` | `readonly` | `object` | Notation styles for converting paths to strings. - `Mixed`: Combines dot notation for properties and bracket notation for indices (e.g., `foo.bar[0].baz`) - `Dot`: Uses dot notation exclusively (e.g., `foo.bar.0.baz`) - `Bracket`: Uses bracket notation exclusively (e.g., `["foo"]["bar"][0]["baz"]`) | pathist.ts:86 |
| `Notation.Mixed` | `readonly` | `"Mixed"` | - | pathist.ts:87 |
| `Notation.Dot` | `readonly` | `"Dot"` | - | pathist.ts:88 |
| `Notation.Bracket` | `readonly` | `"Bracket"` | - | pathist.ts:89 |
| <a id="indices"></a> `Indices` | `readonly` | `object` | Modes for handling numeric indices during path comparisons. - `Preserve`: Numeric indices must match exactly for paths to be considered equal - `Ignore`: Any numeric index matches any other numeric index (useful for comparing paths across different array positions) | pathist.ts:98 |
| `Indices.Preserve` | `readonly` | `"Preserve"` | - | pathist.ts:99 |
| `Indices.Ignore` | `readonly` | `"Ignore"` | - | pathist.ts:100 |
| <a id="length"></a> `length` | `readonly` | `number` | The number of segments in this path. **Example** `const path = Pathist.from('foo.bar.baz'); console.log(path.length); // 3` | pathist.ts:492 |

## Accessors

### defaultNotation

#### Get Signature

> **get** `static` **defaultNotation**(): [`Notation`](../type-aliases/Notation.md)

Defined in: pathist.ts:121

Gets or sets the default notation style used when converting paths to strings.

When setting, the notation is validated and applied to all new Pathist instances.

##### Throws

When setting: If the notation value is invalid

##### Default Value

`Pathist.Notation.Mixed`

##### Returns

[`Notation`](../type-aliases/Notation.md)

#### Set Signature

> **set** `static` **defaultNotation**(`notation`): `void`

Defined in: pathist.ts:125

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `notation` | [`Notation`](../type-aliases/Notation.md) |

##### Returns

`void`

***

### defaultIndices

#### Get Signature

> **get** `static` **defaultIndices**(): [`Indices`](../type-aliases/Indices.md)

Defined in: pathist.ts:139

Gets or sets the default indices comparison mode.

When setting, the mode is validated and applied to all new Pathist instances.

##### Throws

When setting: If the indices mode is invalid

##### Default Value

`Pathist.Indices.Preserve`

##### Returns

[`Indices`](../type-aliases/Indices.md)

#### Set Signature

> **set** `static` **defaultIndices**(`mode`): `void`

Defined in: pathist.ts:143

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `mode` | [`Indices`](../type-aliases/Indices.md) |

##### Returns

`void`

***

### indexWildcards

#### Get Signature

> **get** `static` **indexWildcards**(): `ReadonlySet`<`string` | `number`>

Defined in: pathist.ts:161

Gets or sets the values that are treated as index wildcards.

Wildcard values match any numeric index during comparisons.

When setting, wildcard values can be:

* Negative numbers or non-finite numbers (Infinity, -Infinity, NaN)
* Strings that don't match the pattern `/^[0-9]+$/`

##### Throws

When setting: If any wildcard value is invalid (e.g., positive finite number or numeric string)

##### Default Value

`Set([-1, '*'])`

##### Returns

`ReadonlySet`<`string` | `number`>

#### Set Signature

> **set** `static` **indexWildcards**(`value`): `void`

Defined in: pathist.ts:165

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `value` | `string` | `number` | `ReadonlySet`<`string` | `number`> | (`string` | `number`)\[] |

##### Returns

`void`

***

### defaultNodeChildrenProperties

#### Get Signature

> **get** `static` **defaultNodeChildrenProperties**(): `ReadonlySet`<`string`>

Defined in: pathist.ts:200

##### Returns

`ReadonlySet`<`string`>

#### Set Signature

> **set** `static` **defaultNodeChildrenProperties**(`value`): `void`

Defined in: pathist.ts:212

Gets or sets the default property names that contain child nodes in tree structures.
These properties are used by node-related methods to identify and traverse tree relationships.

##### Throws

* When setting: If the value is not a Set, Array, or string, or if any value is not a string

##### Default Value

`Set(['children'])`

##### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `value` | `string` | `ReadonlySet`<`string`> | `string`\[] | When setting: A Set, Array, or single string value representing property names |

##### Returns

`void`

***

### notation

#### Get Signature

> **get** **notation**(): [`Notation`](../type-aliases/Notation.md)

Defined in: pathist.ts:499

Gets the notation style for this instance.

Returns the instance-specific notation if set, otherwise returns the global default.

##### Returns

[`Notation`](../type-aliases/Notation.md)

***

### indices

#### Get Signature

> **get** **indices**(): [`Indices`](../type-aliases/Indices.md)

Defined in: pathist.ts:508

Gets the indices comparison mode for this instance.

Returns the instance-specific mode if set, otherwise returns the global default.

##### Returns

[`Indices`](../type-aliases/Indices.md)

***

### nodeChildrenProperties

#### Get Signature

> **get** **nodeChildrenProperties**(): `ReadonlySet`<`string`>

Defined in: pathist.ts:517

Gets the node children properties for this instance.

Returns the instance-specific properties if set, otherwise returns the global default.

##### Returns

`ReadonlySet`<`string`>

***

### array

#### Get Signature

> **get** **array**(): [`PathSegment`](../type-aliases/PathSegment.md)\[]

Defined in: pathist.ts:608

Gets the path as an array of segments.

Alias for [toArray](#toarray).

##### Returns

[`PathSegment`](../type-aliases/PathSegment.md)\[]

***

### string

#### Get Signature

> **get** **string**(): `string`

Defined in: pathist.ts:678

Gets the path as a string using the instance's default notation.

Alias for [toString](#tostring) with no arguments.

##### Returns

`string`

## Methods

### from()

> `static` **from**(`input`, `config?`): `Pathist`

Defined in: pathist.ts:302

Creates a new Pathist instance from various input types.
This is the Temporal-style factory method alternative to using `Pathist.from()`.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `input` | [`PathistInput`](../type-aliases/PathistInput.md) | Path string, array of segments, or existing Pathist instance |
| `config?` | [`PathistConfig`](../interfaces/PathistConfig.md) | Optional configuration for notation, indices mode, etc. |

#### Returns

`Pathist`

A new Pathist instance

#### Example

```typescript
Pathist.from('foo.bar.baz')
Pathist.from(['foo', 'bar', 'baz'])
Pathist.from('foo.bar', { notation: 'bracket' })
```

***

### toArray()

> **toArray**(): [`PathSegment`](../type-aliases/PathSegment.md)\[]

Defined in: pathist.ts:598

Returns the path as an array of segments.

Returns a copy of the internal segments array to maintain immutability.

#### Returns

[`PathSegment`](../type-aliases/PathSegment.md)\[]

A new array containing all path segments

#### Example

```typescript
const path = Pathist.from('foo.bar[0].baz');
console.log(path.toArray()); // ['foo', 'bar', 0, 'baz']
```

***

### toString()

> **toString**(`notation?`): `string`

Defined in: pathist.ts:641

Converts the path to a string representation using the specified notation.

Results are cached for performance. The notation parameter allows overriding
the instance's default notation on a per-call basis.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `notation?` | [`Notation`](../type-aliases/Notation.md) | Optional notation style to use (overrides instance default) |

#### Returns

`string`

The path as a string

#### Throws

If the notation value is invalid

#### Examples

Default notation (Mixed)

```typescript
const path = Pathist.from(['foo', 'bar', 0, 'baz']);
console.log(path.toString()); // 'foo.bar[0].baz'
```

Bracket notation

```typescript
console.log(path.toString(Pathist.Notation.Bracket)); // '["foo"]["bar"][0]["baz"]'
```

Dot notation

```typescript
console.log(path.toString(Pathist.Notation.Dot)); // 'foo.bar.0.baz'
```

***

### toJSONPath()

> **toJSONPath**(): `string`

Defined in: pathist.ts:711

Converts the path to JSONPath format (RFC 9535).

JSONPath is a standardized query language for JSON. This method converts
the path to a JSONPath selector string starting with `$` (the root).

#### Returns

`string`

The path as a JSONPath string

#### Examples

Basic usage

```typescript
const path = Pathist.from('foo.bar.baz');
console.log(path.toJSONPath()); // '$.foo.bar.baz'
```

With numeric indices

```typescript
const path = Pathist.from('items[0].name');
console.log(path.toJSONPath()); // '$.items[0].name'
```

With wildcards

```typescript
const path = Pathist.from('items[*].name');
console.log(path.toJSONPath()); // '$.items[*].name'
```

***

### \[iterator]\()

> **\[iterator]**(): `Iterator`<[`PathSegment`](../type-aliases/PathSegment.md)>

Defined in: pathist.ts:768

Makes the Pathist instance iterable, allowing use in for...of loops and spread operators.

#### Returns

`Iterator`<[`PathSegment`](../type-aliases/PathSegment.md)>

An iterator over the path segments

#### Examples

Using for...of

```typescript
const path = Pathist.from('foo.bar.baz');
for (const segment of path) {
  console.log(segment); // 'foo', 'bar', 'baz'
}
```

Using spread operator

```typescript
const segments = [...path]; // ['foo', 'bar', 'baz']
```

***

### equals()

> **equals**(`other`, `options?`): `boolean`

Defined in: pathist.ts:806

Checks if this path is equal to another path.

Two paths are equal if they have the same length and all corresponding segments match.
The indices option controls how numeric indices are compared.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `other` | [`PathistInput`](../type-aliases/PathistInput.md) | `Pathist` | The path to compare against |
| `options?` | [`ComparisonOptions`](../interfaces/ComparisonOptions.md) | Optional comparison options |

#### Returns

`boolean`

`true` if the paths are equal, `false` otherwise

#### See

* [startsWith](#startswith) for checking if this path starts with another
* [endsWith](#endswith) for checking if this path ends with another
* [includes](#includes) for checking if this path contains another

#### Examples

Exact comparison (default)

```typescript
const path1 = Pathist.from('foo[0].bar');
const path2 = Pathist.from('foo[0].bar');
console.log(path1.equals(path2)); // true
```

Ignoring indices

```typescript
const path1 = Pathist.from('foo[0].bar');
const path2 = Pathist.from('foo[5].bar');
console.log(path1.equals(path2, { indices: Pathist.Indices.Ignore })); // true
```

***

### startsWith()

> **startsWith**(`other`, `options?`): `boolean`

Defined in: pathist.ts:848

Checks if this path starts with the specified path segment sequence.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `other` | [`PathistInput`](../type-aliases/PathistInput.md) | `Pathist` | The path segment sequence to check |
| `options?` | [`ComparisonOptions`](../interfaces/ComparisonOptions.md) | Optional comparison options |

#### Returns

`boolean`

`true` if this path starts with the specified sequence, `false` otherwise

#### See

* [endsWith](#endswith) for checking if this path ends with a sequence
* [equals](#equals) for exact path comparison
* [positionOf](#positionof) for finding the position of a sequence

#### Example

```typescript
const path = Pathist.from('foo.bar.baz');
console.log(path.startsWith('foo.bar')); // true
console.log(path.startsWith('bar')); // false
```

***

### endsWith()

> **endsWith**(`other`, `options?`): `boolean`

Defined in: pathist.ts:870

Checks if this path ends with the specified path segment sequence.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `other` | [`PathistInput`](../type-aliases/PathistInput.md) | `Pathist` | The path segment sequence to check |
| `options?` | [`ComparisonOptions`](../interfaces/ComparisonOptions.md) | Optional comparison options |

#### Returns

`boolean`

`true` if this path ends with the specified sequence, `false` otherwise

#### See

* [startsWith](#startswith) for checking if this path starts with a sequence
* [equals](#equals) for exact path comparison
* [lastPositionOf](#lastpositionof) for finding the last position of a sequence

#### Example

```typescript
const path = Pathist.from('foo.bar.baz');
console.log(path.endsWith('bar.baz')); // true
console.log(path.endsWith('bar')); // false
```

***

### includes()

> **includes**(`other`, `options?`): `boolean`

Defined in: pathist.ts:902

Checks if this path contains the specified path segment sequence anywhere within it.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `other` | [`PathistInput`](../type-aliases/PathistInput.md) | `Pathist` | The path segment sequence to search for |
| `options?` | [`ComparisonOptions`](../interfaces/ComparisonOptions.md) | Optional comparison options |

#### Returns

`boolean`

`true` if this path contains the specified sequence, `false` otherwise

#### See

* [positionOf](#positionof) for finding the exact position of the sequence
* [startsWith](#startswith) for checking if the sequence is at the start
* [endsWith](#endswith) for checking if the sequence is at the end

#### Example

```typescript
const path = Pathist.from('foo.bar.baz.qux');
console.log(path.includes('bar.baz')); // true
console.log(path.includes('baz.foo')); // false
```

***

### positionOf()

> **positionOf**(`other`, `options?`): `number`

Defined in: pathist.ts:930

Finds the first position where the specified path segment sequence occurs within this path.

Returns the index of the first segment where the match begins, or -1 if not found.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `other` | [`PathistInput`](../type-aliases/PathistInput.md) | `Pathist` | The path segment sequence to search for |
| `options?` | [`ComparisonOptions`](../interfaces/ComparisonOptions.md) | Optional comparison options |

#### Returns

`number`

The zero-based position of the first match, or -1 if not found

#### See

* [lastPositionOf](#lastpositionof) for finding the last occurrence
* [includes](#includes) for checking if a sequence exists without needing the position
* [pathTo](#pathto) for extracting the path up to the first occurrence

#### Example

```typescript
const path = Pathist.from('foo.bar.baz.bar');
console.log(path.positionOf('bar')); // 1 (first occurrence)
console.log(path.positionOf('qux')); // -1 (not found)
```

***

### lastPositionOf()

> **lastPositionOf**(`other`, `options?`): `number`

Defined in: pathist.ts:986

Finds the last position where the specified path segment sequence occurs within this path.

Returns the index of the first segment where the last match begins, or -1 if not found.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `other` | [`PathistInput`](../type-aliases/PathistInput.md) | `Pathist` | The path segment sequence to search for |
| `options?` | [`ComparisonOptions`](../interfaces/ComparisonOptions.md) | Optional comparison options |

#### Returns

`number`

The zero-based position of the last match, or -1 if not found

#### See

* [positionOf](#positionof) for finding the first occurrence
* [pathToLast](#pathtolast) for extracting the path up to the last occurrence

#### Example

```typescript
const path = Pathist.from('foo.bar.baz.bar');
console.log(path.lastPositionOf('bar')); // 3 (last occurrence)
console.log(path.lastPositionOf('qux')); // -1 (not found)
```

***

### pathTo()

> **pathTo**(`other`, `options?`): `Pathist`

Defined in: pathist.ts:1046

Returns the path up to and including the first occurrence of the specified path segment sequence.

This method searches for the first match of the provided path within this path and returns
a new Pathist instance containing all segments from the start up to and including the match.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `other` | [`PathistInput`](../type-aliases/PathistInput.md) | `Pathist` | The path segment sequence to search for (can be a Pathist instance, string, or array) |
| `options?` | [`ComparisonOptions`](../interfaces/ComparisonOptions.md) | Optional comparison options (e.g., indices mode) |

#### Returns

`Pathist`

A new Pathist instance containing the path up to and including the first match,
or an empty path if no match is found

#### See

* [pathToLast](#pathtolast) for extracting up to the last occurrence
* [positionOf](#positionof) for getting just the position without extraction
* [slice](#slice) for general segment extraction

#### Example

```typescript
const p = Pathist.from('foo.bar.baz.bar.qux');
p.pathTo('bar').toString();        // 'foo.bar'
p.pathTo('bar.baz').toString();    // 'foo.bar.baz'
p.pathTo('notfound').toString();   // ''
```

***

### pathToLast()

> **pathToLast**(`other`, `options?`): `Pathist`

Defined in: pathist.ts:1085

Returns the path up to and including the last occurrence of the specified path segment sequence.

This method searches for the last match of the provided path within this path and returns
a new Pathist instance containing all segments from the start up to and including the last match.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `other` | [`PathistInput`](../type-aliases/PathistInput.md) | `Pathist` | The path segment sequence to search for (can be a Pathist instance, string, or array) |
| `options?` | [`ComparisonOptions`](../interfaces/ComparisonOptions.md) | Optional comparison options (e.g., indices mode) |

#### Returns

`Pathist`

A new Pathist instance containing the path up to and including the last match,
or an empty path if no match is found

#### See

* [pathTo](#pathto) for extracting up to the first occurrence
* [lastPositionOf](#lastpositionof) for getting just the position without extraction

#### Example

```typescript
const p = Pathist.from('foo.bar.baz.bar.qux');
p.pathToLast('bar').toString();        // 'foo.bar.baz.bar'
p.pathToLast('bar.baz').toString();    // 'foo.bar.baz'
p.pathToLast('notfound').toString();   // ''
```

***

### slice()

> **slice**(`start?`, `end?`): `Pathist`

Defined in: pathist.ts:1128

Returns a new path containing a subset of this path's segments.

Works like Array.slice(), extracting segments from start to end (end not included).
The new path preserves this path's configuration.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `start?` | `number` | Zero-based index at which to start extraction (default: 0) |
| `end?` | `number` | Zero-based index before which to end extraction (default: path length) |

#### Returns

`Pathist`

A new Pathist instance containing the extracted segments

#### Example

```typescript
const path = Pathist.from('foo.bar.baz.qux');
console.log(path.slice(1, 3).toString()); // 'bar.baz'
console.log(path.slice(2).toString()); // 'baz.qux'
```

***

### concat()

> **concat**(...`paths`): `Pathist`

Defined in: pathist.ts:1157

Returns a new path that combines this path with one or more other paths.

Creates a new path by concatenating all segments in order. The new path
preserves this path's configuration.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| ...`paths` | ([`PathistInput`](../type-aliases/PathistInput.md) | `Pathist`)\[] | One or more paths to concatenate |

#### Returns

`Pathist`

A new Pathist instance containing all concatenated segments

#### Throws

If any path input is invalid

#### Examples

```typescript
const path1 = Pathist.from('foo.bar');
const path2 = Pathist.from('baz.qux');
console.log(path1.concat(path2).toString()); // 'foo.bar.baz.qux'
```

Multiple paths

```typescript
const result = path1.concat('baz', ['qux', 'quux']);
console.log(result.toString()); // 'foo.bar.baz.qux.quux'
```

***

### nodeIndices()

> **nodeIndices**(): `number`\[]

Defined in: pathist.ts:1265

Returns the numeric index values from the contiguous tree structure.

Extracts all numeric indices from the tree path, representing the tree path coordinates.

#### Returns

`number`\[]

An array of numeric indices, or an empty array if no tree structure exists

#### Example

```typescript
const path = Pathist.from('items[5].children[1].children[3].name');
console.log(path.nodeIndices()); // [5, 1, 3]

const path2 = Pathist.from('foo.bar.baz');
console.log(path2.nodeIndices()); // []
```

***

### nodePaths()

> **nodePaths**(): `Generator`<`Pathist`, `void`, `undefined`>

Defined in: pathist.ts:1327

Generates paths to each successive node in the tree structure.

Yields the path to each node level, starting with the root (empty path) and
progressively building up through each node in the tree.

#### Returns

`Generator`<`Pathist`, `void`, `undefined`>

A generator that yields Pathist instances for each node level

#### Examples

Full tree structure

```typescript
const path = new Pathist('children[0].children[1].foo');
for (const nodePath of path.nodePaths()) {
  console.log(nodePath.string);
}
// Output:
// ''                            (root)
// 'children[0]'                 (first node)
// 'children[0].children[1]'     (second node)
```

Path starting with index

```typescript
const path = new Pathist('[0].children[1].children[2]');
const paths = [...path.nodePaths()];
// paths = [
//   Pathist(''),
//   Pathist('[0]'),
//   Pathist('[0].children[1]'),
//   Pathist('[0].children[1].children[2]')
// ]
```

No tree structure - just root

```typescript
const path = new Pathist('foo.bar');
const paths = [...path.nodePaths()];
// paths = [Pathist('')]
```

***

### firstNodePath()

> **firstNodePath**(): `Pathist`

Defined in: pathist.ts:1380

Returns the path to the first node.

* If the path starts with a numeric index, returns the path up to and including that index
* Otherwise, returns an empty path (representing the root node)

#### Returns

`Pathist`

A new Pathist representing the path to the first node

#### See

* [lastNodePath](#lastnodepath) for extracting the full node path
* [afterNodePath](#afternodepath) for extracting the path after all nodes

#### Examples

Path starting with index

```typescript
const path = new Pathist('[0].children[1].foo');
console.log(path.firstNodePath().toString()); // '[0]'
```

Path starting with property

```typescript
const path = new Pathist('children[0].children[1].foo');
console.log(path.firstNodePath().toString()); // '' (root)
```

Path with no indices

```typescript
const path = new Pathist('foo.bar');
console.log(path.firstNodePath().toString()); // '' (root)
```

***

### lastNodePath()

> **lastNodePath**(): `Pathist`

Defined in: pathist.ts:1414

Returns the full path to the last node in the contiguous tree structure.

* If the path contains numeric indices, returns the path up to and including the last node
* Otherwise, returns an empty path (representing the root node)

#### Returns

`Pathist`

A new Pathist representing the full node path

#### See

* [firstNodePath](#firstnodepath) for extracting the path to the first node
* [afterNodePath](#afternodepath) for extracting the path after all nodes

#### Examples

Tree structure

```typescript
const path = new Pathist('children[0].children[1].foo');
console.log(path.lastNodePath().toString()); // 'children[0].children[1]'
```

Path with no indices

```typescript
const path = new Pathist('foo.bar');
console.log(path.lastNodePath().toString()); // '' (root)
```

***

### afterNodePath()

> **afterNodePath**(): `Pathist`

Defined in: pathist.ts:1450

Returns the path segments after the last node in the tree.

* If the path contains numeric indices, returns the path after the last node
* Otherwise, returns the full path (all segments are relative to the root node)

#### Returns

`Pathist`

A new Pathist containing the segments after the tree structure

#### See

* [lastNodePath](#lastnodepath) for extracting the full node path
* [firstNodePath](#firstnodepath) for extracting the path to the first node

#### Examples

Tree with properties after

```typescript
const path = new Pathist('children[0].children[1].foo');
console.log(path.afterNodePath().toString()); // 'foo'
```

No indices - all relative to root

```typescript
const path = new Pathist('foo.bar');
console.log(path.afterNodePath().toString()); // 'foo.bar'
```

***

### merge()

> **merge**(`path`): `Pathist`

Defined in: pathist.ts:1497

Intelligently merges another path with this path by detecting overlapping segments.

Finds the longest suffix of this path that matches a prefix of the other path,
then combines them by merging at the overlap point. When overlapping segments
include wildcards, concrete values take precedence.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `path` | [`PathistInput`](../type-aliases/PathistInput.md) | `Pathist` | The path to merge with this path |

#### Returns

`Pathist`

A new Pathist instance containing the merged path

#### Throws

If the path input is invalid

#### Examples

Basic merge with overlap

```typescript
const left = Pathist.from('foo.bar.baz');
const right = Pathist.from('baz.qux');
console.log(left.merge(right).toString()); // 'foo.bar.baz.qux'
```

Merge with wildcard replacement

```typescript
const left = Pathist.from('foo[*].bar');
const right = Pathist.from('foo[5].bar.baz');
console.log(left.merge(right).toString()); // 'foo[5].bar.baz'
// The wildcard is replaced with the concrete index
```

No overlap - simple concatenation

```typescript
const left = Pathist.from('foo.bar');
const right = Pathist.from('qux.quux');
console.log(left.merge(right).toString()); // 'foo.bar.qux.quux'
```
