[**Pathist v1.3.0**](../README.md)

***

[Pathist](../README.md) / PathSegment

# Type Alias: PathSegment

> **PathSegment** = `string` | `number`

Defined in: [pathist.ts:10](https://github.com/shaungrady/pathist/blob/2257b7c12204385aad1edea357df4050c73610a1/src/pathist.ts#L10)

A single segment in a path, either a string property name or a numeric index.

## Example

```typescript
const segment1: PathSegment = 'foo';  // property name
const segment2: PathSegment = 0;      // array index
```
