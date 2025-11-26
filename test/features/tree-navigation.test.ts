import test from 'ava';
import { Pathist } from '../../src/pathist.ts';

// Configuration tests
test('nodeChildrenProperties config accepts Set', (t) => {
	const config = { nodeChildrenProperties: new Set(['children', 'items']) };
	const p = Pathist.from('[0].items[1]', config);
	t.deepEqual(p.nodeChildrenProperties, new Set(['children', 'items']));
});

test('nodeChildrenProperties config accepts array', (t) => {
	const config = { nodeChildrenProperties: ['children', 'items'] };
	const p = Pathist.from('[0].items[1]', config);
	t.deepEqual(p.nodeChildrenProperties, new Set(['children', 'items']));
});

test('nodeChildrenProperties config accepts string', (t) => {
	const config = { nodeChildrenProperties: 'children' };
	const p = Pathist.from('[0].children[1]', config);
	t.deepEqual(p.nodeChildrenProperties, new Set(['children']));
});

test('nodeChildrenProperties uses default when not configured', (t) => {
	const p = Pathist.from('[0].children[1]');
	t.deepEqual(p.nodeChildrenProperties, new Set(['children']));
});

test('nodeChildrenProperties config propagates through slice', (t) => {
	const config = { nodeChildrenProperties: new Set(['items']) };
	const p = Pathist.from('items[0].items[1]', config);
	const sliced = p.slice(0, 2);
	t.deepEqual(sliced.nodeChildrenProperties, new Set(['items']));
});

