import test from 'ava';
import { Pathist } from '../../src/pathist.js';

// defaultNotation Getter/Setter
test('default notation is Mixed', (t) => {
	const p = Pathist.from([0, 'foo', 1]);
	t.is(p.toString(), '[0].foo[1]');
});

test('defaultNotation setter changes default to Bracket', (t) => {
	Pathist.defaultNotation = Pathist.Notation.Bracket;
	const p = Pathist.from([0, 'foo', 1]);
	t.is(p.toString(), '[0]["foo"][1]');
	// Reset to Mixed for other tests
	Pathist.defaultNotation = Pathist.Notation.Mixed;
});

test('defaultNotation setter changes default to Dot', (t) => {
	Pathist.defaultNotation = Pathist.Notation.Dot;
	const p = Pathist.from([0, 'foo', 1]);
	t.is(p.toString(), '0.foo.1');
	// Reset to Mixed for other tests
	Pathist.defaultNotation = Pathist.Notation.Mixed;
});

test('defaultNotation setter validates notation value', (t) => {
	const error = t.throws(
		() => {
			Pathist.defaultNotation = 'invalid' as any;
		},
		{ instanceOf: TypeError },
	);
	t.regex(error.message, /invalid notation/i);
});

test('per-call override works regardless of default', (t) => {
	Pathist.defaultNotation = Pathist.Notation.Bracket;
	const p = Pathist.from([0, 'foo', 1]);
	t.is(p.toString(Pathist.Notation.Mixed), '[0].foo[1]');
	// Reset to Mixed for other tests
	Pathist.defaultNotation = Pathist.Notation.Mixed;
});

// Indices Default and Configuration
test('default indices mode is Preserve', (t) => {
	t.is(Pathist.defaultIndices, Pathist.Indices.Preserve);
});

test('defaultIndices setter changes default to Ignore', (t) => {
	const originalMode = Pathist.defaultIndices;
	Pathist.defaultIndices = Pathist.Indices.Ignore;
	t.is(Pathist.defaultIndices, Pathist.Indices.Ignore);
	// Reset for other tests
	Pathist.defaultIndices = originalMode;
});

test('defaultIndices setter validates mode value', (t) => {
	const error = t.throws(
		() => {
			Pathist.defaultIndices = 'invalid' as any;
		},
		{ instanceOf: TypeError },
	);
	t.regex(error.message, /invalid indices mode/i);
});

// Instance-level Configuration
test('instance notation config overrides static default', (t) => {
	const p = Pathist.from([0, 'foo', 1], { notation: 'Bracket' });
	t.is(p.toString(), '[0]["foo"][1]');
});

test('instance indices config overrides static default', (t) => {
	const p1 = Pathist.from([0, 1, 2], { indices: 'Ignore' });
	const p2 = Pathist.from([0, 5, 2]);
	t.true(p1.equals(p2)); // Uses instance config: ignore

	const p3 = Pathist.from([0, 1, 2]); // Uses static default: preserve
	t.false(p3.equals(p2));
});

test('explicit parameter overrides instance config', (t) => {
	const p = Pathist.from([0, 'foo', 1], { notation: 'Bracket' });
	t.is(p.toString('Dot'), '0.foo.1'); // Explicit override
	t.is(p.toString(), '[0]["foo"][1]'); // Uses instance config
});

test('explicit options override instance indices config', (t) => {
	const p1 = Pathist.from([0, 1, 2], { indices: 'Preserve' });
	const p2 = Pathist.from([0, 5, 2]);
	t.false(p1.equals(p2)); // Uses instance config: preserve
	t.true(p1.equals(p2, { indices: 'Ignore' })); // Explicit override
});

test('instance config without notation uses static default', (t) => {
	Pathist.defaultNotation = Pathist.Notation.Bracket;
	const p = Pathist.from([0, 'foo', 1], { indices: 'Ignore' });
	t.is(p.toString(), '[0]["foo"][1]'); // Uses static default notation
	Pathist.defaultNotation = Pathist.Notation.Mixed;
});

test('instance config without indices uses static default', (t) => {
	const originalMode = Pathist.defaultIndices;
	Pathist.defaultIndices = Pathist.Indices.Ignore;
	const p1 = Pathist.from([0, 1, 2], { notation: 'Bracket' });
	const p2 = Pathist.from([0, 5, 2]);
	t.true(p1.equals(p2)); // Uses static default indices: ignore
	Pathist.defaultIndices = originalMode;
});

test('instance getters return resolved config', (t) => {
	const p1 = Pathist.from('foo', { notation: 'Bracket', indices: 'Ignore' });
	t.is(p1.notation, 'Bracket');
	t.is(p1.indices, 'Ignore');

	const p2 = Pathist.from('bar');
	t.is(p2.notation, Pathist.defaultNotation);
	t.is(p2.indices, Pathist.defaultIndices);
});
