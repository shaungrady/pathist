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

// setDefaultNotation() Class Method
test('default notation is Mixed', (t) => {
	const p = new Pathist([0, 'foo', 1]);
	t.is(p.toString(), '[0].foo[1]');
});

test('setDefaultNotation changes default to Bracket', (t) => {
	Pathist.setDefaultNotation(Pathist.Notation.Bracket);
	const p = new Pathist([0, 'foo', 1]);
	t.is(p.toString(), '[0]["foo"][1]');
	// Reset to Mixed for other tests
	Pathist.setDefaultNotation(Pathist.Notation.Mixed);
});

test('setDefaultNotation changes default to Dot', (t) => {
	Pathist.setDefaultNotation(Pathist.Notation.Dot);
	const p = new Pathist([0, 'foo', 1]);
	t.is(p.toString(), '0.foo.1');
	// Reset to Mixed for other tests
	Pathist.setDefaultNotation(Pathist.Notation.Mixed);
});

test('per-call override works regardless of default', (t) => {
	Pathist.setDefaultNotation(Pathist.Notation.Bracket);
	const p = new Pathist([0, 'foo', 1]);
	t.is(p.toString(Pathist.Notation.Mixed), '[0].foo[1]');
	// Reset to Mixed for other tests
	Pathist.setDefaultNotation(Pathist.Notation.Mixed);
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
