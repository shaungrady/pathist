[**Pathist v1.3.0**](../README.md)

***

[Pathist](../README.md) / PathistInput

# Type Alias: PathistInput

> **PathistInput** = `string` | [`PathSegment`](PathSegment.md)\[]

Defined in: [pathist.ts:34](https://github.com/shaungrady/pathist/blob/4b94a5ca125a554dad291872d2b98310e6b3858e/src/pathist.ts#L34)

Valid input types for constructing a Pathist instance.
Can be a path string (e.g., "foo.bar"), an array of segments, or an existing Pathist instance.

## Example

```typescript
const input1: PathistInput = 'foo.bar.baz';
const input2: PathistInput = ['foo', 'bar', 'baz'];
const input3: PathistInput = ['foo', 'bar', 0, 'baz'];
```
