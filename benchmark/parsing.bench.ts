/**
 * Benchmark suite for path parsing performance
 *
 * Run with: pnpm tsx benchmark/parsing.bench.ts
 */

import { Pathist } from '../src/pathist.js';

interface BenchmarkResult {
	name: string;
	iterations: number;
	totalTime: number;
	avgTime: number;
	opsPerSec: number;
}

/**
 * Run a benchmark with the given function
 */
function benchmark(name: string, fn: () => void, iterations = 100_000): BenchmarkResult {
	// Warm-up
	for (let i = 0; i < 1000; i++) {
		fn();
	}

	// Actual benchmark
	const start = performance.now();
	for (let i = 0; i < iterations; i++) {
		fn();
	}
	const end = performance.now();

	const totalTime = end - start;
	const avgTime = totalTime / iterations;
	const opsPerSec = (iterations / totalTime) * 1000;

	return {
		name,
		iterations,
		totalTime,
		avgTime,
		opsPerSec,
	};
}

/**
 * Format benchmark results
 */
function formatResults(results: BenchmarkResult[]): void {
	console.log('\n📊 Benchmark Results\n');
	console.log('─'.repeat(100));
	console.log(
		`${'Test Name'.padEnd(50)} | ${'Ops/sec'.padStart(15)} | ${'Avg (ms)'.padStart(12)} | ${'Total (ms)'.padStart(12)}`,
	);
	console.log('─'.repeat(100));

	for (const result of results) {
		console.log(
			`${result.name.padEnd(50)} | ${result.opsPerSec.toFixed(0).padStart(15)} | ${result.avgTime.toFixed(6).padStart(12)} | ${result.totalTime.toFixed(2).padStart(12)}`,
		);
	}

	console.log('─'.repeat(100));
	console.log();
}

// ============================================================================
// Test Cases
// ============================================================================

const testCases = {
	// Short simple paths
	shortDot: 'foo.bar.baz',
	shortBracket: '["foo"]["bar"]["baz"]',
	shortMixed: 'foo.bar[0].baz',

	// Long segment names
	longSegments:
		'veryLongPropertyName.anotherVeryLongPropertyName.yetAnotherVeryLongPropertyName.andOneMoreVeryLongPropertyName',

	// Many segments
	manySegments: Array.from({ length: 50 }, (_, i) => `seg${i}`).join('.'),

	// Mixed notation with numbers
	mixedNumbers: 'users[0].profile.addresses[5].city.name',

	// Heavy bracket notation
	heavyBrackets: Array.from({ length: 20 }, (_, i) => `[${i}]`).join(''),

	// Special characters requiring brackets
	specialChars: '["foo.bar"]["baz[0]"]["qux space"]["empty-dash"]',

	// Escaped characters
	escaped: 'foo\\.bar\\.baz\\.qux',

	// Wildcards
	wildcards: 'users[*].posts[*].comments[-1].text',

	// Real-world examples
	realWorld1: 'data.users[0].profile.settings.preferences.notifications.email',
	realWorld2: 'response.body.items[5].metadata.tags[-1]',
	realWorld3: 'state.ui.modals["confirmDialog"].isOpen',

	// Edge cases
	emptyString: '',
	singleSegment: 'foo',
	numberOnly: '[0]',
	deepNesting: 'a.b.c.d.e.f.g.h.i.j.k.l.m.n.o.p.q.r.s.t.u.v.w.x.y.z',

	// Quoted strings with escapes
	quotedEscapes: '["foo\\"bar"]["baz\\\\qux"]',
} as const;

// ============================================================================
// Benchmark Suites
// ============================================================================

function runParsingBenchmarks(): void {
	console.log('\n🔍 Running Parsing Benchmarks...\n');

	const results: BenchmarkResult[] = [];

	// Benchmark each test case
	for (const [name, path] of Object.entries(testCases)) {
		const result = benchmark(`Parse: ${name}`, () => {
			Pathist.from(path);
		});
		results.push(result);
	}

	formatResults(results);

	// Summary statistics
	const avgOpsPerSec = results.reduce((sum, r) => sum + r.opsPerSec, 0) / results.length;
	const minOpsPerSec = Math.min(...results.map((r) => r.opsPerSec));
	const maxOpsPerSec = Math.max(...results.map((r) => r.opsPerSec));

	console.log('\n📈 Summary Statistics\n');
	console.log(`Average ops/sec: ${avgOpsPerSec.toFixed(0)}`);
	console.log(`Range: ${minOpsPerSec.toFixed(0)} - ${maxOpsPerSec.toFixed(0)} ops/sec`);
	console.log();
}

function runArrayConstructionBenchmark(): void {
	console.log('\n🔍 Array Construction Benchmark...\n');

	const results: BenchmarkResult[] = [];

	// Test with array input (no parsing needed)
	const arrayInput = ['foo', 'bar', 0, 'baz', 'qux'];
	results.push(
		benchmark('Array input (baseline)', () => {
			Pathist.from(arrayInput);
		}),
	);

	formatResults(results);
}

function runRepeatedParsingBenchmark(): void {
	console.log('\n🔍 Repeated Parsing Benchmark (cache effectiveness)...\n');

	const results: BenchmarkResult[] = [];

	// Parse the same path many times to see if caching helps
	const commonPath = 'users[0].profile.name';

	results.push(
		benchmark('Parse same path repeatedly', () => {
			Pathist.from(commonPath);
		}),
	);

	formatResults(results);
}

function runNumberParsingBenchmark(): void {
	console.log('\n🔍 Number Parsing Benchmark...\n');

	const results: BenchmarkResult[] = [];

	// Focus on paths with many numbers
	const manyNumbers = Array.from({ length: 20 }, (_, i) => `[${i}]`).join('');
	const mixedNumbers = Array.from({ length: 20 }, (_, i) =>
		i % 2 === 0 ? `[${i}]` : `.seg${i}`,
	).join('');

	results.push(
		benchmark('Parse: many consecutive numbers', () => {
			Pathist.from(manyNumbers);
		}),
	);

	results.push(
		benchmark('Parse: mixed numbers and strings', () => {
			Pathist.from(mixedNumbers);
		}),
	);

	formatResults(results);
}

function runLongSegmentBenchmark(): void {
	console.log('\n🔍 Long Segment Name Benchmark...\n');

	const results: BenchmarkResult[] = [];

	// Test with increasingly long segment names
	const segments = [10, 50, 100, 200, 500];

	for (const len of segments) {
		const longSegment = 'a'.repeat(len);
		const path = `${longSegment}.${longSegment}.${longSegment}`;

		results.push(
			benchmark(`Parse: ${len} char segments`, () => {
				Pathist.from(path);
			}),
		);
	}

	formatResults(results);
}

// ============================================================================
// Main
// ============================================================================

function main(): void {
	console.log('🚀 Pathist Parsing Performance Benchmarks');
	console.log('==========================================');

	runParsingBenchmarks();
	runArrayConstructionBenchmark();
	runRepeatedParsingBenchmark();
	runNumberParsingBenchmark();
	runLongSegmentBenchmark();

	console.log('\n✅ Benchmarks complete!\n');
}

main();
