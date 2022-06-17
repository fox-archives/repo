import { fs, asserts } from "../deps.ts";

import * as util from "../util/util.ts";
import * as types from "../types.ts";

export default {
	id: "prettier",
	name: "Prettier",
	match: new Map([
		[
			"package.json",
			(
				opts: types.FoxModuleOptions,
				entry: fs.WalkEntry,
				notices: types.Notice[]
			) => {
				const packageJson = JSON.parse(entry.path);
				if (packageJson?.prettier) {
					lintPrettierConfig(packageJson);
				}
			},
		],
		[
			".prettierrc.json",
			(
				opts: types.FoxModuleOptions,
				entry: fs.WalkEntry,
				notices: types.Notice[]
			) => {
				const prettierConfig = JSON.parse(entry.path);
				lintPrettierConfig(prettierConfig);
			},
		],
		[
			"@(.prettierrc|.prettierrc.yml|.prettierrc.yaml|.prettierrc.json5|.prettierrc.js|.prettierrc.cjs|prettier.config.js|prettier.config.cjs|.prettierrc.toml)",
			(
				opts: types.FoxModuleOptions,
				entry: fs.WalkEntry,
				notices: types.Notice[]
			) => {
				console.log("not supported: " + entry.path); // TODO
			},
		],
	]),
};

function lintPrettierConfig(prettierConfig: unknown) {
	const expected = {
		useTabs: true,
		semi: false,
		singleQuote: true,
		trailingComma: "all",
	};
	asserts.assertEquals(expected, prettierConfig);
}
