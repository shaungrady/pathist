import test from 'ava';
import { Pathist } from '../../src/pathist.js';

// Configuration tests
test('nodeChildrenProperties config accepts Set', (t) => {
	const config = { nodeChildrenProperties: new Set(['children', 'items']) };
	const p = new Pathist('[0].items[1]', config);
	t.deepEqual(p.nodeChildrenProperties, new Set(['children', 'items']));
});

test('nodeChildrenProperties config accepts array', (t) => {
	const config = { nodeChildrenProperties: ['children', 'items'] };
	const p = new Pathist('[0].items[1]', config);
	t.deepEqual(p.nodeChildrenProperties, new Set(['children', 'items']));
});

test('nodeChildrenProperties config accepts string', (t) => {
	const config = { nodeChildrenProperties: 'children' };
	const p = new Pathist('[0].children[1]', config);
	t.deepEqual(p.nodeChildrenProperties, new Set(['children']));
});

test('nodeChildrenProperties uses default when not configured', (t) => {
	const p = new Pathist('[0].children[1]');
	t.deepEqual(p.nodeChildrenProperties, new Set(['children']));
});

test('nodeChildrenProperties config propagates through slice', (t) => {
	const config = { nodeChildrenProperties: new Set(['items']) };
	const p = new Pathist('items[0].items[1]', config);
	const sliced = p.slice(0, 2);
	t.deepEqual(sliced.nodeChildrenProperties, new Set(['items']));
});

test('nodeChildrenProperties config propagates through concat', (t) => {
	const config = { nodeChildrenProperties: new Set(['items']) };
	const p = new Pathist('items[0]', config);
	const result = p.concat('items[1]');
	t.deepEqual(result.nodeChildrenProperties, new Set(['items']));
});

test('static defaultNodeChildrenProperties can be set with Set', (t) => {
	const original = Pathist.defaultNodeChildrenProperties;
	Pathist.defaultNodeChildrenProperties = new Set(['nodes']);
	t.deepEqual(Pathist.defaultNodeChildrenProperties, new Set(['nodes']));
	Pathist.defaultNodeChildrenProperties = original; // Restore
});

test('static defaultNodeChildrenProperties can be set with array', (t) => {
	const original = Pathist.defaultNodeChildrenProperties;
	Pathist.defaultNodeChildrenProperties = ['items', 'children'];
	t.deepEqual(Pathist.defaultNodeChildrenProperties, new Set(['items', 'children']));
	Pathist.defaultNodeChildrenProperties = original; // Restore
});

test('static defaultNodeChildrenProperties can be set with string', (t) => {
	const original = Pathist.defaultNodeChildrenProperties;
	Pathist.defaultNodeChildrenProperties = 'nodes';
	t.deepEqual(Pathist.defaultNodeChildrenProperties, new Set(['nodes']));
	Pathist.defaultNodeChildrenProperties = original; // Restore
});

// firstNodePath() parametric tests
const firstNodePathCases = [
	{
		input: 'children[2].children[3].foo.bar',
		expected: '',
		desc: 'tree starts with property - root is first node',
	},
	{
		input: '[0].children[1].foo',
		expected: '[0]',
		desc: 'tree starts with index',
	},
	{
		input: 'foo.bar.baz',
		expected: '',
		desc: 'no indices - root is first node',
	},
	{
		input: '',
		expected: '',
		desc: 'empty path - root',
	},
	{
		input: 'items[5].items[3].items[1]',
		config: { nodeChildrenProperties: ['items'] },
		expected: '',
		desc: 'custom child property - starts with property',
	},
	{
		input: '[10].items[3]',
		config: { nodeChildrenProperties: ['items'] },
		expected: '[10]',
		desc: 'custom child property - starts with index',
	},
];

for (const { input, expected, desc, config } of firstNodePathCases) {
	test(`firstNodePath: ${desc}`, (t) => {
		const p = new Pathist(input, config);
		t.is(p.firstNodePath().string, expected);
	});
}

