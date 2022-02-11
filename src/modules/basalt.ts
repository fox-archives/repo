import * as fs from "https://deno.land/std@0.125.0/fs/mod.ts";
import * as toml from "https://deno.land/std@0.125.0/encoding/toml.ts";

import * as log from "../util/log.ts";

// TODO: test to ensure the following do or do not have || exit prepended

export const name = "Basalt";
export const description = "For Basalt projects";
export const onFilesHooks = [
	{
		files: ["basalt.toml"],
		async fn(entry: fs.WalkEntry) {
			log.info(`Running for file ${entry.path}`);

			const text = await Deno.readTextFile(entry.path);
			const json = toml.parse(text);
			const pkg = json.package as Record<string, any>;

			if (!pkg) {
				log.error("There should be a 'package' entry");
				return;
			}

			if (!pkg.type) {
				log.error("There should be a 'package.type' entry");
			}

			if (!pkg.name) {
				log.error("There should be a 'package.name' entry");
			}

			if (!pkg.slug) {
				log.error("There should be a 'package.slug' entry");
			}

			if (!pkg.version) {
				log.error("There should be a 'package.version' entry");
			}

			if (!pkg.authors) {
				log.error("There should be an 'package.authors' entry");
			}

			if (!pkg.description) {
				log.error("There should be a 'package.descriptions' entry");
			}
		},
	},
];
