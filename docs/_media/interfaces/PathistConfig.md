[**Pathist v0.1.0**](../README.md)

***

[Pathist](../globals.md) / PathistConfig

# Interface: PathistConfig

Defined in: [pathist.ts:28](https://github.com/shaungrady/pathist/blob/main/src/pathist.ts#L28)

Configuration options for creating a Pathist instance.

## Properties

| Property | Type | Default value | Description | Defined in |
| ------ | ------ | ------ | ------ | ------ |
| <a id="notation"></a> `notation?` | [`Notation`](../type-aliases/Notation.md) | The global `Pathist.defaultNotation` setting | The notation style to use when converting the path to a string. | [pathist.ts:33](https://github.com/shaungrady/pathist/blob/main/src/pathist.ts#L33) |
| <a id="indices"></a> `indices?` | [`Indices`](../type-aliases/Indices.md) | The global `Pathist.defaultIndices` setting | How to handle numeric indices during path comparisons. - `'Preserve'`: Indices must match exactly - `'Ignore'`: Any numeric index matches any other numeric index | [pathist.ts:41](https://github.com/shaungrady/pathist/blob/main/src/pathist.ts#L41) |
| <a id="nodechildrenproperties"></a> `nodeChildrenProperties?` | `string` | `ReadonlySet`<`string`> | `string`\[] | The global `Pathist.defaultNodeChildrenProperties` setting | Property name(s) that contain child nodes in tree structures. Used by node-related methods to identify tree relationships. | [pathist.ts:48](https://github.com/shaungrady/pathist/blob/main/src/pathist.ts#L48) |
