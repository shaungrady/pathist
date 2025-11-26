[**Pathist v1.0.0**](../README.md)

***

[Pathist](../README.md) / ComparisonOptions

# Interface: ComparisonOptions

Defined in: pathist.ts:1716

Options for comparing paths.

## Properties

### indices?

> `optional` **indices**: [`Indices`](../type-aliases/Indices.md)

Defined in: pathist.ts:1723

How to handle numeric indices during comparison.
- `Pathist.Indices.Preserve`: Indices must match exactly
- `Pathist.Indices.Ignore`: Any numeric index matches any other numeric index

#### Default Value

The path instance's `indices` setting
