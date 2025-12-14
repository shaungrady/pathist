[**Pathist v1.2.0**](../README.md)

***

[Pathist](../README.md) / PathSegment

# Type Alias: PathSegment

> **PathSegment** = `string` | `number`

Defined in: [pathist.ts:10](https://github.com/shaungrady/pathist/blob/06fe07a6dc194a79e11167e1080200213ebb6e8c/src/pathist.ts#L10)

A single segment in a path, either a string property name or a numeric index.

## Example

```typescript
const segment1: PathSegment = 'foo';  // property name
const segment2: PathSegment = 0;      // array index
```
