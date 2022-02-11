import * as fs from "https://deno.land/std@0.125.0/fs/mod.ts";

import * as log from "../util/log.ts";

export const name = "bake";
export const description = "Parses Bakefile.sh scripts for errors";
// export const onAlwaysHook =
export const onFilesHooks = [
	{
		files: ["Bakefile.sh"],
		async fn(entry: fs.WalkEntry) {
			const text = await Deno.readTextFile(entry.path);
			for (const line of text.split("\n")) {
				if (line.includes("task.fmt()")) {
					log.error("Please use task.format instead of task.fmt");
				}
			}
		},
	},
];
