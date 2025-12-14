import test from 'ava';
import { Pathist } from '../../src/pathist.js';

// relativeTo() method tests
test('relativeTo extracts relative path from base', (t) => {
	const fullPath = Pathist.from('api.users[0].profile.settings');
	const basePath = Pathist.from('api.users[0]');
	const relative = fullPath.relativeTo(basePath);
	t.not(relative, null);
	t.is(relative?.string, 'profile.settings');
});

test('relativeTo returns empty path when paths are equal', (t) => {
	const path = Pathist.from('users.profile.settings');
	const relative = path.relativeTo(path);
	t.not(relative, null);
	t.is(relative?.length, 0);
	t.is(relative?.string, '');
});

test('relativeTo returns null when path does not start with base', (t) => {
	const path = Pathist.from('posts.comments');
	const base = Pathist.from('users.profile');
	const relative = path.relativeTo(base);
	t.is(relative, null);
});

test('relativeTo returns null when base is longer than path', (t) => {
	const shortPath = Pathist.from('users');
	const longBase = Pathist.from('users.profile.settings');
	const relative = shortPath.relativeTo(longBase);
	t.is(relative, null);
});

test('relativeTo handles empty base path', (t) => {
	const path = Pathist.from('users.profile');
	const emptyBase = Pathist.from('');
	const relative = path.relativeTo(emptyBase);
	t.not(relative, null);
	t.is(relative?.string, 'users.profile');
});

test('relativeTo returns null for empty path with non-empty base', (t) => {
	const emptyPath = Pathist.from('');
	const base = Pathist.from('users');
	const relative = emptyPath.relativeTo(base);
	t.is(relative, null);
});

test('relativeTo accepts string input for base', (t) => {
	const path = Pathist.from('api.users[0].profile.settings');
	const relative = path.relativeTo('api.users[0]');
	t.is(relative?.string, 'profile.settings');
});

test('relativeTo accepts array input for base', (t) => {
	const path = Pathist.from('api.users[0].profile');
	const relative = path.relativeTo(['api', 'users', 0]);
	t.is(relative?.string, 'profile');
});

test('relativeTo propagates config to new instance', (t) => {
	const path = Pathist.from('users.profile.settings', {
		notation: Pathist.Notation.Bracket,
		indices: Pathist.Indices.Ignore,
	});
	const base = Pathist.from('users');
	const relative = path.relativeTo(base);
	t.is(relative?.notation, Pathist.Notation.Bracket);
	t.is(relative?.indices, Pathist.Indices.Ignore);
});

test('relativeTo works with wildcards in base', (t) => {
	const path = Pathist.from('items[5].metadata.tags');
	const base = Pathist.from('items[*].metadata');
	const relative = path.relativeTo(base);
	t.is(relative?.string, 'tags');
});

test('relativeTo works with wildcards in both paths', (t) => {
	const path = Pathist.from('items[*].metadata.tags[*]');
	const base = Pathist.from('items[*].metadata');
	const relative = path.relativeTo(base);
	t.is(relative?.string, 'tags[*]');
});

test('relativeTo handles single segment extraction', (t) => {
	const path = Pathist.from('users.profile');
	const base = Pathist.from('users');
	const relative = path.relativeTo(base);
	t.is(relative?.string, 'profile');
	t.is(relative?.length, 1);
});

test('relativeTo throws on null input', (t) => {
	const path = Pathist.from('users.profile');
	t.throws(() => path.relativeTo(null as any), {
		instanceOf: TypeError,
		message: /Invalid path input/,
	});
});

test('relativeTo throws on undefined input', (t) => {
	const path = Pathist.from('users.profile');
	t.throws(() => path.relativeTo(undefined as any), {
		instanceOf: TypeError,
		message: /Invalid path input/,
	});
});

