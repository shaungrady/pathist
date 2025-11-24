import test from 'ava';
import { Pathist } from '../../src/pathist.ts';

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
