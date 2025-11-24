import test from 'ava';
import { Pathist } from './pathist.ts';

// Constructor - String Input
test('parses dot notation string', (t) => {
	const p = new Pathist('foo.bar.baz');
	t.deepEqual(p.toArray(), ['foo', 'bar', 'baz']);
});

test('parses bracket notation with numeric indices', (t) => {
	const p = new Pathist('[0][1][2]');
	t.deepEqual(p.toArray(), [0, 1, 2]);
});

test('parses mixed notation string', (t) => {
	const p = new Pathist('[0].children[2].some.path');
	t.deepEqual(p.toArray(), [0, 'children', 2, 'some', 'path']);
});

test('parses empty string', (t) => {
	const p = new Pathist('');
	t.deepEqual(p.toArray(), []);
});

test('parses single segment string', (t) => {
	const p = new Pathist('foo');
	t.deepEqual(p.toArray(), ['foo']);
});

test('parses single bracket segment', (t) => {
	const p = new Pathist('[0]');
	t.deepEqual(p.toArray(), [0]);
});

// Constructor - Array Input
test('accepts array with mixed types', (t) => {
	const p = new Pathist([0, 'children', 2, 'some', 'path']);
	t.deepEqual(p.toArray(), [0, 'children', 2, 'some', 'path']);
});

test('accepts empty array', (t) => {
	const p = new Pathist([]);
	t.deepEqual(p.toArray(), []);
});

test('rejects array containing symbols', (t) => {
	const sym = Symbol('test');
	t.throws(() => new Pathist([0, sym] as any), {
		message: /symbol/i,
	});
});

test('rejects array containing objects', (t) => {
	t.throws(() => new Pathist([0, {}] as any), {
		message: /string or number/i,
	});
});

test('rejects array containing null', (t) => {
	t.throws(() => new Pathist([0, null] as any), {
		message: /string or number/i,
	});
});

test('rejects array containing undefined', (t) => {
	t.throws(() => new Pathist([0, undefined] as any), {
		message: /string or number/i,
	});
});

// toArray() Method
test('toArray returns correct array representation', (t) => {
	const p = new Pathist('foo.bar');
	t.deepEqual(p.toArray(), ['foo', 'bar']);
});

test('toArray returns a new array (not internal reference)', (t) => {
	const p = new Pathist('foo.bar');
	const arr1 = p.toArray();
	const arr2 = p.toArray();
	t.not(arr1, arr2);
});

test('modifying toArray result does not affect instance', (t) => {
	const p = new Pathist('foo.bar');
	const arr = p.toArray();
	arr.push('baz');
	t.deepEqual(p.toArray(), ['foo', 'bar']);
});

// toString() - Mixed Notation (Default)
test('toString with mixed notation - numbers and strings', (t) => {
	const p = new Pathist([0, 'foo', 1]);
	t.is(p.toString(), '[0].foo[1]');
});

test('toString with mixed notation - only strings', (t) => {
	const p = new Pathist(['foo', 'bar']);
	t.is(p.toString(), 'foo.bar');
});

test('toString with mixed notation - only numbers', (t) => {
	const p = new Pathist([0, 1, 2]);
	t.is(p.toString(), '[0][1][2]');
});

test('toString with mixed notation - empty path', (t) => {
	const p = new Pathist([]);
	t.is(p.toString(), '');
});

// toString() - Bracket Notation
test('toString with bracket notation - numbers and strings', (t) => {
	const p = new Pathist([0, 'foo', 1]);
	t.is(p.toString(Pathist.Notation.Bracket), '[0]["foo"][1]');
});

test('toString with bracket notation - only strings', (t) => {
	const p = new Pathist(['foo', 'bar']);
	t.is(p.toString(Pathist.Notation.Bracket), '["foo"]["bar"]');
});

test('toString with bracket notation - only numbers', (t) => {
	const p = new Pathist([0, 1, 2]);
	t.is(p.toString(Pathist.Notation.Bracket), '[0][1][2]');
});

test('toString with bracket notation - empty path', (t) => {
	const p = new Pathist([]);
	t.is(p.toString(Pathist.Notation.Bracket), '');
});