// lastNodePath() parametric tests
const lastNodePathCases = [
	{
		input: 'children[2].children[3].foo.bar',
		expected: 'children[2].children[3]',
		desc: 'contiguous sequence ends before .foo',
	},
	{
		input: '[0].children[1].foo.bar.children[2]',
		expected: '[0].children[1]',
		desc: 'ignores children[2] after .foo.bar breaks contiguity',
	},
	{
		input: 'items[5].items[3].items[1]',
		config: { nodeChildrenProperties: ['items'] },
		expected: 'items[5].items[3].items[1]',
		desc: 'full contiguous tree path with custom property',
	},
	{
		input: 'foo.bar.baz',
		expected: '',
		desc: 'no indices - root is the node',
	},
	{
		input: '[0]',
		expected: '[0]',
		desc: 'single root index',
	},
	{
		input: '[0].children[1]',
		expected: '[0].children[1]',
		desc: 'root index with child',
	},
	{
		input: '',
		expected: '',
		desc: 'empty path - root',
	},
	{
		input: 'a[0].b[1].c[2]',
		config: { nodeChildrenProperties: ['a', 'b', 'c'] },
		expected: 'a[0].b[1].c[2]',
		desc: 'all properties are child properties',
	},
	{
		input: 'children[0].foo[1]',
		expected: 'children[0]',
		desc: 'stops at non-child property "foo"',
	},
];

for (const { input, expected, desc, config } of lastNodePathCases) {
	test(`lastNodePath: ${desc}`, (t) => {
		const p = new Pathist(input, config);
		t.is(p.lastNodePath().string, expected);
	});
}

// nodeIndices() parametric tests
const nodeIndicesCases = [
	{
		input: '[5].children[1].children[3].foo',
		expected: [5, 1, 3],
		desc: 'extracts indices from tree path',
	},
	{
		input: 'children[2].children[3].foo.bar',
		expected: [2, 3],
		desc: 'tree at root',
	},
	{
		input: 'foo.bar.children[0].children[1]',
		expected: [0, 1],
		desc: 'tree starting at root with properties before first index',
	},
	{
		input: '[0].children[1].foo.bar.children[2]',
		expected: [0, 1],
		desc: 'ignores index after break in contiguity',
	},
	{
		input: 'items[5].items[3].items[1]',
		config: { nodeChildrenProperties: ['items'] },
		expected: [5, 3, 1],
		desc: 'custom child property',
	},
	{
		input: 'foo.bar.baz',
		expected: [],
		desc: 'no tree found returns empty array',
	},
	{
		input: '[7]',
		expected: [7],
		desc: 'single root node',
	},
	{
		input: 'content[0]',
		expected: [],
		desc: 'single node without child property',
	},
	{
		input: '',
		expected: [],
		desc: 'empty path',
	},
	{
		input: 'a[10].b[20].c[30]',
		config: { nodeChildrenProperties: ['a', 'b', 'c'] },
		expected: [10, 20, 30],
		desc: 'multiple different child properties',
	},
];

for (const { input, expected, desc, config } of nodeIndicesCases) {
	test(`nodeIndices: ${desc}`, (t) => {
		const p = new Pathist(input, config);
		t.deepEqual(p.nodeIndices(), expected);
	});
}

// Integration tests
test('tree navigation works with ArkType-style error paths', (t) => {
	const errorPath = new Pathist('children[2].children[3].foo.bar[0].baz', {
		nodeChildrenProperties: ['children'],
	});

	const indices = errorPath.nodeIndices();
	t.deepEqual(indices, [2, 3]);

	// Extract node and relative paths using Path methods
	t.is(errorPath.firstNodePath().string, '');
	t.is(errorPath.lastNodePath().string, 'children[2].children[3]');
	t.is(errorPath.afterNodePath().string, 'foo.bar[0].baz');
});

test('tree navigation works with AST-style paths', (t) => {
	const astPath = new Pathist('body[0].declarations[2].arguments[1]', {
		nodeChildrenProperties: ['body', 'declarations', 'arguments'],
	});

	t.is(astPath.firstNodePath().string, '');
	t.is(astPath.lastNodePath().string, 'body[0].declarations[2].arguments[1]');
	t.deepEqual(astPath.nodeIndices(), [0, 2, 1]);
});

