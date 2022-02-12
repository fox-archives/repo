import * as fs from "https://deno.land/std@0.125.0/fs/mod.ts";
import * as toml from "https://deno.land/std@0.125.0/encoding/toml.ts";

import * as util from "../util/util.ts";

// TODO: test to ensure the following do or do not have || exit prepended

export const name = "Basalt";
export const description = "For Basalt projects";
export const onFilesHooks = [
	{
		files: ["basalt.toml"],
		async fn(entry: fs.WalkEntry) {
			util.logInfo(`Running for file ${entry.path}`);

			const text = await Deno.readTextFile(entry.path);
			const json = toml.parse(text);
			const pkg = json.package as Record<string, any>;

			if (!pkg) {
				util.logError("There should be a 'package' entry");
				return;
			}

			if (!pkg.type) {
				util.logError("There should be a 'package.type' entry");
			}

			if (!pkg.name) {
				util.logError("There should be a 'package.name' entry");
			}

			if (!pkg.slug) {
				util.logError("There should be a 'package.slug' entry");
			}

			if (!pkg.version) {
				util.logError("There should be a 'package.version' entry");
			}

			if (!pkg.authors) {
				util.logError("There should be an 'package.authors' entry");
			}

			if (!pkg.description) {
				util.logError("There should be a 'package.descriptions' entry");
			}
		},
	},
];
