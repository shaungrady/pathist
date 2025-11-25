type PathSegment = string | number;
type PathInput = string | PathSegment[];

export interface PathistConfig {
	notation?: Notation;
	indices?: Indices;
}

export class Pathist {
	static readonly Notation = {
		Mixed: 'mixed',
		Dot: 'dot',
		Bracket: 'bracket',
	} as const;

	static readonly Indices = {
		Preserve: 'preserve',
		Ignore: 'ignore',
	} as const;

	static #defaultNotation: Notation = Pathist.Notation.Mixed;
	static #defaultIndices: Indices = Pathist.Indices.Preserve;
	static #indexWildcards: ReadonlySet<string | number> = new Set([-1, '*']);

	static get defaultNotation(): Notation {
		return Pathist.#defaultNotation;
	}

	static set defaultNotation(notation: Notation) {
		Pathist.#validateNotation(notation);
		Pathist.#defaultNotation = notation;
	}

	static get defaultIndices(): Indices {
		return Pathist.#defaultIndices;
	}

	static set defaultIndices(mode: Indices) {
		Pathist.#validateIndices(mode);
		Pathist.#defaultIndices = mode;
	}

	static get indexWildcards(): ReadonlySet<string | number> {
		return Pathist.#indexWildcards;
	}

	static set indexWildcards(
		value: ReadonlySet<string | number> | Array<string | number> | string | number,
	) {
		// Handle empty values - unset wildcards
		if (
			value === '' ||
			(Array.isArray(value) && value.length === 0) ||
			(value instanceof Set && value.size === 0)
		) {
			Pathist.#indexWildcards = new Set();
			return;
		}

		// Get iterable values
		let values: Iterable<string | number>;
		if (value instanceof Set || Array.isArray(value)) {
			values = value;
		} else if (typeof value === 'string' || typeof value === 'number') {
			values = [value];
		} else {
			throw new TypeError(
				'indexWildcards must be a Set, Array, string, or number',
			);
		}

		// Validate each value and build new Set
		const validatedSet = new Set<string | number>();
		for (const v of values) {
			Pathist.#validateWildcard(v);
			validatedSet.add(v);
		}

		Pathist.#indexWildcards = validatedSet;
	}

