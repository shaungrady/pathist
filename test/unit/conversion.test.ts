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

// toJSONPath() Method
test('toJSONPath with empty path returns root', (t) => {
	const p = new Pathist('');
	t.is(p.toJSONPath(), '$');
});

test('toJSONPath with basic dot notation', (t) => {
	const p = new Pathist('users[0].name');
	t.is(p.toJSONPath(), '$.users[0].name');
});

test('toJSONPath with nested properties', (t) => {
	const p = new Pathist('data.results[5].items[2]');
	t.is(p.toJSONPath(), '$.data.results[5].items[2]');
});

test('toJSONPath converts -1 wildcard to *', (t) => {
	const p = new Pathist('items[-1].value');
	t.is(p.toJSONPath(), '$.items[*].value');
});

test('toJSONPath converts * wildcard to *', (t) => {
	const p = new Pathist('items[*].name');
	t.is(p.toJSONPath(), '$.items[*].name');
});

test('toJSONPath with multiple wildcards', (t) => {
	const p = new Pathist('data[*].items[*]');
	t.is(p.toJSONPath(), '$.data[*].items[*]');
});

test('toJSONPath with mixed wildcards (-1 and *)', (t) => {
	const p = new Pathist('data[-1].items[*].values');
	t.is(p.toJSONPath(), '$.data[*].items[*].values');
});

test('toJSONPath with properties requiring bracket notation - hyphen', (t) => {
	const p = new Pathist(['foo-bar']);
	t.is(p.toJSONPath(), "$['foo-bar']");
});

test('toJSONPath with properties requiring bracket notation - dot', (t) => {
	const p = new Pathist(['baz.qux']);
	t.is(p.toJSONPath(), "$['baz.qux']");
});

test('toJSONPath with multiple special character properties', (t) => {
	const p = new Pathist(['foo-bar', 'baz.qux']);
	t.is(p.toJSONPath(), "$['foo-bar']['baz.qux']");
});

test('toJSONPath with property containing single quote', (t) => {
	const p = new Pathist(["it's"]);
	t.is(p.toJSONPath(), "$['it\\'s']");
});

test('toJSONPath with property containing multiple single quotes', (t) => {
	const p = new Pathist(["it's what's"]);
	t.is(p.toJSONPath(), "$['it\\'s what\\'s']");
});

test('toJSONPath with property containing spaces', (t) => {
	const p = new Pathist(['my property']);
	t.is(p.toJSONPath(), "$['my property']");
});

test('toJSONPath with property containing brackets', (t) => {
	const p = new Pathist(['prop[0]']);
	t.is(p.toJSONPath(), "$['prop[0]']");
});

test('toJSONPath with empty string property', (t) => {
	const p = new Pathist(['']);
	t.is(p.toJSONPath(), "$['']");
});

test('toJSONPath with property starting with number', (t) => {
	const p = new Pathist(['123abc']);
	t.is(p.toJSONPath(), "$['123abc']");
});

test('toJSONPath with valid identifier using underscore', (t) => {
	const p = new Pathist('_private');
	t.is(p.toJSONPath(), '$._private');
});

test('toJSONPath with valid identifier using dollar sign', (t) => {
	const p = new Pathist('$special');
	t.is(p.toJSONPath(), '$.$special');
});

test('toJSONPath with valid identifier containing numbers', (t) => {
	const p = new Pathist('prop123');
	t.is(p.toJSONPath(), '$.prop123');
});

test('toJSONPath with complex mixed path', (t) => {
	const p = new Pathist(['api', 'users', 0, 'profile-data', 'settings']);
	t.is(p.toJSONPath(), "$.api.users[0]['profile-data'].settings");
});

test('toJSONPath with array construction and wildcards', (t) => {
	const p = new Pathist(['store', 'books', -1, 'author']);
	t.is(p.toJSONPath(), '$.store.books[*].author');
});

test('toJSONPath with only numeric indices', (t) => {
	const p = new Pathist([0, 1, 2]);
	t.is(p.toJSONPath(), '$[0][1][2]');
});

test('toJSONPath with only wildcards', (t) => {
	const p = new Pathist([-1, '*', -1]);
	t.is(p.toJSONPath(), '$[*][*][*]');
});

test('toJSONPath with single property', (t) => {
	const p = new Pathist('foo');
	t.is(p.toJSONPath(), '$.foo');
});

test('toJSONPath with single numeric index', (t) => {
	const p = new Pathist([0]);
	t.is(p.toJSONPath(), '$[0]');
});

test('toJSONPath with special characters requiring escaping', (t) => {
	const p = new Pathist(["a'b'c"]);
	t.is(p.toJSONPath(), "$['a\\'b\\'c']");
});