// Parametric tests for relativeTo
const relativeToCases = [
	{
		path: 'api.v2.users[5].profile.settings',
		base: 'api.v2.users[5]',
		expected: 'profile.settings',
		desc: 'extract nested path',
	},
	{
		path: 'data.users[0]',
		base: 'data',
		expected: 'users[0]',
		desc: 'extract path with index',
	},
	{
		path: 'a.b.c.d.e',
		base: 'a.b',
		expected: 'c.d.e',
		desc: 'extract multi-segment path',
	},
	{
		path: 'users',
		base: '',
		expected: 'users',
		desc: 'empty base returns full path',
	},
];

for (const { path, base, expected, desc } of relativeToCases) {
	test(`relativeTo: ${desc}`, (t) => {
		const p = Pathist.from(path);
		const relative = p.relativeTo(base);
		t.is(relative?.string, expected);
	});
}

// commonStart() method tests
test('commonStart finds common prefix between two paths', (t) => {
	const path1 = Pathist.from('users[0].profile.settings.theme');
	const path2 = Pathist.from('users[0].profile.avatar.url');
	const common = path1.commonStart(path2);
	t.is(common.string, 'users[0].profile');
});

test('commonStart returns empty path when no common prefix', (t) => {
	const path1 = Pathist.from('users.name');
	const path2 = Pathist.from('posts.title');
	const common = path1.commonStart(path2);
	t.is(common.length, 0);
	t.is(common.string, '');
});

test('commonStart returns shorter path when one is prefix of other', (t) => {
	const path1 = Pathist.from('users.profile.settings');
	const path2 = Pathist.from('users.profile');
	const common = path1.commonStart(path2);
	t.is(common.string, 'users.profile');
});

test('commonStart returns full path when paths are equal', (t) => {
	const path = Pathist.from('users.profile.settings');
	const common = path.commonStart(path);
	t.is(common.string, 'users.profile.settings');
});

test('commonStart handles empty paths', (t) => {
	const path = Pathist.from('users.profile');
	const empty = Pathist.from('');
	const common = path.commonStart(empty);
	t.is(common.length, 0);
	t.is(common.string, '');
});

test('commonStart with both empty paths returns empty path', (t) => {
	const empty1 = Pathist.from('');
	const empty2 = Pathist.from('');
	const common = empty1.commonStart(empty2);
	t.is(common.length, 0);
	t.is(common.string, '');
});

test('commonStart accepts string input', (t) => {
	const path = Pathist.from('users[0].profile.settings');
	const common = path.commonStart('users[0].profile.avatar');
	t.is(common.string, 'users[0].profile');
});

test('commonStart accepts array input', (t) => {
	const path = Pathist.from('users[0].profile.settings');
	const common = path.commonStart(['users', 0, 'profile', 'avatar']);
	t.is(common.string, 'users[0].profile');
});

test('commonStart propagates config to new instance', (t) => {
	const path = Pathist.from('users.profile.settings', {
		notation: Pathist.Notation.Bracket,
		indices: Pathist.Indices.Ignore,
	});
	const other = Pathist.from('users.profile.avatar');
	const common = path.commonStart(other);
	t.is(common.notation, Pathist.Notation.Bracket);
	t.is(common.indices, Pathist.Indices.Ignore);
});

test('commonStart works with wildcards', (t) => {
	const path1 = Pathist.from('items[*].metadata.tags');
	const path2 = Pathist.from('items[5].metadata.author');
	const common = path1.commonStart(path2);
	t.is(common.string, 'items[*].metadata');
});

test('commonStart handles single segment common prefix', (t) => {
	const path1 = Pathist.from('users.profile.settings');
	const path2 = Pathist.from('users.posts.comments');
	const common = path1.commonStart(path2);
	t.is(common.string, 'users');
	t.is(common.length, 1);
});

test('commonStart is commutative', (t) => {
	const path1 = Pathist.from('users.profile.settings');
	const path2 = Pathist.from('users.profile.avatar');
	const common1 = path1.commonStart(path2);
	const common2 = path2.commonStart(path1);
	t.is(common1.string, common2.string);
	t.true(common1.equals(common2));
});

test('commonStart throws on null input', (t) => {
	const path = Pathist.from('users.profile');
	t.throws(() => path.commonStart(null as any), {
		instanceOf: TypeError,
		message: /Invalid path input/,
	});
});

