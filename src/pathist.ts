/**
 * A single segment in a path, either a string property name or a numeric index.
 *
 * @example
 * ```typescript
 * const segment1: PathSegment = 'foo';  // property name
 * const segment2: PathSegment = 0;      // array index
 * ```
 */
export type PathSegment = string | number;

/**
 * Valid input types for constructing a Pathist instance.
 * Can be a path string (e.g., "foo.bar"), an array of segments, or an existing Pathist instance.
 *
 * @example
 * ```typescript
 * const input1: PathistInput = 'foo.bar.baz';
 * const input2: PathistInput = ['foo', 'bar', 'baz'];
 * const input3: PathistInput = ['foo', 'bar', 0, 'baz'];
 * ```
 */
export type PathistInput = string | PathSegment[];

/**
 * Configuration options for creating a Pathist instance.
 */
export interface PathistConfig {
	/**
	 * The notation style to use when converting the path to a string.
	 * @defaultValue The global `Pathist.defaultNotation` setting
	 */
	notation?: Notation;

	/**
	 * How to handle numeric indices during path comparisons.
	 * - `'Preserve'`: Indices must match exactly
	 * - `'Ignore'`: Any numeric index matches any other numeric index
	 * @defaultValue The global `Pathist.defaultIndices` setting
	 */
	indices?: Indices;

	/**
	 * Property name(s) that contain child nodes in tree structures.
	 * Used by node-related methods to identify tree relationships.
	 * @defaultValue The global `Pathist.defaultNodeChildrenProperties` setting
	 */
	nodeChildrenProperties?: ReadonlySet<string> | string[] | string;
}

/**
 * A path utility class for parsing, manipulating, and comparing object property paths.
 *
 * Pathist provides a comprehensive API for working with property paths in JavaScript objects.
 * It supports multiple notation styles (dot, bracket, and mixed), handles numeric indices,
 * and offers powerful comparison and manipulation methods.
 *
 * @example
 * Basic usage
 * ```typescript
 * const path = Pathist.from('foo.bar.baz');
 * console.log(path.length); // 3
 * console.log(path.toArray()); // ['foo', 'bar', 'baz']
 * ```
 *
 * @example
 * Path comparison
 * ```typescript
 * const path1 = Pathist.from('foo.bar');
 * const path2 = Pathist.from('foo.bar.baz');
 * console.log(path2.startsWith(path1)); // true
 * ```
 */
export class Pathist {
	// ============================================================================
	// Static Constants
	// ============================================================================

	/**
	 * Notation styles for converting paths to strings.
	 *
	 * - `Mixed`: Combines dot notation for properties and bracket notation for indices (e.g., `foo.bar[0].baz`)
	 * - `Dot`: Uses dot notation exclusively (e.g., `foo.bar.0.baz`)
	 * - `Bracket`: Uses bracket notation exclusively (e.g., `["foo"]["bar"][0]["baz"]`)
	 */
	static readonly Notation = {
		Mixed: 'Mixed',
		Dot: 'Dot',
		Bracket: 'Bracket',
	} as const;

	/**
	 * Modes for handling numeric indices during path comparisons.
	 *
	 * - `Preserve`: Numeric indices must match exactly for paths to be considered equal
	 * - `Ignore`: Any numeric index matches any other numeric index (useful for comparing paths across different array positions)
	 */
	static readonly Indices = {
		Preserve: 'Preserve',
		Ignore: 'Ignore',
	} as const;

	// ============================================================================
	// Static Configuration
	// ============================================================================

	static #defaultNotation: Notation = Pathist.Notation.Mixed;
	static #defaultIndices: Indices = Pathist.Indices.Preserve;
	static #indexWildcards: ReadonlySet<string | number> = new Set([-1, '*']);
	static #defaultNodeChildrenProperties: ReadonlySet<string> = new Set(['children']);

	/**
	 * Gets or sets the default notation style used when converting paths to strings.
	 *
	 * When setting, the notation is validated and applied to all new Pathist instances.
	 *
	 * @param notation - When setting: The notation style to use as default
	 * @throws {TypeError} When setting: If the notation value is invalid
	 * @defaultValue `Pathist.Notation.Mixed`
	 */
	static get defaultNotation(): Notation {
		return Pathist.#defaultNotation;
	}

	static set defaultNotation(notation: Notation) {
		Pathist.#validateNotation(notation);
		Pathist.#defaultNotation = notation;
	}

	/**
	 * Gets or sets the default indices comparison mode.
	 *
	 * When setting, the mode is validated and applied to all new Pathist instances.
	 *
	 * @param mode - When setting: The indices mode to use as default
	 * @throws {TypeError} When setting: If the indices mode is invalid
	 * @defaultValue `Pathist.Indices.Preserve`
	 */
	static get defaultIndices(): Indices {
		return Pathist.#defaultIndices;
	}

	static set defaultIndices(mode: Indices) {
		Pathist.#validateIndices(mode);
		Pathist.#defaultIndices = mode;
	}

	/**
	 * Gets or sets the values that are treated as index wildcards.
	 *
	 * Wildcard values match any numeric index during comparisons.
	 *
	 * When setting, wildcard values can be:
	 * - Negative numbers or non-finite numbers (Infinity, -Infinity, NaN)
	 * - Strings that don't match the pattern `/^[0-9]+$/`
	 *
	 * @param value - When setting: A Set, Array, or single string/number value to use as wildcards
	 * @throws {TypeError} When setting: If any wildcard value is invalid (e.g., positive finite number or numeric string)
	 * @defaultValue `Set([-1, '*'])`
	 */
	static get indexWildcards(): ReadonlySet<string | number> {
		return Pathist.#indexWildcards;
	}