	static #validateNotation(notation: Notation): void {
		const validNotations = Object.values(Pathist.Notation);
		if (!validNotations.includes(notation)) {
			throw new TypeError(
				`Invalid notation: "${notation}". Must be one of: ${validNotations.join(', ')}`,
			);
		}
	}

	static #validateIndices(mode: Indices): void {
		const validModes = Object.values(Pathist.Indices);
		if (!validModes.includes(mode)) {
			throw new TypeError(
				`Invalid indices mode: "${mode}". Must be one of: ${validModes.join(', ')}`,
			);
		}
	}

	static #validateWildcard(value: string | number): void {
		if (typeof value === 'number') {
			// Must be negative or non-finite
			if (value >= 0 && Number.isFinite(value)) {
				throw new TypeError(
					`Invalid wildcard: ${value}. Numeric wildcards must be negative or non-finite (Infinity, -Infinity, NaN)`,
				);
			}
		} else if (typeof value === 'string') {
			// Must not be a numeric string (cannot match /^[0-9]+$/)
			if (/^[0-9]+$/.test(value)) {
				throw new TypeError(
					`Invalid wildcard: "${value}". String wildcards cannot be numeric strings matching /^[0-9]+$/`,
				);
			}
		} else {
			throw new TypeError(
				`Invalid wildcard type: ${typeof value}. Wildcards must be string or number`,
			);
		}
	}

	static #toSegments(input: Pathist | PathInput): ReadonlyArray<PathSegment> | null {
		// Handle null/undefined
		if (input == null) {
			return null;
		}

		// If it's already a Pathist instance, return its segments
		if (input instanceof Pathist) {
			return input.segments;
		}

		// If it's a string or array, parse it
		if (typeof input === 'string' || Array.isArray(input)) {
			try {
				const temp = new Pathist(input);
				return temp.segments;
			} catch {
				// If construction fails (invalid input), return null
				return null;
			}
		}

		// Invalid type
		return null;
	}

	static #isWildcard(segment: PathSegment): boolean {
		return Pathist.#indexWildcards.has(segment);
	}

	static #segmentsMatch(
		segL: PathSegment,
		segR: PathSegment,
		indices: Indices,
	): boolean {
		const isWildcardL = Pathist.#isWildcard(segL);
		const isWildcardR = Pathist.#isWildcard(segR);

		// If either is a wildcard, it matches numbers or other wildcards
		if (isWildcardL || isWildcardR) {
			// Both are wildcards - match
			if (isWildcardL && isWildcardR) {
				return true;
			}
			// One is wildcard - must match a number or another wildcard
			const nonWildcard = isWildcardL ? segR : segL;
			return typeof nonWildcard === 'number';
		}

		// If indices should be ignored and both segments are numbers, they match
		if (indices === Pathist.Indices.Ignore) {
			if (typeof segL === 'number' && typeof segR === 'number') {
				return true;
			}
		}

		// Otherwise, require exact match
		return segL === segR;
	}

	static #validatePropertySegment(segment: string, index: number): void {
		if (Pathist.#indexWildcards.has(segment)) {
			throw new Error(
				`Index wildcard '${segment}' cannot appear in property position (at index ${index})`,
			);
		}
	}

	static #parseBracketContent(content: string): PathSegment {
		// Check if it's a number
		const num = Number(content);
		if (!Number.isNaN(num) && content === num.toString()) {
			return num;
		}

		// It's a string (possibly with quotes)
		// Validate quote matching
		const startsWithQuote = content[0] === '"' || content[0] === "'";
		const endsWithQuote = content[content.length - 1] === '"' || content[content.length - 1] === "'";

		if (startsWithQuote && endsWithQuote) {
			// Both quoted - check if they match
			if (content[0] !== content[content.length - 1]) {
				throw new Error(
					`Mismatched quotes in bracket notation: [${content}]`,
				);
			}
			// Remove matching quotes
			return content.slice(1, -1);
		} else if (startsWithQuote || endsWithQuote) {
			// Only one side quoted - error
			throw new Error(
				`Mismatched quotes in bracket notation: [${content}]`,
			);
		}

		// No quotes - return as-is
		return content;
	}

	static #requiresBracketNotation(segment: string): boolean {
		// Empty strings need bracket notation
		if (segment.length === 0) {
			return true;
		}

		// Check for characters that would break dot notation parsing
		// - dots would be parsed as segment separators
		// - brackets would be parsed as bracket notation
		// - spaces for clarity (though technically parseable)
		return segment.includes('.') || segment.includes('[') || segment.includes(']') || segment.includes(' ');
	}

	static #needsJSONPathBracketNotation(segment: string): boolean {
		// Empty strings need bracket notation
		if (segment.length === 0) {
			return true;
		}

		// Check if it's a valid JavaScript identifier
		// Valid identifiers: start with letter, _, or $; contain only letters, digits, _, or $
		const identifierRegex = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/;
		return !identifierRegex.test(segment);
	}

	static #findClosingBracket(input: string, startIndex: number): number {
		// Find the closing bracket, accounting for properly quoted strings
		// startIndex should point to the '[' character
		let i = startIndex + 1;

		// Check if content starts with a quote
		if (i < input.length && (input[i] === '"' || input[i] === "'")) {
			const quote = input[i];
			i++; // Skip opening quote

			// Find matching closing quote (ignore any ] inside quotes)
			while (i < input.length && input[i] !== quote) {
				i++;
			}

			if (i < input.length && input[i] === quote) {
				i++; // Skip closing quote
				// Now look for ]
				if (i < input.length && input[i] === ']') {
					return i;
				}
			}
			// No closing quote found - reset to after '[' and find first ]
			// Let parseBracketContent handle quote validation
			i = startIndex + 1;
		}

		// No quote or after quote - find first ]
		while (i < input.length && input[i] !== ']') {
			i++;
		}

		if (i < input.length && input[i] === ']') {
			return i;
		}

		return -1;
	}

	// Instance-level config
	#notation?: Notation;
	#indices?: Indices;

	private readonly segments: ReadonlyArray<PathSegment>;
	private readonly stringCache: Map<Notation, string> = new Map();

	readonly length: number;

	// Instance getters that resolve: instance → static default
	get notation(): Notation {
		return this.#notation ?? Pathist.defaultNotation;
	}

	get indices(): Indices {
		return this.#indices ?? Pathist.defaultIndices;
	}

	// Helper to propagate config when creating new instances
	private cloneConfig(): PathistConfig {
		return {
			notation: this.#notation,
			indices: this.#indices,
		};
	}

	constructor(input: PathInput, config?: PathistConfig) {
		this.#notation = config?.notation;
		this.#indices = config?.indices;
		if (typeof input === 'string') {
			this.segments = this.parseString(input);
		} else {
			this.validateArray(input);
			// Create a copy to ensure immutability
			this.segments = [...input];
		}
		this.length = this.segments.length;
	}

	toArray(): PathSegment[] {
		// Return a copy to maintain immutability
		return [...this.segments];
	}

	get array(): PathSegment[] {
		return this.toArray();
	}

	toString(notation?: Notation): string {
		const resolved = notation ?? this.notation;
		Pathist.#validateNotation(resolved);

		// Check cache first
		const cached = this.stringCache.get(resolved);
		if (cached !== undefined) {
			return cached;
		}

		// Compute the string representation
		let result: string;
		if (this.segments.length === 0) {
			result = '';
		} else {
			switch (resolved) {
				case Pathist.Notation.Bracket:
					result = this.toBracketNotation();
					break;
				case Pathist.Notation.Dot:
					result = this.toDotNotation();
					break;
				case Pathist.Notation.Mixed:
				default:
					result = this.toMixedNotation();
			}
		}

		// Cache and return
		this.stringCache.set(resolved, result);
		return result;
	}

	get string(): string {
		return this.toString();
	}

	toJSONPath(): string {
		// Empty path returns root
		if (this.segments.length === 0) {
			return '$';
		}

		// Build the JSONPath string
		let result = '$';

		for (const segment of this.segments) {
			// Check for wildcards first (before checking if it's a number)
			if (Pathist.#isWildcard(segment)) {
				// Wildcard segments → [*] notation (RFC 9535)
				result += '[*]';
			} else if (typeof segment === 'number') {
				// Numeric segments → [n] notation
				result += `[${segment}]`;
			} else {
				// String segment - check if it needs bracket notation
				if (Pathist.#needsJSONPathBracketNotation(segment)) {
					// Use bracket notation with single quotes, escaping any single quotes
					const escaped = segment.replace(/'/g, "\\'");
					result += `['${escaped}']`;
				} else {
					// Use dot notation for valid identifiers
					result += `.${segment}`;
				}
			}
		}

		return result;
	}

	*[Symbol.iterator](): Iterator<PathSegment> {
		yield* this.segments;
	}

	equals(other: Pathist | PathInput, options?: ComparisonOptions): boolean {
		const otherSegments = Pathist.#toSegments(other);
		if (otherSegments === null) {
			return false;
		}

		// Compare lengths first
		if (this.segments.length !== otherSegments.length) {
			return false;
		}

		// Determine indices mode
		const indices = options?.indices ?? this.indices;

		// Compare each segment
		for (let i = 0; i < this.segments.length; i++) {
			if (!Pathist.#segmentsMatch(this.segments[i], otherSegments[i], indices)) {
				return false;
			}
		}

		return true;
	}

	startsWith(other: Pathist | PathInput, options?: ComparisonOptions): boolean {
		const otherSegments = Pathist.#toSegments(other);
		if (otherSegments === null) {
			return false;
		}

		// Empty path starts with empty path
		if (otherSegments.length === 0) {
			return true;
		}

		// Can't start with a longer path
		if (otherSegments.length > this.segments.length) {
			return false;
		}

		// Determine indices mode
		const indices = options?.indices ?? this.indices;

		// Compare each segment from the start
		for (let i = 0; i < otherSegments.length; i++) {
			if (!Pathist.#segmentsMatch(this.segments[i], otherSegments[i], indices)) {
				return false;
			}
		}

		return true;
	}

	endsWith(other: Pathist | PathInput, options?: ComparisonOptions): boolean {
		const otherSegments = Pathist.#toSegments(other);
		if (otherSegments === null) {
			return false;
		}

		// Empty path ends with empty path
		if (otherSegments.length === 0) {
			return true;
		}

		// Can't end with a longer path
		if (otherSegments.length > this.segments.length) {
			return false;
		}

		// Determine indices mode
		const indices = options?.indices ?? this.indices;

		// Compare each segment from the end
		const offset = this.segments.length - otherSegments.length;
		for (let i = 0; i < otherSegments.length; i++) {
			if (!Pathist.#segmentsMatch(this.segments[offset + i], otherSegments[i], indices)) {
				return false;
			}
		}

		return true;
	}

	includes(other: Pathist | PathInput, options?: ComparisonOptions): boolean {
		const otherSegments = Pathist.#toSegments(other);
		if (otherSegments === null) {
			return false;
		}

		// Empty path is included in any path
		if (otherSegments.length === 0) {
			return true;
		}

		// Can't include a longer path
		if (otherSegments.length > this.segments.length) {
			return false;
		}

		// Determine indices mode
		const indices = options?.indices ?? this.indices;

		// Try to find the sequence starting at each position
		const maxStartIndex = this.segments.length - otherSegments.length;
		for (let start = 0; start <= maxStartIndex; start++) {
			let found = true;
			for (let i = 0; i < otherSegments.length; i++) {
				if (!Pathist.#segmentsMatch(this.segments[start + i], otherSegments[i], indices)) {
					found = false;
					break;
				}
			}
			if (found) {
				return true;
			}
		}

		return false;
	}

	indexOf(other: Pathist | PathInput, options?: ComparisonOptions): number {
		const otherSegments = Pathist.#toSegments(other);
		if (otherSegments === null) {
			return -1;
		}

		// Empty path is at index 0
		if (otherSegments.length === 0) {
			return 0;
		}

		// Can't find a longer path
		if (otherSegments.length > this.segments.length) {
			return -1;
		}

		// Determine indices mode
		const indices = options?.indices ?? this.indices;

		// Try to find the sequence starting at each position
		const maxStartIndex = this.segments.length - otherSegments.length;
		for (let start = 0; start <= maxStartIndex; start++) {
			let found = true;
			for (let i = 0; i < otherSegments.length; i++) {
				if (!Pathist.#segmentsMatch(this.segments[start + i], otherSegments[i], indices)) {
					found = false;
					break;
				}
			}
			if (found) {
				return start;
			}
		}

		return -1;
	}

	lastIndexOf(other: Pathist | PathInput, options?: ComparisonOptions): number {
		const otherSegments = Pathist.#toSegments(other);
		if (otherSegments === null) {
			return -1;
		}

		// Empty path is at the end
		if (otherSegments.length === 0) {
			return this.segments.length;
		}

		// Can't find a longer path
		if (otherSegments.length > this.segments.length) {
			return -1;
		}

		// Determine indices mode
		const indices = options?.indices ?? this.indices;

		// Try to find the sequence starting from the end
		const maxStartIndex = this.segments.length - otherSegments.length;
		for (let start = maxStartIndex; start >= 0; start--) {
			let found = true;
			for (let i = 0; i < otherSegments.length; i++) {
				if (!Pathist.#segmentsMatch(this.segments[start + i], otherSegments[i], indices)) {
					found = false;
					break;
				}
			}
			if (found) {
				return start;
			}
		}

		return -1;
	}

	slice(start?: number, end?: number): Pathist {
		const slicedSegments = this.segments.slice(start, end);
		return new Pathist(slicedSegments, this.cloneConfig());
	}

	concat(...paths: Array<Pathist | PathInput>): Pathist {
		const allSegments: PathSegment[] = [...this.segments];

		for (const path of paths) {
			const segments = Pathist.#toSegments(path);
			if (segments === null) {
				throw new TypeError(
					'Invalid path input: paths must be string, array, or Pathist instance',
				);
			}
			allSegments.push(...segments);
		}

		return new Pathist(allSegments, this.cloneConfig());
	}

	merge(path: Pathist | PathInput): Pathist {
		const otherSegments = Pathist.#toSegments(path);
		if (otherSegments === null) {
			throw new TypeError(
				'Invalid path input: path must be string, array, or Pathist instance',
			);
		}

		// If either path is empty, just concatenate
		if (this.segments.length === 0) {
			return new Pathist(otherSegments, this.cloneConfig());
		}
		if (otherSegments.length === 0) {
			return new Pathist(this.segments, this.cloneConfig());
		}

		// Find the longest overlap: suffix of this path matches prefix of other path
		let overlapLength = 0;
		const maxOverlap = Math.min(this.segments.length, otherSegments.length);

		for (let len = maxOverlap; len > 0; len--) {
			// Check if the last `len` segments of this path match the first `len` segments of other path
			let match = true;
			for (let i = 0; i < len; i++) {
				const thisSegment = this.segments[this.segments.length - len + i];
				const otherSegment = otherSegments[i];

				// Check if segments match using wildcard-aware logic
				const thisIsWildcard = Pathist.#isWildcard(thisSegment);
				const otherIsWildcard = Pathist.#isWildcard(otherSegment);

				if (thisIsWildcard && otherIsWildcard) {
					// Both wildcards - match
					continue;
				}
				if (thisIsWildcard || otherIsWildcard) {
					// One wildcard, one concrete - check if concrete is a number
					const concrete = thisIsWildcard ? otherSegment : thisSegment;
					if (typeof concrete !== 'number') {
						match = false;
						break;
					}
					// Match, but we'll use the concrete value in the result
					continue;
				}
				// Both concrete - must be equal
				if (thisSegment !== otherSegment) {
					match = false;
					break;
				}
			}

			if (match) {
				overlapLength = len;
				break;
			}
		}

		// Build the merged segments
		const mergedSegments: PathSegment[] = [...this.segments];

		if (overlapLength > 0) {
			// Replace overlapping wildcards with concrete values
			for (let i = 0; i < overlapLength; i++) {
				const thisSegment = this.segments[this.segments.length - overlapLength + i];
				const otherSegment = otherSegments[i];

				const thisIsWildcard = Pathist.#isWildcard(thisSegment);
				const otherIsWildcard = Pathist.#isWildcard(otherSegment);

				// If other has a concrete value and this has wildcard, use concrete
				if (thisIsWildcard && !otherIsWildcard) {
					mergedSegments[this.segments.length - overlapLength + i] = otherSegment;
				}
			}

			// Add non-overlapping segments from other path
			for (let i = overlapLength; i < otherSegments.length; i++) {
				mergedSegments.push(otherSegments[i]);
			}
		} else {
			// No overlap - just concatenate
			mergedSegments.push(...otherSegments);
		}

		return new Pathist(mergedSegments, this.cloneConfig());
	}

	private parseString(input: string): PathSegment[] {
		if (input === '') {
			return [];
		}

		const segments: PathSegment[] = [];
		let current = '';
		let segmentStart = 0;
		let i = 0;

		while (i < input.length) {
			const char = input[i];

			if (char === '[') {
				// Save any accumulated dot-notation segment
				if (current) {
					Pathist.#validatePropertySegment(current, segmentStart);
					segments.push(current);
					current = '';
				}

				// Find closing bracket (accounting for quoted strings)
				const closeIndex = Pathist.#findClosingBracket(input, i);
				if (closeIndex === -1) {
					throw new Error('Unclosed bracket in path');
				}

				const bracketContent = input.slice(i + 1, closeIndex);
				segments.push(Pathist.#parseBracketContent(bracketContent));

				i = closeIndex + 1;

				// Skip the dot after bracket if present
				if (input[i] === '.') {
					i++;
				}
				segmentStart = i;
			} else if (char === '.') {
				if (current) {
					Pathist.#validatePropertySegment(current, segmentStart);
					segments.push(current);
					current = '';
				}
				i++;
				segmentStart = i;
			} else {
				current += char;
				i++;
			}
		}

		// Add any remaining segment
		if (current) {
			Pathist.#validatePropertySegment(current, segmentStart);
			segments.push(current);
		}

		return segments;
	}

	private validateArray(input: PathSegment[]): void {
		for (const segment of input) {
			const type = typeof segment;
			if (type !== 'string' && type !== 'number') {
				if (type === 'symbol') {
					throw new TypeError('Path segments cannot contain symbols');
				}
				throw new TypeError('Path segments must be string or number');
			}
		}
	}

	private toMixedNotation(): string {
		return this.segments
			.map((segment, index) => {
				if (typeof segment === 'number') {
					return `[${segment}]`;
				}
				// String segment - check if wildcard
				if (Pathist.#isWildcard(segment)) {
					return `[${segment}]`;
				}
				// Check if string requires bracket notation (dots, brackets, spaces, etc.)
				if (Pathist.#requiresBracketNotation(segment)) {
					return `["${segment}"]`;
				}
				// Regular string segment - use dot notation
				if (index === 0) {
					return segment;
				}
				return `.${segment}`;
			})
			.join('');
	}

	private toBracketNotation(): string {
		return this.segments
			.map((segment) => {
				if (typeof segment === 'number') {
					return `[${segment}]`;
				}
				// String segment - check if wildcard (no quotes)
				if (Pathist.#isWildcard(segment)) {
					return `[${segment}]`;
				}
				return `["${segment}"]`;
			})
			.join('');
	}

	private toDotNotation(): string {
		return this.segments.join('.');
	}
}

export type Notation = (typeof Pathist.Notation)[keyof typeof Pathist.Notation];
export type Indices = (typeof Pathist.Indices)[keyof typeof Pathist.Indices];

export interface ComparisonOptions {
	indices?: Indices;
}
