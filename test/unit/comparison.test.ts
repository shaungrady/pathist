import test from 'ava';
import { Pathist } from '../../src/pathist.ts';

// Equals Method
test('equals returns true for same Pathist instance', (t) => {
	const p = new Pathist([0, 'foo', 1]);
	t.true(p.equals(p));
});

test('equals returns true for Pathist with same segments', (t) => {
	const p1 = new Pathist([0, 'foo', 1]);
	const p2 = new Pathist([0, 'foo', 1]);
	t.true(p1.equals(p2));
	t.true(p2.equals(p1));
});

test('equals returns true for Pathist constructed from different inputs', (t) => {
	const p1 = new Pathist([0, 'foo', 1]);
	const p2 = new Pathist('[0].foo[1]');
	t.true(p1.equals(p2));
	t.true(p2.equals(p1));
});

test('equals returns false for Pathist with different segments', (t) => {
	const p1 = new Pathist([0, 'foo', 1]);
	const p2 = new Pathist([0, 'bar', 1]);
	t.false(p1.equals(p2));
});

test('equals returns false for Pathist with different length', (t) => {
	const p1 = new Pathist([0, 'foo']);
	const p2 = new Pathist([0, 'foo', 1]);
	t.false(p1.equals(p2));
});

test('equals accepts string and compares correctly', (t) => {
	const p = new Pathist([0, 'foo', 1]);
	t.true(p.equals('[0].foo[1]'));
	t.false(p.equals('0.foo.1')); // Dot notation gives strings, not numbers
	t.false(p.equals('[0].bar[1]'));

	// Dot notation path
	const p2 = new Pathist('0.foo.1');
	t.true(p2.equals('0.foo.1'));
	t.true(p2.equals(['0', 'foo', '1'])); // All strings
});

test('equals accepts array and compares correctly', (t) => {
	const p = new Pathist([0, 'foo', 1]);
	t.true(p.equals([0, 'foo', 1]));
	t.false(p.equals([0, 'bar', 1]));
	t.false(p.equals([0, 'foo']));
});

test('equals returns true for empty paths', (t) => {
	const p1 = new Pathist([]);
	const p2 = new Pathist('');
	t.true(p1.equals(p2));
	t.true(p1.equals([]));
	t.true(p1.equals(''));
});

test('equals returns false for invalid inputs', (t) => {
	const p = new Pathist([0, 'foo', 1]);
	t.false(p.equals(null as any));
	t.false(p.equals(undefined as any));
	t.false(p.equals(123 as any));
	t.false(p.equals({} as any));
});

// StartsWith Method
test('startsWith returns true for same Pathist instance', (t) => {
	const p = new Pathist([0, 'foo', 1]);
	t.true(p.startsWith(p));
});

test('startsWith returns true when path starts with prefix', (t) => {
	const p = new Pathist([0, 'foo', 1, 'bar']);
	t.true(p.startsWith(new Pathist([0, 'foo'])));
	t.true(p.startsWith(new Pathist([0])));
	t.true(p.startsWith(new Pathist([0, 'foo', 1, 'bar']))); // Full match
});

test('startsWith returns false when path does not start with prefix', (t) => {
	const p = new Pathist([0, 'foo', 1, 'bar']);
	t.false(p.startsWith(new Pathist([0, 'bar'])));
	t.false(p.startsWith(new Pathist(['foo'])));
	t.false(p.startsWith(new Pathist([1, 'foo'])));
});

test('startsWith returns true for empty path', (t) => {
	const p = new Pathist([0, 'foo', 1]);
	t.true(p.startsWith(new Pathist([])));
	t.true(p.startsWith(''));
	t.true(p.startsWith([]));
});

test('startsWith returns false when prefix is longer', (t) => {
	const p = new Pathist([0, 'foo']);
	t.false(p.startsWith(new Pathist([0, 'foo', 1])));
});

test('startsWith accepts string and compares correctly', (t) => {
	const p = new Pathist([0, 'foo', 1, 'bar']);
	t.true(p.startsWith('[0].foo'));
	t.true(p.startsWith('[0]'));
	t.false(p.startsWith('[0].bar'));
});

test('startsWith accepts array and compares correctly', (t) => {
	const p = new Pathist([0, 'foo', 1, 'bar']);
	t.true(p.startsWith([0, 'foo']));
	t.true(p.startsWith([0]));
	t.false(p.startsWith([0, 'bar']));
});

test('startsWith returns false for invalid inputs', (t) => {
	const p = new Pathist([0, 'foo', 1]);
	t.false(p.startsWith(null as any));
	t.false(p.startsWith(undefined as any));
	t.false(p.startsWith(123 as any));
	t.false(p.startsWith({} as any));
});

test('empty path startsWith empty path', (t) => {
	const p = new Pathist([]);
	t.true(p.startsWith([]));
	t.true(p.startsWith(''));
});

test('empty path does not startWith non-empty path', (t) => {
	const p = new Pathist([]);
	t.false(p.startsWith([0]));
	t.false(p.startsWith('foo'));
});

// EndsWith Method
test('endsWith returns true for same Pathist instance', (t) => {
	const p = new Pathist([0, 'foo', 1]);
	t.true(p.endsWith(p));
});

test('endsWith returns true when path ends with suffix', (t) => {
	const p = new Pathist([0, 'foo', 1, 'bar']);
	t.true(p.endsWith(new Pathist(['bar'])));
	t.true(p.endsWith(new Pathist([1, 'bar'])));
	t.true(p.endsWith(new Pathist(['foo', 1, 'bar'])));
	t.true(p.endsWith(new Pathist([0, 'foo', 1, 'bar']))); // Full match
});

