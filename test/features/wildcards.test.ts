import test from 'ava';
import { Pathist } from '../../src/pathist.ts';

// Index Wildcards Configuration
test.serial('indexWildcards default is Set([-1, "*"])', (t) => {
	// Reset to default first
	Pathist.indexWildcards = [-1, '*'];
	t.deepEqual(Array.from(Pathist.indexWildcards).sort(), [-1, '*'].sort());
});

test.serial('indexWildcards can be set with an array', (t) => {
	Pathist.indexWildcards = [-2, '**'];
	t.deepEqual(Array.from(Pathist.indexWildcards).sort(), [-2, '**'].sort());
	// Reset to default
	Pathist.indexWildcards = [-1, '*'];
});

test.serial('indexWildcards can be set with a Set', (t) => {
	Pathist.indexWildcards = new Set([NaN, 'wild']);
	t.deepEqual(
		Array.from(Pathist.indexWildcards).filter((x) => typeof x === 'string'),
		['wild']
	);
	// NaN requires special handling
	t.true(Array.from(Pathist.indexWildcards).some((x) => Number.isNaN(x)));
	// Reset to default
	Pathist.indexWildcards = [-1, '*'];
});

test.serial('indexWildcards can be set with a single value', (t) => {
	Pathist.indexWildcards = -5;
	t.deepEqual(Array.from(Pathist.indexWildcards), [-5]);
	// Reset to default
	Pathist.indexWildcards = [-1, '*'];
});

test.serial('indexWildcards can be unset with empty values', (t) => {
	// Empty string
	Pathist.indexWildcards = '';
	t.deepEqual(Array.from(Pathist.indexWildcards), []);

	// Empty array
	Pathist.indexWildcards = [];
	t.deepEqual(Array.from(Pathist.indexWildcards), []);

	// Empty Set
	Pathist.indexWildcards = new Set();
	t.deepEqual(Array.from(Pathist.indexWildcards), []);

	// Reset to default
	Pathist.indexWildcards = [-1, '*'];
});

test.serial('indexWildcards accepts negative numbers', (t) => {
	Pathist.indexWildcards = [-1, -2, -999];
	t.deepEqual(
		Array.from(Pathist.indexWildcards).sort((a, b) => (a as number) - (b as number)),
		[-999, -2, -1]
	);
	// Reset to default
	Pathist.indexWildcards = [-1, '*'];
});

test.serial('indexWildcards accepts non-finite numbers', (t) => {
	Pathist.indexWildcards = [Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY, NaN];
	const wildcards = Array.from(Pathist.indexWildcards);
	t.true(wildcards.includes(Number.POSITIVE_INFINITY));
	t.true(wildcards.includes(Number.NEGATIVE_INFINITY));
	t.true(wildcards.some((x) => Number.isNaN(x)));
	// Reset to default
	Pathist.indexWildcards = [-1, '*'];
});

test.serial('indexWildcards accepts non-numeric strings', (t) => {
	Pathist.indexWildcards = ['*', '**', 'wild', 'any'];
	t.deepEqual(Array.from(Pathist.indexWildcards).sort(), ['*', '**', 'any', 'wild']);
	// Reset to default
	Pathist.indexWildcards = [-1, '*'];
});

test.serial('indexWildcards rejects non-negative finite numbers', (t) => {
	t.throws(
		() => {
			Pathist.indexWildcards = [0];
		},
		{ message: /negative or non-finite/ }
	);
	t.throws(
		() => {
			Pathist.indexWildcards = [5];
		},
		{ message: /negative or non-finite/ }
	);
	// Reset to default
	Pathist.indexWildcards = [-1, '*'];
});

test.serial('indexWildcards rejects numeric strings', (t) => {
	t.throws(
		() => {
			Pathist.indexWildcards = ['0'];
		},
		{ message: /cannot be numeric strings/ }
	);
	t.throws(
		() => {
			Pathist.indexWildcards = ['123'];
		},
		{ message: /cannot be numeric strings/ }
	);
	t.throws(
		() => {
			Pathist.indexWildcards = ['01'];
		},
		{ message: /cannot be numeric strings/ }
	);
	// Reset to default
	Pathist.indexWildcards = [-1, '*'];
});

test.serial('indexWildcards accepts alphanumeric strings', (t) => {
	Pathist.indexWildcards = ['1a', 'a1', '0x'];
	t.deepEqual(Array.from(Pathist.indexWildcards).sort(), ['0x', '1a', 'a1']);
	// Reset to default
	Pathist.indexWildcards = [-1, '*'];
});

