import * as fs from "https://deno.land/std@0.125.0/fs/mod.ts";

// TODO: insert 'auto eof etc. in gitattriutes as well as
// linguist-generated for 'bake' file

export const name = "Git";
export const description = "Checks .gitattributes file";
export const onFilesHooks = [
	{
		files: ["package.json"],
		fn(entry: fs.WalkEntry) {},
	},
];
