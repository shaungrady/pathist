[**Pathist v1.3.0**](../README.md)

***

[Pathist](../README.md) / PathSegment

# Type Alias: PathSegment

> **PathSegment** = `string` | `number`

Defined in: [pathist.ts:10](https://github.com/shaungrady/pathist/blob/2ad3cb8c631ac05eff93dc68cfcf411b0f84b89d/src/pathist.ts#L10)

A single segment in a path, either a string property name or a numeric index.

## Example

```typescript
const segment1: PathSegment = 'foo';  // property name
const segment2: PathSegment = 0;      // array index
```
