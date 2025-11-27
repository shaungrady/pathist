import test from 'ava';
import { Pathist } from '../../src/pathist.js';

// toArray() Method
test('toArray returns correct array representation', (t) => {
	const p = Pathist.from('foo.bar');
	t.deepEqual(p.toArray(), ['foo', 'bar']);
});

test('toArray returns a new array (not internal reference)', (t) => {
	const p = Pathist.from('foo.bar');
	const arr1 = p.toArray();
	const arr2 = p.toArray();
	t.not(arr1, arr2);
});

test('modifying toArray result does not affect instance', (t) => {
	const p = Pathist.from('foo.bar');
	const arr = p.toArray();
	arr.push('baz');
	t.deepEqual(p.toArray(), ['foo', 'bar']);
});

// Parameterized toString() tests for Mixed Notation (Default)
const mixedNotationCases = [
	{
		input: [0, 'foo', 1],
		expected: '[0].foo[1]',
		desc: 'numbers and strings',
	},
	{
		input: ['foo', 'bar'],
		expected: 'foo.bar',
		desc: 'only strings',
	},
	{
		input: [0, 1, 2],
		expected: '[0][1][2]',
		desc: 'only numbers',
	},
	{
		input: [],
		expected: '',
		desc: 'empty path',
	},
];

for (const { input, expected, desc } of mixedNotationCases) {
	test(`toString with mixed notation - ${desc}`, (t) => {
		const p = Pathist.from(input);
		t.is(p.toString(), expected);
	});
}

// Parameterized toString() tests for Bracket Notation
const bracketNotationCases = [
	{
		input: [0, 'foo', 1],
		expected: '[0]["foo"][1]',
		desc: 'numbers and strings',
	},
	{
		input: ['foo', 'bar'],
		expected: '["foo"]["bar"]',
		desc: 'only strings',
	},
	{
		input: [0, 1, 2],
		expected: '[0][1][2]',
		desc: 'only numbers',
	},
	{
		input: [],
		expected: '',
		desc: 'empty path',
	},
];

for (const { input, expected, desc } of bracketNotationCases) {
	test(`toString with bracket notation - ${desc}`, (t) => {
		const p = Pathist.from(input);
		t.is(p.toString(Pathist.Notation.Bracket), expected);
	});
}

// Parameterized toString() tests for Dot Notation
const dotNotationCases = [
	{
		input: [0, 'foo', 1],
		expected: '0.foo.1',
		desc: 'numbers and strings',
	},
	{
		input: ['foo', 'bar'],
		expected: 'foo.bar',
		desc: 'only strings',
	},
	{
		input: [0],
		expected: '0',
		desc: 'single number',
	},
	{
		input: [],
		expected: '',
		desc: 'empty path',
	},
];

for (const { input, expected, desc } of dotNotationCases) {
	test(`toString with dot notation - ${desc}`, (t) => {
		const p = Pathist.from(input);
		t.is(p.toString(Pathist.Notation.Dot), expected);
	});
}

test('toString validates notation parameter', (t) => {
	const p = Pathist.from(['foo', 'bar']);
	const error = t.throws(
		() => {
			p.toString('invalid' as any);
		},
		{ instanceOf: TypeError },
	);
	t.regex(error.message, /invalid notation/i);
});

// Memoization
test('toString returns same string reference when called multiple times with same notation', (t) => {
	const p = Pathist.from([0, 'foo', 1]);
	const str1 = p.toString();
	const str2 = p.toString();
	t.is(str1, str2); // Same reference
});

test('toString memoizes different notations separately', (t) => {
	const p = Pathist.from([0, 'foo', 1]);
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
	const p = Pathist.from([0, 'foo', 1]);
	t.is(p.string, p.toString());
	t.is(p.string, '[0].foo[1]');
});

test('array getter returns same as toArray()', (t) => {
	const p = Pathist.from([0, 'foo', 1]);
	t.deepEqual(p.array, p.toArray());
	t.deepEqual(p.array, [0, 'foo', 1]);
});

test('string getter uses default notation', (t) => {
	Pathist.defaultNotation = Pathist.Notation.Bracket;
	const p = Pathist.from([0, 'foo', 1]);
	t.is(p.string, '[0]["foo"][1]');
	// Reset to Mixed for other tests
	Pathist.defaultNotation = Pathist.Notation.Mixed;
});