// toString() - Dot Notation
test('toString with dot notation - numbers and strings', (t) => {
	const p = new Pathist([0, 'foo', 1]);
	t.is(p.toString(Pathist.Notation.Dot), '0.foo.1');
});

test('toString with dot notation - only strings', (t) => {
	const p = new Pathist(['foo', 'bar']);
	t.is(p.toString(Pathist.Notation.Dot), 'foo.bar');
});

test('toString with dot notation - single number', (t) => {
	const p = new Pathist([0]);
	t.is(p.toString(Pathist.Notation.Dot), '0');
});

test('toString with dot notation - empty path', (t) => {
	const p = new Pathist([]);
	t.is(p.toString(Pathist.Notation.Dot), '');
});

test('toString validates notation parameter', (t) => {
	const p = new Pathist(['foo', 'bar']);
	const error = t.throws(() => {
		p.toString('invalid' as any);
	}, { instanceOf: TypeError });
	t.regex(error.message, /invalid notation/i);
});

// defaultNotation Getter/Setter
test('default notation is Mixed', (t) => {
	const p = new Pathist([0, 'foo', 1]);
	t.is(p.toString(), '[0].foo[1]');
});

test('defaultNotation setter changes default to Bracket', (t) => {
	Pathist.defaultNotation = Pathist.Notation.Bracket;
	const p = new Pathist([0, 'foo', 1]);
	t.is(p.toString(), '[0]["foo"][1]');
	// Reset to Mixed for other tests
	Pathist.defaultNotation = Pathist.Notation.Mixed;
});

test('defaultNotation setter changes default to Dot', (t) => {
	Pathist.defaultNotation = Pathist.Notation.Dot;
	const p = new Pathist([0, 'foo', 1]);
	t.is(p.toString(), '0.foo.1');
	// Reset to Mixed for other tests
	Pathist.defaultNotation = Pathist.Notation.Mixed;
});

test('defaultNotation setter validates notation value', (t) => {
	const error = t.throws(() => {
		Pathist.defaultNotation = 'invalid' as any;
	}, { instanceOf: TypeError });
	t.regex(error.message, /invalid notation/i);
});

test('per-call override works regardless of default', (t) => {
	Pathist.defaultNotation = Pathist.Notation.Bracket;
	const p = new Pathist([0, 'foo', 1]);
	t.is(p.toString(Pathist.Notation.Mixed), '[0].foo[1]');
	// Reset to Mixed for other tests
	Pathist.defaultNotation = Pathist.Notation.Mixed;
});

// Immutability
test('modifying input array after construction does not affect instance', (t) => {
	const input = [0, 'foo', 1];
	const p = new Pathist(input);
	input.push('bar');
	t.deepEqual(p.toArray(), [0, 'foo', 1]);
});

// Memoization
test('toString returns same string reference when called multiple times with same notation', (t) => {
	const p = new Pathist([0, 'foo', 1]);
	const str1 = p.toString();
	const str2 = p.toString();
	t.is(str1, str2); // Same reference
});

test('toString memoizes different notations separately', (t) => {
	const p = new Pathist([0, 'foo', 1]);
	const mixed1 = p.toString(Pathist.Notation.Mixed);
	const bracket1 = p.toString(Pathist.Notation.Bracket);
	const mixed2 = p.toString(Pathist.Notation.Mixed);
	const bracket2 = p.toString(Pathist.Notation.Bracket);

	t.is(mixed1, mixed2); // Same reference
	t.is(bracket1, bracket2); // Same reference
	t.not(mixed1, bracket1); // Different values
});

// Length Property
test('length property returns correct number of segments', (t) => {
	const p = new Pathist([0, 'foo', 1]);
	t.is(p.length, 3);
});

test('empty path has length 0', (t) => {
	const p = new Pathist([]);
	t.is(p.length, 0);
});

test('single segment has length 1', (t) => {
	const p1 = new Pathist(['foo']);
	const p2 = new Pathist([0]);
	t.is(p1.length, 1);
	t.is(p2.length, 1);
});

