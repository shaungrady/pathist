import test from 'ava';
import { Pathist } from '../../src/pathist.js';

// Equals Method
test('equals returns true for same Pathist instance', (t) => {
	const p = Pathist.from([0, 'foo', 1]);
	t.true(p.equals(p));
});

// Parameterized equals tests
const equalsCases = [
	{
		p1: [0, 'foo', 1],
		p2: [0, 'foo', 1],
		expected: true,
		desc: 'same segments',
	},
	{
		p1: [0, 'foo', 1],
		p2: '[0].foo[1]',
		expected: true,
		desc: 'different inputs, same segments',
	},
	{
		p1: [0, 'foo', 1],
		p2: [0, 'bar', 1],
		expected: false,
		desc: 'different segments',
	},
	{
		p1: [0, 'foo'],
		p2: [0, 'foo', 1],
		expected: false,
		desc: 'different length',
	},
	{
		p1: [],
		p2: '',
		expected: true,
		desc: 'empty paths',
	},
];

for (const { p1, p2, expected, desc } of equalsCases) {
	test(`equals: ${desc}`, (t) => {
		const pathist = Pathist.from(p1);
		t.is(pathist.equals(p2), expected);
		// Test symmetry for Pathist inputs
		if (typeof p2 !== 'string' && !Array.isArray(p2)) {
			t.is(Pathist.from(p2).equals(p1), expected);
		}
	});
}

test('equals accepts string and compares correctly', (t) => {
	const p = Pathist.from([0, 'foo', 1]);
	t.true(p.equals('[0].foo[1]'));
	t.false(p.equals('0.foo.1')); // Dot notation gives strings, not numbers
	t.false(p.equals('[0].bar[1]'));

	// Dot notation path
	const p2 = Pathist.from('0.foo.1');
	t.true(p2.equals('0.foo.1'));
	t.true(p2.equals(['0', 'foo', '1'])); // All strings
});

test('equals accepts array and compares correctly', (t) => {
	const p = Pathist.from([0, 'foo', 1]);
	t.true(p.equals([0, 'foo', 1]));
	t.false(p.equals([0, 'bar', 1]));
	t.false(p.equals([0, 'foo']));
});

test('equals returns true for empty paths', (t) => {
	const p1 = Pathist.from([]);
	const p2 = Pathist.from('');
	t.true(p1.equals(p2));
	t.true(p1.equals([]));
	t.true(p1.equals(''));
});

// Parameterized invalid input tests for equals
const invalidInputs = [
	{ value: null, desc: 'null' },
	{ value: undefined, desc: 'undefined' },
	{ value: 123, desc: 'number' },
	{ value: {}, desc: 'object' },
];

for (const { value, desc } of invalidInputs) {
	test(`equals returns false for ${desc} input`, (t) => {
		const p = Pathist.from([0, 'foo', 1]);
		t.false(p.equals(value as any));
	});
}

// StartsWith Method
test('startsWith returns true for same Pathist instance', (t) => {
	const p = Pathist.from([0, 'foo', 1]);
	t.true(p.startsWith(p));
});

// Parameterized startsWith tests
const startsWithCases = [
	{
		path: [0, 'foo', 1, 'bar'],
		prefix: [0, 'foo'],
		expected: true,
		desc: 'starts with prefix',
	},
	{
		path: [0, 'foo', 1, 'bar'],
		prefix: [0],
		expected: true,
		desc: 'starts with single segment',
	},
	{
		path: [0, 'foo', 1, 'bar'],
		prefix: [0, 'foo', 1, 'bar'],
		expected: true,
		desc: 'full match',
	},
	{
		path: [0, 'foo', 1, 'bar'],
		prefix: [0, 'bar'],
		expected: false,
		desc: 'does not start with prefix',
	},
	{
		path: [0, 'foo', 1, 'bar'],
		prefix: ['foo'],
		expected: false,
		desc: 'middle segment is not prefix',
	},
	{
		path: [0, 'foo', 1, 'bar'],
		prefix: [1, 'foo'],
		expected: false,
		desc: 'wrong first segment',
	},
	{
		path: [0, 'foo'],
		prefix: [0, 'foo', 1],
		expected: false,
		desc: 'prefix is longer than path',
	},
];

for (const { path, prefix, expected, desc } of startsWithCases) {
	test(`startsWith: ${desc}`, (t) => {
		const p = Pathist.from(path);
		t.is(p.startsWith(Pathist.from(prefix)), expected);
	});
}