test('array getter returns a new array each time', (t) => {
	const p = Pathist.from([0, 'foo', 1]);
	const arr1 = p.array;
	const arr2 = p.array;
	t.not(arr1, arr2);
	t.deepEqual(arr1, arr2);
});

// Parameterized toJSONPath() tests
const jsonPathCases = [
	{
		input: '',
		expected: '$',
		desc: 'empty path returns root',
	},
	{
		input: 'users[0].name',
		expected: '$.users[0].name',
		desc: 'basic dot notation',
	},
	{
		input: 'data.results[5].items[2]',
		expected: '$.data.results[5].items[2]',
		desc: 'nested properties',
	},
	{
		input: 'items[-1].value',
		expected: '$.items[*].value',
		desc: '-1 wildcard to *',
	},
	{
		input: 'items[*].name',
		expected: '$.items[*].name',
		desc: '* wildcard to *',
	},
	{
		input: 'data[*].items[*]',
		expected: '$.data[*].items[*]',
		desc: 'multiple wildcards',
	},
	{
		input: 'data[-1].items[*].values',
		expected: '$.data[*].items[*].values',
		desc: 'mixed wildcards (-1 and *)',
	},
	{
		input: ['foo-bar'],
		expected: "$['foo-bar']",
		desc: 'property with hyphen',
	},
	{
		input: ['baz.qux'],
		expected: "$['baz.qux']",
		desc: 'property with dot',
	},
	{
		input: ['foo-bar', 'baz.qux'],
		expected: "$['foo-bar']['baz.qux']",
		desc: 'multiple special character properties',
	},
	{
		input: ["it's"],
		expected: "$['it\\'s']",
		desc: 'property containing single quote',
	},
	{
		input: ["it's what's"],
		expected: "$['it\\'s what\\'s']",
		desc: 'property containing multiple single quotes',
	},
	{
		input: ['my property'],
		expected: "$['my property']",
		desc: 'property containing spaces',
	},
	{
		input: ['prop[0]'],
		expected: "$['prop[0]']",
		desc: 'property containing brackets',
	},
	{
		input: [''],
		expected: "$['']",
		desc: 'empty string property',
	},
	{
		input: ['123abc'],
		expected: "$['123abc']",
		desc: 'property starting with number',
	},
	{
		input: '_private',
		expected: '$._private',
		desc: 'valid identifier using underscore',
	},
	{
		input: '$special',
		expected: '$.$special',
		desc: 'valid identifier using dollar sign',
	},
	{
		input: 'prop123',
		expected: '$.prop123',
		desc: 'valid identifier containing numbers',
	},
	{
		input: ['api', 'users', 0, 'profile-data', 'settings'],
		expected: "$.api.users[0]['profile-data'].settings",
		desc: 'complex mixed path',
	},
	{
		input: ['store', 'books', -1, 'author'],
		expected: '$.store.books[*].author',
		desc: 'array construction with wildcards',
	},
	{
		input: [0, 1, 2],
		expected: '$[0][1][2]',
		desc: 'only numeric indices',
	},
	{
		input: [-1, '*', -1],
		expected: '$[*][*][*]',
		desc: 'only wildcards',
	},
	{
		input: 'foo',
		expected: '$.foo',
		desc: 'single property',
	},
	{
		input: [0],
		expected: '$[0]',
		desc: 'single numeric index',
	},
	{
		input: ["a'b'c"],
		expected: "$['a\\'b\\'c']",
		desc: 'special characters requiring escaping',
	},
];

for (const { input, expected, desc } of jsonPathCases) {
	test(`toJSONPath: ${desc}`, (t) => {
		const p = Pathist.from(input);
		t.is(p.toJSONPath(), expected);
	});
}

test('jsonPath getter returns same as toJSONPath()', (t) => {
	const p = Pathist.from('foo.bar[0].baz');
	t.is(p.jsonPath, p.toJSONPath());
	t.is(p.jsonPath, '$.foo.bar[0].baz');
});