test('commonStart throws on undefined input', (t) => {
	const path = Pathist.from('users.profile');
	t.throws(() => path.commonStart(undefined as any), {
		instanceOf: TypeError,
		message: /Invalid path input/,
	});
});

// Parametric tests for commonStart
const commonStartCases = [
	{
		path1: 'a.b.c.d',
		path2: 'a.b.c.e',
		expected: 'a.b.c',
		desc: 'common prefix of three segments',
	},
	{
		path1: 'api.v1.users.list',
		path2: 'api.v1.posts.list',
		expected: 'api.v1',
		desc: 'common API version prefix',
	},
	{
		path1: 'data.items[0].value',
		path2: 'data.items[1].value',
		expected: 'data.items',
		desc: 'different indices, common parent',
	},
	{
		path1: 'x.y.z',
		path2: 'a.b.c',
		expected: '',
		desc: 'no common prefix',
	},
	{
		path1: 'same.path',
		path2: 'same.path',
		expected: 'same.path',
		desc: 'identical paths',
	},
];

for (const { path1, path2, expected, desc } of commonStartCases) {
	test(`commonStart: ${desc}`, (t) => {
		const p1 = Pathist.from(path1);
		const common = p1.commonStart(path2);
		t.is(common.string, expected);
	});
}

// commonEnd() method tests
test('commonEnd finds common suffix between two paths', (t) => {
	const path1 = Pathist.from('users[0].profile.settings');
	const path2 = Pathist.from('config.default.settings');
	const common = path1.commonEnd(path2);
	t.is(common.string, 'settings');
});

test('commonEnd returns empty path when no common suffix', (t) => {
	const path1 = Pathist.from('users.name');
	const path2 = Pathist.from('posts.title');
	const common = path1.commonEnd(path2);
	t.is(common.length, 0);
	t.is(common.string, '');
});

test('commonEnd returns shorter path when one is suffix of other', (t) => {
	const path1 = Pathist.from('api.users.profile.settings');
	const path2 = Pathist.from('profile.settings');
	const common = path1.commonEnd(path2);
	t.is(common.string, 'profile.settings');
});

test('commonEnd returns full path when paths are equal', (t) => {
	const path = Pathist.from('users.profile.settings');
	const common = path.commonEnd(path);
	t.is(common.string, 'users.profile.settings');
});

test('commonEnd handles empty paths', (t) => {
	const path = Pathist.from('users.profile');
	const empty = Pathist.from('');
	const common = path.commonEnd(empty);
	t.is(common.length, 0);
	t.is(common.string, '');
});

test('commonEnd with both empty paths returns empty path', (t) => {
	const empty1 = Pathist.from('');
	const empty2 = Pathist.from('');
	const common = empty1.commonEnd(empty2);
	t.is(common.length, 0);
	t.is(common.string, '');
});

test('commonEnd accepts string input', (t) => {
	const path = Pathist.from('users.profile.settings.theme');
	const common = path.commonEnd('default.settings.theme');
	t.is(common.string, 'settings.theme');
});

test('commonEnd accepts array input', (t) => {
	const path = Pathist.from('users.profile.settings.theme');
	const common = path.commonEnd(['settings', 'theme']);
	t.is(common.string, 'settings.theme');
});

test('commonEnd propagates config to new instance', (t) => {
	const path = Pathist.from('users.profile.settings', {
		notation: Pathist.Notation.Bracket,
		indices: Pathist.Indices.Ignore,
	});
	const other = Pathist.from('config.default.settings');
	const common = path.commonEnd(other);
	t.is(common.notation, Pathist.Notation.Bracket);
	t.is(common.indices, Pathist.Indices.Ignore);
});

test('commonEnd works with wildcards', (t) => {
	const path1 = Pathist.from('items[0].metadata.tags[*]');
	const path2 = Pathist.from('users[5].data.tags[*]');
	const common = path1.commonEnd(path2);
	t.is(common.string, 'tags[*]');
});