test.serial('indexWildcards rejects invalid types', (t) => {
	t.throws(
		() => {
			Pathist.indexWildcards = null as any;
		},
		{ message: /must be a Set, Array, string, or number/ }
	);
	t.throws(
		() => {
			Pathist.indexWildcards = undefined as any;
		},
		{ message: /must be a Set, Array, string, or number/ }
	);
	t.throws(
		() => {
			Pathist.indexWildcards = {} as any;
		},
		{ message: /must be a Set, Array, string, or number/ }
	);
	// Reset to default
	Pathist.indexWildcards = [-1, '*'];
});

test.serial('indexWildcards validates values in collections', (t) => {
	// Arrays with non-negative numbers
	t.throws(
		() => {
			Pathist.indexWildcards = [0, '*'];
		},
		{ message: /negative or non-finite/ }
	);

	// Arrays with numeric strings
	t.throws(
		() => {
			Pathist.indexWildcards = [-1, '123'];
		},
		{ message: /cannot be numeric strings/ }
	);

	// Sets with non-negative numbers
	t.throws(
		() => {
			Pathist.indexWildcards = new Set([42]);
		},
		{ message: /negative or non-finite/ }
	);

	// Sets with numeric strings
	t.throws(
		() => {
			Pathist.indexWildcards = new Set(['*', '0']);
		},
		{ message: /cannot be numeric strings/ }
	);

	// Reset to default
	Pathist.indexWildcards = [-1, '*'];
});

// Wildcard Rendering in toString
test.serial('toString renders numeric wildcards without quotes in mixed notation', (t) => {
	Pathist.indexWildcards = [-1, '*'];
	const p = new Pathist(['foo', -1, 'bar']);
	t.is(p.toString(), 'foo[-1].bar');
});

test.serial('toString renders string wildcards without quotes in mixed notation', (t) => {
	Pathist.indexWildcards = [-1, '*'];
	const p = new Pathist(['foo', '*', 'bar']);
	t.is(p.toString(), 'foo[*].bar');
});

test.serial('toString renders numeric wildcards without quotes in bracket notation', (t) => {
	Pathist.indexWildcards = [-1, '*'];
	const p = new Pathist(['foo', -1, 'bar']);
	t.is(p.toString(Pathist.Notation.Bracket), '["foo"][-1]["bar"]');
});

test.serial('toString renders string wildcards without quotes in bracket notation', (t) => {
	Pathist.indexWildcards = [-1, '*'];
	const p = new Pathist(['foo', '*', 'bar']);
	t.is(p.toString(Pathist.Notation.Bracket), '["foo"][*]["bar"]');
});

test.serial('toString renders wildcards in dot notation', (t) => {
	Pathist.indexWildcards = [-1, '*'];
	const p = new Pathist(['foo', -1, '*', 'bar']);
	t.is(p.toString(Pathist.Notation.Dot), 'foo.-1.*.bar');
});

test.serial('toString renders multiple wildcards correctly', (t) => {
	Pathist.indexWildcards = [-1, '*', '**'];
	const p = new Pathist([0, '*', -1, 'foo', '**']);
	t.is(p.toString(), '[0][*][-1].foo[**]');
	// Reset to default
	Pathist.indexWildcards = [-1, '*'];
});

test.serial('toString renders non-wildcard strings with quotes in bracket notation', (t) => {
	Pathist.indexWildcards = [-1, '*'];
	const p = new Pathist(['foo', 'bar']);
	t.is(p.toString(Pathist.Notation.Bracket), '["foo"]["bar"]');
});

test.serial('toString renders non-finite number wildcards correctly', (t) => {
	// Infinity
	Pathist.indexWildcards = [Number.POSITIVE_INFINITY];
	const p1 = new Pathist(['foo', Number.POSITIVE_INFINITY, 'bar']);
	t.is(p1.toString(), 'foo[Infinity].bar');

	// NaN
	Pathist.indexWildcards = [NaN];
	const p2 = new Pathist(['foo', NaN, 'bar']);
	t.is(p2.toString(), 'foo[NaN].bar');

	// Reset to default
	Pathist.indexWildcards = [-1, '*'];
});

