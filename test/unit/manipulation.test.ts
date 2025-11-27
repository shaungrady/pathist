import test from 'ava';
import { Pathist } from '../../src/pathist.js';

// slice() method tests
test('slice returns entire path when called without arguments', (t) => {
	const p = Pathist.from('children[2].children[3].foo.bar');
	const sliced = p.slice();
	t.is(sliced.string, 'children[2].children[3].foo.bar');
	t.not(sliced, p); // Should be a new instance
});

test('slice extracts sub-path with start index', (t) => {
	const p = Pathist.from('children[2].children[3].foo.bar');
	const sliced = p.slice(4);
	t.is(sliced.string, 'foo.bar');
});

test('slice extracts sub-path with start and end indices', (t) => {
	const p = Pathist.from('children[2].children[3].foo.bar');
	const sliced = p.slice(0, 4);
	t.is(sliced.string, 'children[2].children[3]');
});

test('slice handles negative indices', (t) => {
	const p = Pathist.from('children[2].children[3].foo.bar');
	const sliced = p.slice(-2);
	t.is(sliced.string, 'foo.bar');
});

test('slice propagates config to new instance', (t) => {
	const p = Pathist.from('foo.bar', {
		notation: Pathist.Notation.Bracket,
		indices: Pathist.Indices.Ignore,
	});
	const sliced = p.slice(0, 1);
	t.is(sliced.notation, Pathist.Notation.Bracket);
	t.is(sliced.indices, Pathist.Indices.Ignore);
});

test('slice returns empty path when start equals end', (t) => {
	const p = Pathist.from('foo.bar.baz');
	const sliced = p.slice(1, 1);
	t.is(sliced.length, 0);
	t.is(sliced.string, '');
});

test('slice handles out-of-bounds indices gracefully', (t) => {
	const p = Pathist.from('foo.bar');
	const sliced = p.slice(10);
	t.is(sliced.length, 0);
	t.is(sliced.string, '');
});

// parent() method tests
test('parent returns path with last segment removed', (t) => {
	const p = Pathist.from('foo.bar.baz');
	const parent = p.parent();
	t.is(parent.string, 'foo.bar');
});

test('parent with depth of 2', (t) => {
	const p = Pathist.from('foo.bar.baz.qux');
	const parent = p.parent(2);
	t.is(parent.string, 'foo.bar');
});

test('parent with depth equal to length returns empty path', (t) => {
	const p = Pathist.from('foo.bar.baz');
	const parent = p.parent(3);
	t.is(parent.length, 0);
	t.is(parent.string, '');
});

test('parent with depth exceeding length returns empty path', (t) => {
	const p = Pathist.from('foo.bar');
	const parent = p.parent(10);
	t.is(parent.length, 0);
	t.is(parent.string, '');
});

test('parent with depth of 0 returns clone', (t) => {
	const p = Pathist.from('foo.bar.baz');
	const clone = p.parent(0);
	t.is(clone.string, 'foo.bar.baz');
	t.not(clone, p); // Should be a new instance
});

test('parent on empty path returns empty path', (t) => {
	const p = Pathist.from('');
	const parent = p.parent();
	t.is(parent.length, 0);
	t.is(parent.string, '');
});

test('parent on single segment path returns empty path', (t) => {
	const p = Pathist.from('foo');
	const parent = p.parent();
	t.is(parent.length, 0);
	t.is(parent.string, '');
});

test('parent throws on negative depth', (t) => {
	const p = Pathist.from('foo.bar');
	t.throws(() => p.parent(-1), {
		instanceOf: RangeError,
		message: /non-negative/,
	});
});

test('parent propagates config to new instance', (t) => {
	const p = Pathist.from('foo.bar.baz', {
		notation: Pathist.Notation.Bracket,
		indices: Pathist.Indices.Ignore,
	});
	const parent = p.parent();
	t.is(parent.notation, Pathist.Notation.Bracket);
	t.is(parent.indices, Pathist.Indices.Ignore);
});

test('parent works with paths containing indices', (t) => {
	const p = Pathist.from('items[0].children[1].name');
	const parent = p.parent();
	t.is(parent.string, 'items[0].children[1]');
});