test('commonEnd handles single segment common suffix', (t) => {
	const path1 = Pathist.from('users.profile.name');
	const path2 = Pathist.from('config.default.name');
	const common = path1.commonEnd(path2);
	t.is(common.string, 'name');
	t.is(common.length, 1);
});

test('commonEnd is commutative', (t) => {
	const path1 = Pathist.from('api.users.profile.settings');
	const path2 = Pathist.from('config.profile.settings');
	const common1 = path1.commonEnd(path2);
	const common2 = path2.commonEnd(path1);
	t.is(common1.string, common2.string);
	t.true(common1.equals(common2));
});

test('commonEnd handles paths with indices', (t) => {
	const path1 = Pathist.from('users[0].items[5]');
	const path2 = Pathist.from('data.cache.items[5]');
	const common = path1.commonEnd(path2);
	t.is(common.string, 'items[5]');
});

test('commonEnd throws on null input', (t) => {
	const path = Pathist.from('users.profile');
	t.throws(() => path.commonEnd(null as any), {
		instanceOf: TypeError,
		message: /Invalid path input/,
	});
});

test('commonEnd throws on undefined input', (t) => {
	const path = Pathist.from('users.profile');
	t.throws(() => path.commonEnd(undefined as any), {
		instanceOf: TypeError,
		message: /Invalid path input/,
	});
});

// Parametric tests for commonEnd
const commonEndCases = [
	{
		path1: 'a.b.c.d',
		path2: 'x.y.c.d',
		expected: 'c.d',
		desc: 'common suffix of two segments',
	},
	{
		path1: 'api.users.profile.settings.theme',
		path2: 'config.default.settings.theme',
		expected: 'settings.theme',
		desc: 'common settings suffix',
	},
	{
		path1: 'data.items[0].value',
		path2: 'cache.items[1].value',
		expected: 'value',
		desc: 'common value suffix',
	},
	{
		path1: 'x.y.z',
		path2: 'a.b.c',
		expected: '',
		desc: 'no common suffix',
	},
	{
		path1: 'same.path',
		path2: 'same.path',
		expected: 'same.path',
		desc: 'identical paths',
	},
];

for (const { path1, path2, expected, desc } of commonEndCases) {
	test(`commonEnd: ${desc}`, (t) => {
		const p1 = Pathist.from(path1);
		const common = p1.commonEnd(path2);
		t.is(common.string, expected);
	});
}

// Integration tests combining the three methods
test('relativeTo and commonStart are related', (t) => {
	const path1 = Pathist.from('api.users[0].profile.settings.theme');
	const path2 = Pathist.from('api.users[0].profile.avatar.url');

	const common = path1.commonStart(path2);
	const relative1 = path1.relativeTo(common);
	const relative2 = path2.relativeTo(common);

	t.is(common.string, 'api.users[0].profile');
	t.is(relative1?.string, 'settings.theme');
	t.is(relative2?.string, 'avatar.url');

	// Verify we can reconstruct
	t.not(relative1, null);
	t.not(relative2, null);
	if (relative1 && relative2) {
		t.true(common.concat(relative1).equals(path1));
		t.true(common.concat(relative2).equals(path2));
	}
});

test('relativeTo is inverse of concat', (t) => {
	const base = Pathist.from('api.users[0]');
	const relative = Pathist.from('profile.settings');

	const full = base.concat(relative);
	const extracted = full.relativeTo(base);

	t.not(extracted, null);
	if (extracted) {
		t.true(extracted.equals(relative));
		t.is(extracted.string, 'profile.settings');
	}
});

test('commonEnd can be used with slice to extract prefix', (t) => {
	const path1 = Pathist.from('api.users.profile.settings');
	const path2 = Pathist.from('config.profile.settings');

	const commonSuffix = path1.commonEnd(path2);
	const prefix1 = path1.slice(0, path1.length - commonSuffix.length);
	const prefix2 = path2.slice(0, path2.length - commonSuffix.length);

	t.is(prefix1.string, 'api.users');
	t.is(prefix2.string, 'config');
	t.is(commonSuffix.string, 'profile.settings');
});
