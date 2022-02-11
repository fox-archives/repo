import { parse } from "https://deno.land/std@0.125.0/flags/mod.ts";
import { modulePrettier } from "./modules/prettier.ts";
import * as fs from "https://deno.land/std@0.125.0/fs/mod.ts";

const args = parse(Deno.args);

if (args.h || args.help) {
	console.info(`Usage: foxomate`);
	Deno.exit(0);
}

const prettier = modulePrettier();

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
	],
})) {
	for (const hook of prettier.hooksFile) {
		for (const file of hook.files) {
			if (file === entry.name) {
				await hook.fn(entry);
			}
		}
	}
}