test('tree navigation with multiple child property names', (t) => {
	const p = new Pathist('children[0].items[1].children[2]', {
		nodeChildrenProperties: ['children', 'items'],
	});

	t.is(p.firstNodePath().string, '');
	t.is(p.lastNodePath().string, 'children[0].items[1].children[2]');
	t.deepEqual(p.nodeIndices(), [0, 1, 2]);
});

test('tree navigation stops at non-child property', (t) => {
	const p = new Pathist('children[0].items[1].other[2]', {
		nodeChildrenProperties: ['children', 'items'],
	});

	t.is(p.firstNodePath().string, '');
	t.is(p.lastNodePath().string, 'children[0].items[1]');
	t.deepEqual(p.nodeIndices(), [0, 1]);
});

// Path methods tests
test('firstNodePath returns empty when starting with property', (t) => {
	const p = new Pathist('children[0].children[1]');
	t.is(p.firstNodePath().string, '');
});

test('firstNodePath returns first index when starting with index', (t) => {
	const p = new Pathist('[5].children[1]');
	t.is(p.firstNodePath().string, '[5]');
});

test('firstNodePath returns empty path when no indices', (t) => {
	const p = new Pathist('foo.bar.baz');
	t.is(p.firstNodePath().string, '');
});

test('lastNodePath returns full tree path', (t) => {
	const p = new Pathist('children[2].children[3].foo.bar');
	t.is(p.lastNodePath().string, 'children[2].children[3]');
});

test('lastNodePath returns empty path when no indices', (t) => {
	const p = new Pathist('foo.bar.baz');
	t.is(p.lastNodePath().string, '');
});

test('afterNodePath returns path after tree ends', (t) => {
	const p = new Pathist('[5].children[1].children[3].foo[7].bar');
	t.is(p.afterNodePath().string, 'foo[7].bar');
});

test('afterNodePath returns empty path when path ends at tree', (t) => {
	const p = new Pathist('children[0].children[1]');
	t.is(p.afterNodePath().string, '');
});

test('afterNodePath returns full path when no indices', (t) => {
	const p = new Pathist('foo.bar.baz');
	const after = p.afterNodePath();
	t.is(after.string, 'foo.bar.baz');
	t.not(after, p);
});

// parentNode() tests
test('parentNode on path starting with index', (t) => {
	const p = new Pathist('[0].children[1].name');
	const parent = p.parentNode();
	t.is(parent.string, '[0]');
});

test('parentNode on path starting with index - exceeding depth', (t) => {
	const p = new Pathist('[0].children[1].name');
	const parent = p.parentNode(2);
	t.is(parent.string, '[0]'); // Can't go higher than first node
});

test('parentNode on path with no tree structure returns root', (t) => {
	const p = new Pathist('foo.bar.baz');
	const parent = p.parentNode();
	t.is(parent.string, '');
});

test('parentNode on empty path returns root', (t) => {
	const p = new Pathist('');
	const parent = p.parentNode();
	t.is(parent.string, '');
});

test('parentNode on single node returns root', (t) => {
	const p = new Pathist('children[0].value');
	const parent = p.parentNode();
	t.is(parent.string, '');
});

test('parentNode throws on negative depth', (t) => {
	const p = new Pathist('children[0].children[1]');
	t.throws(() => p.parentNode(-1), {
		instanceOf: RangeError,
		message: /non-negative/,
	});
});

test('parentNode propagates config to new instance', (t) => {
	const p = new Pathist('items[0].items[1].items[2]', {
		notation: Pathist.Notation.Bracket,
		indices: Pathist.Indices.Ignore,
		nodeChildrenProperties: ['items'],
	});
	const parent = p.parentNode();
	t.is(parent.notation, Pathist.Notation.Bracket);
	t.is(parent.indices, Pathist.Indices.Ignore);
	t.deepEqual(parent.nodeChildrenProperties, new Set(['items']));
});

test('parentNode with custom child properties', (t) => {
	const p = new Pathist('items[0].items[1].value', {
		nodeChildrenProperties: ['items'],
	});
	const parent = p.parentNode();
	t.is(parent.string, 'items[0]');
});

test('parentNode stops at non-child property boundary', (t) => {
	const p = new Pathist('children[0].other[1].value', {
		nodeChildrenProperties: ['children'],
	});
	const parent = p.parentNode();
	// lastNodePath should be 'children[0]', so parent is root
	t.is(parent.string, '');
});

