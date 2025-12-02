import test from 'ava';
import { Pathist } from '../../src/pathist.js';

// =============================================================================
// match() - general matching anywhere in path
// =============================================================================

const matchCases = [
	{
		desc: 'exact match in middle',
		path: 'foo.bar.baz.qux',
		pattern: 'bar.baz',
		expected: 'bar.baz',
	},
	{
		desc: 'exact match at start',
		path: 'foo.bar.baz',
		pattern: 'foo.bar',
		expected: 'foo.bar',
	},
	{
		desc: 'exact match at end',
		path: 'foo.bar.baz',
		pattern: 'bar.baz',
		expected: 'bar.baz',
	},
	{
		desc: 'single segment match',
		path: 'foo.bar.baz',
		pattern: 'bar',
		expected: 'bar',
	},
	{
		desc: 'wildcard match with concrete value',
		path: ['foo', 0, 'bar', 1, 'baz'],
		pattern: '[-1].bar',
		expected: '[0].bar',
	},
	{
		desc: 'multiple wildcards',
		path: ['foo', 5, 'bar', 10, 'baz'],
		pattern: '[-1].bar.[-1]',
		expected: '[5].bar[10]',
	},
	{
		desc: 'wildcard at start of pattern',
		path: ['foo', 0, 'bar', 'baz'],
		pattern: '[*].bar',
		expected: '[0].bar',
	},
	{
		desc: 'full path match',
		path: 'foo.bar.baz',
		pattern: 'foo.bar.baz',
		expected: 'foo.bar.baz',
	},
];

for (const { desc, path, pattern, expected } of matchCases) {
	test(`match: ${desc}`, (t) => {
		const p = Pathist.from(path);
		const match = p.match(pattern);
		t.not(match, null);
		t.is(match?.toString(), expected);
	});
}

const matchNotFoundCases = [
	{
		desc: 'pattern not in path',
		path: 'foo.bar.baz',
		pattern: 'qux',
	},
	{
		desc: 'pattern longer than path',
		path: 'foo.bar',
		pattern: 'foo.bar.baz.qux',
	},
	{
		desc: 'wildcard mismatch (string property)',
		path: 'foo.bar.baz',
		pattern: '[-1].bar', // wildcard expects number
	},
	{
		desc: 'partial segment mismatch',
		path: 'foo.bar.baz',
		pattern: 'bar.qux',
	},
];

for (const { desc, path, pattern } of matchNotFoundCases) {
	test(`match (not found): ${desc}`, (t) => {
		const p = Pathist.from(path);
		const match = p.match(pattern);
		t.is(match, null);
	});
}

test('match: invalid pattern returns null', (t) => {
	const p = Pathist.from('foo.bar.baz');
	// biome-ignore lint/suspicious/noExplicitAny: Testing invalid input
	const match = p.match(null as any);
	t.is(match, null);
});

test('match: finds first occurrence', (t) => {
	const p = Pathist.from('foo.bar.baz.bar.qux');
	const match = p.match('bar');
	t.not(match, null);
	t.is(match?.toString(), 'bar');
	// Verify it's the first by checking position
	t.is(p.positionOf('bar'), 1); // First bar is at position 1
});

test('match: works with indices ignore', (t) => {
	const p = Pathist.from(['foo', 5, 'bar', 10]);
	const match = p.match([0, 'bar'], { indices: Pathist.Indices.Ignore });
	t.not(match, null);
	t.is(match?.toString(), '[5].bar'); // Concrete values preserved
});

// =============================================================================
// matchStart() - prefix matching
// =============================================================================

const matchStartCases = [
	{
		desc: 'exact prefix match',
		path: 'foo.bar.baz.qux',
		pattern: 'foo.bar',
		expected: 'foo.bar',
	},
	{
		desc: 'single segment prefix',
		path: 'foo.bar.baz',
		pattern: 'foo',
		expected: 'foo',
	},
	{
		desc: 'wildcard prefix with concrete value',
		path: ['foo', 2, 'bar', 'baz'],
		pattern: 'foo[-1].bar',
		expected: 'foo[2].bar',
	},
	{
		desc: 'multiple wildcards in prefix',
		path: [5, 3, 'children', 'name'],
		pattern: '[*][*].children',
		expected: '[5][3].children',
	},
	{
		desc: 'full path as prefix',
		path: 'foo.bar.baz',
		pattern: 'foo.bar.baz',
		expected: 'foo.bar.baz',
	},
	{
		desc: 'wildcard at start',
		path: [0, 'foo', 'bar'],
		pattern: '[*].foo',
		expected: '[0].foo',
	},
];

for (const { desc, path, pattern, expected } of matchStartCases) {
	test(`matchStart: ${desc}`, (t) => {
		const p = Pathist.from(path);
		const match = p.matchStart(pattern);
		t.not(match, null);
		t.is(match?.toString(), expected);
		t.is(match?.length, Pathist.from(expected).length);
	});
}

