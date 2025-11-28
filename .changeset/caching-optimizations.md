---
"pathist": patch
---

Add internal caching for improved performance:
- Cache `toJSONPointer()` and `toJSONPath()` results (minimal memory overhead, avoids string building and character escaping on repeated calls)
- Cache tree node position lookups using single-scan approach for `firstNodePath()`, `lastNodePath()`, `afterNodePath()`, `nodeIndices()`, `nodePaths()`, and `parentNode()` (tiny memory footprint with cumulative speedups across 6+ methods)

These optimizations maintain tiny memory usage while providing noticeable performance improvements for common operations, especially in serialization workflows and tree navigation scenarios. The single-scan node position caching computes both first and last node indices together, avoiding redundant segment array iterations.