// Wildcard Matching in Comparison Methods
test.serial('equals matches wildcard with numbers', (t) => {
	Pathist.indexWildcards = [-1, '*'];
	const p1 = new Pathist(['foo', -1, 'bar']);
	const p2 = new Pathist(['foo', 0, 'bar']);
	const p3 = new Pathist(['foo', 999, 'bar']);

	// Wildcard matches numbers
	t.true(p1.equals(p2));
	t.true(p1.equals(p3));
	t.true(p2.equals(p1));

	// Wildcard does NOT match strings
	t.false(p1.equals(['foo', 'any', 'bar']));
	t.false(p1.equals(['foo', 'baz', 'bar']));
});

test.serial('equals matches string wildcard with numbers and wildcards', (t) => {
	Pathist.indexWildcards = [-1, '*'];
	const p1 = new Pathist(['foo', '*', 'bar']);

	// String wildcard matches numbers
	t.true(p1.equals(['foo', 0, 'bar']));
	t.true(p1.equals(['foo', 999, 'bar']));

	// String wildcard matches other wildcards
	t.true(p1.equals(['foo', -1, 'bar']));

	// String wildcard does NOT match regular strings
	t.false(p1.equals(['foo', 'anything', 'bar']));
	t.false(p1.equals(['foo', 'baz', 'bar']));
});

test.serial('equals with wildcards still checks non-wildcard segments', (t) => {
	Pathist.indexWildcards = [-1, '*'];
	const p1 = new Pathist(['foo', -1, 'bar']);
	const p2 = new Pathist(['foo', 0, 'baz']);
	const p3 = new Pathist(['qux', 0, 'bar']);
	t.false(p1.equals(p2));
	t.false(p1.equals(p3));
});

test.serial('equals with wildcards on both sides matches', (t) => {
	Pathist.indexWildcards = [-1, '*'];
	const p1 = new Pathist(['foo', -1, 'bar']);
	const p2 = new Pathist(['foo', '*', 'bar']);
	t.true(p1.equals(p2));
});

test.serial('startsWith matches wildcard at any position', (t) => {
	Pathist.indexWildcards = [-1, '*'];
	const p = new Pathist(['foo', 0, 'bar', 1]);
	t.true(p.startsWith(['foo', -1]));
	t.true(p.startsWith(['foo', '*', 'bar']));
});

test.serial('endsWith matches wildcard at any position', (t) => {
	Pathist.indexWildcards = [-1, '*'];
	const p = new Pathist(['foo', 0, 'bar', 1]);

	// Wildcard at end
	t.true(p.endsWith(['bar', -1]));
	t.true(p.endsWith(['bar', '*']));

	// Wildcard in middle
	t.true(p.endsWith([-1, 'bar', 1]));
	t.true(p.endsWith(['*', 'bar', 1]));

	// Multiple wildcards
	t.true(p.endsWith([-1, 'bar', '*']));
	t.true(p.endsWith(['foo', -1, 'bar', '*']));
});

test.serial('includes matches wildcard at any position', (t) => {
	Pathist.indexWildcards = [-1, '*'];
	const p = new Pathist(['foo', 0, 'bar', 1, 'baz']);
	t.true(p.includes([-1, 'bar']));
	t.true(p.includes(['bar', '*']));
	t.true(p.includes(['foo', -1, 'bar', '*', 'baz']));
});

test.serial('wildcards work with indices: Ignore option', (t) => {
	Pathist.indexWildcards = [-1, '*'];
	const p1 = new Pathist(['foo', 5, 'bar', 10]);
	const p2 = new Pathist(['foo', -1, 'bar', '*']);

	// With wildcards AND indices ignore, should match
	t.true(p1.equals(p2, { indices: Pathist.Indices.Ignore }));

	// Wildcards match numbers
	t.true(p1.startsWith(['foo', '*'], { indices: Pathist.Indices.Ignore }));
	t.true(p1.startsWith(['foo', -1], { indices: Pathist.Indices.Ignore }));
	t.true(p1.endsWith(['bar', '*'], { indices: Pathist.Indices.Ignore }));

	// Both wildcards and indices:Ignore work together
	const p3 = new Pathist([0, 'x', 1]);
	t.true(p3.startsWith([-1, 'x'], { indices: Pathist.Indices.Ignore }));
	t.true(p3.endsWith(['x', '*'], { indices: Pathist.Indices.Ignore }));
});

