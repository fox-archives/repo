import * as fs from "https://deno.land/std@0.125.0/fs/mod.ts";

import * as util from "../util/util.ts";

export const name = "Deno";
export const description = "Lints deno.json files";
export const onFiles = [
	{
		files: ["deno.json"],
		async fn(entry: fs.WalkEntry) {
			const text = await Deno.readTextFile(entry.path);
			const jsonObj = JSON.parse(text);

			if (!jsonObj.fmt) {
				util.logMissingProperty("fmt");
				return;
			}

			if (!jsonObj.fmt.options) {
				util.logMissingProperty("fmt.options");
				return;
			}

			const fmtOptions = jsonObj.fmt.options;

			if (fmtOptions.indentWidth !== 3) {
				util.logWrongPropertyValue("fmt.options", 3);
			}

			if (fmtOptions.useTabs !== true) {
				util.logWrongPropertyValue("fmt.useTabs", true);
			}
		},
	},
];
