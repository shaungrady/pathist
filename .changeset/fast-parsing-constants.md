---
"pathist": patch
---

Optimize path string parsing by moving character code constants to module level. This provides ~20% faster constant access compared to class static properties, contributing to an overall ~24% improvement in parsing performance.