// Parametric tests for parentNode with different depths
const parentNodeDepthCases = [
	{
		path: 'children[0].children[1].children[2].children[3].value',
		depth: 0,
		expected: 'children[0].children[1].children[2].children[3]',
		desc: 'depth 0 (last node)',
	},
	{
		path: 'children[0].children[1].children[2].children[3].value',
		depth: 1,
		expected: 'children[0].children[1].children[2]',
		desc: 'depth 1',
	},
	{
		path: 'children[0].children[1].children[2].children[3].value',
		depth: 2,
		expected: 'children[0].children[1]',
		desc: 'depth 2',
	},
	{
		path: 'children[0].children[1].children[2].children[3].value',
		depth: 3,
		expected: 'children[0]',
		desc: 'depth 3',
	},
	{
		path: 'children[0].children[1].children[2].children[3].value',
		depth: 4,
		expected: '',
		desc: 'depth 4 (root)',
	},
	{
		path: 'children[0].children[1].children[2].children[3].value',
		depth: 5,
		expected: '',
		desc: 'depth 5 (exceeds, returns root)',
	},
];

for (const { path, depth, expected, desc } of parentNodeDepthCases) {
	test(`parentNode with ${desc}`, (t) => {
		const p = Pathist.from(path);
		t.is(p.parentNode(depth).string, expected);
	});
}

test('Path methods propagate config', (t) => {
	const config = { nodeChildrenProperties: ['items'] as const };
	const p = new Pathist('items[0].items[1].foo', config);

	t.deepEqual(p.firstNodePath().nodeChildrenProperties, new Set(['items']));
	t.deepEqual(p.lastNodePath().nodeChildrenProperties, new Set(['items']));
	t.deepEqual(p.afterNodePath().nodeChildrenProperties, new Set(['items']));
});
// nodePaths() tests
test('nodePaths yields root and all node paths for tree structure', (t) => {
	const p = new Pathist('children[0].children[1].foo');
	const paths = [...p.nodePaths()];

	t.is(paths.length, 3);
	t.is(paths[0].string, '');
	t.is(paths[1].string, 'children[0]');
	t.is(paths[2].string, 'children[0].children[1]');
});

test('nodePaths yields root and nodes for path starting with index', (t) => {
	const p = new Pathist('[0].children[1].children[2]');
	const paths = [...p.nodePaths()];

	t.is(paths.length, 3);
	t.is(paths[0].string, '[0]');
	t.is(paths[1].string, '[0].children[1]');
	t.is(paths[2].string, '[0].children[1].children[2]');
});

test('nodePaths yields only root for path with no indices', (t) => {
	const p = new Pathist('foo.bar.baz');
	const paths = [...p.nodePaths()];

	t.is(paths.length, 1);
	t.is(paths[0].string, '');
});

test('nodePaths yields only root for empty path', (t) => {
	const p = new Pathist('');
	const paths = [...p.nodePaths()];

	t.is(paths.length, 1);
	t.is(paths[0].string, '');
});

test('nodePaths stops at non-child property', (t) => {
	const p = new Pathist('children[0].items[1].other[2]', {
		nodeChildrenProperties: ['children', 'items'],
	});
	const paths = [...p.nodePaths()];

	t.is(paths.length, 3);
	t.is(paths[0].string, '');
	t.is(paths[1].string, 'children[0]');
	t.is(paths[2].string, 'children[0].items[1]');
});

test('nodePaths works with for...of loop', (t) => {
	const p = new Pathist('children[0].children[1]');
	const strings: string[] = [];

	for (const nodePath of p.nodePaths()) {
		strings.push(nodePath.string);
	}

	t.deepEqual(strings, ['', 'children[0]', 'children[0].children[1]']);
});

test('nodePaths propagates config to yielded paths', (t) => {
	const config = { nodeChildrenProperties: ['items'] as const };
	const p = new Pathist('items[0].items[1]', config);
	const paths = [...p.nodePaths()];

	for (const path of paths) {
		t.deepEqual(path.nodeChildrenProperties, new Set(['items']));
	}
});
