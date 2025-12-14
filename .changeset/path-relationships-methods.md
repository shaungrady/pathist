---
"pathist": minor
---

Add three new path relationship methods for analyzing and decomposing paths:

- `relativeTo(base)` - Extracts the relative path from a base path. Returns the segments that need to be concatenated to the base to produce the full path. Returns `null` if the path doesn't start with the base. This is the inverse operation of `concat()`.

- `commonStart(other)` - Finds the common prefix path shared between two paths. Returns the longest sequence of segments that both paths start with, or an empty path if no common prefix exists.

- `commonEnd(other)` - Finds the common suffix path shared between two paths. Returns the longest sequence of segments that both paths end with, or an empty path if no common suffix exists.

These methods enable powerful path decomposition and analysis workflows, such as extracting relative paths for display, finding shared parent paths, and identifying structural similarities between paths.