test('length is consistent with toArray().length', (t) => {
	const p = new Pathist([0, 'children', 2, 'some', 'path']);
	t.is(p.length, p.toArray().length);
	t.is(p.length, 5);
});

// Getter Aliases
test('string getter returns same as toString()', (t) => {
	const p = new Pathist([0, 'foo', 1]);
	t.is(p.string, p.toString());
	t.is(p.string, '[0].foo[1]');
});

test('array getter returns same as toArray()', (t) => {
	const p = new Pathist([0, 'foo', 1]);
	t.deepEqual(p.array, p.toArray());
	t.deepEqual(p.array, [0, 'foo', 1]);
});

test('string getter uses default notation', (t) => {
	Pathist.defaultNotation = Pathist.Notation.Bracket;
	const p = new Pathist([0, 'foo', 1]);
	t.is(p.string, '[0]["foo"][1]');
	// Reset to Mixed for other tests
	Pathist.defaultNotation = Pathist.Notation.Mixed;
});

test('array getter returns a new array each time', (t) => {
	const p = new Pathist([0, 'foo', 1]);
	const arr1 = p.array;
	const arr2 = p.array;
	t.not(arr1, arr2);
	t.deepEqual(arr1, arr2);
});

// Iterator
test('can iterate over segments with for...of', (t) => {
	const p = new Pathist([0, 'foo', 1]);
	const segments = [];
	for (const segment of p) {
		segments.push(segment);
	}
	t.deepEqual(segments, [0, 'foo', 1]);
});

test('can spread instance into array', (t) => {
	const p = new Pathist(['foo', 'bar', 'baz']);
	t.deepEqual([...p], ['foo', 'bar', 'baz']);
});

test('can use Array.from on instance', (t) => {
	const p = new Pathist([0, 'children', 2]);
	t.deepEqual(Array.from(p), [0, 'children', 2]);
});

test('empty path iteration works', (t) => {
	const p = new Pathist([]);
	const segments = [];
	for (const segment of p) {
		segments.push(segment);
	}
	t.deepEqual(segments, []);
});

test('iterator returns correct values in order', (t) => {
	const p = new Pathist([0, 'a', 1, 'b', 2]);
	const iterator = p[Symbol.iterator]();
	t.deepEqual(iterator.next(), { value: 0, done: false });
	t.deepEqual(iterator.next(), { value: 'a', done: false });
	t.deepEqual(iterator.next(), { value: 1, done: false });
	t.deepEqual(iterator.next(), { value: 'b', done: false });
	t.deepEqual(iterator.next(), { value: 2, done: false });
	t.deepEqual(iterator.next(), { value: undefined, done: true });
});

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

test('indexOf with indices: Preserve - different indices do not match', (t) => {
	const p = new Pathist([0, 'foo', 1, 'bar', 2]);
	t.is(p.indexOf([9, 'bar']), -1);
	t.is(p.indexOf([9, 'bar'], { indices: Pathist.Indices.Preserve }), -1);
});

test('indexOf with indices: Ignore - different indices match', (t) => {
	const p = new Pathist([0, 'foo', 1, 'bar', 2]);
	t.is(p.indexOf([9, 'bar'], { indices: Pathist.Indices.Ignore }), 2);
	t.is(p.indexOf([999], { indices: Pathist.Indices.Ignore }), 0);
	t.is(p.indexOf([7, 'foo', 8], { indices: Pathist.Indices.Ignore }), 0);
});

test('indexOf with indices: Ignore - string segments must match', (t) => {
	const p = new Pathist([0, 'foo', 1, 'bar']);
	t.is(p.indexOf([9, 'baz'], { indices: Pathist.Indices.Ignore }), -1);
});