// Parametric tests for parent with different depths
const parentDepthCases = [
	{ path: 'a.b.c.d.e', depth: 1, expected: 'a.b.c.d', desc: 'depth 1' },
	{ path: 'a.b.c.d.e', depth: 2, expected: 'a.b.c', desc: 'depth 2' },
	{ path: 'a.b.c.d.e', depth: 3, expected: 'a.b', desc: 'depth 3' },
	{ path: 'a.b.c.d.e', depth: 4, expected: 'a', desc: 'depth 4' },
	{ path: 'a.b.c.d.e', depth: 5, expected: '', desc: 'depth 5 (full length)' },
	{ path: 'a.b.c.d.e', depth: 6, expected: '', desc: 'depth 6 (exceeds length)' },
];

for (const { path, depth, expected, desc } of parentDepthCases) {
	test(`parent with ${desc}`, (t) => {
		const p = Pathist.from(path);
		t.is(p.parent(depth).string, expected);
	});
}

// concat() method tests
test('concat combines two Pathist instances', (t) => {
	const nodePath = Pathist.from('children[2].children[3]');
	const relativePath = Pathist.from('foo.bar');
	const result = nodePath.concat(relativePath);
	t.is(result.string, 'children[2].children[3].foo.bar');
});

test('concat accepts string input', (t) => {
	const p = Pathist.from('children[2].children[3]');
	const result = p.concat('baz.qux');
	t.is(result.string, 'children[2].children[3].baz.qux');
});

test('concat accepts array input', (t) => {
	const p = Pathist.from('a.b');
	const result = p.concat(['c', 0, 'd']);
	t.is(result.string, 'a.b.c[0].d');
});

test('concat accepts multiple arguments', (t) => {
	const p = Pathist.from('a');
	const result = p.concat('b', ['c'], Pathist.from('d'));
	t.is(result.string, 'a.b.c.d');
});

test('concat with empty path', (t) => {
	const p = Pathist.from('foo.bar');
	const result = p.concat('');
	t.is(result.string, 'foo.bar');
});

test('concat throws on null input', (t) => {
	const p = Pathist.from('foo.bar');
	t.throws(() => p.concat(null as any), {
		instanceOf: TypeError,
		message: /Invalid path input/,
	});
});

test('concat throws on undefined input', (t) => {
	const p = Pathist.from('foo.bar');
	t.throws(() => p.concat(undefined as any), {
		instanceOf: TypeError,
		message: /Invalid path input/,
	});
});

test('concat propagates config to new instance', (t) => {
	const p = Pathist.from('foo', {
		notation: Pathist.Notation.Bracket,
		indices: Pathist.Indices.Ignore,
	});
	const result = p.concat('bar');
	t.is(result.notation, Pathist.Notation.Bracket);
	t.is(result.indices, Pathist.Indices.Ignore);
});

// merge() method tests
test('merge finds overlap and deduplicates', (t) => {
	const p = Pathist.from('a.b.c');
	const result = p.merge('b.c.d');
	t.is(result.string, 'a.b.c.d');
});

test('merge finds single segment overlap', (t) => {
	const p = Pathist.from('a.b.c');
	const result = p.merge('c.d.e');
	t.is(result.string, 'a.b.c.d.e');
});

test('merge acts like concat when no overlap', (t) => {
	const p = Pathist.from('a.b.c');
	const result = p.merge('d.e.f');
	t.is(result.string, 'a.b.c.d.e.f');
});

test('merge works with indices', (t) => {
	const p = Pathist.from('items[0].items[1]');
	const result = p.merge('items[1].name');
	t.is(result.string, 'items[0].items[1].name');
});

test('merge requires exact segment match for overlap', (t) => {
	const p = Pathist.from('a.b.c');
	const result = p.merge('b.d.e');
	t.is(result.string, 'a.b.c.b.d.e'); // b doesn't match b.c
});

test('merge prefers concrete value over wildcard', (t) => {
	const p = Pathist.from('items[-1].name');
	const result = p.merge('items[5].name.value');
	t.is(result.string, 'items[5].name.value');
});

test('merge prefers concrete value when first path has concrete', (t) => {
	const p = Pathist.from('items[5].name');
	const result = p.merge('items[-1].name.value');
	t.is(result.string, 'items[5].name.value');
});

