---
"pathist": patch
---

Optimize path string parsing with substring slicing instead of character-by-character concatenation. This improves performance by up to 3x for paths with long property names, with an average 14% improvement across all parsing operations and no regressions in bracket notation performance.
