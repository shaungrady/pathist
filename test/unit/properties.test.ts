import test from 'ava';
import * as fc from 'fast-check';
import { Pathist } from '../../src/pathist.js';

// ============================================================================
// Custom Arbitraries for Generating Test Data
// ============================================================================

/**
 * Generates valid path segments (strings or numbers).
 * Includes edge cases like empty strings, special characters, negative numbers, etc.
 */
const pathSegmentArbitrary = fc.oneof(
	// String segments with various edge cases
	fc.string(), // Any string including empty
	fc.stringMatching(/^[a-zA-Z_][a-zA-Z0-9_]*$/), // Valid identifiers
	fc.stringMatching(/^[a-zA-Z0-9.\-_ ]+$/), // Strings with special chars
	fc.constant(''), // Empty string explicitly
	fc.constant(' '), // Space
	fc.constant('foo.bar'), // Contains dot
	fc.constant('foo[0]'), // Contains brackets

	// Numeric segments (indices)
	fc.integer({ min: 0, max: 100 }), // Positive indices
	fc.integer({ min: -10, max: -1 }), // Negative indices (wildcards in some contexts)
	fc.constant(0), // Zero explicitly
);

/**
 * Generates arrays of path segments to construct Pathist instances.
 */
const pathSegmentsArbitrary = fc.array(pathSegmentArbitrary, { minLength: 0, maxLength: 20 });

/**
 * Generates Pathist instances.
 */
const pathistArbitrary = pathSegmentsArbitrary.map((segments) => Pathist.from(segments));

// ============================================================================
// Parsing Properties
// ============================================================================

test('property: round-trip parsing preserves segments (array -> Pathist -> string -> Pathist)', (t) => {
	fc.assert(
		fc.property(pathSegmentsArbitrary, (segments) => {
			const p1 = Pathist.from(segments);
			const str = p1.toString();
			const p2 = Pathist.from(str);

			t.deepEqual(
				p2.toArray(),
				p1.toArray(),
				`Round-trip failed for segments: ${JSON.stringify(segments)}\n` +
					`  After round-trip: ${JSON.stringify(p2.toArray())}\n` +
					`  String representation: ${str}`,
			);
		}),
		{ numRuns: 500, seed: 42 },
	);
	t.pass();
});

test('property: parsing from array gives same result as parsing serialized string', (t) => {
	fc.assert(
		fc.property(pathSegmentsArbitrary, (segments) => {
			const fromArray = Pathist.from(segments);
			const fromString = Pathist.from(fromArray.toString());

			t.true(
				fromArray.equals(fromString),
				`Mismatch for segments: ${JSON.stringify(segments)}\n` +
					`  From array: ${fromArray.toString()}\n` +
					`  From string: ${fromString.toString()}`,
			);
		}),
		{ numRuns: 500, seed: 42 },
	);
	t.pass();
});

test('property: toArray() and toJSONPath() are consistent', (t) => {
	fc.assert(
		fc.property(pathSegmentsArbitrary, (segments) => {
			const path = Pathist.from(segments);
			const arr = path.toArray();
			const jsonPath = path.toJSONPath();

			// JSONPath should start with $
			t.true(jsonPath.startsWith('$'), `JSONPath should start with '$': ${jsonPath}`);

			// Empty path should produce just '$'
			if (arr.length === 0) {
				t.is(jsonPath, '$', `Empty path should produce '$'`);
			} else {
				// Non-empty path should have more than just '$'
				t.true(
					jsonPath.length > 1,
					`Non-empty path should produce JSONPath longer than '$': ${JSON.stringify(arr)} -> ${jsonPath}`,
				);
			}
		}),
		{ numRuns: 300, seed: 42 },
	);
	t.pass();
});

// ============================================================================
// Comparison Method Properties
// ============================================================================

test('property: equals is reflexive (p.equals(p) is always true)', (t) => {
	fc.assert(
		fc.property(pathistArbitrary, (path) => {
			t.true(path.equals(path), `Reflexivity failed for path: ${path.toString()}`);
		}),
		{ numRuns: 300, seed: 42 },
	);
	t.pass();
});

