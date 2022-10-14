import { fs, asserts } from "../deps.ts";

import * as util from "../util/util.ts";
import * as types from "../types.ts";
import { Notices } from "../util/Notices.ts";

import {
	parseGitattributes,
	separateGitattributes,
	GitAttributeLine,
} from "../parsers/gitattributes.ts";

const LINTER_ID = "git";

export const module: types.FoxModule = {
	id: LINTER_ID,
	name: "Git",
	activateOn: {
		ecosystem: "any",
		form: "any",
	},
	triggers: {
		async onInitial(opts: types.foxLintArgs) {
			const myNotices = new Notices(LINTER_ID);

			if (opts.fix) {
				await fs.ensureFile(".gitattributes");
			}

			const text = await Deno.readTextFile(".gitattributes");
			const parsed = parseGitattributes(text);

			const { foxxoAttributes, otherAttributes } = separateGitattributes(
				parsed,
				myNotices
			);

			const finalFoxxoAttributes: GitAttributeLine[] = [
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

			if (asserts.equal(foxxoAttributes, finalFoxxoAttributes)) {
				myNotices.add("outdated-foxxo-attributes", {
					description: "The automatically generated attributes are out of date",
				});
			}

			for (const finalFoxxoAttribute of finalFoxxoAttributes) {
				const present = ((): number => {
					for (let i = 0; i < otherAttributes.length; ++i) {
						const item = otherAttributes[i];
						if (asserts.equal(item, finalFoxxoAttribute)) {
							return i;
						}
					}
					return -1;
				})();

				if (present !== -1) {
					myNotices.add("duplicated attributes", {
						description:
							"An automatically generated attribute duplicates with an already existing one",
					});
					otherAttributes.splice(present, 1);
				}
			}

			const finalAttributes: GitAttributeLine[] = [
				{ comment: "# foxxo start" },
				...finalFoxxoAttributes,
				{ comment: "# foxxo end" },
				{
					newline: true,
				},
				...otherAttributes,
			];

			for (const finalAttribute of finalAttributes) {
				if (finalAttribute.pattern && finalAttribute.attributes) {
					if (finalAttribute.pattern.includes("glue")) {
						myNotices.add("has-old-glue", {
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
					finalText += finalAttribute.comment.trimEnd() + "\n";
				} else if (finalAttribute.pattern && finalAttribute.attributes) {
					let line = finalAttribute.pattern + " ";
					for (const [attrKey, attrValue] of Object.entries(
						finalAttribute.attributes
					)) {
						if (attrValue === true) {
							line += attrKey + " ";
						} else if (attrValue === false) {
							line += "-" + attrKey + " ";
						} else {
							line += attrKey + "=" + attrValue + " ";
						}
					}
					finalText += line.trimEnd() + "\n";
				}
			}
			if (opts.fix) {
				await Deno.writeTextFile(".gitattributes", finalText);
			}
		},
	},
};