test('indexOf with indices: Ignore - finds subsequence at correct position', (t) => {
	const p = new Pathist([0, 'foo', 1, 'bar', 2, 'baz']);
	// Middle subsequence
	t.is(p.indexOf([999, 'bar', 888], { indices: Pathist.Indices.Ignore }), 2);
	// Start subsequence
	t.is(p.indexOf([777, 'foo'], { indices: Pathist.Indices.Ignore }), 0);
	// End subsequence
	t.is(p.indexOf([666, 'baz'], { indices: Pathist.Indices.Ignore }), 4);
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

test('lastIndexOf with indices: Preserve - different indices do not match', (t) => {
	const p = new Pathist([0, 'foo', 1, 'bar', 2]);
	t.is(p.lastIndexOf([9, 'bar']), -1);
	t.is(p.lastIndexOf([9, 'bar'], { indices: Pathist.Indices.Preserve }), -1);
});

test('lastIndexOf with indices: Ignore - different indices match', (t) => {
	const p = new Pathist([0, 'foo', 1, 'bar', 2]);
	t.is(p.lastIndexOf([9, 'bar'], { indices: Pathist.Indices.Ignore }), 2);
	t.is(p.lastIndexOf([999], { indices: Pathist.Indices.Ignore }), 4);
	t.is(p.lastIndexOf([7, 'foo', 8], { indices: Pathist.Indices.Ignore }), 0);
});

test('lastIndexOf with indices: Ignore - string segments must match', (t) => {
	const p = new Pathist([0, 'foo', 1, 'bar']);
	t.is(p.lastIndexOf([9, 'baz'], { indices: Pathist.Indices.Ignore }), -1);
});

test('lastIndexOf with indices: Ignore - finds last subsequence at correct position', (t) => {
	const p = new Pathist([0, 'foo', 1, 'bar', 2, 'baz', 3, 'bar', 4]);
	// Multiple 'bar' segments - should find last one (at index 6: segment 3 and 'bar')
	t.is(p.lastIndexOf([999, 'bar'], { indices: Pathist.Indices.Ignore }), 6);
	// Start subsequence
	t.is(p.lastIndexOf([777, 'foo'], { indices: Pathist.Indices.Ignore }), 0);
	// Find last occurrence of 'baz' followed by any number
	t.is(p.lastIndexOf(['baz', 888], { indices: Pathist.Indices.Ignore }), 5);
});

// Indices Default and Configuration
test('default indices mode is Preserve', (t) => {
	t.is(Pathist.defaultIndices, Pathist.Indices.Preserve);
});

test('defaultIndices setter changes default to Ignore', (t) => {
	const originalMode = Pathist.defaultIndices;
	Pathist.defaultIndices = Pathist.Indices.Ignore;
	t.is(Pathist.defaultIndices, Pathist.Indices.Ignore);
	// Reset for other tests
	Pathist.defaultIndices = originalMode;
});

test('defaultIndices setter validates mode value', (t) => {
	const error = t.throws(() => {
		Pathist.defaultIndices = 'invalid' as any;
	}, { instanceOf: TypeError });
	t.regex(error.message, /invalid indices mode/i);
});

// Equals with Indices Options
test('equals with indices: Preserve (default) - different indices do not match', (t) => {
	const p1 = new Pathist([0, 'foo', 1]);
	const p2 = new Pathist([0, 'foo', 2]);
	t.false(p1.equals(p2));
	t.false(p1.equals(p2, { indices: Pathist.Indices.Preserve }));
});

test('equals with indices: Ignore - different indices match', (t) => {
	const p1 = new Pathist([0, 'foo', 1]);
	const p2 = new Pathist([0, 'foo', 2]);
	const p3 = new Pathist([9, 'foo', 999]);
	t.true(p1.equals(p2, { indices: Pathist.Indices.Ignore }));
	t.true(p1.equals(p3, { indices: Pathist.Indices.Ignore }));
});

test('equals with indices: Ignore - string segments must still match exactly', (t) => {
	const p1 = new Pathist([0, 'foo', 1]);
	const p2 = new Pathist([0, 'bar', 2]);
	t.false(p1.equals(p2, { indices: Pathist.Indices.Ignore }));
});

test('equals with indices: Ignore - mixed number and string segments', (t) => {
	const p1 = new Pathist([0, 'foo', 1, 'bar', 2]);
	const p2 = new Pathist([5, 'foo', 7, 'bar', 9]);
	const p3 = new Pathist([5, 'foo', 7, 'baz', 9]);
	t.true(p1.equals(p2, { indices: Pathist.Indices.Ignore }));
	t.false(p1.equals(p3, { indices: Pathist.Indices.Ignore }));
});

test('equals respects defaultIndices', (t) => {
	const originalMode = Pathist.defaultIndices;
	const p1 = new Pathist([0, 'foo', 1]);
	const p2 = new Pathist([0, 'foo', 2]);

	Pathist.defaultIndices = Pathist.Indices.Ignore;
	t.true(p1.equals(p2)); // Should match with Ignore mode

	Pathist.defaultIndices = Pathist.Indices.Preserve;
	t.false(p1.equals(p2)); // Should not match with Preserve mode

	// Reset
	Pathist.defaultIndices = originalMode;
});

// StartsWith with Indices Options
test('startsWith with indices: Preserve - different indices do not match', (t) => {
	const p = new Pathist([0, 'foo', 1, 'bar']);
	t.false(p.startsWith([9, 'foo']));
	t.false(p.startsWith([9, 'foo'], { indices: Pathist.Indices.Preserve }));
});

test('startsWith with indices: Ignore - different indices match', (t) => {
	const p = new Pathist([0, 'foo', 1, 'bar']);
	t.true(p.startsWith([9, 'foo'], { indices: Pathist.Indices.Ignore }));
	t.true(p.startsWith([999], { indices: Pathist.Indices.Ignore }));
});

test('startsWith with indices: Ignore - string segments must match', (t) => {
	const p = new Pathist([0, 'foo', 1, 'bar']);
	t.false(p.startsWith([9, 'baz'], { indices: Pathist.Indices.Ignore }));
});

// EndsWith with Indices Options
test('endsWith with indices: Preserve - different indices do not match', (t) => {
	const p = new Pathist([0, 'foo', 1, 'bar']);
	t.false(p.endsWith([9, 'bar']));
	t.false(p.endsWith([9, 'bar'], { indices: Pathist.Indices.Preserve }));
});

test('endsWith with indices: Ignore - different indices match', (t) => {
	const p1 = new Pathist([0, 'foo', 1, 'bar']);
	t.true(p1.endsWith([9, 'bar'], { indices: Pathist.Indices.Ignore }));

	const p2 = new Pathist([0, 'foo', 1]);
	t.true(p2.endsWith([999], { indices: Pathist.Indices.Ignore }));
});

test('endsWith with indices: Ignore - string segments must match', (t) => {
	const p = new Pathist([0, 'foo', 1, 'bar']);
	t.false(p.endsWith([9, 'baz'], { indices: Pathist.Indices.Ignore }));
});

// Includes with Indices Options
test('includes with indices: Preserve - different indices do not match', (t) => {
	const p = new Pathist([0, 'foo', 1, 'bar', 2]);
	t.false(p.includes([9, 'bar']));
	t.false(p.includes([9, 'bar'], { indices: Pathist.Indices.Preserve }));
});

test('includes with indices: Ignore - different indices match', (t) => {
	const p = new Pathist([0, 'foo', 1, 'bar', 2]);
	t.true(p.includes([9, 'bar'], { indices: Pathist.Indices.Ignore }));
	t.true(p.includes([999], { indices: Pathist.Indices.Ignore }));
	t.true(p.includes([7, 'foo', 8], { indices: Pathist.Indices.Ignore }));
});

test('includes with indices: Ignore - string segments must match', (t) => {
	const p = new Pathist([0, 'foo', 1, 'bar']);
	t.false(p.includes([9, 'baz'], { indices: Pathist.Indices.Ignore }));
});

test('includes with indices: Ignore - finds subsequence anywhere', (t) => {
	const p = new Pathist([0, 'foo', 1, 'bar', 2, 'baz']);
	// Middle subsequence
	t.true(p.includes([999, 'bar', 888], { indices: Pathist.Indices.Ignore }));
	// Start subsequence
	t.true(p.includes([777, 'foo'], { indices: Pathist.Indices.Ignore }));
	// End subsequence
	t.true(p.includes([666, 'baz'], { indices: Pathist.Indices.Ignore }));
});
