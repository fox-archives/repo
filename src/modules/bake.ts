import { fs } from "../deps.ts";

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
