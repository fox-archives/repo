#!/usr/bin/env node
import * as path from "https://deno.land/std@0.125.0/path/mod.ts";

export function moduleDeno() {
	return {
		name: "Deno",
		description: "For deno projects",
		hooksFile: [
			{
				files: [".editorconfig"],
				async fn() {
					const editorConfigFile = ".editorconfig";
					// Use file ending of underscore to match [*]
					const filePath = path.join(path.dirname(editorConfigFile), "_._");

					const result = await editorconfig.parseFromFiles(
						filePath,
						Promise.resolve([
							{
								name: editorConfigFile,
								contents: await Deno.readTextFile(editorConfigFile),
							},
						])
					);

					if (result.indent_style !== "tab") {
						printError(
							0,
							0,
							"default-indent-style",
							"Default indent_style must be set to tab"
						);
					}
					if (result.indent_size !== "unset") {
						printError(
							0,
							0,
							"default-indent-size",
							"Default indent_style must be unset"
						);
					}
					if (result.tab_width !== void 0) {
						printError(
							0,
							0,
							"default-tab-width",
							"Default tab_width must not be set"
						);
					}
					if (result.end_of_line !== "lf") {
						printError(
							0,
							0,
							"default-end-of-line",
							"Default end_of_line must be 'lf'"
						);
					}
					if (result.charset !== "utf-8") {
						printError(
							0,
							0,
							"default-charset",
							"Default charset must be set to 'utf-8'"
						);
					}
					if (result.trim_trailing_whitespace !== true) {
						printError(
							0,
							0,
							"default-trim_trailing-whitespace",
							"Default trim_trailing_whitespace must be set to 'true'"
						);
					}
					if (result.insert_final_newline !== true) {
						printError(
							0,
							0,
							"default-insert-final-newline",
							"Default insert_final_newline must be set to 'true'"
						);
					}

					// Read File
					const editorConfigFileContents = await Deno.readTextFile(
						editorConfigFile
					);

					// Start linting

					if (editorConfigFileContents.slice(0, 11) !== "root = true") {
						printError(
							0,
							0,
							"required-top-level-root-true",
							"The first 11 characters must be `root = true`"
						);
					}

					let rowIndex = 1;
					let columnIndex = 1;
					for (let j = 1; j < editorConfigFileContents.length - 1; ++j) {
						const char = editorConfigFileContents[j];
						const previousChar = editorConfigFileContents[j - 1];
						const nextChar = editorConfigFileContents[j + 1];

						if (char === "\n") {
							columnIndex = 0;
							rowIndex++;
						} else {
							columnIndex++;
						}

						switch (char) {
							case "[":
								if (previousChar !== "\n") {
									printError(
										rowIndex,
										columnIndex,
										"required-newline-before-start-bracket",
										"Newline before starting brackets is required"
									);
								}

								if (nextChar === " " || nextChar === "\t") {
									printError(
										rowIndex,
										columnIndex,
										"no-whitespace-after-start-bracket",
										"Whitespace after starting brackets is prohibited"
									);
								}
								break;
							case "]":
								if (previousChar === " " || previousChar === "\t") {
									printError(
										rowIndex,
										columnIndex,
										"no-whitespace-before-end-bracket",
										"Whitespace before ending brackets is prohibited"
									);
								}

								if (nextChar !== "\n") {
									printError(
										rowIndex,
										columnIndex,
										"required-newline-after-end-bracket",
										"Newline after ending brackets is required"
									);
								}
								break;
							case "=":
								if (previousChar !== " ") {
									printError(
										rowIndex,
										columnIndex,
										"required-space-before-equals",
										"Space before equals sign is required"
									);
								}

								if (nextChar !== " ") {
									printError(
										rowIndex,
										columnIndex,
										"required-space-after-equals",
										"Space after equals sign is required"
									);
								}
								break;
							case "\n":
								if (nextChar === " " || nextChar === "\t") {
									printError(
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

					/**
					 * @param {number} rowIndex
					 * @param {number} columnIndex
					 * @param {string} code
					 * @param {string} summary
					 */
					function printError(
						rowIndex: number,
						columnIndex: number,
						code: string,
						summary: string
					) {
						if (formatter === "unix") {
							console.log(
								`${editorConfigFile}:${rowIndex}:${columnIndex}: ${summary}. [Error/${code}]`
							);
						} else if (formatter === "visualstudio") {
							console.log(
								`${editorConfigFile}(${rowIndex},${columnIndex}): error ${code} : ${summary}.`
							);
						}
					}
				},
			},
		],
	};
}
