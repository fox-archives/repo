#!/usr/bin/env -S deno run --allow-read

import * as fs from "https://deno.land/std@0.125.0/fs/mod.ts";

function logError(msg: string) {
	console.error(`Error: ${msg}`);
}

function die(msg: string) {
	logError(msg);
	Deno.exit(1);
}

for await (const entry of fs.expandGlob("**/*", {
	exclude: ["node_modules"],
})) {
	if (entry.name === "package.json") {
		let packageJson;
		try {
			const text = await Deno.readTextFile(entry.path);
			packageJson = JSON.parse(text);
		} catch (err) {
			logError(`Could not parse packageJson file at ${entry.path}. Skipping`);
			continue;
		}

		if (packageJson.prettier !== void 0) {
			prettierLint(entry.path, packageJson.prettier);
		}
	} else if (entry.name === ".prettierrc") {
		logError("File '.prettierrc' recognized, but not supported");
	} else if (entry.name === ".prettierrc.json") {
		let json;

		try {
			let text = await Deno.readTextFile(entry.path);
			json = JSON.parse(text);
		} catch (err) {
			logError(`Could not parse file ${entry.path} as JSON`);
			console.error(err);
			continue;
		}

		prettierLint(entry.path, json);
	} else if (
		entry.name === ".prettierrc.yml" ||
		entry.name === ".prettierrc.yaml"
	) {
		logError("File '.prettierrc.ya?ml' recognized, but not supported");
	} else if (entry.name === ".prettierrc.json5") {
		logError("File '.prettierrc.json5' recognized, but not supported");
	} else if (
		entry.name === ".prettierrc.js" ||
		entry.name === ".prettierrc.cjs" ||
		entry.name === "prettier.config.js" ||
		entry.name === "prettier.config.cjs"
	) {
		logError(
			"File '(.prettierrc|prettier.config).c?js' recognized, but not supported"
		);
	} else if (entry.name === ".prettierrc.toml") {
		logError("File '.prettierrc.toml' recognized, but not supported");
	}
}

function prettierLint(path: string, json: Record<string, any>) {
	if (typeof json !== "object" || json === null) {
		logError(
			`Prettier configuration object in ${path} is not actually an object. Skipping`
		);
		return;
	}

	console.info(`Checking file '${path}`);

	const jsonArr = Object.entries(json);
	if (jsonArr.length !== 5) {
		logError("Expected 5 entries in prettiercfg");
	}

	if (json.tabWidth !== 3) {
		logError("tabWidth should be '3'");
	}

	if (!json.useTabs) {
		logError("useTabs should be true");
	}

	if (!json.semi) {
		logError("semi should be true");
	}

	if (!json.singleQuote) {
		logError("singleQuote should be true");
	}

	if (json.trailingComma !== "all") {
		logError("trailingComma should be 'all'");
	}

	console.info();
}