test.serial('wildcards disabled when set is empty', (t) => {
	Pathist.indexWildcards = [];
	const p1 = new Pathist(['foo', -1, 'bar']);
	const p2 = new Pathist(['foo', 0, 'bar']);
	const p3 = new Pathist(['foo', -1, 'bar']);
	// -1 should not be wildcard anymore
	t.false(p1.equals(p2));
	t.true(p1.equals(p3));
	// Reset to default
	Pathist.indexWildcards = [-1, '*'];
});

// IndexOf with Wildcards
test.serial('indexOf matches wildcard with numbers', (t) => {
	Pathist.indexWildcards = [-1, '*'];
	const p = new Pathist(['foo', 0, 'bar', 1, 'baz']);

	// Wildcard matches numbers
	t.is(p.indexOf(['foo', -1]), 0);
	t.is(p.indexOf(['foo', '*']), 0);
	t.is(p.indexOf([0, 'bar']), 1);
	t.is(p.indexOf([-1, 'bar']), 1);
	t.is(p.indexOf(['*', 'bar']), 1);

	// Wildcard does NOT match strings
	t.is(p.indexOf([-1, 'foo']), -1);
	t.is(p.indexOf(['*', 'foo']), -1);
});

test.serial('indexOf matches string wildcard with numbers and wildcards', (t) => {
	Pathist.indexWildcards = [-1, '*'];
	const p = new Pathist(['foo', 0, 'bar', 1, 'baz']);

	// String wildcard matches numbers
	t.is(p.indexOf(['*', 'bar']), 1);
	t.is(p.indexOf(['foo', '*', 'bar']), 0);

	// String wildcard matches other wildcards
	t.is(p.indexOf(['foo', -1, 'bar']), 0);

	// String wildcard does NOT match regular strings
	t.is(p.indexOf(['*', 'nonexistent']), -1);
});

test.serial('indexOf with wildcards checks non-wildcard segments', (t) => {
	Pathist.indexWildcards = [-1, '*'];
	const p = new Pathist(['foo', 0, 'bar', 1, 'baz']);

	// Correct non-wildcard segments
	t.is(p.indexOf(['foo', -1, 'bar']), 0);

	// Wrong non-wildcard segments
	t.is(p.indexOf(['foo', -1, 'wrong']), -1);
	t.is(p.indexOf(['wrong', -1, 'bar']), -1);
});

test.serial('indexOf with wildcards on both sides matches', (t) => {
	Pathist.indexWildcards = [-1, '*'];
	const p = new Pathist(['foo', -1, 'bar', '*', 'baz']);
	t.is(p.indexOf(['foo', -1]), 0);
	t.is(p.indexOf(['foo', '*']), 0);
	t.is(p.indexOf([0, 'bar']), 1);
	t.is(p.indexOf([99, 'bar']), 1);
});

test.serial('indexOf finds first match with wildcards', (t) => {
	Pathist.indexWildcards = [-1, '*'];
	const p = new Pathist(['foo', 0, 'bar', 1, 'bar', 2, 'bar']);

	// First occurrence of wildcard + 'bar'
	t.is(p.indexOf([-1, 'bar']), 1);
	t.is(p.indexOf(['*', 'bar']), 1);
});

test.serial('indexOf with wildcards works with indices: Ignore option', (t) => {
	Pathist.indexWildcards = [-1, '*'];
	const p = new Pathist(['foo', 5, 'bar', 10, 'baz']);

	// With wildcards AND indices ignore, should match
	t.is(p.indexOf([-1, 'bar'], { indices: Pathist.Indices.Ignore }), 1);
	t.is(p.indexOf(['*', 'bar'], { indices: Pathist.Indices.Ignore }), 1);

	// Wildcards match numbers
	t.is(p.indexOf(['foo', '*'], { indices: Pathist.Indices.Ignore }), 0);
	t.is(p.indexOf(['foo', -1], { indices: Pathist.Indices.Ignore }), 0);
});

test.serial('indexOf wildcards disabled returns -1 when not matching exactly', (t) => {
	Pathist.indexWildcards = [];
	const p = new Pathist(['foo', -1, 'bar']);

	// -1 should not be wildcard anymore
	t.is(p.indexOf(['foo', 0, 'bar']), -1);
	t.is(p.indexOf(['foo', -1, 'bar']), 0);

	// Reset to default
	Pathist.indexWildcards = [-1, '*'];
});

