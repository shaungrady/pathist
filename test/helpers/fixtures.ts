/**
 * Common test fixtures and utilities for Pathist tests
 */

import type { Pathist } from '../../src/pathist.ts';

/**
 * Common path segments used in tests
 */
export const commonSegments = {
	empty: [],
	singleString: ['foo'],
	singleNumber: [0],
	mixed: [0, 'foo', 1, 'bar', 2],
	strings: ['foo', 'bar', 'baz'],
	numbers: [0, 1, 2],
} as const;

/**
 * Common path strings used in tests
 */
export const commonPaths = {
	mixed: '[0].foo[1]',
	dot: 'foo.bar.baz',
	bracket: '[0][1][2]',
	wildcardNumeric: 'foo[-1].bar',
	wildcardString: 'foo[*].bar',
} as const;

/**
 * Helper to reset Pathist static configuration to defaults
 */
export function resetPathistDefaults(PathistClass: typeof Pathist): void {
	PathistClass.defaultNotation = PathistClass.Notation.Mixed;
	PathistClass.defaultIndices = PathistClass.Indices.Preserve;
	PathistClass.indexWildcards = [-1, '*'];
}

/**
 * Helper to create a test context with isolated configuration
 */
export function withIsolatedConfig<T>(PathistClass: typeof Pathist, fn: () => T): T {
	const originalNotation = PathistClass.defaultNotation;
	const originalIndices = PathistClass.defaultIndices;
	const originalWildcards = PathistClass.indexWildcards;

	try {
		return fn();
	} finally {
		PathistClass.defaultNotation = originalNotation;
		PathistClass.defaultIndices = originalIndices;
		PathistClass.indexWildcards = originalWildcards;
	}
}
