import test from 'ava';
import { Pathist } from '../../src/pathist.ts';

// IndexOf Method
test('positionOf returns correct position for same Pathist instance', (t) => {
	const p = new Pathist([0, 'foo', 1]);
	t.is(p.positionOf(p), 0);
});

// Parameterized positionOf tests
const positionOfCases = [
	{
		path: [0, 'foo', 1, 'bar', 2],
		subsequence: [0, 'foo'],
		expected: 0,
		desc: 'subsequence at beginning',
	},
	{
		path: [0, 'foo', 1, 'bar', 2],
		subsequence: [0],
		expected: 0,
		desc: 'single segment at beginning',
	},
	{
		path: [0, 'foo', 1, 'bar', 2],
		subsequence: ['foo', 1],
		expected: 1,
		desc: 'subsequence in middle',
	},
	{
		path: [0, 'foo', 1, 'bar', 2],
		subsequence: ['foo', 1, 'bar'],
		expected: 1,
		desc: 'multi-segment subsequence in middle',
	},
	{
		path: [0, 'foo', 1, 'bar', 2],
		subsequence: [1],
		expected: 2,
		desc: 'single segment in middle',
	},
	{
		path: [0, 'foo', 1, 'bar', 2],
		subsequence: ['bar', 2],
		expected: 3,
		desc: 'subsequence at end',
	},
	{
		path: [0, 'foo', 1, 'bar', 2],
		subsequence: [2],
		expected: 4,
		desc: 'single segment at end',
	},
	{
		path: [0, 'foo', 1, 'bar'],
		subsequence: [0, 'foo', 1, 'bar'],
		expected: 0,
		desc: 'full match',
	},
	{
		path: [0, 'foo', 1, 'bar'],
		subsequence: [0, 'bar'],
		expected: -1,
		desc: 'non-contiguous segments',
	},
	{
		path: [0, 'foo', 1, 'bar'],
		subsequence: ['foo', 'bar'],
		expected: -1,
		desc: 'non-adjacent segments',
	},
	{
		path: [0, 'foo', 1, 'bar'],
		subsequence: [2],
		expected: -1,
		desc: 'non-existent segment',
	},
	{
		path: [0, 'foo', 1, 'bar'],
		subsequence: ['baz'],
		expected: -1,
		desc: 'non-existent string segment',
	},
	{
		path: [0, 'foo'],
		subsequence: [0, 'foo', 1],
		expected: -1,
		desc: 'subsequence longer than path',
	},
];

for (const { path, subsequence, expected, desc } of positionOfCases) {
	test(`positionOf: ${desc}`, (t) => {
		const p = new Pathist(path);
		t.is(p.positionOf(new Pathist(subsequence)), expected);
	});
}

test('positionOf returns 0 for empty path', (t) => {
	const p = new Pathist([0, 'foo', 1]);
	t.is(p.positionOf(new Pathist([])), 0);
	t.is(p.positionOf(''), 0);
	t.is(p.positionOf([]), 0);
});

test('positionOf accepts string and compares correctly', (t) => {
	const p = new Pathist([0, 'foo', 1, 'bar']);
	t.is(p.positionOf('foo'), 1);
	t.is(p.positionOf('[1].bar'), 2);
	t.is(p.positionOf('[0].foo'), 0);
	t.is(p.positionOf('[0].bar'), -1);
	t.is(p.positionOf('foo.bar'), -1);
});

test('positionOf accepts array and compares correctly', (t) => {
	const p = new Pathist([0, 'foo', 1, 'bar']);
	t.is(p.positionOf(['foo']), 1);
	t.is(p.positionOf([1, 'bar']), 2);
	t.is(p.positionOf([0, 'foo']), 0);
	t.is(p.positionOf([0, 'bar']), -1);
	t.is(p.positionOf(['foo', 'bar']), -1);
});

// Parameterized invalid input tests
const invalidInputs = [
	{ value: null, desc: 'null' },
	{ value: undefined, desc: 'undefined' },
	{ value: 123, desc: 'number' },
	{ value: {}, desc: 'object' },
];

for (const { value, desc } of invalidInputs) {
	test(`positionOf returns -1 for ${desc} input`, (t) => {
		const p = new Pathist([0, 'foo', 1]);
		t.is(p.positionOf(value as any), -1);
	});
}

test('empty path positionOf empty path returns 0', (t) => {
	const p = new Pathist([]);
	t.is(p.positionOf([]), 0);
	t.is(p.positionOf(''), 0);
});

test('empty path positionOf non-empty path returns -1', (t) => {
	const p = new Pathist([]);
	t.is(p.positionOf([0]), -1);
	t.is(p.positionOf('foo'), -1);
});

test('positionOf handles single segment paths correctly', (t) => {
	const p = new Pathist(['foo']);
	t.is(p.positionOf(['foo']), 0);
	t.is(p.positionOf(['bar']), -1);
});

test('positionOf returns first occurrence when multiple matches exist', (t) => {
	const p = new Pathist(['foo', 'bar', 'foo', 'baz', 'foo']);
	t.is(p.positionOf(['foo']), 0);
	t.is(p.positionOf(new Pathist(['foo'])), 0);
});

// LastIndexOf Method
test('lastPositionOf returns correct position for same Pathist instance', (t) => {
	const p = new Pathist([0, 'foo', 1]);
	t.is(p.lastPositionOf(p), 0);
});

