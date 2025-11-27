import test from 'ava';
import { Pathist } from '../../src/pathist.js';

// Equals with Indices Options
test('equals with indices: Preserve (default) - different indices do not match', (t) => {
	const p1 = Pathist.from([0, 'foo', 1]);
	const p2 = Pathist.from([0, 'foo', 2]);
	t.false(p1.equals(p2));
	t.false(p1.equals(p2, { indices: Pathist.Indices.Preserve }));
});

test('equals with indices: Ignore - different indices match', (t) => {
	const p1 = Pathist.from([0, 'foo', 1]);
	const p2 = Pathist.from([0, 'foo', 2]);
	const p3 = Pathist.from([9, 'foo', 999]);
	t.true(p1.equals(p2, { indices: Pathist.Indices.Ignore }));
	t.true(p1.equals(p3, { indices: Pathist.Indices.Ignore }));
});

test('equals with indices: Ignore - string segments must still match exactly', (t) => {
	const p1 = Pathist.from([0, 'foo', 1]);
	const p2 = Pathist.from([0, 'bar', 2]);
	t.false(p1.equals(p2, { indices: Pathist.Indices.Ignore }));
});

test('equals with indices: Ignore - mixed number and string segments', (t) => {
	const p1 = Pathist.from([0, 'foo', 1, 'bar', 2]);
	const p2 = Pathist.from([5, 'foo', 7, 'bar', 9]);
	const p3 = Pathist.from([5, 'foo', 7, 'baz', 9]);
	t.true(p1.equals(p2, { indices: Pathist.Indices.Ignore }));
	t.false(p1.equals(p3, { indices: Pathist.Indices.Ignore }));
});

test('equals respects defaultIndices', (t) => {
	const originalMode = Pathist.defaultIndices;
	const p1 = Pathist.from([0, 'foo', 1]);
	const p2 = Pathist.from([0, 'foo', 2]);

	Pathist.defaultIndices = Pathist.Indices.Ignore;
	t.true(p1.equals(p2)); // Should match with Ignore mode

	Pathist.defaultIndices = Pathist.Indices.Preserve;
	t.false(p1.equals(p2)); // Should not match with Preserve mode

	// Reset
	Pathist.defaultIndices = originalMode;
});

// StartsWith with Indices Options
test('startsWith with indices: Preserve - different indices do not match', (t) => {
	const p = Pathist.from([0, 'foo', 1, 'bar']);
	t.false(p.startsWith([9, 'foo']));
	t.false(p.startsWith([9, 'foo'], { indices: Pathist.Indices.Preserve }));
});

test('startsWith with indices: Ignore - different indices match', (t) => {
	const p = Pathist.from([0, 'foo', 1, 'bar']);
	t.true(p.startsWith([9, 'foo'], { indices: Pathist.Indices.Ignore }));
	t.true(p.startsWith([999], { indices: Pathist.Indices.Ignore }));
});

test('startsWith with indices: Ignore - string segments must match', (t) => {
	const p = Pathist.from([0, 'foo', 1, 'bar']);
	t.false(p.startsWith([9, 'baz'], { indices: Pathist.Indices.Ignore }));
});

// EndsWith with Indices Options
test('endsWith with indices: Preserve - different indices do not match', (t) => {
	const p = Pathist.from([0, 'foo', 1, 'bar']);
	t.false(p.endsWith([9, 'bar']));
	t.false(p.endsWith([9, 'bar'], { indices: Pathist.Indices.Preserve }));
});

test('endsWith with indices: Ignore - different indices match', (t) => {
	const p1 = Pathist.from([0, 'foo', 1, 'bar']);
	t.true(p1.endsWith([9, 'bar'], { indices: Pathist.Indices.Ignore }));

	const p2 = Pathist.from([0, 'foo', 1]);
	t.true(p2.endsWith([999], { indices: Pathist.Indices.Ignore }));
});

test('endsWith with indices: Ignore - string segments must match', (t) => {
	const p = Pathist.from([0, 'foo', 1, 'bar']);
	t.false(p.endsWith([9, 'baz'], { indices: Pathist.Indices.Ignore }));
});

// Includes with Indices Options
test('includes with indices: Preserve - different indices do not match', (t) => {
	const p = Pathist.from([0, 'foo', 1, 'bar', 2]);
	t.false(p.includes([9, 'bar']));
	t.false(p.includes([9, 'bar'], { indices: Pathist.Indices.Preserve }));
});