test('property: equals is symmetric (p1.equals(p2) === p2.equals(p1))', (t) => {
	fc.assert(
		fc.property(pathistArbitrary, pathistArbitrary, (p1, p2) => {
			const forward = p1.equals(p2);
			const backward = p2.equals(p1);

			t.is(
				forward,
				backward,
				`Symmetry failed:\n` +
					`  p1: ${p1.toString()} (${JSON.stringify(p1.toArray())})\n` +
					`  p2: ${p2.toString()} (${JSON.stringify(p2.toArray())})\n` +
					`  p1.equals(p2): ${forward}, p2.equals(p1): ${backward}`,
			);
		}),
		{ numRuns: 500, seed: 42 },
	);
	t.pass();
});

test('property: equals is transitive (p1=p2 && p2=p3 => p1=p3)', (t) => {
	fc.assert(
		fc.property(
			pathSegmentsArbitrary,
			pathSegmentsArbitrary,
			pathSegmentsArbitrary,
			(seg1, seg2, seg3) => {
				const p1 = Pathist.from(seg1);
				const p2 = Pathist.from(seg2);
				const p3 = Pathist.from(seg3);

				if (p1.equals(p2) && p2.equals(p3)) {
					t.true(
						p1.equals(p3),
						`Transitivity failed:\n` +
							`  p1: ${p1.toString()}\n` +
							`  p2: ${p2.toString()}\n` +
							`  p3: ${p3.toString()}`,
					);
				}
			},
		),
		{ numRuns: 500, seed: 42 },
	);
	t.pass();
});

test('property: startsWith with empty path is always true', (t) => {
	fc.assert(
		fc.property(pathistArbitrary, (path) => {
			t.true(path.startsWith([]), `startsWith([]) failed for path: ${path.toString()}`);
		}),
		{ numRuns: 300, seed: 42 },
	);
	t.pass();
});

test('property: endsWith with empty path is always true', (t) => {
	fc.assert(
		fc.property(pathistArbitrary, (path) => {
			t.true(path.endsWith([]), `endsWith([]) failed for path: ${path.toString()}`);
		}),
		{ numRuns: 300, seed: 42 },
	);
	t.pass();
});

test('property: includes with empty path is always true', (t) => {
	fc.assert(
		fc.property(pathistArbitrary, (path) => {
			t.true(path.includes([]), `includes([]) failed for path: ${path.toString()}`);
		}),
		{ numRuns: 300, seed: 42 },
	);
	t.pass();
});

test('property: path always startsWith and endsWith itself', (t) => {
	fc.assert(
		fc.property(pathistArbitrary, (path) => {
			t.true(path.startsWith(path), `startsWith(self) failed for path: ${path.toString()}`);
			t.true(path.endsWith(path), `endsWith(self) failed for path: ${path.toString()}`);
		}),
		{ numRuns: 300, seed: 42 },
	);
	t.pass();
});

test('property: if p.startsWith(prefix), then p.slice(0, prefix.length).equals(prefix)', (t) => {
	fc.assert(
		fc.property(pathistArbitrary, pathistArbitrary, (path, prefix) => {
			if (path.startsWith(prefix)) {
				const sliced = path.slice(0, prefix.length);
				t.true(
					sliced.equals(prefix),
					`startsWith/slice inconsistency:\n` +
						`  path: ${path.toString()}\n` +
						`  prefix: ${prefix.toString()}\n` +
						`  sliced: ${sliced.toString()}`,
				);
			}
		}),
		{ numRuns: 500, seed: 42 },
	);
	t.pass();
});

test('property: if p.endsWith(suffix), then p.slice(-suffix.length).equals(suffix)', (t) => {
	fc.assert(
		fc.property(pathistArbitrary, pathistArbitrary, (path, suffix) => {
			if (path.endsWith(suffix) && suffix.length > 0) {
				const sliced = path.slice(-suffix.length);
				t.true(
					sliced.equals(suffix),
					`endsWith/slice inconsistency:\n` +
						`  path: ${path.toString()}\n` +
						`  suffix: ${suffix.toString()}\n` +
						`  sliced: ${sliced.toString()}`,
				);
			}
		}),
		{ numRuns: 500, seed: 42 },
	);
	t.pass();
});

// ============================================================================
// Manipulation Method Properties
// ============================================================================

