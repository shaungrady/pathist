[**Pathist v1.2.0**](../README.md)

***

[Pathist](../README.md) / PathSegment

# Type Alias: PathSegment

> **PathSegment** = `string` | `number`

Defined in: [pathist.ts:10](https://github.com/shaungrady/pathist/blob/e11b9d0a17b19e7d5bc2eeb29e51c2c348a28253/src/pathist.ts#L10)

A single segment in a path, either a string property name or a numeric index.

## Example

```typescript
const segment1: PathSegment = 'foo';  // property name
const segment2: PathSegment = 0;      // array index
```
