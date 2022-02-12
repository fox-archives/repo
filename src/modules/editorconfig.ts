#!/usr/bin/env node
import * as fs from "https://deno.land/std@0.125.0/fs/mod.ts";
import * as path from "https://deno.land/std@0.125.0/path/mod.ts";

import * as util from "../util/util.ts";

export function ensureEditorconfigKeyValue(
	text: string,
	glob: string,
	key: string,
	value: string
) {
	if (!text.match(new RegExp(""))) {
		util.logError(`For glob '${glob}', key '${key}' must be set to '${value}`);
	}
}

/**
 * @description Ensures a particular key is _not set_. It does not
 * cover cases in which keys are *literally* set to 'unset'
 */
export function ensureEditorconfigKeyNotSet(
	lines: string[],
	glob: string,
	key: string
) {
	let currentGlob = "";
	for (const line in lines) {
		if (line === `[${glob}]`) {
			currentGlob = glob;
			continue;
		}

		if (currentGlob == glob) {
			if (line.includes(key)) {
				util.logError(
					`For glob ${glob}, key ${key} must be unset. (not even set to the value 'unset')`
				);
			}
		}
	}
}

// TODO ensure sorting

export const name = "Deno";
export const description = "Lint deno.json";
export const onFiles = [
	{
		files: [".editorconfig"],
		async fn(entry: fs.WalkEntry) {
			const text = await Deno.readTextFile(entry.path);
			const lines = text.split("\n");

			if (lines[0] != "root = true") {
				util.logError("Must have declaration 'root = true' at top of file");
			}

			ensureEditorconfigKeyValue(text, "*", "indent-style", "tab");
			ensureEditorconfigKeyNotSet(lines, "*", "indent-size");
			ensureEditorconfigKeyNotSet(lines, "*", "tab-width");
			ensureEditorconfigKeyValue(text, "*", "end_of_line", "lf");
			ensureEditorconfigKeyValue(text, "*", "charset", "utf-8");
			ensureEditorconfigKeyValue(text, "*", "trim_trailing_whitespace", "true");
			ensureEditorconfigKeyValue(text, "*", "insert_final_newline", "true");
			ensureEditorconfigKeyNotSet(lines, "*", "max_line_length");

			let rowIndex = 1;
			let columnIndex = 1;
			for (let j = 1; j < text.length - 1; ++j) {
				const char = text[j];
				const previousChar = text[j - 1];
				const nextChar = text[j + 1];

				if (char === "\n") {
					columnIndex = 0;
					rowIndex++;
				} else {
					columnIndex++;
				}

				switch (char) {
					case "[":
						if (previousChar !== "\n") {
							util.printLineError(
								rowIndex,
								columnIndex,
								"required-newline-before-start-bracket",
								"Newline before starting brackets is required"
							);
						}

						if (nextChar === " " || nextChar === "\t") {
							util.printLineError(
								rowIndex,
								columnIndex,
								"no-whitespace-after-start-bracket",
								"Whitespace after starting brackets is prohibited"
							);
						}
						break;
					case "]":
						if (previousChar === " " || previousChar === "\t") {
							util.printLineError(
								rowIndex,
								columnIndex,
								"no-whitespace-before-end-bracket",
								"Whitespace before ending brackets is prohibited"
							);
						}

						if (nextChar !== "\n") {
							util.printLineError(
								rowIndex,
								columnIndex,
								"required-newline-after-end-bracket",
								"Newline after ending brackets is required"
							);
						}
						break;
					case "=":
						if (previousChar !== " ") {
							util.printLineError(
								rowIndex,
								columnIndex,
								"required-space-before-equals",
								"Space before equals sign is required"
							);
						}

						if (nextChar !== " ") {
							util.printLineError(
								rowIndex,
								columnIndex,
								"required-space-after-equals",
								"Space after equals sign is required"
							);
						}
						break;
					case "\n":
						if (nextChar === " " || nextChar === "\t") {
							util.printLineError(
								rowIndex,
								columnIndex,
								"no-whitespace-after-newline",
								"Whitespace after newline is prohibited"
							);
						}
						break;
					default:
						break;
				}
			}
		},
	},
];