test('property: slice without arguments creates equal path', (t) => {
	fc.assert(
		fc.property(pathistArbitrary, (path) => {
			const sliced = path.slice();
			t.true(sliced.equals(path), `slice() should equal original: ${path.toString()}`);
			t.not(sliced, path, 'slice() should create new instance');
		}),
		{ numRuns: 300, seed: 42 },
	);
	t.pass();
});

test('property: slice + concat identity (p.slice(0,n).concat(p.slice(n)).equals(p))', (t) => {
	fc.assert(
		fc.property(pathistArbitrary, fc.integer({ min: 0, max: 50 }), (path, splitPoint) => {
			const n = splitPoint % (path.length + 1);
			const left = path.slice(0, n);
			const right = path.slice(n);
			const reconstructed = left.concat(right);

			t.true(
				reconstructed.equals(path),
				`slice/concat identity failed at index ${n}:\n` +
					`  original: ${path.toString()}\n` +
					`  left: ${left.toString()}\n` +
					`  right: ${right.toString()}\n` +
					`  reconstructed: ${reconstructed.toString()}`,
			);
		}),
		{ numRuns: 500, seed: 42 },
	);
	t.pass();
});

test('property: slice is consistent with Array.slice on toArray()', (t) => {
	fc.assert(
		fc.property(
			pathistArbitrary,
			fc.integer({ min: -30, max: 30 }),
			fc.integer({ min: -30, max: 30 }),
			(path, start, end) => {
				const pathSliced = path.slice(start, end);
				const arraySliced = path.toArray().slice(start, end);

				t.deepEqual(
					pathSliced.toArray(),
					arraySliced,
					`slice inconsistency with Array.slice(${start}, ${end}):\n` +
						`  path: ${path.toString()}\n` +
						`  path.slice().toArray(): ${JSON.stringify(pathSliced.toArray())}\n` +
						`  toArray().slice(): ${JSON.stringify(arraySliced)}`,
				);
			},
		),
		{ numRuns: 500, seed: 42 },
	);
	t.pass();
});

test('property: concat is associative ((p1.concat(p2)).concat(p3) === p1.concat(p2.concat(p3)))', (t) => {
	fc.assert(
		fc.property(pathistArbitrary, pathistArbitrary, pathistArbitrary, (p1, p2, p3) => {
			const left = p1.concat(p2).concat(p3);
			const right = p1.concat(p2.concat(p3));

			t.true(
				left.equals(right),
				`concat associativity failed:\n` +
					`  p1: ${p1.toString()}\n` +
					`  p2: ${p2.toString()}\n` +
					`  p3: ${p3.toString()}\n` +
					`  (p1+p2)+p3: ${left.toString()}\n` +
					`  p1+(p2+p3): ${right.toString()}`,
			);
		}),
		{ numRuns: 500, seed: 42 },
	);
	t.pass();
});

test('property: concat with empty path is identity', (t) => {
	fc.assert(
		fc.property(pathistArbitrary, (path) => {
			const withEmptyLeft = Pathist.from([]).concat(path);
			const withEmptyRight = path.concat([]);

			t.true(withEmptyLeft.equals(path), `Empty concat left failed: ${path.toString()}`);
			t.true(withEmptyRight.equals(path), `Empty concat right failed: ${path.toString()}`);
		}),
		{ numRuns: 300, seed: 42 },
	);
	t.pass();
});

test('property: parentPath() then concat last segment restores original (for non-empty paths)', (t) => {
	fc.assert(
		fc.property(pathistArbitrary, (path) => {
			if (path.length > 0) {
				const parent = path.parentPath();
				const lastSegment = path.toArray()[path.length - 1];
				const reconstructed = parent.concat([lastSegment]);

				t.true(
					reconstructed.equals(path),
					`parent/concat identity failed:\n` +
						`  original: ${path.toString()}\n` +
						`  parent: ${parent.toString()}\n` +
						`  reconstructed: ${reconstructed.toString()}`,
				);
			}
		}),
		{ numRuns: 500, seed: 42 },
	);
	t.pass();
});