// LastIndexOf with Wildcards
test.serial('lastIndexOf matches wildcard with numbers', (t) => {
	Pathist.indexWildcards = [-1, '*'];
	const p = new Pathist(['foo', 0, 'bar', 1, 'baz', 2, 'bar']);

	// Wildcard matches numbers - should find last occurrence
	t.is(p.lastIndexOf(['*', 'bar']), 5);
	t.is(p.lastIndexOf([-1, 'bar']), 5);
	t.is(p.lastIndexOf(['foo', -1]), 0);

	// Wildcard does NOT match strings
	t.is(p.lastIndexOf([-1, 'foo']), -1);
	t.is(p.lastIndexOf(['*', 'foo']), -1);
});

test.serial('lastIndexOf matches string wildcard with numbers and wildcards', (t) => {
	Pathist.indexWildcards = [-1, '*'];
	const p = new Pathist(['foo', 0, 'bar', 1, 'baz', 2, 'bar']);

	// String wildcard matches numbers
	t.is(p.lastIndexOf(['*', 'bar']), 5);
	t.is(p.lastIndexOf([1, 'baz']), 3);
	t.is(p.lastIndexOf(['*', 'baz']), 3);

	// String wildcard matches other wildcards
	t.is(p.lastIndexOf([-1, 'bar']), 5);
});

test.serial('lastIndexOf with wildcards checks non-wildcard segments', (t) => {
	Pathist.indexWildcards = [-1, '*'];
	const p = new Pathist(['foo', 0, 'bar', 1, 'baz']);

	// Correct non-wildcard segments
	t.is(p.lastIndexOf(['foo', -1, 'bar']), 0);

	// Wrong non-wildcard segments
	t.is(p.lastIndexOf(['foo', -1, 'wrong']), -1);
	t.is(p.lastIndexOf(['wrong', -1, 'bar']), -1);
});

test.serial('lastIndexOf with wildcards on both sides matches', (t) => {
	Pathist.indexWildcards = [-1, '*'];
	const p = new Pathist(['foo', -1, 'bar', '*', 'baz']);
	t.is(p.lastIndexOf(['foo', -1]), 0);
	t.is(p.lastIndexOf(['foo', '*']), 0);
	t.is(p.lastIndexOf([0, 'bar']), 1);
	t.is(p.lastIndexOf([99, 'bar']), 1);
});

test.serial('lastIndexOf finds last match with wildcards', (t) => {
	Pathist.indexWildcards = [-1, '*'];
	const p = new Pathist(['foo', 0, 'bar', 1, 'bar', 2, 'bar']);

	// Last occurrence of wildcard + 'bar'
	t.is(p.lastIndexOf([-1, 'bar']), 5);
	t.is(p.lastIndexOf(['*', 'bar']), 5);

	// Compare with indexOf which finds first
	t.is(p.indexOf([-1, 'bar']), 1);
});

test.serial('lastIndexOf with wildcards works with indices: Ignore option', (t) => {
	Pathist.indexWildcards = [-1, '*'];
	const p = new Pathist(['foo', 5, 'bar', 10, 'baz', 15, 'bar']);

	// With wildcards AND indices ignore, should match
	t.is(p.lastIndexOf([-1, 'bar'], { indices: Pathist.Indices.Ignore }), 5);
	t.is(p.lastIndexOf(['*', 'bar'], { indices: Pathist.Indices.Ignore }), 5);

	// Wildcards match numbers
	t.is(p.lastIndexOf(['foo', '*'], { indices: Pathist.Indices.Ignore }), 0);
	t.is(p.lastIndexOf(['foo', -1], { indices: Pathist.Indices.Ignore }), 0);
});

test.serial('lastIndexOf wildcards disabled returns -1 when not matching exactly', (t) => {
	Pathist.indexWildcards = [];
	const p = new Pathist(['foo', -1, 'bar']);

	// -1 should not be wildcard anymore
	t.is(p.lastIndexOf(['foo', 0, 'bar']), -1);
	t.is(p.lastIndexOf(['foo', -1, 'bar']), 0);

	// Reset to default
	Pathist.indexWildcards = [-1, '*'];
});

// Index Wildcard Validation in String Parsing
test.serial('rejects index wildcard in dot notation', (t) => {
	Pathist.indexWildcards = [-1, '*'];

	// Single wildcard in dot notation
	t.throws(() => new Pathist('foo.*.bar'), {
		message: /Index wildcard '\*' cannot appear in property position/,
	});

	// Wildcard at start
	t.throws(() => new Pathist('*.foo.bar'), {
		message: /Index wildcard '\*' cannot appear in property position/,
	});

	// Wildcard at end
	t.throws(() => new Pathist('foo.bar.*'), {
		message: /Index wildcard '\*' cannot appear in property position/,
	});
});

