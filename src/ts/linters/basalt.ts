import { fs, toml } from "../deps.ts";

import * as lintUtils from "../util/lintUtils.ts";
import * as util from "../util/util.ts";
import * as types from "../types.ts";

const LINTER_ID = "bake";

export const module: types.FoxModule = {
	id: LINTER_ID,
	name: "Basalt",
	activateOn: {
		ecosystem: "any",
		form: "any",
	},
	match: new Map([
		[
			"basalt.toml",
			async (opts: types.foxLintArgs, entry: fs.WalkEntry) => {
				const basaltToml = toml.parse(await util.mustReadFile(entry.path));
				await lintUtils.validateSchemaAgainst("basalt", basaltToml);
			},
		],
	]),
};
