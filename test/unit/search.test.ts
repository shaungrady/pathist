import test from 'ava';
import { Pathist } from '../../src/pathist.js';

// IndexOf Method
test('positionOf returns correct position for same Pathist instance', (t) => {
	const p = Pathist.from([0, 'foo', 1]);
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
		const p = Pathist.from(path);
		t.is(p.positionOf(Pathist.from(subsequence)), expected);
	});
}

test('positionOf returns 0 for empty path', (t) => {
	const p = Pathist.from([0, 'foo', 1]);
	t.is(p.positionOf(Pathist.from([])), 0);
	t.is(p.positionOf(''), 0);
	t.is(p.positionOf([]), 0);
});

test('positionOf accepts string and compares correctly', (t) => {
	const p = Pathist.from([0, 'foo', 1, 'bar']);
	t.is(p.positionOf('foo'), 1);
	t.is(p.positionOf('[1].bar'), 2);
	t.is(p.positionOf('[0].foo'), 0);
	t.is(p.positionOf('[0].bar'), -1);
	t.is(p.positionOf('foo.bar'), -1);
});

test('positionOf accepts array and compares correctly', (t) => {
	const p = Pathist.from([0, 'foo', 1, 'bar']);
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
		const p = Pathist.from([0, 'foo', 1]);
		t.is(p.positionOf(value as any), -1);
	});
}

test('empty path positionOf empty path returns 0', (t) => {
	const p = Pathist.from([]);
	t.is(p.positionOf([]), 0);
	t.is(p.positionOf(''), 0);
});

test('empty path positionOf non-empty path returns -1', (t) => {
	const p = Pathist.from([]);
	t.is(p.positionOf([0]), -1);
	t.is(p.positionOf('foo'), -1);
});

test('positionOf handles single segment paths correctly', (t) => {
	const p = Pathist.from(['foo']);
	t.is(p.positionOf(['foo']), 0);
	t.is(p.positionOf(['bar']), -1);
});

test('positionOf returns first occurrence when multiple matches exist', (t) => {
	const p = Pathist.from(['foo', 'bar', 'foo', 'baz', 'foo']);
	t.is(p.positionOf(['foo']), 0);
	t.is(p.positionOf(Pathist.from(['foo'])), 0);
});

// LastIndexOf Method
test('lastPositionOf returns correct position for same Pathist instance', (t) => {
	const p = Pathist.from([0, 'foo', 1]);
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
		const p = Pathist.from(path);
		t.is(p.lastPositionOf(Pathist.from(subsequence)), expected);
	});
}

test('lastPositionOf returns length for empty path', (t) => {
	const p = Pathist.from([0, 'foo', 1]);
	t.is(p.lastPositionOf(Pathist.from([])), 3);
	t.is(p.lastPositionOf(''), 3);
	t.is(p.lastPositionOf([]), 3);
});

test('lastPositionOf accepts string and compares correctly', (t) => {
	const p = Pathist.from([0, 'foo', 1, 'bar']);
	t.is(p.lastPositionOf('foo'), 1);
	t.is(p.lastPositionOf('[1].bar'), 2);
	t.is(p.lastPositionOf('[0].foo'), 0);
	t.is(p.lastPositionOf('[0].bar'), -1);
	t.is(p.lastPositionOf('foo.bar'), -1);
});

test('lastPositionOf accepts array and compares correctly', (t) => {
	const p = Pathist.from([0, 'foo', 1, 'bar']);
	t.is(p.lastPositionOf(['foo']), 1);
	t.is(p.lastPositionOf([1, 'bar']), 2);
	t.is(p.lastPositionOf([0, 'foo']), 0);
	t.is(p.lastPositionOf([0, 'bar']), -1);
	t.is(p.lastPositionOf(['foo', 'bar']), -1);
});

for (const { value, desc } of invalidInputs) {
	test(`lastPositionOf returns -1 for ${desc} input`, (t) => {
		const p = Pathist.from([0, 'foo', 1]);
		t.is(p.lastPositionOf(value as any), -1);
	});
}

test('empty path lastPositionOf empty path returns 0', (t) => {
	const p = Pathist.from([]);
	t.is(p.lastPositionOf([]), 0);
	t.is(p.lastPositionOf(''), 0);
});

test('empty path lastPositionOf non-empty path returns -1', (t) => {
	const p = Pathist.from([]);
	t.is(p.lastPositionOf([0]), -1);
	t.is(p.lastPositionOf('foo'), -1);
});

