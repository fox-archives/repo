import { fs, asserts } from "../deps.ts";

import * as util from "../util/util.ts";
import * as types from "../types.ts";

import {
	parseGitattributes,
	separateGitattributes,
	GitAttributeLine,
} from "../parsers/gitattributes.ts";

export const module: types.FoxModule = {
	id: "git",
	name: "Git",
	activateOn: {
		ecosystem: "any",
		form: "any",
	},
	triggers: {
		async onInitial(opts: types.foxLintArgs) {
			if (opts.fix) {
				await fs.ensureFile(".gitattributes");
			}

			const text = await Deno.readTextFile(".gitattributes");
			const parsed = parseGitattributes(text);
			const notices: types.NoticeReturn[] = [];
			const { foxxyAttributes, otherAttributes } = separateGitattributes(
				parsed,
				notices
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
				notices.push({
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
					notices.push({
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
						notices.push({
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

			return notices;
		},
	},
};