const matchStartNotFoundCases = [
	{
		desc: 'pattern not at start',
		path: 'foo.bar.baz',
		pattern: 'bar',
	},
	{
		desc: 'pattern longer than path',
		path: 'foo.bar',
		pattern: 'foo.bar.baz.qux',
	},
	{
		desc: 'wildcard type mismatch',
		path: 'foo.bar',
		pattern: '[-1].bar', // expects number at start
	},
	{
		desc: 'partial prefix mismatch',
		path: 'foo.bar.baz',
		pattern: 'foo.qux',
	},
];

for (const { desc, path, pattern } of matchStartNotFoundCases) {
	test(`matchStart (not found): ${desc}`, (t) => {
		const p = Pathist.from(path);
		const match = p.matchStart(pattern);
		t.is(match, null);
	});
}

test('matchStart: invalid pattern returns null', (t) => {
	const p = Pathist.from('foo.bar.baz');
	// biome-ignore lint/suspicious/noExplicitAny: Testing invalid input
	const match = p.matchStart(null as any);
	t.is(match, null);
});

test('matchStart: empty path never matches non-empty pattern', (t) => {
	const p = Pathist.from('');
	const match = p.matchStart('foo');
	t.is(match, null);
});

test('matchStart: can extract remaining path', (t) => {
	const p = Pathist.from(['foo', 2, 'bar', 'baz', 'qux']);
	const match = p.matchStart('foo[-1].bar');
	t.not(match, null);
	t.is(match?.length, 3);

	// Extract remaining path
	if (match) {
		const remaining = p.slice(match.length);
		t.deepEqual(remaining.toArray(), ['baz', 'qux']);
	}
});

test('matchStart: works with indices ignore', (t) => {
	const p = Pathist.from(['foo', 5, 'bar']);
	const match = p.matchStart([0, 'foo'], { indices: Pathist.Indices.Ignore });
	t.is(match, null); // Doesn't start with [0, 'foo']

	const match2 = p.matchStart(['foo', 99], { indices: Pathist.Indices.Ignore });
	t.not(match2, null);
	t.is(match2?.toString(), 'foo[5]'); // Preserves concrete value
});

// =============================================================================
// matchEnd() - suffix matching
// =============================================================================

const matchEndCases = [
	{
		desc: 'exact suffix match',
		path: 'foo.bar.baz.qux',
		pattern: 'baz.qux',
		expected: 'baz.qux',
	},
	{
		desc: 'single segment suffix',
		path: 'foo.bar.baz',
		pattern: 'baz',
		expected: 'baz',
	},
	{
		desc: 'wildcard suffix with concrete value',
		path: ['foo', 0, 'bar', 2, 'baz'],
		pattern: '[-1].baz',
		expected: '[2].baz',
	},
	{
		desc: 'multiple wildcards in suffix',
		path: ['foo', 5, 3, 'baz'],
		pattern: '[-1][*].baz',
		expected: '[5][3].baz',
	},
	{
		desc: 'full path as suffix',
		path: 'foo.bar.baz',
		pattern: 'foo.bar.baz',
		expected: 'foo.bar.baz',
	},
	{
		desc: 'wildcard at end',
		path: ['foo', 'bar', 7],
		pattern: 'bar[*]',
		expected: 'bar[7]',
	},
];

for (const { desc, path, pattern, expected } of matchEndCases) {
	test(`matchEnd: ${desc}`, (t) => {
		const p = Pathist.from(path);
		const match = p.matchEnd(pattern);
		t.not(match, null);
		t.is(match?.toString(), expected);
		t.is(match?.length, Pathist.from(expected).length);
	});
}

const matchEndNotFoundCases = [
	{
		desc: 'pattern not at end',
		path: 'foo.bar.baz',
		pattern: 'bar',
	},
	{
		desc: 'pattern longer than path',
		path: 'bar.baz',
		pattern: 'foo.bar.baz.qux',
	},
	{
		desc: 'wildcard type mismatch',
		path: 'foo.bar',
		pattern: 'foo[-1]', // expects number at end
	},
	{
		desc: 'partial suffix mismatch',
		path: 'foo.bar.baz',
		pattern: 'qux.baz',
	},
];

for (const { desc, path, pattern } of matchEndNotFoundCases) {
	test(`matchEnd (not found): ${desc}`, (t) => {
		const p = Pathist.from(path);
		const match = p.matchEnd(pattern);
		t.is(match, null);
	});
}

test('matchEnd: invalid pattern returns null', (t) => {
	const p = Pathist.from('foo.bar.baz');
	// biome-ignore lint/suspicious/noExplicitAny: Testing invalid input
	const match = p.matchEnd(null as any);
	t.is(match, null);
});

