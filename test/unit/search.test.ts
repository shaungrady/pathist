import test from 'ava';
import { Pathist } from '../../src/pathist.ts';

// IndexOf Method
test('indexOf returns correct position for same Pathist instance', (t) => {
	const p = new Pathist([0, 'foo', 1]);
	t.is(p.indexOf(p), 0);
});

// Parameterized indexOf tests
const indexOfCases = [
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

for (const { path, subsequence, expected, desc } of indexOfCases) {
	test(`indexOf: ${desc}`, (t) => {
		const p = new Pathist(path);
		t.is(p.indexOf(new Pathist(subsequence)), expected);
	});
}

test('indexOf returns 0 for empty path', (t) => {
	const p = new Pathist([0, 'foo', 1]);
	t.is(p.indexOf(new Pathist([])), 0);
	t.is(p.indexOf(''), 0);
	t.is(p.indexOf([]), 0);
});

test('indexOf accepts string and compares correctly', (t) => {
	const p = new Pathist([0, 'foo', 1, 'bar']);
	t.is(p.indexOf('foo'), 1);
	t.is(p.indexOf('[1].bar'), 2);
	t.is(p.indexOf('[0].foo'), 0);
	t.is(p.indexOf('[0].bar'), -1);
	t.is(p.indexOf('foo.bar'), -1);
});

test('indexOf accepts array and compares correctly', (t) => {
	const p = new Pathist([0, 'foo', 1, 'bar']);
	t.is(p.indexOf(['foo']), 1);
	t.is(p.indexOf([1, 'bar']), 2);
	t.is(p.indexOf([0, 'foo']), 0);
	t.is(p.indexOf([0, 'bar']), -1);
	t.is(p.indexOf(['foo', 'bar']), -1);
});

// Parameterized invalid input tests
const invalidInputs = [
	{ value: null, desc: 'null' },
	{ value: undefined, desc: 'undefined' },
	{ value: 123, desc: 'number' },
	{ value: {}, desc: 'object' },
];

for (const { value, desc } of invalidInputs) {
	test(`indexOf returns -1 for ${desc} input`, (t) => {
		const p = new Pathist([0, 'foo', 1]);
		t.is(p.indexOf(value as any), -1);
	});
}

test('empty path indexOf empty path returns 0', (t) => {
	const p = new Pathist([]);
	t.is(p.indexOf([]), 0);
	t.is(p.indexOf(''), 0);
});

test('empty path indexOf non-empty path returns -1', (t) => {
	const p = new Pathist([]);
	t.is(p.indexOf([0]), -1);
	t.is(p.indexOf('foo'), -1);
});

test('indexOf handles single segment paths correctly', (t) => {
	const p = new Pathist(['foo']);
	t.is(p.indexOf(['foo']), 0);
	t.is(p.indexOf(['bar']), -1);
});

test('indexOf returns first occurrence when multiple matches exist', (t) => {
	const p = new Pathist(['foo', 'bar', 'foo', 'baz', 'foo']);
	t.is(p.indexOf(['foo']), 0);
	t.is(p.indexOf(new Pathist(['foo'])), 0);
});

// LastIndexOf Method
test('lastIndexOf returns correct position for same Pathist instance', (t) => {
	const p = new Pathist([0, 'foo', 1]);
	t.is(p.lastIndexOf(p), 0);
});

// Parameterized lastIndexOf tests
const lastIndexOfCases = [
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

for (const { path, subsequence, expected, desc } of lastIndexOfCases) {
	test(`lastIndexOf: ${desc}`, (t) => {
		const p = new Pathist(path);
		t.is(p.lastIndexOf(new Pathist(subsequence)), expected);
	});
}

test('lastIndexOf returns length for empty path', (t) => {
	const p = new Pathist([0, 'foo', 1]);
	t.is(p.lastIndexOf(new Pathist([])), 3);
	t.is(p.lastIndexOf(''), 3);
	t.is(p.lastIndexOf([]), 3);
});

test('lastIndexOf accepts string and compares correctly', (t) => {
	const p = new Pathist([0, 'foo', 1, 'bar']);
	t.is(p.lastIndexOf('foo'), 1);
	t.is(p.lastIndexOf('[1].bar'), 2);
	t.is(p.lastIndexOf('[0].foo'), 0);
	t.is(p.lastIndexOf('[0].bar'), -1);
	t.is(p.lastIndexOf('foo.bar'), -1);
});

test('lastIndexOf accepts array and compares correctly', (t) => {
	const p = new Pathist([0, 'foo', 1, 'bar']);
	t.is(p.lastIndexOf(['foo']), 1);
	t.is(p.lastIndexOf([1, 'bar']), 2);
	t.is(p.lastIndexOf([0, 'foo']), 0);
	t.is(p.lastIndexOf([0, 'bar']), -1);
	t.is(p.lastIndexOf(['foo', 'bar']), -1);
});

for (const { value, desc } of invalidInputs) {
	test(`lastIndexOf returns -1 for ${desc} input`, (t) => {
		const p = new Pathist([0, 'foo', 1]);
		t.is(p.lastIndexOf(value as any), -1);
	});
}

test('empty path lastIndexOf empty path returns 0', (t) => {
	const p = new Pathist([]);
	t.is(p.lastIndexOf([]), 0);
	t.is(p.lastIndexOf(''), 0);
});

test('empty path lastIndexOf non-empty path returns -1', (t) => {
	const p = new Pathist([]);
	t.is(p.lastIndexOf([0]), -1);
	t.is(p.lastIndexOf('foo'), -1);
});

test('lastIndexOf handles single segment paths correctly', (t) => {
	const p = new Pathist(['foo']);
	t.is(p.lastIndexOf(['foo']), 0);
	t.is(p.lastIndexOf(['bar']), -1);
});

test('lastIndexOf with multiple matches returns last position', (t) => {
	const p = new Pathist([0, 'foo', 1, 'foo', 2, 'foo', 3]);
	t.is(p.lastIndexOf(['foo']), 5);
	t.is(p.indexOf(['foo']), 1); // Verify indexOf returns first
});