test('property: parentPath(n) reduces length by n (when n <= length)', (t) => {
	fc.assert(
		fc.property(pathistArbitrary, fc.integer({ min: 0, max: 50 }), (path, depth) => {
			if (depth <= path.length) {
				const parent = path.parentPath(depth);
				t.is(
					parent.length,
					path.length - depth,
					`parentPath(${depth}) length mismatch:\n` +
						`  original length: ${path.length}\n` +
						`  parent length: ${parent.length}\n` +
						`  path: ${path.toString()}`,
				);
			}
		}),
		{ numRuns: 500, seed: 42 },
	);
	t.pass();
});

test('property: merge is at least as long as the longer input', (t) => {
	fc.assert(
		fc.property(pathistArbitrary, pathistArbitrary, (p1, p2) => {
			const merged = p1.merge(p2);
			const maxLength = Math.max(p1.length, p2.length);

			t.true(
				merged.length >= maxLength,
				`merge result too short:\n` +
					`  p1: ${p1.toString()} (length ${p1.length})\n` +
					`  p2: ${p2.toString()} (length ${p2.length})\n` +
					`  merged: ${merged.toString()} (length ${merged.length})`,
			);
		}),
		{ numRuns: 500, seed: 42 },
	);
	t.pass();
});

test('property: merge with identical paths returns equivalent path', (t) => {
	fc.assert(
		fc.property(pathistArbitrary, (path) => {
			const merged = path.merge(path);
			t.true(
				merged.equals(path),
				`merge(self) should equal self: ${path.toString()} -> ${merged.toString()}`,
			);
		}),
		{ numRuns: 300, seed: 42 },
	);
	t.pass();
});

test('property: merge result always startsWith first path when second is empty', (t) => {
	fc.assert(
		fc.property(pathistArbitrary, (path) => {
			const merged = path.merge([]);
			t.true(merged.equals(path), `merge with empty should equal original: ${path.toString()}`);
		}),
		{ numRuns: 300, seed: 42 },
	);
	t.pass();
});

// ============================================================================
// Iterator and Reduce Properties
// ============================================================================

test('property: iteration produces same segments as toArray()', (t) => {
	fc.assert(
		fc.property(pathistArbitrary, (path) => {
			const fromIterator = Array.from(path);
			const fromArray = path.toArray();

			t.deepEqual(
				fromIterator,
				fromArray,
				`Iterator mismatch for path: ${path.toString()}\n` +
					`  from iterator: ${JSON.stringify(fromIterator)}\n` +
					`  from toArray(): ${JSON.stringify(fromArray)}`,
			);
		}),
		{ numRuns: 300, seed: 42 },
	);
	t.pass();
});

test('property: reduce is consistent with toArray().reduce()', (t) => {
	fc.assert(
		fc.property(pathistArbitrary, (path) => {
			const reducer = (acc: string, seg: string | number) => `${acc}/${seg}`;
			const initial = '';

			const fromPath = path.reduce(reducer, initial);
			const fromArray = path.toArray().reduce(reducer, initial);

			t.is(
				fromPath,
				fromArray,
				`reduce mismatch for path: ${path.toString()}\n` +
					`  from path.reduce(): ${fromPath}\n` +
					`  from toArray().reduce(): ${fromArray}`,
			);
		}),
		{ numRuns: 300, seed: 42 },
	);
	t.pass();
});

// ============================================================================
// Length Property
// ============================================================================

test('property: length equals toArray().length', (t) => {
	fc.assert(
		fc.property(pathistArbitrary, (path) => {
			t.is(path.length, path.toArray().length, `Length mismatch for path: ${path.toString()}`);
		}),
		{ numRuns: 300, seed: 42 },
	);
	t.pass();
});

test('property: empty path has length 0', (t) => {
	const emptyPaths = [Pathist.from([]), Pathist.from('')];

	for (const path of emptyPaths) {
		t.is(path.length, 0);
		t.deepEqual(path.toArray(), []);
	}
});

// ============================================================================
// Configuration Propagation Properties
// ============================================================================

test('property: slice propagates configuration', (t) => {
	fc.assert(
		fc.property(
			pathSegmentsArbitrary,
			fc.constantFrom(Pathist.Notation.Mixed, Pathist.Notation.Dot, Pathist.Notation.Bracket),
			fc.constantFrom(Pathist.Indices.Preserve, Pathist.Indices.Ignore),
			(segments, notation, indices) => {
				const path = Pathist.from(segments, { notation, indices });
				const sliced = path.slice(0, Math.max(1, path.length - 1));

				if (sliced.length > 0) {
					t.is(sliced.notation, notation, `slice didn't propagate notation`);
					t.is(sliced.indices, indices, `slice didn't propagate indices`);
				}
			},
		),
		{ numRuns: 300, seed: 42 },
	);
	t.pass();
});

