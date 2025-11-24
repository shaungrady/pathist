import test from 'ava';
import { Pathist } from '../../src/pathist.ts';

// IndexOf Method
test('indexOf returns correct position for same Pathist instance', (t) => {
	const p = new Pathist([0, 'foo', 1]);
	t.is(p.indexOf(p), 0);
});

test('indexOf returns 0 when subsequence is at the beginning', (t) => {
	const p = new Pathist([0, 'foo', 1, 'bar', 2]);
	t.is(p.indexOf(new Pathist([0, 'foo'])), 0);
	t.is(p.indexOf(new Pathist([0])), 0);
});

test('indexOf returns correct index when subsequence is in the middle', (t) => {
	const p = new Pathist([0, 'foo', 1, 'bar', 2]);
	t.is(p.indexOf(new Pathist(['foo', 1])), 1);
	t.is(p.indexOf(new Pathist(['foo', 1, 'bar'])), 1);
	t.is(p.indexOf(new Pathist([1])), 2);
});

test('indexOf returns correct index when subsequence is at the end', (t) => {
	const p = new Pathist([0, 'foo', 1, 'bar', 2]);
	t.is(p.indexOf(new Pathist(['bar', 2])), 3);
	t.is(p.indexOf(new Pathist([2])), 4);
});

test('indexOf returns 0 for full match', (t) => {
	const p = new Pathist([0, 'foo', 1, 'bar']);
	t.is(p.indexOf(new Pathist([0, 'foo', 1, 'bar'])), 0);
});

test('indexOf returns -1 when subsequence does not exist', (t) => {
	const p = new Pathist([0, 'foo', 1, 'bar']);
	t.is(p.indexOf(new Pathist([0, 'bar'])), -1);
	t.is(p.indexOf(new Pathist(['foo', 'bar'])), -1);
	t.is(p.indexOf(new Pathist([2])), -1);
	t.is(p.indexOf(new Pathist(['baz'])), -1);
});

test('indexOf returns 0 for empty path', (t) => {
	const p = new Pathist([0, 'foo', 1]);
	t.is(p.indexOf(new Pathist([])), 0);
	t.is(p.indexOf(''), 0);
	t.is(p.indexOf([]), 0);
});

test('indexOf returns -1 when subsequence is longer', (t) => {
	const p = new Pathist([0, 'foo']);
	t.is(p.indexOf(new Pathist([0, 'foo', 1])), -1);
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

test('indexOf returns -1 for invalid inputs', (t) => {
	const p = new Pathist([0, 'foo', 1]);
	t.is(p.indexOf(null as any), -1);
	t.is(p.indexOf(undefined as any), -1);
	t.is(p.indexOf(123 as any), -1);
	t.is(p.indexOf({} as any), -1);
});

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

test('lastIndexOf returns 0 when subsequence is at the beginning and only occurs once', (t) => {
	const p = new Pathist([0, 'foo', 1, 'bar', 2]);
	t.is(p.lastIndexOf(new Pathist([0, 'foo'])), 0);
	t.is(p.lastIndexOf(new Pathist([0])), 0);
});

test('lastIndexOf returns correct index when subsequence is in the middle', (t) => {
	const p = new Pathist([0, 'foo', 1, 'bar', 2]);
	t.is(p.lastIndexOf(new Pathist(['foo', 1])), 1);
	t.is(p.lastIndexOf(new Pathist(['foo', 1, 'bar'])), 1);
	t.is(p.lastIndexOf(new Pathist([1])), 2);
});

test('lastIndexOf returns correct index when subsequence is at the end', (t) => {
	const p = new Pathist([0, 'foo', 1, 'bar', 2]);
	t.is(p.lastIndexOf(new Pathist(['bar', 2])), 3);
	t.is(p.lastIndexOf(new Pathist([2])), 4);
});

test('lastIndexOf returns 0 for full match', (t) => {
	const p = new Pathist([0, 'foo', 1, 'bar']);
	t.is(p.lastIndexOf(new Pathist([0, 'foo', 1, 'bar'])), 0);
});

test('lastIndexOf returns -1 when subsequence does not exist', (t) => {
	const p = new Pathist([0, 'foo', 1, 'bar']);
	t.is(p.lastIndexOf(new Pathist([0, 'bar'])), -1);
	t.is(p.lastIndexOf(new Pathist(['foo', 'bar'])), -1);
	t.is(p.lastIndexOf(new Pathist([2])), -1);
	t.is(p.lastIndexOf(new Pathist(['baz'])), -1);
});

test('lastIndexOf returns length for empty path', (t) => {
	const p = new Pathist([0, 'foo', 1]);
	t.is(p.lastIndexOf(new Pathist([])), 3);
	t.is(p.lastIndexOf(''), 3);
	t.is(p.lastIndexOf([]), 3);
});

test('lastIndexOf returns -1 when subsequence is longer', (t) => {
	const p = new Pathist([0, 'foo']);
	t.is(p.lastIndexOf(new Pathist([0, 'foo', 1])), -1);
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

test('lastIndexOf returns -1 for invalid inputs', (t) => {
	const p = new Pathist([0, 'foo', 1]);
	t.is(p.lastIndexOf(null as any), -1);
	t.is(p.lastIndexOf(undefined as any), -1);
	t.is(p.lastIndexOf(123 as any), -1);
	t.is(p.lastIndexOf({} as any), -1);
});

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

test('lastIndexOf returns last occurrence when multiple matches exist', (t) => {
	const p = new Pathist(['foo', 'bar', 'foo', 'baz', 'foo']);
	t.is(p.lastIndexOf(['foo']), 4);
	t.is(p.lastIndexOf(new Pathist(['foo'])), 4);
});

test('lastIndexOf with multiple matches returns last position', (t) => {
	const p = new Pathist([0, 'foo', 1, 'foo', 2, 'foo', 3]);
	t.is(p.lastIndexOf(['foo']), 5);
	t.is(p.indexOf(['foo']), 1); // Verify indexOf returns first
});