// Parameterized toJSONPointer() tests
const jsonPointerCases = [
	{
		input: '',
		expected: '',
		desc: 'empty path returns empty string',
	},
	{
		input: 'foo.bar.baz',
		expected: '/foo/bar/baz',
		desc: 'basic dot notation',
	},
	{
		input: 'users[0].name',
		expected: '/users/0/name',
		desc: 'path with array index',
	},
	{
		input: 'data.results[5].items[2]',
		expected: '/data/results/5/items/2',
		desc: 'nested properties with indices',
	},
	{
		input: ['foo~bar'],
		expected: '/foo~0bar',
		desc: 'tilde escaping',
	},
	{
		input: ['foo/bar'],
		expected: '/foo~1bar',
		desc: 'slash escaping',
	},
	{
		input: ['foo~bar', 'baz/qux'],
		expected: '/foo~0bar/baz~1qux',
		desc: 'multiple special characters',
	},
	{
		input: ['a/b~c/d~e'],
		expected: '/a~1b~0c~1d~0e',
		desc: 'mixed special characters in single segment',
	},
	{
		input: [''],
		expected: '/',
		desc: 'empty string property',
	},
	{
		input: ['', ''],
		expected: '//',
		desc: 'multiple empty string properties',
	},
	{
		input: ['my property'],
		expected: '/my property',
		desc: 'property with spaces',
	},
	{
		input: ['prop.with.dots'],
		expected: '/prop.with.dots',
		desc: 'property containing dots (no escaping needed)',
	},
	{
		input: ['prop[0]'],
		expected: '/prop[0]',
		desc: 'property containing brackets (no escaping needed)',
	},
	{
		input: [0, 1, 2],
		expected: '/0/1/2',
		desc: 'only numeric indices',
	},
	{
		input: ['foo', 0, 'bar', 1],
		expected: '/foo/0/bar/1',
		desc: 'mixed strings and numbers',
	},
	{
		input: 'foo',
		expected: '/foo',
		desc: 'single property',
	},
	{
		input: [0],
		expected: '/0',
		desc: 'single numeric index',
	},
	{
		input: ['items', -1, 'value'],
		expected: '/items/-1/value',
		desc: 'wildcard -1 as literal (no special handling)',
	},
	{
		input: ['items', '*', 'name'],
		expected: '/items/*/name',
		desc: 'wildcard * as literal (no special handling)',
	},
	{
		input: ['api', 'users', 0, 'profile-data', 'settings'],
		expected: '/api/users/0/profile-data/settings',
		desc: 'complex mixed path',
	},
	{
		input: ['~~/~'],
		expected: '/~0~0~1~0',
		desc: 'extreme escaping case',
	},
	{
		input: ['123abc'],
		expected: '/123abc',
		desc: 'property starting with number',
	},
	{
		input: '_private',
		expected: '/_private',
		desc: 'property with underscore',
	},
	{
		input: '$special',
		expected: '/$special',
		desc: 'property with dollar sign',
	},
];

for (const { input, expected, desc } of jsonPointerCases) {
	test(`toJSONPointer: ${desc}`, (t) => {
		const p = Pathist.from(input);
		t.is(p.toJSONPointer(), expected);
	});
}

test('jsonPointer getter returns same as toJSONPointer()', (t) => {
	const p = Pathist.from('foo.bar[0].baz');
	t.is(p.jsonPointer, p.toJSONPointer());
	t.is(p.jsonPointer, '/foo/bar/0/baz');
});

