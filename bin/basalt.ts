#!/usr/bin/env -S deno run --allow-read

import * as fs from "https://deno.land/std@0.125.0/fs/mod.ts";
import * as toml from "https://deno.land/std@0.125.0/encoding/toml.ts";

// TODO: test to ensure the followign do or do not have || exit prepended
// basalt-package-init basalt.package-init basalt.package-load

function logError(msg: string) {
	console.error(`Error: ${msg}`);
}

function logInfo(msg: string) {
	console.info(`Info: ${msg}`);
}

for await (const entry of fs.expandGlob("**/*", {
	exclude: ["node_modules"],
})) {
	if (entry.name === "basalt.toml") {
		logInfo(`Running for file ${entry.path}`);

		const text = await Deno.readTextFile(entry.path);
		const json = toml.parse(text);
		const pkg = json.package as Record<string, any>;

		if (!pkg) {
			logError("There should be a 'package' entry");
			continue;
		}

		if (!pkg.type) {
			logError("There should be a 'package.type' entry");
		}

		if (!pkg.name) {
			logError("There should be a 'package.name' entry");
		}

		if (!pkg.slug) {
			logError("There should be a 'package.slug' entry");
		}

		if (!pkg.version) {
			logError("There should be a 'package.version' entry");
		}

		if (!pkg.authors) {
			logError("There should be an 'package.authors' entry");
		}

		if (!pkg.description) {
			logError("There should be a 'package.descriptions' entry");
		}
	}
}
