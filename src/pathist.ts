type PathSegment = string | number;
type PathInput = string | PathSegment[];

export class Pathist {
	static readonly Notation = {
		Mixed: 'mixed',
		Dot: 'dot',
		Bracket: 'bracket',
	} as const;

	static #defaultNotation: Notation = Pathist.Notation.Mixed;

	static get defaultNotation(): Notation {
		return Pathist.#defaultNotation;
	}

	static set defaultNotation(notation: Notation) {
		Pathist.#defaultNotation = notation;
	}

	private readonly segments: ReadonlyArray<PathSegment>;
	private readonly stringCache: Map<Notation, string> = new Map();

	constructor(input: PathInput) {
		if (typeof input === 'string') {
			this.segments = this.parseString(input);
		} else {
			this.validateArray(input);
			// Create a copy to ensure immutability
			this.segments = [...input];
		}
	}

	toArray(): PathSegment[] {
		// Return a copy to maintain immutability
		return [...this.segments];
	}

	get array(): PathSegment[] {
		return this.toArray();
	}

	toString(notation: Notation = Pathist.defaultNotation): string {
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
				// String segment
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
				return `["${segment}"]`;
			})
			.join('');
	}

	private toDotNotation(): string {
		return this.segments.join('.');
	}
}

export type Notation = (typeof Pathist.Notation)[keyof typeof Pathist.Notation];