// Parameterized fromJSONPointer() tests
const fromJSONPointerCases = [
	{
		input: '',
		expected: [],
		desc: 'empty string returns root (empty path)',
	},
	{
		input: '/foo/bar/baz',
		expected: ['foo', 'bar', 'baz'],
		desc: 'basic path parsing',
	},
	{
		input: '/users/0/name',
		expected: ['users', 0, 'name'],
		desc: 'path with numeric index',
	},
	{
		input: '/data/results/5/items/2',
		expected: ['data', 'results', 5, 'items', 2],
		desc: 'nested properties with numeric indices',
	},
	{
		input: '/foo~0bar',
		expected: ['foo~bar'],
		desc: 'tilde unescaping',
	},
	{
		input: '/foo~1bar',
		expected: ['foo/bar'],
		desc: 'slash unescaping',
	},
	{
		input: '/foo~0bar/baz~1qux',
		expected: ['foo~bar', 'baz/qux'],
		desc: 'multiple special characters',
	},
	{
		input: '/a~1b~0c~1d~0e',
		expected: ['a/b~c/d~e'],
		desc: 'mixed special characters in single segment',
	},
	{
		input: '/',
		expected: [''],
		desc: 'single empty string property',
	},
	{
		input: '//',
		expected: ['', ''],
		desc: 'multiple empty string properties',
	},
	{
		input: '/my property',
		expected: ['my property'],
		desc: 'property with spaces',
	},
	{
		input: '/prop.with.dots',
		expected: ['prop.with.dots'],
		desc: 'property containing dots',
	},
	{
		input: '/prop[0]',
		expected: ['prop[0]'],
		desc: 'property containing brackets',
	},
	{
		input: '/0/1/2',
		expected: [0, 1, 2],
		desc: 'only numeric indices',
	},
	{
		input: '/foo/0/bar/1',
		expected: ['foo', 0, 'bar', 1],
		desc: 'mixed strings and numbers',
	},
	{
		input: '/foo',
		expected: ['foo'],
		desc: 'single property',
	},
	{
		input: '/0',
		expected: [0],
		desc: 'single numeric index',
	},
	{
		input: '/items/-1/value',
		expected: ['items', '-1', 'value'],
		desc: 'negative number as string (not valid array index)',
	},
	{
		input: '/items/*/name',
		expected: ['items', '*', 'name'],
		desc: 'asterisk as string property',
	},
	{
		input: '/api/users/0/profile-data/settings',
		expected: ['api', 'users', 0, 'profile-data', 'settings'],
		desc: 'complex mixed path',
	},
	{
		input: '/~0~0~1~0',
		expected: ['~~/~'],
		desc: 'extreme unescaping case',
	},
	{
		input: '/123abc',
		expected: ['123abc'],
		desc: 'property starting with number (not valid numeric index)',
	},
	{
		input: '/_private',
		expected: ['_private'],
		desc: 'property with underscore',
	},
	{
		input: '/$special',
		expected: ['$special'],
		desc: 'property with dollar sign',
	},
	{
		input: '/00',
		expected: ['00'],
		desc: 'leading zeros make it a string (not valid array index)',
	},
	{
		input: '/01',
		expected: ['01'],
		desc: 'zero-prefixed number as string',
	},
	{
		input: '/10',
		expected: [10],
		desc: 'valid numeric index without leading zeros',
	},
];

for (const { input, expected, desc } of fromJSONPointerCases) {
	test(`fromJSONPointer: ${desc}`, (t) => {
		const p = Pathist.fromJSONPointer(input);
		t.deepEqual(p.toArray(), expected);
	});
}

// Round-trip tests for toJSONPointer/fromJSONPointer
const roundTripCases = [
	{
		segments: ['foo', 'bar', 'baz'],
		desc: 'simple properties',
	},
	{
		segments: ['users', 0, 'name'],
		desc: 'with numeric indices',
	},
	{
		segments: ['foo~bar', 'baz/qux'],
		desc: 'special characters',
	},
	{
		segments: [''],
		desc: 'empty string property',
	},
	{
		segments: [],
		desc: 'empty path (root)',
	},
	{
		segments: [0, 1, 2],
		desc: 'only numbers',
	},
	{
		segments: ['a/b~c/d~e'],
		desc: 'mixed special chars',
	},
];

for (const { segments, desc } of roundTripCases) {
	test(`round-trip: ${desc}`, (t) => {
		const original = Pathist.from(segments);
		const pointer = original.toJSONPointer();
		const parsed = Pathist.fromJSONPointer(pointer);
		t.deepEqual(parsed.toArray(), original.toArray());
	});
}

// Error cases
test('fromJSONPointer throws on invalid format (no leading slash)', (t) => {
	const error = t.throws(
		() => {
			Pathist.fromJSONPointer('foo/bar');
		},
		{ instanceOf: Error },
	);
	t.regex(error.message, /must start with/i);
});

test('fromJSONPointer accepts config parameter', (t) => {
	const p = Pathist.fromJSONPointer('/foo/bar', {
		notation: Pathist.Notation.Bracket,
	});
	t.is(p.toString(), '["foo"]["bar"]');
});
