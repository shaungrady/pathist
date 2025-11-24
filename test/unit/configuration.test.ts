import test from 'ava';
import { Pathist } from '../../src/pathist.ts';

// defaultNotation Getter/Setter
test('default notation is Mixed', (t) => {
	const p = new Pathist([0, 'foo', 1]);
	t.is(p.toString(), '[0].foo[1]');
});

test('defaultNotation setter changes default to Bracket', (t) => {
	Pathist.defaultNotation = Pathist.Notation.Bracket;
	const p = new Pathist([0, 'foo', 1]);
	t.is(p.toString(), '[0]["foo"][1]');
	// Reset to Mixed for other tests
	Pathist.defaultNotation = Pathist.Notation.Mixed;
});

test('defaultNotation setter changes default to Dot', (t) => {
	Pathist.defaultNotation = Pathist.Notation.Dot;
	const p = new Pathist([0, 'foo', 1]);
	t.is(p.toString(), '0.foo.1');
	// Reset to Mixed for other tests
	Pathist.defaultNotation = Pathist.Notation.Mixed;
});

test('defaultNotation setter validates notation value', (t) => {
	const error = t.throws(() => {
		Pathist.defaultNotation = 'invalid' as any;
	}, { instanceOf: TypeError });
	t.regex(error.message, /invalid notation/i);
});

test('per-call override works regardless of default', (t) => {
	Pathist.defaultNotation = Pathist.Notation.Bracket;
	const p = new Pathist([0, 'foo', 1]);
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
	const error = t.throws(() => {
		Pathist.defaultIndices = 'invalid' as any;
	}, { instanceOf: TypeError });
	t.regex(error.message, /invalid indices mode/i);
});
