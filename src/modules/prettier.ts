import * as fs from "https://deno.land/std@0.125.0/fs/mod.ts";

import * as log from "../util/log.ts";

export const name = "Prettier";
export const description = "Checks prettier configuration";
export const onFilesHooks = [
	{
		files: ["package.json"],
		async fn(entry: fs.WalkEntry) {
			let packageJson;
			try {
				const text = await Deno.readTextFile(entry.path);
				packageJson = JSON.parse(text);
			} catch (err) {
				log.error(
					`Could not parse packageJson file at ${entry.path}. Skipping`
				);
				return;
			}

			if (packageJson.prettier !== void 0) {
				prettierLint(entry.path, packageJson.prettier);
			}
		},
	},
	{
		files: [".prettierrc"],
		fn() {
			log.error("File '.prettierrc' recognized, but not supported");
		},
	},
	{
		files: [".prettierrc.json"],
		async fn(entry: fs.WalkEntry) {
			let json;

			try {
				const text = await Deno.readTextFile(entry.path);
				json = JSON.parse(text);
			} catch (err) {
				log.error(`Could not parse file ${entry.path} as JSON`);
				console.error(err);
				return;
			}

			prettierLint(entry.path, json);
		},
	},
	{
		files: [".prettierrc.yml", ".prettierrc.yaml"],
		fn() {
			log.error("File '.prettierrc.ya?ml' recognized, but not supported");
		},
	},
	{
		files: [".prettierrc.json5"],
		fn() {
			log.error("File '.prettierrc.json5' recognized, but not supported");
		},
	},
	{
		files: [
			".prettierrc.js",
			".prettierrc.cjs",
			"prettier.config.js",
			"prettier.config.cjs",
		],
		fn() {
			log.error(
				"File '(.prettierrc|prettier.config).c?js' recognized, but not supported"
			);
		},
	},
	{
		files: [".prettierrc.toml"],
		fn() {
			log.error("File '.prettierrc.toml' recognized, but not supported");
		},
	},
];

function prettierLint(path: string, json: Record<string, any>) {
	if (typeof json !== "object" || json === null) {
		log.error(
			`Prettier configuration object in ${path} is not actually an object. Skipping`
		);
		return;
	}

	console.info(`Checking file '${path}`);

	const jsonArr = Object.entries(json);
	if (jsonArr.length !== 5) {
		log.error("Expected 5 entries in prettiercfg");
	}

	if (json.tabWidth !== 3) {
		log.error("tabWidth should be '3'");
	}

	if (!json.useTabs) {
		log.error("useTabs should be true");
	}

	if (!json.semi) {
		log.error("semi should be true");
	}

	if (!json.singleQuote) {
		log.error("singleQuote should be true");
	}

	if (json.trailingComma !== "all") {
		log.error("trailingComma should be 'all'");
	}

	console.info();
}