test('property: concat propagates configuration from left operand', (t) => {
	fc.assert(
		fc.property(
			pathSegmentsArbitrary,
			pathSegmentsArbitrary,
			fc.constantFrom(Pathist.Notation.Mixed, Pathist.Notation.Dot, Pathist.Notation.Bracket),
			fc.constantFrom(Pathist.Indices.Preserve, Pathist.Indices.Ignore),
			(seg1, seg2, notation, indices) => {
				const p1 = Pathist.from(seg1, { notation, indices });
				const p2 = Pathist.from(seg2);
				const result = p1.concat(p2);

				if (result.length > 0) {
					t.is(result.notation, notation, `concat didn't propagate notation from left`);
					t.is(result.indices, indices, `concat didn't propagate indices from left`);
				}
			},
		),
		{ numRuns: 300, seed: 42 },
	);
	t.pass();
});

// ============================================================================
// Smoke Tests - Ensure Methods Don't Throw on Valid Inputs
// ============================================================================

test('property: all core methods complete without throwing on valid inputs', (t) => {
	fc.assert(
		fc.property(pathistArbitrary, (path) => {
			t.notThrows(() => {
				// Conversion methods
				path.toString();
				path.toArray();
				path.toJSONPath();
				path.toJSONPointer();

				// Property getters
				path.length;
				path.notation;
				path.indices;
				path.string;
				path.array;
				path.jsonPath;
				path.jsonPointer;

				// Manipulation methods
				path.slice();
				path.slice(0);
				path.slice(0, 1);
				path.parentPath();
				path.concat([]);
				path.concat('foo');
				path.merge([]);

				// Comparison methods
				path.equals(path);
				path.startsWith([]);
				path.endsWith([]);
				path.includes([]);

				// Search methods
				path.positionOf([]);
				path.lastPositionOf([]);
				path.pathTo([]);
				path.pathToLast([]);

				// Tree navigation methods
				path.firstNodePath();
				path.lastNodePath();
				path.afterNodePath();
				path.parentNode();
				path.nodeIndices();

				// Iterator
				Array.from(path);
				for (const _seg of path) {
					// Just iterate
				}

				// Reduce
				path.reduce((acc, seg) => acc + String(seg), '');

				// nodePaths generator
				for (const _nodePath of path.nodePaths()) {
					// Just iterate
				}
			}, `Methods threw unexpectedly for path: ${path.toString()}`);
		}),
		{ numRuns: 200, seed: 42 },
	);
	t.pass();
});

test('property: toString with all notation modes never throws', (t) => {
	fc.assert(
		fc.property(
			pathistArbitrary,
			fc.constantFrom(Pathist.Notation.Mixed, Pathist.Notation.Dot, Pathist.Notation.Bracket),
			(path, notation) => {
				t.notThrows(() => {
					const result = path.toString(notation);
					t.is(typeof result, 'string', 'toString should return string');
				}, `toString(${notation}) threw for path: ${path.toString()}`);
			},
		),
		{ numRuns: 300, seed: 42 },
	);
	t.pass();
});

test('property: manipulation methods with various indices never throw', (t) => {
	fc.assert(
		fc.property(
			pathistArbitrary,
			fc.integer({ min: -50, max: 50 }),
			fc.integer({ min: -50, max: 50 }),
			(path, idx1, idx2) => {
				t.notThrows(() => {
					path.slice(idx1);
					path.slice(idx1, idx2);
					if (idx1 >= 0) {
						path.parentPath(idx1);
					}
				}, `Manipulation methods threw for path: ${path.toString()} with indices ${idx1}, ${idx2}`);
			},
		),
		{ numRuns: 300, seed: 42 },
	);
	t.pass();
});

// ============================================================================
// Exception Tests - Methods That Should Throw on Invalid Inputs
// ============================================================================

