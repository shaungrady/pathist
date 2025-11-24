# Test Organization

This directory contains all tests for the Pathist library, organized following a hierarchical, domain-driven structure that separates concerns and improves maintainability.

## Directory Structure

```
test/
├── unit/                       # Unit tests for individual methods
│   ├── constructor.test.ts     # Constructor validation & initialization
│   ├── parsing.test.ts         # String and array parsing
│   ├── conversion.test.ts      # toArray(), toString(), getters, memoization
│   ├── comparison.test.ts      # equals, startsWith, endsWith, includes
│   ├── search.test.ts          # indexOf, lastIndexOf
│   ├── iteration.test.ts       # Iterator protocol & Symbol.iterator
│   └── configuration.test.ts   # Static configuration (notation, indices)
├── features/                   # Feature-level integration tests
│   ├── wildcards.test.ts       # Wildcard functionality across all methods
│   ├── indices-mode.test.ts    # Indices comparison mode behavior
│   └── notation.test.ts        # Notation rendering system
└── helpers/                    # Shared test utilities
    ├── fixtures.ts             # Common test data & utilities
    └── index.ts                # Helper exports
```

## Organization Principles

### 1. **Separation of Concerns**
- **Unit tests** (`test/unit/`) focus on individual methods and their core behavior
- **Feature tests** (`test/features/`) test cross-cutting concerns that span multiple methods
- **Helpers** (`test/helpers/`) provide shared utilities to reduce duplication

### 2. **Logical Grouping**
Tests are grouped by their functional area rather than by file or class:
- Constructor & initialization logic together
- All comparison methods (equals, startsWith, endsWith, includes) in one file
- Search methods (indexOf, lastIndexOf) together

### 3. **Clear Naming Conventions**
- Test files use the pattern `{area}.test.ts`
- Test descriptions are descriptive and follow a consistent format
- File names immediately indicate the functionality being tested

### 4. **Feature-Based Testing**
Complex features that affect multiple methods are tested together:
- **Wildcards**: Tests wildcard behavior across comparison, search, and rendering methods
- **Indices mode**: Tests how indices comparison affects all comparison methods
- **Notation**: Tests notation rendering across different output formats

## Test Statistics

- **Total tests**: 197
- **Unit tests**: ~150
- **Feature tests**: ~47
- **Test files**: 9

## Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests in a specific directory
pnpm test test/unit/

# Run a specific test file
pnpm test test/unit/constructor.test.ts
```

## Writing New Tests

### Adding Unit Tests
Place unit tests in the appropriate file based on the method being tested:
- Constructor/validation → `test/unit/constructor.test.ts`
- Output methods → `test/unit/conversion.test.ts`
- Comparison methods → `test/unit/comparison.test.ts`

### Adding Feature Tests
For features that span multiple methods, create or add to feature test files:
- Cross-method behavior → New file in `test/features/`
- Existing feature → Add to existing feature test file

### Using Helpers
Common test data and utilities are available in `test/helpers/`:

```typescript
import { commonSegments, commonPaths, resetPathistDefaults } from '../helpers/index.js';
```

## Benefits of This Structure

1. **Easy Navigation**: Find tests by functionality, not by implementation details
2. **Reduced Duplication**: Shared test data and utilities in one place
3. **Clearer Intent**: File names and organization make test purpose obvious
4. **Better Isolation**: Unit tests are separated from integration/feature tests
5. **Scalability**: Easy to add new test files as features grow
6. **Parallel Testing**: Smaller, focused files enable better test parallelization

## Migration Notes

This structure was established to replace the previous flat organization where all tests lived in `src/` alongside source code. The new structure:

- Moves all tests to a dedicated `test/` directory
- Breaks large monolithic test files (1000+ lines) into focused modules (50-300 lines)
- Separates unit tests from feature tests
- Adds shared test utilities
- Maintains 100% test coverage from the original structure
