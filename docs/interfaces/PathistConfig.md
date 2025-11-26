[**Pathist v1.0.0**](../README.md)

***

[Pathist](../README.md) / PathistConfig

# Interface: PathistConfig

Defined in: pathist.ts:28

Configuration options for creating a Pathist instance.

## Properties

### notation?

> `optional` **notation**: [`Notation`](../type-aliases/Notation.md)

Defined in: pathist.ts:33

The notation style to use when converting the path to a string.

#### Default Value

The global `Pathist.defaultNotation` setting

***

### indices?

> `optional` **indices**: [`Indices`](../type-aliases/Indices.md)

Defined in: pathist.ts:41

How to handle numeric indices during path comparisons.
- `'Preserve'`: Indices must match exactly
- `'Ignore'`: Any numeric index matches any other numeric index

#### Default Value

The global `Pathist.defaultIndices` setting

***

### nodeChildrenProperties?

> `optional` **nodeChildrenProperties**: `string` \| `ReadonlySet`\<`string`\> \| `string`[]

Defined in: pathist.ts:48

Property name(s) that contain child nodes in tree structures.
Used by node-related methods to identify tree relationships.

#### Default Value

The global `Pathist.defaultNodeChildrenProperties` setting