test('property: parentPath throws RangeError on negative depth', (t) => {
	fc.assert(
		fc.property(pathistArbitrary, fc.integer({ min: -100, max: -1 }), (path, negativeDepth) => {
			t.throws(
				() => path.parentPath(negativeDepth),
				{ instanceOf: RangeError },
				`Should throw RangeError for negative depth ${negativeDepth}`,
			);
		}),
		{ numRuns: 100, seed: 42 },
	);
	t.pass();
});

test('property: constructor rejects arrays with invalid segment types', (t) => {
	fc.assert(
		fc.property(
			fc.array(
				fc.oneof(
					fc.string(),
					fc.integer(),
					fc.constant(null), // Invalid
					fc.constant(undefined), // Invalid
					fc.constant({}), // Invalid
					fc.constant(Symbol('test')), // Invalid
				),
				{ minLength: 1, maxLength: 5 },
			),
			(segments) => {
				const hasInvalidType = segments.some(
					(s) =>
						s === null ||
						s === undefined ||
						typeof s === 'object' ||
						typeof s === 'symbol' ||
						(typeof s !== 'string' && typeof s !== 'number'),
				);

				if (hasInvalidType) {
					t.throws(
						() => Pathist.from(segments as any),
						{ instanceOf: TypeError },
						`Should throw TypeError for invalid segments: ${JSON.stringify(segments)}`,
					);
				} else {
					t.notThrows(() => Pathist.from(segments as any), `Should not throw for valid segments`);
				}
			},
		),
		{ numRuns: 200, seed: 42 },
	);
	t.pass();
});

test('property: parentNode throws RangeError on negative depth', (t) => {
	fc.assert(
		fc.property(pathistArbitrary, fc.integer({ min: -100, max: -1 }), (path, negativeDepth) => {
			t.throws(
				() => path.parentNode(negativeDepth),
				{ instanceOf: RangeError },
				`parentNode should throw RangeError for negative depth ${negativeDepth}`,
			);
		}),
		{ numRuns: 100, seed: 42 },
	);
	t.pass();
});

test('property: concat and merge throw TypeError on null/undefined inputs', (t) => {
	fc.assert(
		fc.property(pathistArbitrary, (path) => {
			t.throws(() => path.concat(null as any), { instanceOf: TypeError });
			t.throws(() => path.concat(undefined as any), { instanceOf: TypeError });
			t.throws(() => path.merge(null as any), { instanceOf: TypeError });
			t.throws(() => path.merge(undefined as any), { instanceOf: TypeError });
		}),
		{ numRuns: 100, seed: 42 },
	);
	t.pass();
});

// ============================================================================
// Null/Undefined Handling - Methods That Should Handle Gracefully
// ============================================================================

test('property: comparison methods return false for null/undefined inputs', (t) => {
	fc.assert(
		fc.property(pathistArbitrary, (path) => {
			// All comparison methods should return false for invalid inputs
			t.false(path.equals(null as any), 'equals(null) should return false');
			t.false(path.equals(undefined as any), 'equals(undefined) should return false');
			t.false(path.startsWith(null as any), 'startsWith(null) should return false');
			t.false(path.startsWith(undefined as any), 'startsWith(undefined) should return false');
			t.false(path.endsWith(null as any), 'endsWith(null) should return false');
			t.false(path.endsWith(undefined as any), 'endsWith(undefined) should return false');
			t.false(path.includes(null as any), 'includes(null) should return false');
			t.false(path.includes(undefined as any), 'includes(undefined) should return false');
		}),
		{ numRuns: 100, seed: 42 },
	);
	t.pass();
});

test('property: search methods return -1 for null/undefined inputs', (t) => {
	fc.assert(
		fc.property(pathistArbitrary, (path) => {
			// positionOf and lastPositionOf should return -1
			t.is(path.positionOf(null as any), -1, 'positionOf(null) should return -1');
			t.is(path.positionOf(undefined as any), -1, 'positionOf(undefined) should return -1');
			t.is(path.lastPositionOf(null as any), -1, 'lastPositionOf(null) should return -1');
			t.is(path.lastPositionOf(undefined as any), -1, 'lastPositionOf(undefined) should return -1');
		}),
		{ numRuns: 100, seed: 42 },
	);
	t.pass();
});

