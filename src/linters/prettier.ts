import { fs, asserts } from "../deps.ts";

import * as lintUtils from "../util/lintUtils.ts";
import * as util from "../util/util.ts";
import * as types from "../types.ts";

export { module };
const module: types.FoxModule = {
	id: "prettier",
	name: "Prettier",
	activateOn: {
		ecosystem: "any",
		form: "any",
	},
	match: new Map([
		[
			"package.json",
			(opts: types.foxLintArgs, entry: fs.WalkEntry) => {
				// TODO: only support .prettierrc.json
				// const packageJson = JSON.parse(entry.path);
				// if (packageJson?.prettier) {
				// 	const expected = getExpected();
				// 	const actualConfig = packageJson.prettier;
				// 	lintUtils.validateValuesAgainst(expected, actualConfig);
				// }
			},
		],
		[
			".prettierrc.json",
			(opts: types.foxLintArgs, entry: fs.WalkEntry) => {
				const expected = getExpected();
				const actualConfig = JSON.parse(entry.path);
				lintUtils.validateValuesAgainst(expected, actualConfig);
			},
		],
		[
			"@(.prettierrc|.prettierrc.yml|.prettierrc.yaml|.prettierrc.json5|.prettierrc.js|.prettierrc.cjs|prettier.config.js|prettier.config.cjs|.prettierrc.toml)",
			(opts: types.foxLintArgs, entry: fs.WalkEntry) => {
				console.log("not supported: " + entry.path); // TODO
			},
		],
	]),
};

function getExpected() {
	return {
		useTabs: true,
		semi: false,
		singleQuote: true,
		trailingComma: "all",
	};
}
