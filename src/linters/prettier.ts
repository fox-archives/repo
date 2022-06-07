import { fs, asserts } from "../deps.ts";

import * as util from "../util/util.ts";
import * as types from "../types.ts";

export default {
	id: "prettier",
	name: "Prettier",
	match: new Map([
		[
			"package.json",
			(opts: types.ModuleOptions, entry: fs.WalkEntry) => {
				const packageJson = JSON.parse(entry.path);
				if (packageJson?.prettier) {
					lintPrettierConfig(packageJson);
				}
			},
		],
		[
			".prettierrc.json",
			(opts: types.ModuleOptions, entry: fs.WalkEntry) => {
				const prettierConfig = JSON.parse(entry.path);
				lintPrettierConfig(prettierConfig);
			},
		],
		[
			"@(.prettierrc|.prettierrc.yml|.prettierrc.yaml|.prettierrc.json5|.prettierrc.js|.prettierrc.cjs|prettier.config.js|prettier.config.cjs|.prettierrc.toml)",
			(opts: types.ModuleOptions, entry: fs.WalkEntry) => {
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
