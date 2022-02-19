import { fs } from "../deps.ts";

import * as util from "../util/util.ts";

export const name = "Prettier";
export const description = "Checks prettier configuration";
export const onFiles = [
	{
		files: ["package.json"],
		async fn(opts: util.Opts, entry: fs.WalkEntry) {
			let packageJson;
			try {
				const text = await Deno.readTextFile(entry.path);
				packageJson = JSON.parse(text);
			} catch (err) {
				util.logInfo(
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
			util.logInfo("File '.prettierrc' recognized, but not supported");
		},
	},
	{
		files: [".prettierrc.json"],
		async fn(opts: util.Opts, entry: fs.WalkEntry) {
			let json;

			try {
				const text = await Deno.readTextFile(entry.path);
				json = JSON.parse(text);
			} catch (err) {
				util.logInfo(`Could not parse file ${entry.path} as JSON`);
				console.error(err);
				return;
			}

			prettierLint(entry.path, json);
		},
	},
	{
		files: [".prettierrc.yml", ".prettierrc.yaml"],
		fn() {
			util.logInfo("File '.prettierrc.ya?ml' recognized, but not supported");
		},
	},
	{
		files: [".prettierrc.json5"],
		fn() {
			util.logInfo("File '.prettierrc.json5' recognized, but not supported");
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
			util.logInfo(
				"File '(.prettierrc|prettier.config).c?js' recognized, but not supported"
			);
		},
	},
	{
		files: [".prettierrc.toml"],
		fn() {
			util.logInfo("File '.prettierrc.toml' recognized, but not supported");
		},
	},
];

function prettierLint(path: string, json: Record<string, any>) {
	if (typeof json !== "object" || json === null) {
		util.logInfo(
			`Prettier configuration object in ${path} is not actually an object. Skipping`
		);
		return;
	}

	const jsonArr = Object.entries(json);
	if (jsonArr.length !== 5) {
		util.logInfo("Expected 5 entries in prettiercfg");
	}

	if (json.tabWidth !== 3) {
		util.logInfo("tabWidth should be '3'");
	}

	if (!json.useTabs) {
		util.logInfo("useTabs should be true");
	}

	if (!json.semi) {
		util.logInfo("semi should be true");
	}

	if (!json.singleQuote) {
		util.logInfo("singleQuote should be true");
	}

	if (json.trailingComma !== "all") {
		util.logInfo("trailingComma should be 'all'");
	}

	console.log();
}