// Parameterized lastPositionOf tests
const lastPositionOfCases = [
	{
		path: [0, 'foo', 1, 'bar', 2],
		subsequence: [0, 'foo'],
		expected: 0,
		desc: 'subsequence at beginning (single occurrence)',
	},
	{
		path: [0, 'foo', 1, 'bar', 2],
		subsequence: [0],
		expected: 0,
		desc: 'single segment at beginning (single occurrence)',
	},
	{
		path: [0, 'foo', 1, 'bar', 2],
		subsequence: ['foo', 1],
		expected: 1,
		desc: 'subsequence in middle',
	},
	{
		path: [0, 'foo', 1, 'bar', 2],
		subsequence: ['foo', 1, 'bar'],
		expected: 1,
		desc: 'multi-segment subsequence in middle',
	},
	{
		path: [0, 'foo', 1, 'bar', 2],
		subsequence: [1],
		expected: 2,
		desc: 'single segment in middle',
	},
	{
		path: [0, 'foo', 1, 'bar', 2],
		subsequence: ['bar', 2],
		expected: 3,
		desc: 'subsequence at end',
	},
	{
		path: [0, 'foo', 1, 'bar', 2],
		subsequence: [2],
		expected: 4,
		desc: 'single segment at end',
	},
	{
		path: [0, 'foo', 1, 'bar'],
		subsequence: [0, 'foo', 1, 'bar'],
		expected: 0,
		desc: 'full match',
	},
	{
		path: [0, 'foo', 1, 'bar'],
		subsequence: [0, 'bar'],
		expected: -1,
		desc: 'non-contiguous segments',
	},
	{
		path: [0, 'foo', 1, 'bar'],
		subsequence: ['foo', 'bar'],
		expected: -1,
		desc: 'non-adjacent segments',
	},
	{
		path: [0, 'foo', 1, 'bar'],
		subsequence: [2],
		expected: -1,
		desc: 'non-existent segment',
	},
	{
		path: [0, 'foo', 1, 'bar'],
		subsequence: ['baz'],
		expected: -1,
		desc: 'non-existent string segment',
	},
	{
		path: [0, 'foo'],
		subsequence: [0, 'foo', 1],
		expected: -1,
		desc: 'subsequence longer than path',
	},
	{
		path: ['foo', 'bar', 'foo', 'baz', 'foo'],
		subsequence: ['foo'],
		expected: 4,
		desc: 'last occurrence when multiple matches exist',
	},
	{
		path: [0, 'foo', 1, 'foo', 2, 'foo', 3],
		subsequence: ['foo'],
		expected: 5,
		desc: 'last of multiple matches',
	},
];

for (const { path, subsequence, expected, desc } of lastPositionOfCases) {
	test(`lastPositionOf: ${desc}`, (t) => {
		const p = new Pathist(path);
		t.is(p.lastPositionOf(new Pathist(subsequence)), expected);
	});
}

test('lastPositionOf returns length for empty path', (t) => {
	const p = new Pathist([0, 'foo', 1]);
	t.is(p.lastPositionOf(new Pathist([])), 3);
	t.is(p.lastPositionOf(''), 3);
	t.is(p.lastPositionOf([]), 3);
});

test('lastPositionOf accepts string and compares correctly', (t) => {
	const p = new Pathist([0, 'foo', 1, 'bar']);
	t.is(p.lastPositionOf('foo'), 1);
	t.is(p.lastPositionOf('[1].bar'), 2);
	t.is(p.lastPositionOf('[0].foo'), 0);
	t.is(p.lastPositionOf('[0].bar'), -1);
	t.is(p.lastPositionOf('foo.bar'), -1);
});

test('lastPositionOf accepts array and compares correctly', (t) => {
	const p = new Pathist([0, 'foo', 1, 'bar']);
	t.is(p.lastPositionOf(['foo']), 1);
	t.is(p.lastPositionOf([1, 'bar']), 2);
	t.is(p.lastPositionOf([0, 'foo']), 0);
	t.is(p.lastPositionOf([0, 'bar']), -1);
	t.is(p.lastPositionOf(['foo', 'bar']), -1);
});

for (const { value, desc } of invalidInputs) {
	test(`lastPositionOf returns -1 for ${desc} input`, (t) => {
		const p = new Pathist([0, 'foo', 1]);
		t.is(p.lastPositionOf(value as any), -1);
	});
}

test('empty path lastPositionOf empty path returns 0', (t) => {
	const p = new Pathist([]);
	t.is(p.lastPositionOf([]), 0);
	t.is(p.lastPositionOf(''), 0);
});

test('empty path lastPositionOf non-empty path returns -1', (t) => {
	const p = new Pathist([]);
	t.is(p.lastPositionOf([0]), -1);
	t.is(p.lastPositionOf('foo'), -1);
});

test('lastPositionOf handles single segment paths correctly', (t) => {
	const p = new Pathist(['foo']);
	t.is(p.lastPositionOf(['foo']), 0);
	t.is(p.lastPositionOf(['bar']), -1);
});

test('lastPositionOf with multiple matches returns last position', (t) => {
	const p = new Pathist([0, 'foo', 1, 'foo', 2, 'foo', 3]);
	t.is(p.lastPositionOf(['foo']), 5);
	t.is(p.positionOf(['foo']), 1); // Verify positionOf returns first
});