test('includes with indices: Ignore - different indices match', (t) => {
	const p = Pathist.from([0, 'foo', 1, 'bar', 2]);
	t.true(p.includes([9, 'bar'], { indices: Pathist.Indices.Ignore }));
	t.true(p.includes([999], { indices: Pathist.Indices.Ignore }));
	t.true(p.includes([7, 'foo', 8], { indices: Pathist.Indices.Ignore }));
});

test('includes with indices: Ignore - string segments must match', (t) => {
	const p = Pathist.from([0, 'foo', 1, 'bar']);
	t.false(p.includes([9, 'baz'], { indices: Pathist.Indices.Ignore }));
});

test('includes with indices: Ignore - finds subsequence anywhere', (t) => {
	const p = Pathist.from([0, 'foo', 1, 'bar', 2, 'baz']);
	// Middle subsequence
	t.true(p.includes([999, 'bar', 888], { indices: Pathist.Indices.Ignore }));
	// Start subsequence
	t.true(p.includes([777, 'foo'], { indices: Pathist.Indices.Ignore }));
	// End subsequence
	t.true(p.includes([666, 'baz'], { indices: Pathist.Indices.Ignore }));
});

// IndexOf with Indices Options
test('positionOf with indices: Preserve - different indices do not match', (t) => {
	const p = Pathist.from([0, 'foo', 1, 'bar', 2]);
	t.is(p.positionOf([9, 'bar']), -1);
	t.is(p.positionOf([9, 'bar'], { indices: Pathist.Indices.Preserve }), -1);
});

test('positionOf with indices: Ignore - different indices match', (t) => {
	const p = Pathist.from([0, 'foo', 1, 'bar', 2]);
	t.is(p.positionOf([9, 'bar'], { indices: Pathist.Indices.Ignore }), 2);
	t.is(p.positionOf([999], { indices: Pathist.Indices.Ignore }), 0);
	t.is(p.positionOf([7, 'foo', 8], { indices: Pathist.Indices.Ignore }), 0);
});

test('positionOf with indices: Ignore - string segments must match', (t) => {
	const p = Pathist.from([0, 'foo', 1, 'bar']);
	t.is(p.positionOf([9, 'baz'], { indices: Pathist.Indices.Ignore }), -1);
});

test('positionOf with indices: Ignore - finds subsequence at correct position', (t) => {
	const p = Pathist.from([0, 'foo', 1, 'bar', 2, 'baz']);
	// Middle subsequence
	t.is(p.positionOf([999, 'bar', 888], { indices: Pathist.Indices.Ignore }), 2);
	// Start subsequence
	t.is(p.positionOf([777, 'foo'], { indices: Pathist.Indices.Ignore }), 0);
	// End subsequence
	t.is(p.positionOf([666, 'baz'], { indices: Pathist.Indices.Ignore }), 4);
});

// LastIndexOf with Indices Options
test('lastPositionOf with indices: Preserve - different indices do not match', (t) => {
	const p = Pathist.from([0, 'foo', 1, 'bar', 2]);
	t.is(p.lastPositionOf([9, 'bar']), -1);
	t.is(p.lastPositionOf([9, 'bar'], { indices: Pathist.Indices.Preserve }), -1);
});

test('lastPositionOf with indices: Ignore - different indices match', (t) => {
	const p = Pathist.from([0, 'foo', 1, 'bar', 2]);
	t.is(p.lastPositionOf([9, 'bar'], { indices: Pathist.Indices.Ignore }), 2);
	t.is(p.lastPositionOf([999], { indices: Pathist.Indices.Ignore }), 4);
	t.is(p.lastPositionOf([7, 'foo', 8], { indices: Pathist.Indices.Ignore }), 0);
});

test('lastPositionOf with indices: Ignore - string segments must match', (t) => {
	const p = Pathist.from([0, 'foo', 1, 'bar']);
	t.is(p.lastPositionOf([9, 'baz'], { indices: Pathist.Indices.Ignore }), -1);
});

test('lastPositionOf with indices: Ignore - finds last subsequence at correct position', (t) => {
	const p = Pathist.from([0, 'foo', 1, 'bar', 2, 'baz', 3, 'bar', 4]);
	// Multiple 'bar' segments - should find last one (at index 6: segment 3 and 'bar')
	t.is(p.lastPositionOf([999, 'bar'], { indices: Pathist.Indices.Ignore }), 6);
	// Start subsequence
	t.is(p.lastPositionOf([777, 'foo'], { indices: Pathist.Indices.Ignore }), 0);
	// Find last occurrence of 'baz' followed by any number
	t.is(p.lastPositionOf(['baz', 888], { indices: Pathist.Indices.Ignore }), 5);
});
