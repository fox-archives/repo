import { fs, asserts } from "../deps.ts";

import * as util from "../util/util.ts";
import * as types from "../types.ts";

export default {
	id: "git",
	name: "Git",
	activateOn: {
		ecosystem: "ALL",
		form: "ALL",
	},
	triggers: {
		async onInitial(opts: types.ModuleOptions) {
			const problems: types.LintRule[] = [];

			if (opts.fix) {
				await fs.ensureFile(".gitattributes");
			}

			const text = await Deno.readTextFile(".gitattributes");
			const parsed = parseGitattributes(text);
			const { foxxyAttributes, otherAttributes } = separateGitattributes(
				parsed,
				problems
			);

			const finalFoxxyAttributes: GitAttributeLine[] = [
				{
					pattern: "*",
					attributes: {
						text: "auto",
						eol: "lf",
					},
				},
				{
					pattern: "bake",
					attributes: {
						"linguist-generated": true,
					},
				},
			];

			if (asserts.equal(foxxyAttributes, finalFoxxyAttributes)) {
				problems.push({
					name: "outdated-foxxy-attributes",
					description: "The automatically generated attributes are out of date",
				});
			}

			for (const finalFoxxyAttribute of finalFoxxyAttributes) {
				const present = ((): number => {
					for (let i = 0; i < otherAttributes.length; ++i) {
						const item = otherAttributes[i];
						if (asserts.equal(item, finalFoxxyAttribute)) {
							return i;
						}
					}
					return -1;
				})();

				if (present !== -1) {
					problems.push({
						name: "duplicated attributes",
						description:
							"An automatically generated attribute duplicates with an already existing one",
					});
					otherAttributes.splice(present, 1);
				}
			}

			const finalAttributes: GitAttributeLine[] = [
				{ comment: "# foxxy start" },
				...finalFoxxyAttributes,
				{ comment: "# foxxy end" },
				{
					newline: true,
				},
				...otherAttributes,
			];

			for (const finalAttribute of finalAttributes) {
				if (finalAttribute.pattern && finalAttribute.attributes) {
					if (finalAttribute.pattern.includes("glue")) {
						problems.push({
							name: "has-old-glue",
							description: "Should not have references to 'glue",
						});
					}
				}
			}

			// Remove duplicate newlines
			for (let i = finalAttributes.length - 1; i > 0; --i) {
				const item = finalAttributes[i];
				const nextItem = finalAttributes[i - 1];

				if (item.newline && nextItem.newline) {
					finalAttributes.splice(i, 1);
				}
			}
			if (finalAttributes.at(-1)?.newline) {
				finalAttributes.splice(-1, 1);
			}

			let finalText = "";
			for (const finalAttribute of finalAttributes) {
				if (finalAttribute.newline) {
					finalText += "\n";
				} else if (finalAttribute.comment) {
					finalText += finalAttribute.comment + "\n";
				} else if (finalAttribute.pattern && finalAttribute.attributes) {
					finalText += finalAttribute.pattern + " ";
					for (const [attrKey, attrValue] of Object.entries(
						finalAttribute.attributes
					)) {
						if (attrValue === true) {
							finalText += attrKey + " ";
						} else if (attrValue === false) {
							finalText += "-" + attrKey + " ";
						} else {
							finalText += attrKey + "=" + attrValue + " ";
						}
					}
					finalText += "\n";
				}
			}
			if (opts.fix) {
				await Deno.writeTextFile(".gitattributes", finalText);
			}
		},
	},
};

type GitAttributeLine = {
	comment?: string;
	newline?: true;
	pattern?: string;
	attributes?: Record<string, boolean | string>;
};

function parseGitattributes(text: string) {
	const lines: GitAttributeLine[] = [];

	for (const line of text.split("\n")) {
		if (line.length == 0) {
			lines.push({ newline: true });
			continue;
		}

		if (line.at(0) === "#") {
			lines.push({ comment: line });
		} else {
			const trimmedLine = line.trim();
			if (trimmedLine.at(0) === '"') {
				util.die("C-style commented patterns are not supported"); // FIXME
			}
			const [pattern, ...attributes] = trimmedLine
				.replace(/\s+/g, " ")
				.split(" ");
			const attrs: Record<string, boolean | string> = {};
			for (const attribute of attributes) {
				if (attribute.includes("=")) {
					const pair = attribute.split("=");
					attrs[pair[0]] = pair[1];
				} else if (attribute.at(0) == "-") {
					attrs[attribute.slice(1)] = false;
				} else {
					attrs[attribute] = true;
				}
			}
			lines.push({ pattern, attributes: attrs });
		}
	}

	return lines;
}

function separateGitattributes(
	lines: GitAttributeLine[],
	problems: types.LintRule[]
) {
	const foxxyAttributes: GitAttributeLine[] = [];
	const otherAttributes: GitAttributeLine[] = [];

	let mode: "default" | "take-foxomate" = "default";
	for (const line of lines) {
		if (line.comment) {
			if (mode === "default") {
				if (line.comment === "# foxomate start") {
					mode = "take-foxomate";
				} else if (line.comment === "# foxomate end") {
					problems.push({
						name: "bad-block",
						description:
							"End declaration cannot come before starting declaration",
					});
				} else if (line.comment === "# foxxy start") {
					mode = "take-foxomate";
				} else if (line.comment === "# foxxy end") {
					problems.push({
						name: "bad-block",
						description:
							"End declaration cannot come before starting declaration",
					});
				} else {
					otherAttributes.push(line);
				}
			} else if (mode === "take-foxomate") {
				if (line.comment === "# foxomate end") {
					mode = "default";
				} else if (line.comment === "# foxxy end") {
					mode = "default";
				} else {
					foxxyAttributes.push(line);
				}
			}
		} else if (line.pattern && line.attributes) {
			if (mode === "default") {
				otherAttributes.push(line);
			} else if (mode === "take-foxomate") {
				foxxyAttributes.push(line);
			}
		} else if (line.newline) {
			if (mode === "default") {
				otherAttributes.push(line);
			} else if (mode === "take-foxomate") {
				foxxyAttributes.push(line);
			}
		} else {
			throw new Error("An attribute unaccounted for was detected");
		}
	}

	return { foxxyAttributes, otherAttributes };
}

function hasFoxomateDeclaration(line: string, value = "") {
	return line.match(new RegExp(`^(?:#|//)[ \t]*foxomate[ \t]*${value}`));
}