test('merge preserves wildcards when both are wildcards', (t) => {
	const p = Pathist.from('items[-1].name');
	const result = p.merge('items[-1].name.value');
	t.is(result.string, 'items[-1].name.value');
});

test('merge handles empty first path', (t) => {
	const p = Pathist.from('');
	const result = p.merge('foo.bar');
	t.is(result.string, 'foo.bar');
});

test('merge handles empty second path', (t) => {
	const p = Pathist.from('foo.bar');
	const result = p.merge('');
	t.is(result.string, 'foo.bar');
});

test('merge accepts string input', (t) => {
	const p = Pathist.from('a.b.c');
	const result = p.merge('b.c.d');
	t.is(result.string, 'a.b.c.d');
});

test('merge accepts array input', (t) => {
	const p = Pathist.from('a.b');
	const result = p.merge(['b', 'c']);
	t.is(result.string, 'a.b.c');
});

test('merge throws on null input', (t) => {
	const p = Pathist.from('foo.bar');
	t.throws(() => p.merge(null as any), {
		instanceOf: TypeError,
		message: /Invalid path input/,
	});
});

test('merge throws on undefined input', (t) => {
	const p = Pathist.from('foo.bar');
	t.throws(() => p.merge(undefined as any), {
		instanceOf: TypeError,
		message: /Invalid path input/,
	});
});

test('merge propagates config to new instance', (t) => {
	const p = Pathist.from('foo.bar', {
		notation: Pathist.Notation.Bracket,
		indices: Pathist.Indices.Ignore,
	});
	const result = p.merge('bar.baz');
	t.is(result.notation, Pathist.Notation.Bracket);
	t.is(result.indices, Pathist.Indices.Ignore);
});

test('merge handles complete overlap', (t) => {
	const p = Pathist.from('a.b.c');
	const result = p.merge('a.b.c');
	t.is(result.string, 'a.b.c');
});

test('merge finds longest overlap', (t) => {
	const p = Pathist.from('a.b.c.d');
	const result = p.merge('b.c.d.e');
	t.is(result.string, 'a.b.c.d.e');
});

test('merge with wildcards does not match string segments', (t) => {
	const p = Pathist.from('items[-1].name');
	const result = p.merge('name.value');
	t.is(result.string, 'items[-1].name.value');
});

test('merge replaces wildcard with concrete in overlapping region', (t) => {
	const p = Pathist.from(['items', -1, 'items', -1]);
	const result = p.merge(['items', 3, 'name']);
	t.is(result.string, 'items[-1].items[3].name');
});

// Use case examples from feature_plans.md
test('slice use case: extract node-relative path', (t) => {
	const errorPath = Pathist.from('children[2].children[3].foo.bar[0].baz');
	const nodeIdx = 3; // Mock lastNodeIndex result
	const relativePath = errorPath.slice(nodeIdx + 1);
	t.is(relativePath.string, 'foo.bar[0].baz');
});

test('slice use case: extract node path', (t) => {
	const errorPath = Pathist.from('children[2].children[3].foo.bar[0].baz');
	const nodeIdx = 3; // Mock lastNodeIndex result
	const nodePath = errorPath.slice(0, nodeIdx + 1);
	t.is(nodePath.string, 'children[2].children[3]');
});

test('concat use case: reconstruct path', (t) => {
	const nodePath = Pathist.from('children[2].children[3]');
	const relativePath = Pathist.from('foo.bar[0].baz');
	const reconstructed = nodePath.concat(relativePath);
	t.is(reconstructed.string, 'children[2].children[3].foo.bar[0].baz');
});

test('concat use case: path building', (t) => {
	const base = Pathist.from('api.users[0]');
	const detail = base.concat('profile.settings');
	t.is(detail.string, 'api.users[0].profile.settings');
});

// reduce() method tests
test('reduce is a convenience wrapper for toArray().reduce()', (t) => {
	const path = Pathist.from('foo.bar.baz');
	const result1 = path.reduce<string>((acc, seg) => `${acc}/${seg}`, '');
	const result2 = path.toArray().reduce<string>((acc, seg) => `${acc}/${seg}`, '');
	t.is(result1, result2);
	t.is(result1, '/foo/bar/baz');
});