test('lastPositionOf handles single segment paths correctly', (t) => {
	const p = Pathist.from(['foo']);
	t.is(p.lastPositionOf(['foo']), 0);
	t.is(p.lastPositionOf(['bar']), -1);
});

test('lastPositionOf with multiple matches returns last position', (t) => {
	const p = Pathist.from([0, 'foo', 1, 'foo', 2, 'foo', 3]);
	t.is(p.lastPositionOf(['foo']), 5);
	t.is(p.positionOf(['foo']), 1); // Verify positionOf returns first
});

// pathTo Method
test('pathTo returns path including first match', (t) => {
	const p = Pathist.from('foo.bar.baz.bar.qux');
	const result = p.pathTo('bar');
	t.deepEqual(result.toArray(), ['foo', 'bar']);
});

// Parameterized pathTo tests
const pathToCases = [
	{
		path: 'foo.bar.baz.bar.qux',
		search: 'bar',
		expected: ['foo', 'bar'],
		desc: 'single segment - first occurrence',
	},
	{
		path: 'foo.bar.baz.bar.qux',
		search: 'bar.baz',
		expected: ['foo', 'bar', 'baz'],
		desc: 'multi-segment sequence',
	},
	{
		path: 'foo.bar.baz.qux',
		search: 'foo',
		expected: ['foo'],
		desc: 'match at beginning',
	},
	{
		path: 'foo.bar.baz.qux',
		search: 'qux',
		expected: ['foo', 'bar', 'baz', 'qux'],
		desc: 'match at end',
	},
	{
		path: 'foo.bar.baz.qux',
		search: 'foo.bar.baz.qux',
		expected: ['foo', 'bar', 'baz', 'qux'],
		desc: 'match entire path',
	},
	{
		path: [0, 'foo', 1, 'bar', 2],
		search: ['foo', 1],
		expected: [0, 'foo', 1],
		desc: 'array segments in middle',
	},
	{
		path: [0, 'foo', 1, 'bar', 2],
		search: [0],
		expected: [0],
		desc: 'single array segment at start',
	},
	{
		path: 'foo.bar.baz',
		search: 'notfound',
		expected: [],
		desc: 'not found returns empty path',
	},
	{
		path: 'foo.bar.baz',
		search: 'bar.qux',
		expected: [],
		desc: 'partial match returns empty path',
	},
];

for (const { path, search, expected, desc } of pathToCases) {
	test(`pathTo: ${desc}`, (t) => {
		const p = Pathist.from(path);
		const result = p.pathTo(search);
		t.deepEqual(result.toArray(), expected);
	});
}

test('pathTo accepts different input types', (t) => {
	const p = Pathist.from('foo.bar.baz.bar.qux');

	// String input
	t.deepEqual(p.pathTo('bar').toArray(), ['foo', 'bar']);

	// Array input
	t.deepEqual(p.pathTo(['bar']).toArray(), ['foo', 'bar']);

	// Pathist input
	t.deepEqual(p.pathTo(Pathist.from('bar')).toArray(), ['foo', 'bar']);
});

test('pathTo with empty search returns empty path', (t) => {
	const p = Pathist.from('foo.bar.baz');
	t.deepEqual(p.pathTo('').toArray(), []);
	t.deepEqual(p.pathTo([]).toArray(), []);
});

test('pathTo on empty path returns empty path', (t) => {
	const p = Pathist.from('');
	t.deepEqual(p.pathTo('foo').toArray(), []);
	t.deepEqual(p.pathTo([]).toArray(), []);
});

test('pathTo throws on invalid input', (t) => {
	const p = Pathist.from('foo.bar');
	t.throws(() => p.pathTo(null as any), { instanceOf: TypeError });
	t.throws(() => p.pathTo(undefined as any), { instanceOf: TypeError });
	t.throws(() => p.pathTo(123 as any), { instanceOf: TypeError });
});

test('pathTo preserves instance config', (t) => {
	const p = Pathist.from('foo.bar.baz', { notation: 'Bracket' });
	const result = p.pathTo('bar');
	t.is(result.toString(), '["foo"]["bar"]');
});

test('pathTo returns first match when multiple exist', (t) => {
	const p = Pathist.from(['foo', 'bar', 'foo', 'baz', 'foo']);
	const result = p.pathTo('foo');
	t.deepEqual(result.toArray(), ['foo']);
});

// pathToLast Method
test('pathToLast returns path including last match', (t) => {
	const p = Pathist.from('foo.bar.baz.bar.qux');
	const result = p.pathToLast('bar');
	t.deepEqual(result.toArray(), ['foo', 'bar', 'baz', 'bar']);
});