test('startsWith returns true for empty path', (t) => {
	const p = Pathist.from([0, 'foo', 1]);
	t.true(p.startsWith(Pathist.from([])));
	t.true(p.startsWith(''));
	t.true(p.startsWith([]));
});

test('startsWith accepts string and compares correctly', (t) => {
	const p = Pathist.from([0, 'foo', 1, 'bar']);
	t.true(p.startsWith('[0].foo'));
	t.true(p.startsWith('[0]'));
	t.false(p.startsWith('[0].bar'));
});

test('startsWith accepts array and compares correctly', (t) => {
	const p = Pathist.from([0, 'foo', 1, 'bar']);
	t.true(p.startsWith([0, 'foo']));
	t.true(p.startsWith([0]));
	t.false(p.startsWith([0, 'bar']));
});

for (const { value, desc } of invalidInputs) {
	test(`startsWith returns false for ${desc} input`, (t) => {
		const p = Pathist.from([0, 'foo', 1]);
		t.false(p.startsWith(value as any));
	});
}

test('empty path startsWith empty path', (t) => {
	const p = Pathist.from([]);
	t.true(p.startsWith([]));
	t.true(p.startsWith(''));
});

test('empty path does not startWith non-empty path', (t) => {
	const p = Pathist.from([]);
	t.false(p.startsWith([0]));
	t.false(p.startsWith('foo'));
});

// EndsWith Method
test('endsWith returns true for same Pathist instance', (t) => {
	const p = Pathist.from([0, 'foo', 1]);
	t.true(p.endsWith(p));
});

// Parameterized endsWith tests
const endsWithCases = [
	{
		path: [0, 'foo', 1, 'bar'],
		suffix: ['bar'],
		expected: true,
		desc: 'ends with single segment',
	},
	{
		path: [0, 'foo', 1, 'bar'],
		suffix: [1, 'bar'],
		expected: true,
		desc: 'ends with suffix',
	},
	{
		path: [0, 'foo', 1, 'bar'],
		suffix: ['foo', 1, 'bar'],
		expected: true,
		desc: 'ends with multi-segment suffix',
	},
	{
		path: [0, 'foo', 1, 'bar'],
		suffix: [0, 'foo', 1, 'bar'],
		expected: true,
		desc: 'full match',
	},
	{
		path: [0, 'foo', 1, 'bar'],
		suffix: [0, 'foo'],
		expected: false,
		desc: 'prefix is not suffix',
	},
	{
		path: [0, 'foo', 1, 'bar'],
		suffix: ['foo'],
		expected: false,
		desc: 'middle segment is not suffix',
	},
	{
		path: [0, 'foo', 1, 'bar'],
		suffix: [1, 'baz'],
		expected: false,
		desc: 'wrong last segment',
	},
	{
		path: [0, 'foo'],
		suffix: [0, 'foo', 1],
		expected: false,
		desc: 'suffix is longer than path',
	},
];

for (const { path, suffix, expected, desc } of endsWithCases) {
	test(`endsWith: ${desc}`, (t) => {
		const p = Pathist.from(path);
		t.is(p.endsWith(Pathist.from(suffix)), expected);
	});
}

test('endsWith returns true for empty path', (t) => {
	const p = Pathist.from([0, 'foo', 1]);
	t.true(p.endsWith(Pathist.from([])));
	t.true(p.endsWith(''));
	t.true(p.endsWith([]));
});

test('endsWith accepts string and compares correctly', (t) => {
	const p = Pathist.from([0, 'foo', 1, 'bar']);
	t.true(p.endsWith('bar'));
	t.true(p.endsWith('[1].bar'));
	t.false(p.endsWith('[0].foo'));
});

test('endsWith accepts array and compares correctly', (t) => {
	const p = Pathist.from([0, 'foo', 1, 'bar']);
	t.true(p.endsWith(['bar']));
	t.true(p.endsWith([1, 'bar']));
	t.false(p.endsWith([0, 'foo']));
});

for (const { value, desc } of invalidInputs) {
	test(`endsWith returns false for ${desc} input`, (t) => {
		const p = Pathist.from([0, 'foo', 1]);
		t.false(p.endsWith(value as any));
	});
}

test('empty path endsWith empty path', (t) => {
	const p = Pathist.from([]);
	t.true(p.endsWith([]));
	t.true(p.endsWith(''));
});