test('property: pathTo and pathToLast throw TypeError on null/undefined inputs', (t) => {
	fc.assert(
		fc.property(pathistArbitrary, (path) => {
			// pathTo and pathToLast should throw TypeError
			t.throws(() => path.pathTo(null as any), { instanceOf: TypeError });
			t.throws(() => path.pathTo(undefined as any), { instanceOf: TypeError });
			t.throws(() => path.pathToLast(null as any), { instanceOf: TypeError });
			t.throws(() => path.pathToLast(undefined as any), { instanceOf: TypeError });
		}),
		{ numRuns: 100, seed: 42 },
	);
	t.pass();
});

test('property: comparison methods handle non-path inputs gracefully', (t) => {
	fc.assert(
		fc.property(pathistArbitrary, (path) => {
			// Test with various invalid input types
			const invalidInputs = [123, true, {}, () => {}, Symbol('test')];

			for (const invalid of invalidInputs) {
				t.false(path.equals(invalid as any), `equals should return false for ${typeof invalid}`);
				t.false(
					path.startsWith(invalid as any),
					`startsWith should return false for ${typeof invalid}`,
				);
				t.false(
					path.endsWith(invalid as any),
					`endsWith should return false for ${typeof invalid}`,
				);
				t.false(
					path.includes(invalid as any),
					`includes should return false for ${typeof invalid}`,
				);
			}
		}),
		{ numRuns: 50, seed: 42 },
	);
	t.pass();
});

// ============================================================================
// Edge Case Properties
// ============================================================================

test('property: parentPath with depth exceeding length returns empty path', (t) => {
	fc.assert(
		fc.property(pathistArbitrary, fc.integer({ min: 0, max: 100 }), (path, excessDepth) => {
			const depth = path.length + excessDepth;
			const parent = path.parentPath(depth);

			t.is(parent.length, 0, `parentPath(${depth}) should return empty path when depth > length`);
			t.deepEqual(parent.toArray(), [], 'parentPath with excess depth should have empty array');
		}),
		{ numRuns: 200, seed: 42 },
	);
	t.pass();
});

test('property: slice with out-of-bounds indices returns valid path', (t) => {
	fc.assert(
		fc.property(
			pathistArbitrary,
			fc.integer({ min: -100, max: 100 }),
			fc.integer({ min: -100, max: 100 }),
			(path, start, end) => {
				t.notThrows(() => {
					const sliced = path.slice(start, end);
					// Result should always be a valid Pathist instance
					t.true(sliced instanceof Pathist);
					t.is(typeof sliced.length, 'number');
					t.true(sliced.length >= 0);
				}, `slice(${start}, ${end}) should not throw for path: ${path.toString()}`);
			},
		),
		{ numRuns: 300, seed: 42 },
	);
	t.pass();
});

test('property: methods return new instances, not mutating original', (t) => {
	fc.assert(
		fc.property(pathistArbitrary, (path) => {
			const original = path.toArray();

			// All these methods should return new instances
			const sliced = path.slice();
			const parent = path.parentPath(0);
			const concatenated = path.concat([]);
			const merged = path.merge([]);

			// Original should be unchanged
			t.deepEqual(path.toArray(), original, 'Original path should not be mutated by method calls');

			// Returned instances should be different objects
			t.not(sliced, path, 'slice() should return new instance');
			t.not(parent, path, 'parentPath() should return new instance');
			t.not(concatenated, path, 'concat() should return new instance');
			t.not(merged, path, 'merge() should return new instance');
		}),
		{ numRuns: 200, seed: 42 },
	);
	t.pass();
});

test('property: empty path operations are consistent', (t) => {
	const empty = Pathist.from([]);

	t.is(empty.length, 0);
	t.deepEqual(empty.toArray(), []);
	t.is(empty.toString(), '');
	t.is(empty.toJSONPath(), '$');
	t.is(empty.toJSONPointer(), '');

	// Operations on empty path
	t.true(empty.equals([]));
	t.true(empty.equals(''));
	t.true(empty.startsWith([]));
	t.true(empty.endsWith([]));
	t.true(empty.includes([]));
	t.is(empty.positionOf([]), 0);
	t.is(empty.lastPositionOf([]), 0);

	// Manipulation
	t.true(empty.slice().equals(empty));
	t.true(empty.parentPath().equals(empty));
	t.true(empty.concat([]).equals(empty));
	t.true(empty.merge([]).equals(empty));

	t.pass();
});
