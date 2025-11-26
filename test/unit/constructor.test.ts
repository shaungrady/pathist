import test from 'ava';
import { Pathist } from '../../src/pathist.ts';

// Constructor - String Input
test('parses dot notation string', (t) => {
	const p = Pathist.from('foo.bar.baz');
	t.deepEqual(p.toArray(), ['foo', 'bar', 'baz']);
});

test('parses bracket notation with numeric indices', (t) => {
	const p = Pathist.from('[0][1][2]');
	t.deepEqual(p.toArray(), [0, 1, 2]);
});

test('parses mixed notation string', (t) => {
	const p = Pathist.from('[0].children[2].some.path');
	t.deepEqual(p.toArray(), [0, 'children', 2, 'some', 'path']);
});

test('parses empty string', (t) => {
	const p = Pathist.from('');
	t.deepEqual(p.toArray(), []);
});

test('parses single segment string', (t) => {
	const p = Pathist.from('foo');
	t.deepEqual(p.toArray(), ['foo']);
});

test('parses single bracket segment', (t) => {
	const p = Pathist.from('[0]');
	t.deepEqual(p.toArray(), [0]);
});

// Constructor - Array Input
test('accepts array with mixed types', (t) => {
	const p = Pathist.from([0, 'children', 2, 'some', 'path']);
	t.deepEqual(p.toArray(), [0, 'children', 2, 'some', 'path']);
});

test('accepts empty array', (t) => {
	const p = Pathist.from([]);
	t.deepEqual(p.toArray(), []);
});

test('rejects array containing symbols', (t) => {
	const sym = Symbol('test');
	t.throws(() => Pathist.from([0, sym] as any), {
		message: /symbol/i,
	});
});

test('rejects array containing objects', (t) => {
	t.throws(() => Pathist.from([0, {}] as any), {
		message: /string or number/i,
	});
});

test('rejects array containing null', (t) => {
	t.throws(() => Pathist.from([0, null] as any), {
		message: /string or number/i,
	});
});

test('rejects array containing undefined', (t) => {
	t.throws(() => Pathist.from([0, undefined] as any), {
		message: /string or number/i,
	});
});

// Immutability
test('modifying input array after construction does not affect instance', (t) => {
	const input = [0, 'foo', 1];
	const p = Pathist.from(input);
	input.push('bar');
	t.deepEqual(p.toArray(), [0, 'foo', 1]);
});

// Length Property
test('length property returns correct number of segments', (t) => {
	const p = Pathist.from([0, 'foo', 1]);
	t.is(p.length, 3);
});

test('empty path has length 0', (t) => {
	const p = Pathist.from([]);
	t.is(p.length, 0);
});

test('single segment has length 1', (t) => {
	const p1 = Pathist.from(['foo']);
	const p2 = Pathist.from([0]);
	t.is(p1.length, 1);
	t.is(p2.length, 1);
});

test('length is consistent with toArray().length', (t) => {
	const p = Pathist.from([0, 'children', 2, 'some', 'path']);
	t.is(p.length, p.toArray().length);
	t.is(p.length, 5);
});
