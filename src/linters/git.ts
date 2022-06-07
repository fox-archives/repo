import { fs } from "../deps.ts";

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
			await fs.ensureFile(".gitattributes");

			// TODO: sort all gitattributes, but only foxomate start the root one
			const text = await Deno.readTextFile(".gitattributes");

			let linesFoxomate = [];
			const linesOther = [];

			let foxomateStart = false;
			for (const line of text.split("\n")) {
				if (line.includes("glue")) {
					util.logInfo(
						"Should not have any references to 'glue' in Gitattributes file"
					);
				}

				if (line === "* text=auto") {
					util.logInfo("Please use '* text=auto eol=lf");
				}

				if (hasFoxomateDeclaration(line, "start")) {
					foxomateStart = true;
					continue;
				} else if (hasFoxomateDeclaration(line, "end")) {
					foxomateStart = false;
					continue;
				} else if (hasFoxomateDeclaration(line)) {
					util.logInfo(`Declaration not recognized: $line`);
				}

				if (foxomateStart) {
					linesFoxomate.push(line);
				} else {
					linesOther.push(line);
				}
			}

			linesFoxomate.push("* text=auto eol=lf");
			linesFoxomate.push("bake linguist-generated");
			linesFoxomate = Array.from(new Set(linesFoxomate)); // remove duplicates
			linesFoxomate = linesFoxomate.sort((a, b) => a.localeCompare(b));
			linesFoxomate.splice(0, 0, "# foxomate start");
			linesFoxomate.push("# foxomate end");

			// If duplicates are found outside of the 'foxomate' block remove them
			for (let i = 0; i < linesOther.length; ++i) {
				if (linesFoxomate.includes(linesOther[i])) {
					linesOther.splice(i, 1);
				}
			}

			const newlines = Array.prototype.concat(linesFoxomate).concat(linesOther);
			await util.writeFile(opts, ".gitattributes", newlines.join("\n"));
		},
	},
};

function hasFoxomateDeclaration(line: string, value = "") {
	return line.match(new RegExp(`^(?:#|//)[ \t]*foxomate[ \t]*${value}`));
}
