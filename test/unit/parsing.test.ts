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

// Parameterized Quote Validation Tests
const mismatchedQuoteCases = [
	{ input: "foo[\'bar\"]", desc: 'single to double' },
	{ input: 'foo["bar\']', desc: 'double to single' },
	{ input: 'foo["bar]', desc: 'opening double quote without closing' },
	{ input: "foo[\'bar]", desc: 'opening single quote without closing' },
	{ input: 'foo[bar"]', desc: 'closing double quote without opening' },
	{ input: "foo[bar\']", desc: 'closing single quote without opening' },
];

for (const { input, desc } of mismatchedQuoteCases) {
	test(`rejects mismatched quotes: ${desc}`, (t) => {
		t.throws(
			() => new Pathist(input),
			{ message: /mismatched quotes/i },
		);
	});
}

// Parameterized Round-trip Tests for Special Characters
const roundTripCases = [
	{
		array: ['foo.bar', 'baz'],
		expected: '["foo.bar"].baz',
		desc: 'property with dot',
	},
	{
		array: ['foo[0]', 'baz'],
		expected: '["foo[0]"].baz',
		desc: 'property with brackets',
	},
	{
		array: ['foo bar', 'baz'],
		expected: '["foo bar"].baz',
		desc: 'property with spaces',
	},
	{
		array: ['', 'baz'],
		expected: '[""].baz',
		desc: 'empty string property',
	},
	{
		array: ['123', 'baz'],
		expected: '123.baz',
		desc: 'numeric string property',
	},
	{
		array: ['foo', 'bar.baz', 'qux'],
		expected: 'foo["bar.baz"].qux',
		desc: 'dot in middle segment',
	},
	{
		array: ['a[b]', 'c[d]', 'e'],
		expected: '["a[b]"]["c[d]"].e',
		desc: 'multiple segments with brackets',
	},
	{
		array: ['', '', ''],
		expected: '[""][""][""]',
		desc: 'multiple empty strings',
	},
	{
		array: [' ', '  ', 'foo'],
		expected: '[" "]["  "].foo',
		desc: 'whitespace-only segments',
	},
];

for (const { array, expected, desc } of roundTripCases) {
	test(`round-trip: ${desc}`, (t) => {
		const p1 = new Pathist(array);
		const str = p1.toString();
		const p2 = new Pathist(str);

		t.is(str, expected, 'serialization matches expected format');
		t.deepEqual(p2.toArray(), array, 'round-trip preserves segments');
	});
}

// Parameterized Parsing Tests
const parsingCases = [
	{
		input: 'foo["bar"]["baz"]',
		expected: ['foo', 'bar', 'baz'],
		desc: 'mixed dot and bracket with quotes',
	},
	{
		input: '["a"]["b"]["c"]',
		expected: ['a', 'b', 'c'],
		desc: 'all bracket notation with quotes',
	},
	{
		input: '[0][1][2]',
		expected: [0, 1, 2],
		desc: 'numeric bracket notation',
	},
	{
		input: 'a[0].b[1].c',
		expected: ['a', 0, 'b', 1, 'c'],
		desc: 'alternating dot and numeric bracket',
	},
	{
		input: '["a.b"]["c[d]"]',
		expected: ['a.b', 'c[d]'],
		desc: 'special chars inside quoted brackets',
	},
	{
		input: '[" "][" "]',
		expected: [' ', ' '],
		desc: 'space-only segments',
	},
	{
		input: '[""][""]',
		expected: ['', ''],
		desc: 'empty quoted segments',
	},
];

for (const { input, expected, desc } of parsingCases) {
	test(`parses: ${desc}`, (t) => {
		const p = new Pathist(input);
		t.deepEqual(p.toArray(), expected);
	});
}
