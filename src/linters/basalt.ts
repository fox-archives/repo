import { fs, toml } from "../deps.ts";

import * as lintUtils from "../util/lintUtils.ts";
import * as util from "../util/util.ts";
import * as types from "../types.ts";

export { module };
const module: types.FoxModule = {
	id: "basalt",
	name: "Basalt",
	activateOn: {
		ecosystem: "any",
		form: "any",
	},
	// @ts-ignore
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