test('nodeChildrenProperties config propagates through concat', (t) => {
	const config = { nodeChildrenProperties: new Set(['items']) };
	const p = Pathist.from('items[0]', config);
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

// firstNodePosition() parametric tests
const firstNodePositionCases = [
	{
		input: 'children[2].children[3].foo.bar',
		expected: 1,
		desc: 'tree at root with child property',
	},
	{
		input: 'foo.bar.content[0].children[1]',
		expected: 3,
		desc: 'tree nested within path',
	},
	{
		input: 'foo.bar.content[0]',
		expected: -1,
		desc: 'path ends on index without child property',
	},
	{
		input: 'foo.bar.baz',
		expected: -1,
		desc: 'no tree found',
	},
	{
		input: '[0].children[1].foo',
		expected: 0,
		desc: 'tree starts at root with index',
	},
	{
		input: '',
		expected: -1,
		desc: 'empty path',
	},
	{
		input: 'items[5].items[3].items[1]',
		config: { nodeChildrenProperties: ['items'] },
		expected: 1,
		desc: 'custom child property "items"',
	},
];

for (const { input, expected, desc, config } of firstNodePositionCases) {
	test(`firstNodePosition: ${desc}`, (t) => {
		const p = Pathist.from(input, config);
		t.is(p.firstNodePosition(), expected);
	});
}

// lastNodePosition() parametric tests
const lastNodePositionCases = [
	{
		input: 'children[2].children[3].foo.bar',
		expected: 3,
		desc: 'contiguous sequence ends before .foo',
	},
	{
		input: '[0].children[1].foo.bar.children[2]',
		expected: 2,
		desc: 'ignores children[2] after .foo.bar breaks contiguity',
	},
	{
		input: 'items[5].items[3].items[1]',
		config: { nodeChildrenProperties: ['items'] },
		expected: 5,
		desc: 'full contiguous tree path with custom property',
	},
	{
		input: 'foo.bar.content[0]',
		expected: -1,
		desc: 'single node at end',
	},
	{
		input: 'foo.bar.baz',
		expected: -1,
		desc: 'no tree found',
	},
	{
		input: '[0]',
		expected: 0,
		desc: 'single root node',
	},
	{
		input: '[0].children[1]',
		expected: 2,
		desc: 'root node with child',
	},
	{
		input: '',
		expected: -1,
		desc: 'empty path',
	},
	{
		input: 'a[0].b[1].c[2]',
		config: { nodeChildrenProperties: ['a', 'b', 'c'] },
		expected: 5,
		desc: 'all properties are child properties',
	},
	{
		input: 'children[0].foo[1]',
		expected: 1,
		desc: 'stops at non-child property "foo"',
	},
];

for (const { input, expected, desc, config } of lastNodePositionCases) {
	test(`lastNodePosition: ${desc}`, (t) => {
		const p = Pathist.from(input, config);
		t.is(p.lastNodePosition(), expected);
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
		input: 'foo.bar.content[0].children[1]',
		expected: [0, 1],
		desc: 'tree nested within path',
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
		const p = Pathist.from(input, config);
		t.deepEqual(p.nodeIndices(), expected);
	});
}

// Integration tests
test('tree navigation works with ArkType-style error paths', (t) => {
	const errorPath = Pathist.from('children[2].children[3].foo.bar[0].baz', {
		nodeChildrenProperties: ['children'],
	});

	const firstPos = errorPath.firstNodePosition();
	const lastPos = errorPath.lastNodePosition();
	const indices = errorPath.nodeIndices();

	t.is(firstPos, 1);
	t.is(lastPos, 3);
	t.deepEqual(indices, [2, 3]);

	// Extract node and relative paths using Position methods
	const nodePath = errorPath.slice(0, lastPos + 1);
	const relativePath = errorPath.slice(lastPos + 1);

	t.is(nodePath.string, 'children[2].children[3]');
	t.is(relativePath.string, 'foo.bar[0].baz');

	// Same using Path methods
	t.is(errorPath.lastNodePath().string, 'children[2].children[3]');
	t.is(errorPath.afterNodePath().string, 'foo.bar[0].baz');
});

test('tree navigation works with AST-style paths', (t) => {
	const astPath = Pathist.from('body[0].declarations[2].arguments[1]', {
		nodeChildrenProperties: ['body', 'declarations', 'arguments'],
	});

	t.is(astPath.firstNodePosition(), 1);
	t.is(astPath.lastNodePosition(), 5);
	t.deepEqual(astPath.nodeIndices(), [0, 2, 1]);
});

test('tree navigation with multiple child property names', (t) => {
	const p = Pathist.from('children[0].items[1].children[2]', {
		nodeChildrenProperties: ['children', 'items'],
	});

	t.is(p.firstNodePosition(), 1);
	t.is(p.lastNodePosition(), 5);
	t.deepEqual(p.nodeIndices(), [0, 1, 2]);
});

test('tree navigation stops at non-child property', (t) => {
	const p = Pathist.from('children[0].items[1].other[2]', {
		nodeChildrenProperties: ['children', 'items'],
	});

	t.is(p.firstNodePosition(), 1);
	t.is(p.lastNodePosition(), 3);
	t.deepEqual(p.nodeIndices(), [0, 1]);
});

// Path methods tests
test('firstNodePath returns path up to first node', (t) => {
	const p = Pathist.from('foo.bar.content[0].children[1]');
	t.is(p.firstNodePath().string, 'foo.bar.content[0]');
});

test('firstNodePath returns empty path when no tree found', (t) => {
	const p = Pathist.from('foo.bar.baz');
	t.is(p.firstNodePath().string, '');
});

test('lastNodePath returns full tree path', (t) => {
	const p = Pathist.from('children[2].children[3].foo.bar');
	t.is(p.lastNodePath().string, 'children[2].children[3]');
});

test('lastNodePath returns empty path when no tree found', (t) => {
	const p = Pathist.from('foo.bar.baz');
	t.is(p.lastNodePath().string, '');
});

test('beforeNodePath returns path before tree starts', (t) => {
	const p = Pathist.from('foo.bar.content[0].children[1]');
	t.is(p.beforeNodePath().string, 'foo.bar.content');
});

test('beforeNodePath returns empty path when tree at root', (t) => {
	const p = Pathist.from('[5].children[1].children[3].foo');
	t.is(p.beforeNodePath().string, '');
});

test('beforeNodePath returns empty path when no tree found', (t) => {
	const p = Pathist.from('foo.bar.baz');
	t.is(p.beforeNodePath().string, '');
});

test('afterNodePath returns path after tree ends', (t) => {
	const p = Pathist.from('[5].children[1].children[3].foo[7].bar');
	t.is(p.afterNodePath().string, 'foo[7].bar');
});

test('afterNodePath returns empty path when path ends at tree', (t) => {
	const p = Pathist.from('foo.bar.content[0].children[1]');
	t.is(p.afterNodePath().string, '');
});

test('afterNodePath returns copy of path when no tree found', (t) => {
	const p = Pathist.from('foo.bar.baz');
	const after = p.afterNodePath();
	t.is(after.string, 'foo.bar.baz');
	t.not(after, p);
});

test('Path methods propagate config', (t) => {
	const config = { nodeChildrenProperties: ['items'] as const };
	const p = Pathist.from('items[0].items[1].foo', config);

	t.deepEqual(p.firstNodePath().nodeChildrenProperties, new Set(['items']));
	t.deepEqual(p.lastNodePath().nodeChildrenProperties, new Set(['items']));
	t.deepEqual(p.beforeNodePath().nodeChildrenProperties, new Set(['items']));
	t.deepEqual(p.afterNodePath().nodeChildrenProperties, new Set(['items']));
});
