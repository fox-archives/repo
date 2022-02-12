import * as flags from "https://deno.land/std@0.125.0/flags/mod.ts";
import * as fs from "https://deno.land/std@0.125.0/fs/mod.ts";

import * as util from "./util/util.ts";
import * as moduleBake from "./modules/bake.ts";
import * as moduleBasalt from "./modules/basalt.ts";
import * as moduleDeno from "./modules/deno.ts";
import * as moduleEditorconfig from "./modules/editorconfig.ts";
import * as moduleGit from "./modules/git.ts";
import * as modulePrettier from "./modules/prettier.ts";

await main();
async function main() {
	const args = flags.parse(Deno.args);

	if (args.h || args.help) {
		console.info(`Usage: foxomate`);
		Deno.exit(0);
	}

	for await (const entry of fs.expandGlob("**/*", {
		exclude: [
			"bower_components",
			"node_modules",
			"jspm_packages",
			"web_modules",
			".next",
			".nuxt",
			".yarn",
			".dynamodb",
			".fusebox",
			".serverless",
			"out",
			"dist",
			".cache",
			"third_party",
		],
	})) {
		if (args.bake) {
			runModule(moduleBake, entry);
		}

		if (args.basalt) {
			runModule(moduleBasalt, entry);
		}

		if (args.deno) {
			runModule(moduleDeno, entry);
		}

		if (args.editorconfig) {
			runModule(moduleEditorconfig, entry);
		}

		if (args.git) {
			runModule(moduleGit, entry);
		}

		if (args.prettier) {
			runModule(modulePrettier, entry);
		}
	}
}

async function runModule(module: any, entry: fs.WalkEntry) {
	for (const trigger of module.onFiles) {
		for (const file of trigger.files) {
			if (file === entry.name) {
				await trigger.fn(entry);
			}
		}
	}
}
