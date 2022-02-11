import * as fs from "https://deno.land/std@0.125.0/fs/mod.ts";

// TODO: insert 'auto eof etc. in gitattriutes as well as
// linguist-generated for 'bake' file

export function moduleGitattributes() {
	return {
		name: "Git Attributes",
		description: "Checks .gitattributes file",
		hooksFile: [
			{
				files: ["package.json"],
				fn(entry: fs.WalkEntry) {},
			},
		],
	};
}
