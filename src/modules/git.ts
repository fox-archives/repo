import { fs } from "../deps.ts";

import * as util from "../util/util.ts";

function hasFoxomateDeclaration(line: string, value = "") {
	return line.match(new RegExp(`^(?:#|//)[ \t]*foxomate[ \t]*${value}`));
}

export const name = "Git";
export const description = "Checks .gitattributes file";
export const init = async () => {
	await fs.ensureFile(".gitattributes");
};
export const onFiles = [
	{
		files: [".gitattributes"],
		async fn(opts: util.Opts, entry: fs.WalkEntry) {
			const text = await Deno.readTextFile(entry.path);

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
			await util.writeFile(opts, entry.path, newlines.join("\n"));
		},
	},
];