test('endsWith returns false when path does not end with suffix', (t) => {
	const p = new Pathist([0, 'foo', 1, 'bar']);
	t.false(p.endsWith(new Pathist([0, 'foo'])));
	t.false(p.endsWith(new Pathist(['foo'])));
	t.false(p.endsWith(new Pathist([1, 'baz'])));
});

test('endsWith returns true for empty path', (t) => {
	const p = new Pathist([0, 'foo', 1]);
	t.true(p.endsWith(new Pathist([])));
	t.true(p.endsWith(''));
	t.true(p.endsWith([]));
});

test('endsWith returns false when suffix is longer', (t) => {
	const p = new Pathist([0, 'foo']);
	t.false(p.endsWith(new Pathist([0, 'foo', 1])));
});

test('endsWith accepts string and compares correctly', (t) => {
	const p = new Pathist([0, 'foo', 1, 'bar']);
	t.true(p.endsWith('bar'));
	t.true(p.endsWith('[1].bar'));
	t.false(p.endsWith('[0].foo'));
});

test('endsWith accepts array and compares correctly', (t) => {
	const p = new Pathist([0, 'foo', 1, 'bar']);
	t.true(p.endsWith(['bar']));
	t.true(p.endsWith([1, 'bar']));
	t.false(p.endsWith([0, 'foo']));
});

test('endsWith returns false for invalid inputs', (t) => {
	const p = new Pathist([0, 'foo', 1]);
	t.false(p.endsWith(null as any));
	t.false(p.endsWith(undefined as any));
	t.false(p.endsWith(123 as any));
	t.false(p.endsWith({} as any));
});

test('empty path endsWith empty path', (t) => {
	const p = new Pathist([]);
	t.true(p.endsWith([]));
	t.true(p.endsWith(''));
});

test('empty path does not endWith non-empty path', (t) => {
	const p = new Pathist([]);
	t.false(p.endsWith([0]));
	t.false(p.endsWith('foo'));
});

// Includes Method
test('includes returns true for same Pathist instance', (t) => {
	const p = new Pathist([0, 'foo', 1]);
	t.true(p.includes(p));
});

test('includes returns true when subsequence is at the beginning', (t) => {
	const p = new Pathist([0, 'foo', 1, 'bar', 2]);
	t.true(p.includes(new Pathist([0, 'foo'])));
	t.true(p.includes(new Pathist([0])));
});

test('includes returns true when subsequence is in the middle', (t) => {
	const p = new Pathist([0, 'foo', 1, 'bar', 2]);
	t.true(p.includes(new Pathist(['foo', 1])));
	t.true(p.includes(new Pathist(['foo', 1, 'bar'])));
	t.true(p.includes(new Pathist([1])));
});

test('includes returns true when subsequence is at the end', (t) => {
	const p = new Pathist([0, 'foo', 1, 'bar', 2]);
	t.true(p.includes(new Pathist(['bar', 2])));
	t.true(p.includes(new Pathist([2])));
});

test('includes returns true for full match', (t) => {
	const p = new Pathist([0, 'foo', 1, 'bar']);
	t.true(p.includes(new Pathist([0, 'foo', 1, 'bar'])));
});

test('includes returns false when subsequence does not exist', (t) => {
	const p = new Pathist([0, 'foo', 1, 'bar']);
	t.false(p.includes(new Pathist([0, 'bar'])));
	t.false(p.includes(new Pathist(['foo', 'bar'])));
	t.false(p.includes(new Pathist([2])));
	t.false(p.includes(new Pathist(['baz'])));
});

test('includes returns true for empty path', (t) => {
	const p = new Pathist([0, 'foo', 1]);
	t.true(p.includes(new Pathist([])));
	t.true(p.includes(''));
	t.true(p.includes([]));
});

test('includes returns false when subsequence is longer', (t) => {
	const p = new Pathist([0, 'foo']);
	t.false(p.includes(new Pathist([0, 'foo', 1])));
});

test('includes accepts string and compares correctly', (t) => {
	const p = new Pathist([0, 'foo', 1, 'bar']);
	t.true(p.includes('foo'));
	t.true(p.includes('[1].bar'));
	t.true(p.includes('[0].foo'));
	t.false(p.includes('[0].bar'));
	t.false(p.includes('foo.bar'));
});

test('includes accepts array and compares correctly', (t) => {
	const p = new Pathist([0, 'foo', 1, 'bar']);
	t.true(p.includes(['foo']));
	t.true(p.includes([1, 'bar']));
	t.true(p.includes([0, 'foo']));
	t.false(p.includes([0, 'bar']));
	t.false(p.includes(['foo', 'bar']));
});

test('includes returns false for invalid inputs', (t) => {
	const p = new Pathist([0, 'foo', 1]);
	t.false(p.includes(null as any));
	t.false(p.includes(undefined as any));
	t.false(p.includes(123 as any));
	t.false(p.includes({} as any));
});

test('empty path includes empty path', (t) => {
	const p = new Pathist([]);
	t.true(p.includes([]));
	t.true(p.includes(''));
});

test('empty path does not include non-empty path', (t) => {
	const p = new Pathist([]);
	t.false(p.includes([0]));
	t.false(p.includes('foo'));
});

test('includes handles single segment paths correctly', (t) => {
	const p = new Pathist(['foo']);
	t.true(p.includes(['foo']));
	t.false(p.includes(['bar']));
});
