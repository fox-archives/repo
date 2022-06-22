import { fs, asserts } from "../deps.ts";

import * as util from "../util/util.ts";
import * as types from "../types.ts";

export { module };
const module: types.FoxModule = {
	id: "editorconfig",
	name: "EditorConfig",
	activateOn: {
		ecosystem: "any",
		form: "any",
	},
	triggers: {
		async onInitial(opts: types.foxLintArgs) {
			if (opts.fix) {
				await fs.ensureFile(".editorconfig");
			}

			// const content = await Deno.readTextFile(".editorconfig");
			// if (content.trim().length == 0) {
			// 	throw new Error(".editorconfig file cannot be empty"); // FIXME
			// }
		},
	},
};

// export const name = "Deno";
// export const description = "Lint deno.json";
// export const onFiles = [
// 	{
// 		files: [".editorconfig"],
// 		async fn(opts: util.Opts, entry: fs.WalkEntry) {
// 			const text = await Deno.readTextFile(entry.path);
// 			const lines = text.split("\n");

// 			if (lines[0] != "root = true") {
// 				util.logInfo("Must have declaration 'root = true' at top of file");
// 			}

// 			if (lines[2] != "[*]") {
// 				util.logInfo("Must have specifier '[*]' on third line");
// 			}

// 			ensureEditorconfigKeyValue(lines, "*", "indent-style", "tab");
// 			ensureEditorconfigKeyNotSet(lines, "*", "indent-size");
// 			ensureEditorconfigKeyNotSet(lines, "*", "tab-width");
// 			ensureEditorconfigKeyValue(lines, "*", "end_of_line", "lf");
// 			ensureEditorconfigKeyValue(lines, "*", "charset", "utf-8");
// 			ensureEditorconfigKeyValue(
// 				lines,
// 				"*",
// 				"trim_trailing_whitespace",
// 				"true"
// 			);
// 			ensureEditorconfigKeyValue(lines, "*", "insert_final_newline", "true");
// 			ensureEditorconfigKeyNotSet(lines, "*", "max_line_length");

// 			let rowIndex = 1;
// 			let columnIndex = 1;
// 			for (let j = 1; j < text.length - 1; ++j) {
// 				const char = text[j];
// 				const previousChar = text[j - 1];
// 				const nextChar = text[j + 1];

// 				if (char === "\n") {
// 					columnIndex = 0;
// 					rowIndex++;
// 				} else {
// 					columnIndex++;
// 				}

// 				switch (char) {
// 					case "[":
// 						if (previousChar !== "\n") {
// 							util.printLineError(
// 								rowIndex,
// 								columnIndex,
// 								"required-newline-before-start-bracket",
// 								"Newline before starting brackets is required"
// 							);
// 						}

// 						if (nextChar === " " || nextChar === "\t") {
// 							util.printLineError(
// 								rowIndex,
// 								columnIndex,
// 								"no-whitespace-after-start-bracket",
// 								"Whitespace after starting brackets is prohibited"
// 							);
// 						}
// 						break;
// 					case "]":
// 						if (previousChar === " " || previousChar === "\t") {
// 							util.printLineError(
// 								rowIndex,
// 								columnIndex,
// 								"no-whitespace-before-end-bracket",
// 								"Whitespace before ending brackets is prohibited"
// 							);
// 						}

// 						if (nextChar !== "\n") {
// 							util.printLineError(
// 								rowIndex,
// 								columnIndex,
// 								"required-newline-after-end-bracket",
// 								"Newline after ending brackets is required"
// 							);
// 						}
// 						break;
// 					case "=":
// 						if (previousChar !== " ") {
// 							util.printLineError(
// 								rowIndex,
// 								columnIndex,
// 								"required-space-before-equals",
// 								"Space before equals sign is required"
// 							);
// 						}

// 						if (nextChar !== " ") {
// 							util.printLineError(
// 								rowIndex,
// 								columnIndex,
// 								"required-space-after-equals",
// 								"Space after equals sign is required"
// 							);
// 						}
// 						break;
// 					case "\n":
// 						if (nextChar === " " || nextChar === "\t") {
// 							util.printLineError(
// 								rowIndex,
// 								columnIndex,
// 								"no-whitespace-after-newline",
// 								"Whitespace after newline is prohibited"
// 							);
// 						}
// 						break;
// 					default:
// 						break;
// 				}
// 			}
// 		},
// 	},
// ];

// export function ensureEditorconfigKeyValue(
// 	lines: string[],
// 	glob: string,
// 	key: string,
// 	value: string
// ) {
// 	let currentGlob = "";
// 	let foundMatch = false;
// 	for (const line of lines) {
// 		if (line === `[${glob}]`) {
// 			if (currentGlob !== "" && !foundMatch) {
// 				util.logInfo(
// 					`For glob ${glob}, key ${key} must have value of ${value}')`
// 				);
// 			}

// 			currentGlob = glob;
// 			continue;
// 		}

// 		if (currentGlob == glob) {
// 			if (line.match(new RegExp(`^[ \t]*${key}[ \t]*=[ \t]*${value}`))) {
// 				foundMatch = true;
// 			}
// 		}
// 	}
// }

// /**
//  * @description Ensures a particular key is _not set_. It does not
//  * cover cases in which keys are *literally* set to 'unset'
//  */
// export function ensureEditorconfigKeyNotSet(
// 	lines: string[],
// 	glob: string,
// 	key: string
// ) {
// 	let currentGlob = "";
// 	for (const line of lines) {
// 		if (line === `[${glob}]`) {
// 			currentGlob = glob;
// 			continue;
// 		}

// 		if (currentGlob == glob) {
// 			if (line.includes(key)) {
// 				util.logInfo(
// 					`For glob ${glob}, key ${key} must be unset. (not even set to the value 'unset')`
// 				);
// 			}
// 		}
// 	}
// }
