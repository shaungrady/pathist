[**Pathist v1.2.1**](../README.md)

***

[Pathist](../README.md) / PathistConfig

# Interface: PathistConfig

Defined in: [pathist.ts:39](https://github.com/shaungrady/pathist/blob/f9a11f53e02259034ebb6825652ad8447b1afad0/src/pathist.ts#L39)

Configuration options for creating a Pathist instance.

## Properties

| Property | Type | Default value | Description | Defined in |
| ------ | ------ | ------ | ------ | ------ |
| <a id="notation"></a> `notation?` | [`Notation`](../type-aliases/Notation.md) | The global `Pathist.defaultNotation` setting | The notation style to use when converting the path to a string. | [pathist.ts:44](https://github.com/shaungrady/pathist/blob/f9a11f53e02259034ebb6825652ad8447b1afad0/src/pathist.ts#L44) |
| <a id="indices"></a> `indices?` | [`Indices`](../type-aliases/Indices.md) | The global `Pathist.defaultIndices` setting | How to handle numeric indices during path comparisons. - `'Preserve'`: Indices must match exactly - `'Ignore'`: Any numeric index matches any other numeric index | [pathist.ts:52](https://github.com/shaungrady/pathist/blob/f9a11f53e02259034ebb6825652ad8447b1afad0/src/pathist.ts#L52) |
| <a id="nodechildrenproperties"></a> `nodeChildrenProperties?` | `string` | `ReadonlySet`<`string`> | `string`\[] | The global `Pathist.defaultNodeChildrenProperties` setting | Property name(s) that contain child nodes in tree structures. Used by node-related methods to identify tree relationships. | [pathist.ts:59](https://github.com/shaungrady/pathist/blob/f9a11f53e02259034ebb6825652ad8447b1afad0/src/pathist.ts#L59) |
