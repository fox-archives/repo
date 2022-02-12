import { parse } from "https://deno.land/std@0.125.0/flags/mod.ts";
import * as fs from "https://deno.land/std@0.125.0/fs/mod.ts";

import * as modulePrettier from "./modules/prettier.ts";
// import * as moduleEditorconfig from "./modules/editorconfig.ts";
import * as moduleGit from "./modules/git.ts";

const args = parse(Deno.args);

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
	// Prettier
	for (const trigger of modulePrettier.onFiles) {
		for (const file of trigger.files) {
			if (file === entry.name) {
				await trigger.fn(entry);
			}
		}
	}

	// Git
	for (const trigger of moduleGit.onFiles) {
		for (const file of trigger.files) {
			if (file === entry.name) {
				await trigger.fn(entry);
			}
		}
	}

	// // EditorConfig
	// for (const trigger of moduleEditorconfig.onFiles) {
	// 	for (const file of trigger.files) {
	// 		if (file === entry.name) {
	// 			await trigger.fn(entry);
	// 		}
	// 	}
	// }
}
