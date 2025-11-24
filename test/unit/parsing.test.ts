import test from 'ava';
import { Pathist } from '../../src/pathist.ts';

// String Parsing Tests
test('parses bracket notation with negative indices', (t) => {
	const p = new Pathist('foo[-1].bar');
	t.deepEqual(p.toArray(), ['foo', -1, 'bar']);
});

test('parses bracket notation with string wildcards', (t) => {
	const p = new Pathist('foo[*].bar');
	t.deepEqual(p.toArray(), ['foo', '*', 'bar']);
});

test('parses bracket notation with quoted strings', (t) => {
	const p = new Pathist('["foo"]["bar"]');
	t.deepEqual(p.toArray(), ['foo', 'bar']);
});

test('parses bracket notation with single-quoted strings', (t) => {
	const p = new Pathist("[\'foo\'][\'bar\']");
	t.deepEqual(p.toArray(), ['foo', 'bar']);
});

test('parses bracket notation with unquoted strings', (t) => {
	const p = new Pathist('[foo][bar]');
	t.deepEqual(p.toArray(), ['foo', 'bar']);
});

test('round-trip: bracket notation strings simplify to dot notation', (t) => {
	const input = '["foo"]["bar"]';
	const p = new Pathist(input);
	t.is(p.toString(), 'foo.bar');
});

test('round-trip: parse and render negative index', (t) => {
	const input = 'foo[-1].bar';
	const p = new Pathist(input);
	t.is(p.toString(), input);
});

test('round-trip: parse and render string wildcard', (t) => {
	const input = 'foo[*].bar';
	const p = new Pathist(input);
	t.is(p.toString(), input);
});

// Quote Validation
test('rejects mismatched quotes - single to double', (t) => {
	t.throws(
		() => new Pathist("foo[\'bar\"]"),
		{ message: /mismatched quotes/i },
	);
});

test('rejects mismatched quotes - double to single', (t) => {
	t.throws(
		() => new Pathist('foo["bar\']'),
		{ message: /mismatched quotes/i },
	);
});

test('rejects opening quote without closing', (t) => {
	t.throws(
		() => new Pathist('foo["bar]'),
		{ message: /mismatched quotes/i },
	);
	t.throws(
		() => new Pathist("foo[\'bar]"),
		{ message: /mismatched quotes/i },
	);
});

test('rejects closing quote without opening', (t) => {
	t.throws(
		() => new Pathist('foo[bar"]'),
		{ message: /mismatched quotes/i },
	);
	t.throws(
		() => new Pathist("foo[bar\']"),
		{ message: /mismatched quotes/i },
	);
});

// Round-trip Tests for Special Characters
test('round-trip: property with dot', (t) => {
	const p1 = new Pathist(['foo.bar', 'baz']);
	const str = p1.toString();
	const p2 = new Pathist(str);
	t.deepEqual(p2.toArray(), ['foo.bar', 'baz']);
	t.is(str, '["foo.bar"].baz');
});

test('round-trip: property with brackets', (t) => {
	const p1 = new Pathist(['foo[0]', 'baz']);
	const str = p1.toString();
	const p2 = new Pathist(str);
	t.deepEqual(p2.toArray(), ['foo[0]', 'baz']);
	t.is(str, '["foo[0]"].baz');
});

test('round-trip: property with spaces', (t) => {
	const p1 = new Pathist(['foo bar', 'baz']);
	const str = p1.toString();
	const p2 = new Pathist(str);
	t.deepEqual(p2.toArray(), ['foo bar', 'baz']);
	t.is(str, '["foo bar"].baz');
});

test('round-trip: empty string property', (t) => {
	const p1 = new Pathist(['', 'baz']);
	const str = p1.toString();
	const p2 = new Pathist(str);
	t.deepEqual(p2.toArray(), ['', 'baz']);
	t.is(str, '[""].baz');
});

test('round-trip: numeric string property', (t) => {
	const p1 = new Pathist(['123', 'baz']);
	const str = p1.toString();
	const p2 = new Pathist(str);
	t.deepEqual(p2.toArray(), ['123', 'baz']);
	// Numeric strings don't need brackets in mixed notation
	t.is(str, '123.baz');
});