test('matchEnd: empty path never matches non-empty pattern', (t) => {
	const p = Pathist.from('');
	const match = p.matchEnd('foo');
	t.is(match, null);
});

test('matchEnd: works with indices ignore', (t) => {
	const p = Pathist.from(['foo', 5, 'bar', 99]);
	const match = p.matchEnd(['bar', 99], { indices: Pathist.Indices.Ignore });
	t.not(match, null);
	t.is(match?.toString(), 'bar[99]'); // Preserves concrete values
});

// =============================================================================
// Comparison: match methods vs manual slice
// =============================================================================

test('matchStart avoids redundant parsing', (t) => {
	const path = Pathist.from(['foo', 2, 'bar', 'baz']);
	const pattern = 'foo[-1].bar';

	// Using matchStart (pattern parsed once)
	const match1 = path.matchStart(pattern);

	// Manual approach (pattern parsed twice)
	const patternPath = Pathist.from(pattern);
	const match2 = path.startsWith(pattern) ? path.slice(0, patternPath.length) : null;

	// Results should be identical
	t.is(match1?.toString(), match2?.toString());
	t.is(match1?.length, match2?.length);
});

test('matchEnd avoids redundant parsing', (t) => {
	const path = Pathist.from(['foo', 0, 'bar', 2, 'baz']);
	const pattern = '[-1].baz';

	// Using matchEnd (pattern parsed once)
	const match1 = path.matchEnd(pattern);

	// Manual approach (pattern parsed twice)
	const patternPath = Pathist.from(pattern);
	const match2 = path.endsWith(pattern) ? path.slice(-patternPath.length) : null;

	// Results should be identical
	t.is(match1?.toString(), match2?.toString());
	t.is(match1?.length, match2?.length);
});

// =============================================================================
// Integration: Real-world use case (ArkType error matching)
// =============================================================================

test('integration: ArkType error path matching', (t) => {
	// Config with wildcard patterns
	const config = {
		'foo[-1].bar': { transform: 'A' },
		'foo[-1].baz': { transform: 'B' },
		'qux[*].nested[*].value': { transform: 'C' },
	};

	// Helper to find matching config
	const findConfig = (errorPath: Pathist) => {
		for (const [pattern, value] of Object.entries(config)) {
			if (errorPath.equals(pattern)) {
				return { pattern, value };
			}
		}
		return null;
	};

	// Test cases
	const error1 = Pathist.from(['foo', 2, 'bar']);
	const match1 = findConfig(error1);
	t.not(match1, null);
	t.is(match1?.pattern, 'foo[-1].bar');
	t.is(match1?.value.transform, 'A');

	const error2 = Pathist.from(['foo', 5, 'baz']);
	const match2 = findConfig(error2);
	t.not(match2, null);
	t.is(match2?.pattern, 'foo[-1].baz');
	t.is(match2?.value.transform, 'B');

	const error3 = Pathist.from(['qux', 0, 'nested', 3, 'value']);
	const match3 = findConfig(error3);
	t.not(match3, null);
	t.is(match3?.pattern, 'qux[*].nested[*].value');
	t.is(match3?.value.transform, 'C');

	// No match
	const error4 = Pathist.from(['unknown', 'path']);
	const match4 = findConfig(error4);
	t.is(match4, null);
});

test('integration: descendant path matching with matchStart', (t) => {
	// Config where patterns apply to all descendants
	const config = {
		'foo[-1]': { scope: 'all-foo' },
		'foo[-1].bar': { scope: 'foo-bar-descendants' },
	};

	// Helper to find most specific match
	const findMostSpecific = (errorPath: Pathist) => {
		let bestMatch = null;
		let bestLength = -1;

		for (const [pattern, value] of Object.entries(config)) {
			const match = errorPath.matchStart(pattern);
			if (match && match.length > bestLength) {
				bestMatch = { pattern, value, match };
				bestLength = match.length;
			}
		}

		return bestMatch;
	};

	// Test: deep path matches most specific
	const error1 = Pathist.from(['foo', 2, 'bar', 'baz', 'qux']);
	const match1 = findMostSpecific(error1);
	t.not(match1, null);
	t.is(match1?.pattern, 'foo[-1].bar'); // More specific than 'foo[-1]'
	t.is(match1?.value.scope, 'foo-bar-descendants');
	t.is(match1?.match.toString(), 'foo[2].bar');

	// Test: path without .bar matches only 'foo[-1]'
	const error2 = Pathist.from(['foo', 5, 'qux', 'nested']);
	const match2 = findMostSpecific(error2);
	t.not(match2, null);
	t.is(match2?.pattern, 'foo[-1]');
	t.is(match2?.value.scope, 'all-foo');
	t.is(match2?.match.toString(), 'foo[5]');
});