test.serial('rejects numeric index wildcard in dot notation', (t) => {
	Pathist.indexWildcards = [-1, '*'];

	// -1 wildcard in dot notation (requires special handling as it's parsed as string)
	// Note: -1 won't appear in dot notation naturally, but if someone creates a path like 'foo.-1.bar'
	// The parser will see "-1" as a string, not a number, so it won't match the numeric wildcard
	// This is expected behavior - numeric wildcards should only appear in bracket notation

	// Verify that 'foo.-1.bar' is allowed (parsed as string, not numeric wildcard)
	t.notThrows(() => new Pathist('foo.-1.bar'));
	const p = new Pathist('foo.-1.bar');
	// The "-1" is treated as a string property, not the numeric wildcard
	t.deepEqual(p.toArray(), ['foo', '-1', 'bar']);
	t.is(typeof p.toArray()[1], 'string');
});

test.serial('rejects custom string wildcard in dot notation', (t) => {
	Pathist.indexWildcards = ['**', 'wild'];

	t.throws(() => new Pathist('foo.**.bar'), {
		message: /Index wildcard '\*\*' cannot appear in property position/,
	});

	t.throws(() => new Pathist('foo.wild.bar'), {
		message: /Index wildcard 'wild' cannot appear in property position/,
	});

	// Reset to default
	Pathist.indexWildcards = [-1, '*'];
});

test.serial('allows index wildcard in bracket notation', (t) => {
	Pathist.indexWildcards = [-1, '*'];

	// These should all work fine
	t.notThrows(() => new Pathist('foo[*].bar'));
	t.notThrows(() => new Pathist('[*].foo.bar'));
	t.notThrows(() => new Pathist('foo.bar[*]'));
	t.notThrows(() => new Pathist('foo[*][*].bar'));

	const p = new Pathist('foo[*].bar');
	t.deepEqual(p.toArray(), ['foo', '*', 'bar']);
});

test.serial('allows index wildcard in array constructor', (t) => {
	Pathist.indexWildcards = [-1, '*'];

	// Array input bypasses string parsing - wildcards are allowed anywhere
	t.notThrows(() => new Pathist(['foo', '*', 'bar']));
	t.notThrows(() => new Pathist(['*', 'foo', 'bar']));
	t.notThrows(() => new Pathist(['foo', 'bar', '*']));

	const p = new Pathist(['foo', '*', 'bar']);
	t.deepEqual(p.toArray(), ['foo', '*', 'bar']);
});

test.serial('rejects multiple wildcards in mixed notation', (t) => {
	Pathist.indexWildcards = [-1, '*'];

	// Mixed notation with wildcard in property position should fail
	t.throws(() => new Pathist('foo.*.bar[0]'), {
		message: /Index wildcard '\*' cannot appear in property position/,
	});

	t.throws(() => new Pathist('foo[0].*.bar'), {
		message: /Index wildcard '\*' cannot appear in property position/,
	});

	// But bracket notation wildcards are fine
	t.notThrows(() => new Pathist('foo[*].bar[0]'));
	t.notThrows(() => new Pathist('foo[0][*].bar'));
});

test.serial('validation respects current wildcard configuration', (t) => {
	// Set custom wildcards
	Pathist.indexWildcards = ['custom'];

	// 'custom' should be rejected in dot notation
	t.throws(() => new Pathist('foo.custom.bar'), {
		message: /Index wildcard 'custom' cannot appear in property position/,
	});

	// But '*' should be allowed (no longer a wildcard)
	t.notThrows(() => new Pathist('foo.*.bar'));
	const p = new Pathist('foo.*.bar');
	t.deepEqual(p.toArray(), ['foo', '*', 'bar']);

	// Reset to default
	Pathist.indexWildcards = [-1, '*'];
});

test.serial('no validation when wildcards are disabled', (t) => {
	// Disable wildcards
	Pathist.indexWildcards = [];

	// Now '*' should be allowed in dot notation (it's just a regular property name)
	t.notThrows(() => new Pathist('foo.*.bar'));
	const p = new Pathist('foo.*.bar');
	t.deepEqual(p.toArray(), ['foo', '*', 'bar']);

	// Reset to default
	Pathist.indexWildcards = [-1, '*'];
});
