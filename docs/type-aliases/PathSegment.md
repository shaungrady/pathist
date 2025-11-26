[**Pathist v1.0.0**](../README.md)

***

[Pathist](../README.md) / PathSegment

# Type Alias: PathSegment

> **PathSegment** = `string` \| `number`

Defined in: pathist.ts:10

A single segment in a path, either a string property name or a numeric index.

## Example

```typescript
const segment1: PathSegment = 'foo';  // property name
const segment2: PathSegment = 0;      // array index
```
