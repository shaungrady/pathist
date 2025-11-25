import test from 'ava';
import { Pathist } from '../../src/pathist.ts';

// Pathist.from() tests
test('from() creates instance from string', (t) => {
	const p = Pathist.from('foo.bar.baz');
	t.deepEqual(p.toArray(), ['foo', 'bar', 'baz']);
});

test('from() creates instance from array', (t) => {
	const p = Pathist.from(['foo', 'bar', 'baz']);
	t.deepEqual(p.toArray(), ['foo', 'bar', 'baz']);
});

test('from() accepts config parameter', (t) => {
	const p = Pathist.from('foo.bar', { notation: Pathist.Notation.Bracket });
	t.is(p.toString(), '["foo"]["bar"]');
});

test('from() is equivalent to constructor', (t) => {
	const p1 = Pathist.from('foo.bar.baz');
	const p2 = new Pathist('foo.bar.baz');
	t.deepEqual(p1.toArray(), p2.toArray());
});

test('from() with empty string', (t) => {
	const p = Pathist.from('');
	t.deepEqual(p.toArray(), []);
});

test('from() with empty array', (t) => {
	const p = Pathist.from([]);
	t.deepEqual(p.toArray(), []);
});

test('from() with mixed notation', (t) => {
	const p = Pathist.from('[0].foo[1].bar');
	t.deepEqual(p.toArray(), [0, 'foo', 1, 'bar']);
});

test('from() propagates config through methods', (t) => {
	const p = Pathist.from('foo.bar', { notation: Pathist.Notation.Bracket });
	const sliced = p.slice(0, 1);
	t.is(sliced.toString(), '["foo"]');
});

// Real-world usage with from()
test('from() enables method chaining', (t) => {
	const path = Pathist.from('foo.bar.baz.bar.qux').pathToLast('bar').slice(0, 2);
	t.deepEqual(path.toArray(), ['foo', 'bar']);
});

test('from() works with all instance methods', (t) => {
	const p = Pathist.from('foo.bar.baz');

	// Test various instance methods work
	t.is(p.length, 3);
	t.deepEqual(p.toArray(), ['foo', 'bar', 'baz']);
	t.is(p.toString(), 'foo.bar.baz');
	t.true(p.startsWith('foo'));
	t.true(p.endsWith('baz'));
	t.true(p.includes('bar'));
});