test('empty path does not endWith non-empty path', (t) => {
	const p = Pathist.from([]);
	t.false(p.endsWith([0]));
	t.false(p.endsWith('foo'));
});

// Includes Method
test('includes returns true for same Pathist instance', (t) => {
	const p = Pathist.from([0, 'foo', 1]);
	t.true(p.includes(p));
});

// Parameterized includes tests
const includesCases = [
	{
		path: [0, 'foo', 1, 'bar', 2],
		subsequence: [0, 'foo'],
		expected: true,
		desc: 'subsequence at beginning',
	},
	{
		path: [0, 'foo', 1, 'bar', 2],
		subsequence: [0],
		expected: true,
		desc: 'single segment at beginning',
	},
	{
		path: [0, 'foo', 1, 'bar', 2],
		subsequence: ['foo', 1],
		expected: true,
		desc: 'subsequence in middle',
	},
	{
		path: [0, 'foo', 1, 'bar', 2],
		subsequence: ['foo', 1, 'bar'],
		expected: true,
		desc: 'multi-segment subsequence in middle',
	},
	{
		path: [0, 'foo', 1, 'bar', 2],
		subsequence: [1],
		expected: true,
		desc: 'single segment in middle',
	},
	{
		path: [0, 'foo', 1, 'bar', 2],
		subsequence: ['bar', 2],
		expected: true,
		desc: 'subsequence at end',
	},
	{
		path: [0, 'foo', 1, 'bar', 2],
		subsequence: [2],
		expected: true,
		desc: 'single segment at end',
	},
	{
		path: [0, 'foo', 1, 'bar'],
		subsequence: [0, 'foo', 1, 'bar'],
		expected: true,
		desc: 'full match',
	},
	{
		path: [0, 'foo', 1, 'bar'],
		subsequence: [0, 'bar'],
		expected: false,
		desc: 'non-contiguous segments',
	},
	{
		path: [0, 'foo', 1, 'bar'],
		subsequence: ['foo', 'bar'],
		expected: false,
		desc: 'non-adjacent segments',
	},
	{
		path: [0, 'foo', 1, 'bar'],
		subsequence: [2],
		expected: false,
		desc: 'non-existent segment',
	},
	{
		path: [0, 'foo', 1, 'bar'],
		subsequence: ['baz'],
		expected: false,
		desc: 'non-existent string segment',
	},
	{
		path: [0, 'foo'],
		subsequence: [0, 'foo', 1],
		expected: false,
		desc: 'subsequence longer than path',
	},
];

for (const { path, subsequence, expected, desc } of includesCases) {
	test(`includes: ${desc}`, (t) => {
		const p = Pathist.from(path);
		t.is(p.includes(Pathist.from(subsequence)), expected);
	});
}

test('includes returns true for empty path', (t) => {
	const p = Pathist.from([0, 'foo', 1]);
	t.true(p.includes(Pathist.from([])));
	t.true(p.includes(''));
	t.true(p.includes([]));
});

test('includes accepts string and compares correctly', (t) => {
	const p = Pathist.from([0, 'foo', 1, 'bar']);
	t.true(p.includes('foo'));
	t.true(p.includes('[1].bar'));
	t.true(p.includes('[0].foo'));
	t.false(p.includes('[0].bar'));
	t.false(p.includes('foo.bar'));
});

test('includes accepts array and compares correctly', (t) => {
	const p = Pathist.from([0, 'foo', 1, 'bar']);
	t.true(p.includes(['foo']));
	t.true(p.includes([1, 'bar']));
	t.true(p.includes([0, 'foo']));
	t.false(p.includes([0, 'bar']));
	t.false(p.includes(['foo', 'bar']));
});

for (const { value, desc } of invalidInputs) {
	test(`includes returns false for ${desc} input`, (t) => {
		const p = Pathist.from([0, 'foo', 1]);
		t.false(p.includes(value as any));
	});
}

test('empty path includes empty path', (t) => {
	const p = Pathist.from([]);
	t.true(p.includes([]));
	t.true(p.includes(''));
});

test('empty path does not include non-empty path', (t) => {
	const p = Pathist.from([]);
	t.false(p.includes([0]));
	t.false(p.includes('foo'));
});

test('includes handles single segment paths correctly', (t) => {
	const p = Pathist.from(['foo']);
	t.true(p.includes(['foo']));
	t.false(p.includes(['bar']));
});