	static set indexWildcards(value:
		| ReadonlySet<string | number>
		| Array<string | number>
		| string
		| number) {
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
			throw new TypeError('indexWildcards must be a Set, Array, string, or number');
		}

		// Validate each value and build new Set
		const validatedSet = new Set<string | number>();
		for (const v of values) {
			Pathist.#validateWildcard(v);
			validatedSet.add(v);
		}

		Pathist.#indexWildcards = validatedSet;
	}

	static get defaultNodeChildrenProperties(): ReadonlySet<string> {
		return Pathist.#defaultNodeChildrenProperties;
	}

	/**
	 * Gets or sets the default property names that contain child nodes in tree structures.
	 * These properties are used by node-related methods to identify and traverse tree relationships.
	 *
	 * @param value - When setting: A Set, Array, or single string value representing property names
	 * @throws {TypeError} - When setting: If the value is not a Set, Array, or string, or if any value is not a string
	 * @defaultValue `Set(['children'])`
	 */
	static set defaultNodeChildrenProperties(value: ReadonlySet<string> | string[] | string) {
		// Handle empty values - unset properties
		if (
			value === '' ||
			(Array.isArray(value) && value.length === 0) ||
			(value instanceof Set && value.size === 0)
		) {
			Pathist.#defaultNodeChildrenProperties = new Set();
			return;
		}

		// Get iterable values
		let values: Iterable<string>;
		if (value instanceof Set || Array.isArray(value)) {
			values = value;
		} else if (typeof value === 'string') {
			values = [value];
		} else {
			throw new TypeError('nodeChildrenProperties must be a Set, Array, or string');
		}

		// Validate each value and build new Set
		const validatedSet = new Set<string>();
		for (const v of values) {
			if (typeof v !== 'string') {
				throw new TypeError('nodeChildrenProperties must contain only strings');
			}
			validatedSet.add(v);
		}

		Pathist.#defaultNodeChildrenProperties = validatedSet;
	}

	static #validateNotation(notation: Notation): void {
		if (!(notation in Pathist.Notation)) {
			throw new TypeError(
				`Invalid notation: "${notation}". Must be one of: ${Object.keys(Pathist.Notation).join(', ')}`,
			);
		}
	}

	static #validateIndices(mode: Indices): void {
		if (!(mode in Pathist.Indices)) {
			throw new TypeError(
				`Invalid indices mode: "${mode}". Must be one of: ${Object.keys(Pathist.Indices).join(', ')}`,
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

	// ============================================================================
	// Static Factory & Helper Methods
	// ============================================================================

	/**
	 * Creates a new Pathist instance from various input types.
	 * This is the Temporal-style factory method alternative to using `Pathist.from()`.
	 *
	 * @param input - Path string, array of segments, or existing Pathist instance
	 * @param config - Optional configuration for notation, indices mode, etc.
	 * @returns A new Pathist instance
	 *
	 * @example
	 * ```typescript
	 * Pathist.from('foo.bar.baz')
	 * Pathist.from(['foo', 'bar', 'baz'])
	 * Pathist.from('foo.bar', { notation: 'bracket' })
	 * ```
	 */
	static from(input: PathistInput, config?: PathistConfig): Pathist {
		return new Pathist(input, config);
	}

	static #toSegments(input: Pathist | PathistInput): ReadonlyArray<PathSegment> | null {
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
				const temp = Pathist.from(input);
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

	static #segmentsMatch(segL: PathSegment, segR: PathSegment, indices: Indices): boolean {
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
		const endsWithQuote =
			content[content.length - 1] === '"' || content[content.length - 1] === "'";

		if (startsWithQuote && endsWithQuote) {
			// Both quoted - check if they match
			if (content[0] !== content[content.length - 1]) {
				throw new Error(`Mismatched quotes in bracket notation: [${content}]`);
			}
			// Remove matching quotes
			return content.slice(1, -1);
		} else if (startsWithQuote || endsWithQuote) {
			// Only one side quoted - error
			throw new Error(`Mismatched quotes in bracket notation: [${content}]`);
		}

		// No quotes - return as-is
		return content;
	}

	static #requiresBracketNotation(segment: string): boolean {
		// Empty strings need bracket notation
		if (segment.length === 0) {
			return true;
		}

		// Check for characters that would break path parsing in libraries like lodash.get
		// Note: This is intentionally lenient to match lodash behavior, which accepts
		// most special characters (-, @, #, %, etc.) in dot notation property names.
		// Only characters that would be misinterpreted by the parser require brackets:
		// - dots (.) would be parsed as path separators
		// - brackets ([, ]) would be parsed as bracket notation
		// - spaces for clarity and consistency (though many parsers handle them)
		return (
			segment.includes('.') ||
			segment.includes('[') ||
			segment.includes(']') ||
			segment.includes(' ')
		);
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

	// ============================================================================
	// Instance Fields & Properties
	// ============================================================================

	// Instance-level config
	#notation?: Notation;
	#indices?: Indices;
	#nodeChildrenProperties?: ReadonlySet<string>;

	private readonly segments: ReadonlyArray<PathSegment>;
	private readonly stringCache: Map<Notation, string> = new Map();

	/**
	 * The number of segments in this path.
	 *
	 * @example
	 * ```typescript
	 * const path = Pathist.from('foo.bar.baz');
	 * console.log(path.length); // 3
	 * ```
	 */
	readonly length: number;

	/**
	 * Gets the notation style for this instance.
	 *
	 * Returns the instance-specific notation if set, otherwise returns the global default.
	 */
	get notation(): Notation {
		return this.#notation ?? Pathist.defaultNotation;
	}

	/**
	 * Gets the indices comparison mode for this instance.
	 *
	 * Returns the instance-specific mode if set, otherwise returns the global default.
	 */
	get indices(): Indices {
		return this.#indices ?? Pathist.defaultIndices;
	}

	/**
	 * Gets the node children properties for this instance.
	 *
	 * Returns the instance-specific properties if set, otherwise returns the global default.
	 */
	get nodeChildrenProperties(): ReadonlySet<string> {
		return this.#nodeChildrenProperties ?? Pathist.defaultNodeChildrenProperties;
	}

	// ============================================================================
	// Constructor
	// ============================================================================

	/**
	 * Creates a new Pathist instance from a string, array, or existing Pathist.
	 *
	 * @param input - The path input (string like "foo.bar", array like ['foo', 'bar'], or Pathist instance)
	 * @param config - Optional configuration for notation, indices mode, and node children properties
	 *
	 * @throws {Error} If the string path contains syntax errors (unclosed brackets, mismatched quotes, etc.)
	 * @throws {TypeError} If array segments contain invalid types (must be string or number)
	 *
	 * @example
	 * From string
	 * ```typescript
	 * const path = Pathist.from('foo.bar.baz');
	 * ```
	 *
	 * @example
	 * From array
	 * ```typescript
	 * const path = Pathist.from(['foo', 'bar', 0, 'baz']);
	 * ```
	 *
	 * @example
	 * With custom configuration
	 * ```typescript
	 * const path = Pathist.from('foo.bar', {
	 *   notation: Pathist.Notation.Bracket,
	 *   indices: Pathist.Indices.Ignore
	 * });
	 * ```
	 */
	constructor(input: PathistInput, config?: PathistConfig) {
		this.#notation = config?.notation;
		this.#indices = config?.indices;

		// Handle nodeChildrenProperties config
		if (config?.nodeChildrenProperties !== undefined) {
			const value = config.nodeChildrenProperties;
			if (value instanceof Set) {
				this.#nodeChildrenProperties = value;
			} else if (Array.isArray(value)) {
				this.#nodeChildrenProperties = new Set(value);
			} else if (typeof value === 'string') {
				this.#nodeChildrenProperties = new Set([value]);
			}
		}

		if (typeof input === 'string') {
			this.segments = this.parseString(input);
		} else {
			this.validateArray(input);
			// Create a copy to ensure immutability
			this.segments = [...input];
		}
		this.length = this.segments.length;
	}

	// ============================================================================
	// Conversion & Accessors
	// ============================================================================

	/**
	 * Returns the path as an array of segments.
	 *
	 * Returns a copy of the internal segments array to maintain immutability.
	 *
	 * @returns A new array containing all path segments
	 *
	 * @example
	 * ```typescript
	 * const path = Pathist.from('foo.bar[0].baz');
	 * console.log(path.toArray()); // ['foo', 'bar', 0, 'baz']
	 * ```
	 *
	 * @see {@link array} - Getter alias for this method
	 */
	toArray(): PathSegment[] {
		// Return a copy to maintain immutability
		return [...this.segments];
	}

	/**
	 * Gets the path as an array of segments.
	 *
	 * Alias for {@link toArray}.
	 */
	get array(): PathSegment[] {
		return this.toArray();
	}

	/**
	 * Converts the path to a string representation using the specified notation.
	 *
	 * Results are cached for performance. The notation parameter allows overriding
	 * the instance's default notation on a per-call basis.
	 *
	 * @param notation - Optional notation style to use (overrides instance default)
	 * @returns The path as a string
	 * @throws {TypeError} If the notation value is invalid
	 *
	 * @example
	 * Default notation (Mixed)
	 * ```typescript
	 * const path = Pathist.from(['foo', 'bar', 0, 'baz']);
	 * console.log(path.toString()); // 'foo.bar[0].baz'
	 * ```
	 *
	 * @example
	 * Bracket notation
	 * ```typescript
	 * console.log(path.toString(Pathist.Notation.Bracket)); // '["foo"]["bar"][0]["baz"]'
	 * ```
	 *
	 * @example
	 * Dot notation
	 * ```typescript
	 * console.log(path.toString(Pathist.Notation.Dot)); // 'foo.bar.0.baz'
	 * ```
	 *
	 * @see {@link string} - Getter alias for this method (uses instance default notation)
	 */
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
				default:
					result = this.toMixedNotation();
			}
		}

		// Cache and return
		this.stringCache.set(resolved, result);
		return result;
	}

	/**
	 * Gets the path as a string using the instance's default notation.
	 *
	 * Alias for {@link toString} with no arguments.
	 */
	get string(): string {
		return this.toString();
	}

	/**
	 * Converts the path to JSONPath format (RFC 9535).
	 *
	 * JSONPath is a standardized query language for JSON. This method converts
	 * the path to a JSONPath selector string starting with `$` (the root).
	 *
	 * @returns The path as a JSONPath string
	 *
	 * @example
	 * Basic usage
	 * ```typescript
	 * const path = Pathist.from('foo.bar.baz');
	 * console.log(path.toJSONPath()); // '$.foo.bar.baz'
	 * ```
	 *
	 * @example
	 * With numeric indices
	 * ```typescript
	 * const path = Pathist.from('items[0].name');
	 * console.log(path.toJSONPath()); // '$.items[0].name'
	 * ```
	 *
	 * @example
	 * With wildcards
	 * ```typescript
	 * const path = Pathist.from('items[*].name');
	 * console.log(path.toJSONPath()); // '$.items[*].name'
	 * ```
	 *
	 * @see {@link jsonPath} - Getter alias for this method
	 */
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

	/**
	 * Gets the path as a JSONPath string.
	 *
	 * Alias for {@link toJSONPath}.
	 */
	get jsonPath(): string {
		return this.toJSONPath();
	}

	// ============================================================================
	// Iteration
	// ============================================================================

	/**
	 * Makes the Pathist instance iterable, allowing use in for...of loops and spread operators.
	 *
	 * @returns An iterator over the path segments
	 *
	 * @example
	 * Using for...of
	 * ```typescript
	 * const path = Pathist.from('foo.bar.baz');
	 * for (const segment of path) {
	 *   console.log(segment); // 'foo', 'bar', 'baz'
	 * }
	 * ```
	 *
	 * @example
	 * Using spread operator
	 * ```typescript
	 * const segments = [...path]; // ['foo', 'bar', 'baz']
	 * ```
	 */
	*[Symbol.iterator](): Iterator<PathSegment> {
		yield* this.segments;
	}

	// ============================================================================
	// Comparison Methods
	// ============================================================================

	/**
	 * Checks if this path is equal to another path.
	 *
	 * Two paths are equal if they have the same length and all corresponding segments match.
	 * The indices option controls how numeric indices are compared.
	 *
	 * @param other - The path to compare against
	 * @param options - Optional comparison options
	 * @returns `true` if the paths are equal, `false` otherwise
	 *
	 * @see {@link startsWith} for checking if this path starts with another
	 * @see {@link endsWith} for checking if this path ends with another
	 * @see {@link includes} for checking if this path contains another
	 *
	 * @example
	 * Exact comparison (default)
	 * ```typescript
	 * const path1 = Pathist.from('foo[0].bar');
	 * const path2 = Pathist.from('foo[0].bar');
	 * console.log(path1.equals(path2)); // true
	 * ```
	 *
	 * @example
	 * Ignoring indices
	 * ```typescript
	 * const path1 = Pathist.from('foo[0].bar');
	 * const path2 = Pathist.from('foo[5].bar');
	 * console.log(path1.equals(path2, { indices: Pathist.Indices.Ignore })); // true
	 * ```
	 */
	equals(other: Pathist | PathistInput, options?: ComparisonOptions): boolean {
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

	/**
	 * Checks if this path starts with the specified path segment sequence.
	 *
	 * @param other - The path segment sequence to check
	 * @param options - Optional comparison options
	 * @returns `true` if this path starts with the specified sequence, `false` otherwise
	 *
	 * @see {@link endsWith} for checking if this path ends with a sequence
	 * @see {@link equals} for exact path comparison
	 * @see {@link positionOf} for finding the position of a sequence
	 *
	 * @example
	 * ```typescript
	 * const path = Pathist.from('foo.bar.baz');
	 * console.log(path.startsWith('foo.bar')); // true
	 * console.log(path.startsWith('bar')); // false
	 * ```
	 */
	startsWith(other: Pathist | PathistInput, options?: ComparisonOptions): boolean {
		return this.positionOf(other, options) === 0;
	}

	/**
	 * Checks if this path ends with the specified path segment sequence.
	 *
	 * @param other - The path segment sequence to check
	 * @param options - Optional comparison options
	 * @returns `true` if this path ends with the specified sequence, `false` otherwise
	 *
	 * @see {@link startsWith} for checking if this path starts with a sequence
	 * @see {@link equals} for exact path comparison
	 * @see {@link lastPositionOf} for finding the last position of a sequence
	 *
	 * @example
	 * ```typescript
	 * const path = Pathist.from('foo.bar.baz');
	 * console.log(path.endsWith('bar.baz')); // true
	 * console.log(path.endsWith('bar')); // false
	 * ```
	 */
	endsWith(other: Pathist | PathistInput, options?: ComparisonOptions): boolean {
		const otherSegments = Pathist.#toSegments(other);
		if (otherSegments === null) {
			return false;
		}

		// Can't end with a longer path
		if (otherSegments.length > this.segments.length) {
			return false;
		}

		return this.lastPositionOf(other, options) === this.segments.length - otherSegments.length;
	}

	/**
	 * Checks if this path contains the specified path segment sequence anywhere within it.
	 *
	 * @param other - The path segment sequence to search for
	 * @param options - Optional comparison options
	 * @returns `true` if this path contains the specified sequence, `false` otherwise
	 *
	 * @see {@link positionOf} for finding the exact position of the sequence
	 * @see {@link startsWith} for checking if the sequence is at the start
	 * @see {@link endsWith} for checking if the sequence is at the end
	 *
	 * @example
	 * ```typescript
	 * const path = Pathist.from('foo.bar.baz.qux');
	 * console.log(path.includes('bar.baz')); // true
	 * console.log(path.includes('baz.foo')); // false
	 * ```
	 */
	includes(other: Pathist | PathistInput, options?: ComparisonOptions): boolean {
		return this.positionOf(other, options) !== -1;
	}

	// ============================================================================
	// Search Methods
	// ============================================================================

	/**
	 * Finds the first position where the specified path segment sequence occurs within this path.
	 *
	 * Returns the index of the first segment where the match begins, or -1 if not found.
	 *
	 * @param other - The path segment sequence to search for
	 * @param options - Optional comparison options
	 * @returns The zero-based position of the first match, or -1 if not found
	 *
	 * @see {@link lastPositionOf} for finding the last occurrence
	 * @see {@link includes} for checking if a sequence exists without needing the position
	 * @see {@link pathTo} for extracting the path up to the first occurrence
	 *
	 * @example
	 * ```typescript
	 * const path = Pathist.from('foo.bar.baz.bar');
	 * console.log(path.positionOf('bar')); // 1 (first occurrence)
	 * console.log(path.positionOf('qux')); // -1 (not found)
	 * ```
	 */
	positionOf(other: Pathist | PathistInput, options?: ComparisonOptions): number {
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

	/**
	 * Finds the last position where the specified path segment sequence occurs within this path.
	 *
	 * Returns the index of the first segment where the last match begins, or -1 if not found.
	 *
	 * @param other - The path segment sequence to search for
	 * @param options - Optional comparison options
	 * @returns The zero-based position of the last match, or -1 if not found
	 *
	 * @see {@link positionOf} for finding the first occurrence
	 * @see {@link pathToLast} for extracting the path up to the last occurrence
	 *
	 * @example
	 * ```typescript
	 * const path = Pathist.from('foo.bar.baz.bar');
	 * console.log(path.lastPositionOf('bar')); // 3 (last occurrence)
	 * console.log(path.lastPositionOf('qux')); // -1 (not found)
	 * ```
	 */
	lastPositionOf(other: Pathist | PathistInput, options?: ComparisonOptions): number {
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

	/**
	 * Returns the path up to and including the first occurrence of the specified path segment sequence.
	 *
	 * This method searches for the first match of the provided path within this path and returns
	 * a new Pathist instance containing all segments from the start up to and including the match.
	 *
	 * @param other - The path segment sequence to search for (can be a Pathist instance, string, or array)
	 * @param options - Optional comparison options (e.g., indices mode)
	 * @returns A new Pathist instance containing the path up to and including the first match,
	 *          or an empty path if no match is found
	 *
	 * @see {@link pathToLast} for extracting up to the last occurrence
	 * @see {@link positionOf} for getting just the position without extraction
	 * @see {@link slice} for general segment extraction
	 *
	 * @example
	 * ```typescript
	 * const p = Pathist.from('foo.bar.baz.bar.qux');
	 * p.pathTo('bar').toString();        // 'foo.bar'
	 * p.pathTo('bar.baz').toString();    // 'foo.bar.baz'
	 * p.pathTo('notfound').toString();   // ''
	 * ```
	 */
	pathTo(other: Pathist | PathistInput, options?: ComparisonOptions): Pathist {
		const otherSegments = Pathist.#toSegments(other);
		if (otherSegments === null) {
			throw new TypeError('Invalid path input: path must be string, array, or Pathist instance');
		}

		const position = this.positionOf(other, options);

		// If not found, return empty path
		if (position === -1) {
			return Pathist.from('', this.cloneConfig());
		}

		// Return path up to and including the match
		return this.slice(0, position + otherSegments.length);
	}

	/**
	 * Returns the path up to and including the last occurrence of the specified path segment sequence.
	 *
	 * This method searches for the last match of the provided path within this path and returns
	 * a new Pathist instance containing all segments from the start up to and including the last match.
	 *
	 * @param other - The path segment sequence to search for (can be a Pathist instance, string, or array)
	 * @param options - Optional comparison options (e.g., indices mode)
	 * @returns A new Pathist instance containing the path up to and including the last match,
	 *          or an empty path if no match is found
	 *
	 * @see {@link pathTo} for extracting up to the first occurrence
	 * @see {@link lastPositionOf} for getting just the position without extraction
	 *
	 * @example
	 * ```typescript
	 * const p = Pathist.from('foo.bar.baz.bar.qux');
	 * p.pathToLast('bar').toString();        // 'foo.bar.baz.bar'
	 * p.pathToLast('bar.baz').toString();    // 'foo.bar.baz'
	 * p.pathToLast('notfound').toString();   // ''
	 * ```
	 */
	pathToLast(other: Pathist | PathistInput, options?: ComparisonOptions): Pathist {
		const otherSegments = Pathist.#toSegments(other);
		if (otherSegments === null) {
			throw new TypeError('Invalid path input: path must be string, array, or Pathist instance');
		}

		// Empty path search returns empty path
		if (otherSegments.length === 0) {
			return Pathist.from('', this.cloneConfig());
		}

		const position = this.lastPositionOf(other, options);

		// If not found, return empty path
		if (position === -1) {
			return Pathist.from('', this.cloneConfig());
		}

		// Return path up to and including the match
		return this.slice(0, position + otherSegments.length);
	}

	// ============================================================================
	// Manipulation Methods
	// ============================================================================

	/**
	 * Returns a new path containing a subset of this path's segments.
	 *
	 * Works like Array.slice(), extracting segments from start to end (end not included).
	 * The new path preserves this path's configuration.
	 *
	 * @param start - Zero-based index at which to start extraction (default: 0)
	 * @param end - Zero-based index before which to end extraction (default: path length)
	 * @returns A new Pathist instance containing the extracted segments
	 *
	 * @example
	 * ```typescript
	 * const path = Pathist.from('foo.bar.baz.qux');
	 * console.log(path.slice(1, 3).toString()); // 'bar.baz'
	 * console.log(path.slice(2).toString()); // 'baz.qux'
	 * ```
	 */
	slice(start?: number, end?: number): Pathist {
		const slicedSegments = this.segments.slice(start, end);
		return Pathist.from(slicedSegments, this.cloneConfig());
	}

	/**
	 * Returns a new path that combines this path with one or more other paths.
	 *
	 * Creates a new path by concatenating all segments in order. The new path
	 * preserves this path's configuration.
	 *
	 * @param paths - One or more paths to concatenate
	 * @returns A new Pathist instance containing all concatenated segments
	 * @throws {TypeError} If any path input is invalid
	 *
	 * @example
	 * ```typescript
	 * const path1 = Pathist.from('foo.bar');
	 * const path2 = Pathist.from('baz.qux');
	 * console.log(path1.concat(path2).toString()); // 'foo.bar.baz.qux'
	 * ```
	 *
	 * @example
	 * Multiple paths
	 * ```typescript
	 * const result = path1.concat('baz', ['qux', 'quux']);
	 * console.log(result.toString()); // 'foo.bar.baz.qux.quux'
	 * ```
	 */
	concat(...paths: Array<Pathist | PathistInput>): Pathist {
		const allSegments: PathSegment[] = [...this.segments];

		for (const path of paths) {
			const segments = Pathist.#toSegments(path);
			if (segments === null) {
				throw new TypeError('Invalid path input: paths must be string, array, or Pathist instance');
			}
			allSegments.push(...segments);
		}

		return Pathist.from(allSegments, this.cloneConfig());
	}

	// ============================================================================
	// Tree/Node Navigation Methods
	// ============================================================================

	/**
	 * Helper: Finds the position of the first numeric index that's part of a tree structure.
	 *
	 * A numeric index is part of a tree if it's either:
	 * - At position 0 (root-level array of nodes), OR
	 * - Preceded by a children property
	 *
	 * @returns The zero-based position of the first tree node index, or -1 if none exists
	 * @private
	 */
	#findFirstNumericIndex(): number {
		for (let i = 0; i < this.segments.length; i++) {
			if (typeof this.segments[i] === 'number') {
				// Root-level index - it's a node
				if (i === 0) {
					return i;
				}

				// Check if preceded by a children property
				if (i > 0) {
					const prevSegment = this.segments[i - 1];
					if (typeof prevSegment === 'string' && this.nodeChildrenProperties.has(prevSegment)) {
						return i;
					}
				}
			}
		}
		return -1;
	}

	/**
	 * Helper: Finds the position of the last node index in a contiguous tree structure.
	 *
	 * Starting from the first numeric index, continues as long as the path follows
	 * the pattern of node children properties followed by numeric indices.
	 *
	 * @param firstIdx - The position of the first numeric index
	 * @returns The zero-based position of the last node index, or -1 if firstIdx is -1
	 * @private
	 */
	#findLastNodeIndex(firstIdx: number): number {
		if (firstIdx === -1) {
			return -1;
		}

		let lastIdx = firstIdx;
		let i = firstIdx + 1;

		while (i < this.segments.length) {
			const segment = this.segments[i];

			if (typeof segment === 'string') {
				// Check if it's a children property followed by numeric
				if (
					i + 1 < this.segments.length &&
					typeof this.segments[i + 1] === 'number' &&
					this.nodeChildrenProperties.has(segment)
				) {
					// This is a children property followed by an index - continue the tree
					lastIdx = i + 1;
					i += 2; // Skip both the property and the index
				} else {
					// Not a children property, or not followed by numeric - tree ends
					break;
				}
			} else {
				// Unexpected numeric without a property before it
				break;
			}
		}

		return lastIdx;
	}

	/**
	 * Returns the numeric index values from the contiguous tree structure.
	 *
	 * Extracts all numeric indices from the tree path, representing the tree path coordinates.
	 *
	 * @returns An array of numeric indices, or an empty array if no tree structure exists
	 *
	 * @example
	 * ```typescript
	 * const path = Pathist.from('items[5].children[1].children[3].name');
	 * console.log(path.nodeIndices()); // [5, 1, 3]
	 *
	 * const path2 = Pathist.from('foo.bar.baz');
	 * console.log(path2.nodeIndices()); // []
	 * ```
	 */
	nodeIndices(): number[] {
		const firstIdx = this.#findFirstNumericIndex();
		if (firstIdx === -1) {
			return [];
		}

		const lastIdx = this.#findLastNodeIndex(firstIdx);
		const values: number[] = [];

		// Collect all numeric values from firstIdx to lastIdx
		for (let i = firstIdx; i <= lastIdx; i++) {
			const segment = this.segments[i];
			if (typeof segment === 'number') {
				values.push(segment);
			}
		}

		return values;
	}

	/**
	 * Generates paths to each successive node in the tree structure.
	 *
	 * Yields the path to each node level, starting with the root (empty path) and
	 * progressively building up through each node in the tree.
	 *
	 * @returns A generator that yields Pathist instances for each node level
	 *
	 * @example
	 * Full tree structure
	 * ```typescript
	 * const path = new Pathist('children[0].children[1].foo');
	 * for (const nodePath of path.nodePaths()) {
	 *   console.log(nodePath.string);
	 * }
	 * // Output:
	 * // ''                            (root)
	 * // 'children[0]'                 (first node)
	 * // 'children[0].children[1]'     (second node)
	 * ```
	 *
	 * @example
	 * Path starting with index
	 * ```typescript
	 * const path = new Pathist('[0].children[1].children[2]');
	 * const paths = [...path.nodePaths()];
	 * // paths = [
	 * //   Pathist('[0]'),
	 * //   Pathist('[0].children[1]'),
	 * //   Pathist('[0].children[1].children[2]')
	 * // ]
	 * ```
	 *
	 * @example
	 * No tree structure - just root
	 * ```typescript
	 * const path = new Pathist('foo.bar');
	 * const paths = [...path.nodePaths()];
	 * // paths = [Pathist('')]
	 * ```
	 */
	*nodePaths(): Generator<Pathist, void, undefined> {
		const firstIdx = this.#findFirstNumericIndex();

		// If no numeric indices, only yield root
		if (firstIdx === -1) {
			yield Pathist.from('', this.cloneConfig());
			return;
		}

		// If path doesn't start with an index, yield root first (following firstNodePath logic)
		if (firstIdx > 0) {
			yield Pathist.from('', this.cloneConfig());
		}

		const lastIdx = this.#findLastNodeIndex(firstIdx);

		// Yield path at each node index
		for (let i = firstIdx; i <= lastIdx; i++) {
			const segment = this.segments[i];
			if (typeof segment === 'number') {
				yield this.slice(0, i + 1);
			}
		}
	}

	/**
	 * Returns the path to the first node.
	 *
	 * - If the path starts with a numeric index, returns the path up to and including that index
	 * - Otherwise, returns an empty path (representing the root node)
	 *
	 * @returns A new Pathist representing the path to the first node
	 *
	 * @see {@link lastNodePath} for extracting the full node path
	 * @see {@link afterNodePath} for extracting the path after all nodes
	 *
	 * @example
	 * Path starting with index
	 * ```typescript
	 * const path = new Pathist('[0].children[1].foo');
	 * console.log(path.firstNodePath().toString()); // '[0]'
	 * ```
	 *
	 * @example
	 * Path starting with property
	 * ```typescript
	 * const path = new Pathist('children[0].children[1].foo');
	 * console.log(path.firstNodePath().toString()); // '' (root)
	 * ```
	 *
	 * @example
	 * Path with no indices
	 * ```typescript
	 * const path = new Pathist('foo.bar');
	 * console.log(path.firstNodePath().toString()); // '' (root)
	 * ```
	 */
	firstNodePath(): Pathist {
		// If path starts with numeric index, return path up to it
		if (this.segments.length > 0 && typeof this.segments[0] === 'number') {
			return this.slice(0, 1);
		}
		// Otherwise root is first node
		return Pathist.from('', this.cloneConfig());
	}

	/**
	 * Returns the full path to the last node in the contiguous tree structure.
	 *
	 * - If the path contains numeric indices, returns the path up to and including the last node
	 * - Otherwise, returns an empty path (representing the root node)
	 *
	 * @returns A new Pathist representing the full node path
	 *
	 * @see {@link firstNodePath} for extracting the path to the first node
	 * @see {@link afterNodePath} for extracting the path after all nodes
	 *
	 * @example
	 * Tree structure
	 * ```typescript
	 * const path = new Pathist('children[0].children[1].foo');
	 * console.log(path.lastNodePath().toString()); // 'children[0].children[1]'
	 * ```
	 *
	 * @example
	 * Path with no indices
	 * ```typescript
	 * const path = new Pathist('foo.bar');
	 * console.log(path.lastNodePath().toString()); // '' (root)
	 * ```
	 */
	lastNodePath(): Pathist {
		const firstIdx = this.#findFirstNumericIndex();
		if (firstIdx === -1) {
			// No indices - root is the node
			return Pathist.from('', this.cloneConfig());
		}

		const lastIdx = this.#findLastNodeIndex(firstIdx);
		return this.slice(0, lastIdx + 1);
	}

	/**
	 * Returns the path segments after the last node in the tree.
	 *
	 * - If the path contains numeric indices, returns the path after the last node
	 * - Otherwise, returns the full path (all segments are relative to the root node)
	 *
	 * @returns A new Pathist containing the segments after the tree structure
	 *
	 * @see {@link lastNodePath} for extracting the full node path
	 * @see {@link firstNodePath} for extracting the path to the first node
	 *
	 * @example
	 * Tree with properties after
	 * ```typescript
	 * const path = new Pathist('children[0].children[1].foo');
	 * console.log(path.afterNodePath().toString()); // 'foo'
	 * ```
	 *
	 * @example
	 * No indices - all relative to root
	 * ```typescript
	 * const path = new Pathist('foo.bar');
	 * console.log(path.afterNodePath().toString()); // 'foo.bar'
	 * ```
	 */
	afterNodePath(): Pathist {
		const firstIdx = this.#findFirstNumericIndex();
		if (firstIdx === -1) {
			// No nodes - entire path is after (relative to root)
			return this.slice();
		}

		const lastIdx = this.#findLastNodeIndex(firstIdx);
		return this.slice(lastIdx + 1);
	}

	/**
	 * Intelligently merges another path with this path by detecting overlapping segments.
	 *
	 * Finds the longest suffix of this path that matches a prefix of the other path,
	 * then combines them by merging at the overlap point. When overlapping segments
	 * include wildcards, concrete values take precedence.
	 *
	 * @param path - The path to merge with this path
	 * @returns A new Pathist instance containing the merged path
	 * @throws {TypeError} If the path input is invalid
	 *
	 * @example
	 * Basic merge with overlap
	 * ```typescript
	 * const left = Pathist.from('foo.bar.baz');
	 * const right = Pathist.from('baz.qux');
	 * console.log(left.merge(right).toString()); // 'foo.bar.baz.qux'
	 * ```
	 *
	 * @example
	 * Merge with wildcard replacement
	 * ```typescript
	 * const left = Pathist.from('foo[*].bar');
	 * const right = Pathist.from('foo[5].bar.baz');
	 * console.log(left.merge(right).toString()); // 'foo[5].bar.baz'
	 * // The wildcard is replaced with the concrete index
	 * ```
	 *
	 * @example
	 * No overlap - simple concatenation
	 * ```typescript
	 * const left = Pathist.from('foo.bar');
	 * const right = Pathist.from('qux.quux');
	 * console.log(left.merge(right).toString()); // 'foo.bar.qux.quux'
	 * ```
	 */
	merge(path: Pathist | PathistInput): Pathist {
		const rightSegments = Pathist.#toSegments(path);
		if (rightSegments === null) {
			throw new TypeError('Invalid path input: path must be string, array, or Pathist instance');
		}

		// If either path is empty, just concatenate
		if (this.segments.length === 0) {
			return Pathist.from([...rightSegments], this.cloneConfig());
		}
		if (rightSegments.length === 0) {
			return Pathist.from([...this.segments], this.cloneConfig());
		}

		// Find the longest overlap: suffix of left path matches prefix of right path
		let overlapLength = 0;
		const maxOverlap = Math.min(this.segments.length, rightSegments.length);

		for (let len = maxOverlap; len > 0; len--) {
			const prefix = rightSegments.slice(0, len);
			const pos = this.lastPositionOf(prefix);

			// Check if the prefix appears at the end of the left path
			if (pos !== -1 && pos === this.segments.length - len) {
				overlapLength = len;
				break;
			}
		}

		// Build the merged segments
		const mergedSegments: PathSegment[] = [...this.segments];

		if (overlapLength > 0) {
			// Replace overlapping wildcards with concrete values
			for (let i = 0; i < overlapLength; i++) {
				const leftSegment = this.segments[this.segments.length - overlapLength + i];
				const rightSegment = rightSegments[i];

				const leftIsWildcard = Pathist.#isWildcard(leftSegment);
				const rightIsWildcard = Pathist.#isWildcard(rightSegment);

				// If right has a concrete value and left has wildcard, use concrete
				if (leftIsWildcard && !rightIsWildcard) {
					mergedSegments[this.segments.length - overlapLength + i] = rightSegment;
				}
			}

			// Add non-overlapping segments from right path
			for (let i = overlapLength; i < rightSegments.length; i++) {
				mergedSegments.push(rightSegments[i]);
			}
		} else {
			// No overlap - just concatenate
			mergedSegments.push(...rightSegments);
		}

		return Pathist.from(mergedSegments, this.cloneConfig());
	}

	// ============================================================================
	// Private Helper Methods
	// ============================================================================

	/**
	 * Helper to propagate config when creating new instances.
	 * @private
	 */
	private cloneConfig(): PathistConfig {
		return {
			notation: this.#notation,
			indices: this.#indices,
			nodeChildrenProperties: this.#nodeChildrenProperties,
		};
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

			if (char === '\\' && i + 1 < input.length && input[i + 1] === '.') {
				// Escaped dot - add literal dot to current segment
				current += '.';
				i += 2; // Skip both backslash and dot
			} else if (char === '[') {
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
					return `["${segment.replaceAll(`"`, `\\"`)}"]`;
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
				return `["${segment.replaceAll(`"`, `\\"`)}"]`;
			})
			.join('');
	}

	private toDotNotation(): string {
		return this.segments
			.map((segment) => {
				if (typeof segment === 'number') {
					return String(segment);
				}
				// Escape dots within segment names so they don't get parsed as separators
				return segment.replaceAll('.', '\\.');
			})
			.join('.');
	}
}

/**
 * The notation style for converting paths to strings.
 *
 * Valid values: `Pathist.Notation.Mixed`, `Pathist.Notation.Dot`, or `Pathist.Notation.Bracket`
 */
export type Notation = (typeof Pathist.Notation)[keyof typeof Pathist.Notation];

/**
 * The mode for handling numeric indices during path comparisons.
 *
 * Valid values: `Pathist.Indices.Preserve` or `Pathist.Indices.Ignore`
 */
export type Indices = (typeof Pathist.Indices)[keyof typeof Pathist.Indices];

/**
 * Options for comparing paths.
 */
export interface ComparisonOptions {
	/**
	 * How to handle numeric indices during comparison.
	 * - `Pathist.Indices.Preserve`: Indices must match exactly
	 * - `Pathist.Indices.Ignore`: Any numeric index matches any other numeric index
	 * @defaultValue The path instance's `indices` setting
	 */
	indices?: Indices;
}
