type PathSegment = string | number;
type PathInput = string | PathSegment[];

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

	private readonly segments: ReadonlyArray<PathSegment>;
	private readonly stringCache: Map<Notation, string> = new Map();

	readonly length: number;

	constructor(input: PathInput) {
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

	toString(notation: Notation = Pathist.defaultNotation): string {
		Pathist.#validateNotation(notation);

		// Check cache first
		const cached = this.stringCache.get(notation);
		if (cached !== undefined) {
			return cached;
		}

		// Compute the string representation
		let result: string;
		if (this.segments.length === 0) {
			result = '';
		} else {
			switch (notation) {
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
		this.stringCache.set(notation, result);
		return result;
	}

	get string(): string {
		return this.toString();
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
		const indices = options?.indices ?? Pathist.defaultIndices;

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
		const indices = options?.indices ?? Pathist.defaultIndices;

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
		const indices = options?.indices ?? Pathist.defaultIndices;

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
		const indices = options?.indices ?? Pathist.defaultIndices;

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

	private parseString(input: string): PathSegment[] {
		if (input === '') {
			return [];
		}

		const segments: PathSegment[] = [];
		let current = '';
		let i = 0;

		while (i < input.length) {
			const char = input[i];

			if (char === '[') {
				// Save any accumulated dot-notation segment
				if (current) {
					segments.push(current);
					current = '';
				}

				// Find closing bracket
				const closeIndex = input.indexOf(']', i);
				if (closeIndex === -1) {
					throw new Error('Unclosed bracket in path');
				}

				const bracketContent = input.slice(i + 1, closeIndex);

				// Check if it's a number
				const num = Number(bracketContent);
				if (!Number.isNaN(num) && bracketContent === num.toString()) {
					segments.push(num);
				} else {
					// It's a string (possibly with quotes)
					const unquoted = bracketContent.replace(/^["']|["']$/g, '');
					segments.push(unquoted);
				}

				i = closeIndex + 1;

				// Skip the dot after bracket if present
				if (input[i] === '.') {
					i++;
				}
			} else if (char === '.') {
				if (current) {
					segments.push(current);
					current = '';
				}
				i++;
			} else {
				current += char;
				i++;
			}
		}

		// Add any remaining segment
		if (current) {
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
				// Regular string segment
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