test('reduce navigates to a value in object', (t) => {
	const data = { users: [{ profile: { name: 'Alice' } }] };
	const path = Pathist.from('users[0].profile.name');
	const value = path.reduce((obj: any, segment) => obj?.[segment], data);
	t.is(value, 'Alice');
});

test('reduce handles array indices', (t) => {
	const data = { items: ['a', 'b', 'c'] };
	const path = Pathist.from('items[1]');
	const value = path.reduce((obj: any, seg) => obj?.[seg], data);
	t.is(value, 'b');
});

test('reduce returns undefined for missing paths', (t) => {
	const data = { users: [{ profile: { name: 'Alice' } }] };
	const path = Pathist.from('users[5].profile.name');
	const value = path.reduce((obj: any, seg) => obj?.[seg], data);
	t.is(value, undefined);
});

test('reduce returns undefined for null intermediate values', (t) => {
	const data = { users: null };
	const path = Pathist.from('users[0].name');
	const value = path.reduce((obj: any, seg) => obj?.[seg], data);
	t.is(value, undefined);
});

test('reduce returns undefined for undefined intermediate values', (t) => {
	const data = { users: [{ profile: undefined }] };
	const path = Pathist.from('users[0].profile.name');
	const value = path.reduce((obj: any, seg) => obj?.[seg], data);
	t.is(value, undefined);
});

test('reduce handles empty path', (t) => {
	const data = { foo: 'bar' };
	const path = Pathist.from('');
	const value = path.reduce((obj: any, seg) => obj?.[seg], data);
	t.deepEqual(value, data);
});

test('reduce works with nested objects', (t) => {
	const data = {
		level1: {
			level2: {
				level3: {
					value: 'deep',
				},
			},
		},
	};
	const path = Pathist.from('level1.level2.level3.value');
	const value = path.reduce((obj: any, seg) => obj?.[seg], data);
	t.is(value, 'deep');
});

test('reduce works with mixed arrays and objects', (t) => {
	const data = {
		users: [
			{ profile: { settings: { theme: 'dark' } } },
			{ profile: { settings: { theme: 'light' } } },
		],
	};
	const path = Pathist.from('users[1].profile.settings.theme');
	const value = path.reduce((obj: any, seg) => obj?.[seg], data);
	t.is(value, 'light');
});

test('reduce handles zero as valid value', (t) => {
	const data = { count: 0 };
	const path = Pathist.from('count');
	const value = path.reduce((obj: any, seg) => obj?.[seg], data);
	t.is(value, 0);
});

test('reduce handles false as valid value', (t) => {
	const data = { enabled: false };
	const path = Pathist.from('enabled');
	const value = path.reduce((obj: any, seg) => obj?.[seg], data);
	t.is(value, false);
});

test('reduce handles empty string as valid value', (t) => {
	const data = { name: '' };
	const path = Pathist.from('name');
	const value = path.reduce((obj: any, seg) => obj?.[seg], data);
	t.is(value, '');
});

test('reduce handles null as valid value', (t) => {
	const data = { value: null };
	const path = Pathist.from('value');
	const value = path.reduce((obj: any, seg) => obj?.[seg], data);
	t.is(value, null);
});

test('reduce works with properties containing special characters', (t) => {
	const data = { 'foo.bar': { baz: 'value' } };
	const path = Pathist.from(['foo.bar', 'baz']);
	const value = path.reduce((obj: any, seg) => obj?.[seg], data);
	t.is(value, 'value');
});

test('reduce supports custom reduction logic with fallbacks', (t) => {
	const data = { users: [{ profile: { name: 'Alice' } }] };
	const path = Pathist.from('users[5].profile.name');
	// Provide empty object as fallback for missing paths
	const value = path.reduce((obj: any, seg) => obj?.[seg] ?? {}, data);
	t.deepEqual(value, {});
});

test('reduce can build strings from segments', (t) => {
	const path = Pathist.from('users[0].profile.name');
	const result = path.reduce((acc, seg) => `${acc}/${seg}`, '');
	t.is(result, '/users/0/profile/name');
});

test('reduce can count segments', (t) => {
	const path = Pathist.from('foo.bar.baz.qux');
	const count = path.reduce((acc) => acc + 1, 0);
	t.is(count, 4);
});
