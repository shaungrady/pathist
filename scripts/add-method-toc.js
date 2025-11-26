#!/usr/bin/env node
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Post-processes TypeDoc markdown files to add a method summary table
 * near the top of class documentation for easier navigation.
 */

const DOCS_DIR = 'docs';
const CLASS_DIR = join(DOCS_DIR, 'classes');

/**
 * Extracts method names and their first line of description from markdown
 */
function extractMethods(content) {
	const methods = [];
	const lines = content.split('\n');

	let currentSection = null;
	let i = 0;

	while (i < lines.length) {
		const line = lines[i];

		// Track which section we're in
		if (line.startsWith('## ')) {
			currentSection = line.substring(3).trim();
		}

		// Only process methods in Methods or Accessors sections
		if ((currentSection === 'Methods' || currentSection === 'Accessors') && line.startsWith('### ')) {
			const methodName = line.substring(4).trim();

			// Skip forward to find description (skip the signature line)
			let description = '';
			let j = i + 1;

			// Skip signature lines (starting with >)
			while (j < lines.length && (lines[j].startsWith('>') || lines[j].trim() === '')) {
				j++;
			}

			// Skip "Defined in:" line
			if (j < lines.length && lines[j].startsWith('Defined in:')) {
				j++;
			}

			// Get the first non-empty line as description
			while (j < lines.length && lines[j].trim() === '') {
				j++;
			}

			if (j < lines.length && !lines[j].startsWith('#') && !lines[j].startsWith('>')) {
				description = lines[j].trim();
				// Remove trailing periods for consistency
				if (description.endsWith('.')) {
					description = description.slice(0, -1);
				}
			}

			// Create anchor-safe ID (GitHub style)
			const anchorId = methodName.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');

			methods.push({
				name: methodName,
				description: description || 'No description',
				anchor: anchorId,
				section: currentSection
			});
		}

		i++;
	}

	return methods;
}

/**
 * Creates a markdown table summarizing all methods
 */
function createMethodTable(methods) {
	if (methods.length === 0) return '';

	const accessors = methods.filter(m => m.section === 'Accessors');
	const regularMethods = methods.filter(m => m.section === 'Methods');

	let table = '## Quick Reference\n\n';

	if (regularMethods.length > 0) {
		table += '### Methods\n\n';
		table += '| Method | Description |\n';
		table += '| ------ | ----------- |\n';

		for (const method of regularMethods) {
			const link = `[${method.name}](#${method.anchor})`;
			table += `| ${link} | ${method.description} |\n`;
		}

		table += '\n';
	}

	if (accessors.length > 0) {
		table += '### Accessors\n\n';
		table += '| Accessor | Description |\n';
		table += '| -------- | ----------- |\n';

		for (const accessor of accessors) {
			const link = `[${accessor.name}](#${accessor.anchor})`;
			table += `| ${link} | ${accessor.description} |\n`;
		}

		table += '\n';
	}

	return table;
}

/**
 * Inserts the method table after the class description
 */
function insertMethodTable(content, table) {
	const lines = content.split('\n');
	let insertIndex = -1;

	// Find the best place to insert - after the class description but before first ## heading
	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];

		// Look for the first ## heading (Examples, Constructors, etc.)
		if (line.startsWith('## ')) {
			insertIndex = i;
			break;
		}
	}

	if (insertIndex === -1) return content;

	// Insert the table before the first section
	lines.splice(insertIndex, 0, table);

	return lines.join('\n');
}

/**
 * Process a single class documentation file
 */
function processClassFile(filePath) {
	const content = readFileSync(filePath, 'utf-8');

	// Check if this file already has a Quick Reference section
	if (content.includes('## Quick Reference')) {
		// Remove the old one first
		const lines = content.split('\n');
		const filteredLines = [];
		let inQuickRef = false;

		for (const line of lines) {
			if (line === '## Quick Reference') {
				inQuickRef = true;
				continue;
			}
			if (inQuickRef && line.startsWith('## ') && line !== '## Quick Reference') {
				inQuickRef = false;
			}
			if (!inQuickRef) {
				filteredLines.push(line);
			}
		}

		const cleanedContent = filteredLines.join('\n');
		const methods = extractMethods(cleanedContent);

		if (methods.length === 0) {
			return; // No methods to document
		}

		const table = createMethodTable(methods);
		const newContent = insertMethodTable(cleanedContent, table);

		writeFileSync(filePath, newContent, 'utf-8');
		console.log(`✓ Updated ${filePath}`);
	} else {
		const methods = extractMethods(content);

		if (methods.length === 0) {
			return; // No methods to document
		}

		const table = createMethodTable(methods);
		const newContent = insertMethodTable(content, table);

		writeFileSync(filePath, newContent, 'utf-8');
		console.log(`✓ Added method table to ${filePath}`);
	}
}

/**
 * Main execution
 */
function main() {
	try {
		const files = readdirSync(CLASS_DIR);

		for (const file of files) {
			if (file.endsWith('.md')) {
				const filePath = join(CLASS_DIR, file);
				processClassFile(filePath);
			}
		}

		console.log('\n✅ Method tables added successfully!');
	} catch (error) {
		console.error('Error processing documentation:', error);
		process.exit(1);
	}
}

main();
