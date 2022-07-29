import { fs, asserts } from "../deps.ts";

import * as util from "../util/util.ts";
import * as types from "../types.ts";
import type { Notices } from "../util/Notices.ts";

export type GitAttributeLine = {
	comment?: string;
	newline?: true;
	pattern?: string;
	attributes?: Record<string, boolean | string>;
};

export function parseGitattributes(text: string) {
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
				util.die(
					"Parsing C-style comments in Gitignore files is not supported"
				);
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

export function separateGitattributes(
	lines: GitAttributeLine[],
	myNotices: InstanceType<typeof Notices>
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
					myNotices.add("bad-block", {
						description:
							"End declaration cannot come before starting declaration",
					});
				} else if (line.comment === "# foxxy start") {
					mode = "take-foxomate";
				} else if (line.comment === "# foxxy end") {
					myNotices.add("bad-block", {
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
