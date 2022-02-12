import * as fs from "https://deno.land/std@0.125.0/fs/mod.ts";

import * as util from "../util/util.ts";

export const name = "bake";
export const description = "Lints Bakefiles";
export const onFiles = [
	{
		files: ["Bakefile.sh"],
		async fn(entry: fs.WalkEntry) {
			const text = await Deno.readTextFile(entry.path);
			for (const line of text.split("\n")) {
				if (line.includes("task.fmt()")) {
					util.logError("Use task.format() instead of task.fmt()");
				}
			}
		},
	},
];
