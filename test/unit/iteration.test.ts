import test from 'ava';
import { Pathist } from '../../src/pathist.ts';

// Iterator
test('can iterate over segments with for...of', (t) => {
	const p = Pathist.from([0, 'foo', 1]);
	const segments = [];
	for (const segment of p) {
		segments.push(segment);
	}
	t.deepEqual(segments, [0, 'foo', 1]);
});

test('can spread instance into array', (t) => {
	const p = Pathist.from(['foo', 'bar', 'baz']);
	t.deepEqual([...p], ['foo', 'bar', 'baz']);
});

test('can use Array.from on instance', (t) => {
	const p = Pathist.from([0, 'children', 2]);
	t.deepEqual(Array.from(p), [0, 'children', 2]);
});

test('empty path iteration works', (t) => {
	const p = Pathist.from([]);
	const segments = [];
	for (const segment of p) {
		segments.push(segment);
	}
	t.deepEqual(segments, []);
});

test('iterator returns correct values in order', (t) => {
	const p = Pathist.from([0, 'a', 1, 'b', 2]);
	const iterator = p[Symbol.iterator]();
	t.deepEqual(iterator.next(), { value: 0, done: false });
	t.deepEqual(iterator.next(), { value: 'a', done: false });
	t.deepEqual(iterator.next(), { value: 1, done: false });
	t.deepEqual(iterator.next(), { value: 'b', done: false });
	t.deepEqual(iterator.next(), { value: 2, done: false });
	t.deepEqual(iterator.next(), { value: undefined, done: true });
});