// Parameterized pathToLast tests
const pathToLastCases = [
	{
		path: 'foo.bar.baz.bar.qux',
		search: 'bar',
		expected: ['foo', 'bar', 'baz', 'bar'],
		desc: 'single segment - last occurrence',
	},
	{
		path: 'foo.bar.baz.bar.qux',
		search: 'bar.baz',
		expected: ['foo', 'bar', 'baz'],
		desc: 'multi-segment sequence (only one match)',
	},
	{
		path: 'foo.bar.baz.qux',
		search: 'foo',
		expected: ['foo'],
		desc: 'match at beginning (only one)',
	},
	{
		path: 'foo.bar.baz.qux',
		search: 'qux',
		expected: ['foo', 'bar', 'baz', 'qux'],
		desc: 'match at end',
	},
	{
		path: 'foo.bar.baz.qux',
		search: 'foo.bar.baz.qux',
		expected: ['foo', 'bar', 'baz', 'qux'],
		desc: 'match entire path',
	},
	{
		path: [0, 'foo', 1, 'foo', 2, 'foo', 3],
		search: ['foo'],
		expected: [0, 'foo', 1, 'foo', 2, 'foo'],
		desc: 'last of multiple matches in array',
	},
	{
		path: ['a', 'b', 'a', 'b', 'a', 'b'],
		search: ['a', 'b'],
		expected: ['a', 'b', 'a', 'b', 'a', 'b'],
		desc: 'last occurrence of repeating pattern',
	},
	{
		path: 'foo.bar.baz',
		search: 'notfound',
		expected: [],
		desc: 'not found returns empty path',
	},
	{
		path: 'foo.bar.baz',
		search: 'bar.qux',
		expected: [],
		desc: 'partial match returns empty path',
	},
];

for (const { path, search, expected, desc } of pathToLastCases) {
	test(`pathToLast: ${desc}`, (t) => {
		const p = Pathist.from(path);
		const result = p.pathToLast(search);
		t.deepEqual(result.toArray(), expected);
	});
}

test('pathToLast accepts different input types', (t) => {
	const p = Pathist.from('foo.bar.baz.bar.qux');

	// String input
	t.deepEqual(p.pathToLast('bar').toArray(), ['foo', 'bar', 'baz', 'bar']);

	// Array input
	t.deepEqual(p.pathToLast(['bar']).toArray(), ['foo', 'bar', 'baz', 'bar']);

	// Pathist input
	t.deepEqual(p.pathToLast(Pathist.from('bar')).toArray(), ['foo', 'bar', 'baz', 'bar']);
});

test('pathToLast with empty search returns empty path', (t) => {
	const p = Pathist.from('foo.bar.baz');
	t.deepEqual(p.pathToLast('').toArray(), []);
	t.deepEqual(p.pathToLast([]).toArray(), []);
});

test('pathToLast on empty path returns empty path', (t) => {
	const p = Pathist.from('');
	t.deepEqual(p.pathToLast('foo').toArray(), []);
	t.deepEqual(p.pathToLast([]).toArray(), []);
});

test('pathToLast throws on invalid input', (t) => {
	const p = Pathist.from('foo.bar');
	t.throws(() => p.pathToLast(null as any), { instanceOf: TypeError });
	t.throws(() => p.pathToLast(undefined as any), { instanceOf: TypeError });
	t.throws(() => p.pathToLast(123 as any), { instanceOf: TypeError });
});

test('pathToLast preserves instance config', (t) => {
	const p = Pathist.from('foo.bar.baz.bar', { notation: 'Bracket' });
	const result = p.pathToLast('bar');
	t.is(result.toString(), '["foo"]["bar"]["baz"]["bar"]');
});

test('pathToLast returns last match when multiple exist', (t) => {
	const p = Pathist.from(['foo', 'bar', 'foo', 'baz', 'foo']);
	const result = p.pathToLast('foo');
	t.deepEqual(result.toArray(), ['foo', 'bar', 'foo', 'baz', 'foo']);
});

test('pathTo vs pathToLast with multiple matches', (t) => {
	const p = Pathist.from('a.b.c.b.d.b.e');

	// pathTo returns first match
	t.deepEqual(p.pathTo('b').toArray(), ['a', 'b']);

	// pathToLast returns last match
	t.deepEqual(p.pathToLast('b').toArray(), ['a', 'b', 'c', 'b', 'd', 'b']);
});
