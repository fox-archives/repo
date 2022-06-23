import { fs } from "../deps.ts";

import * as util from "../util/util.ts";
import * as types from "../types.ts";

export { module };
const module: types.FoxModule = {
	id: "glue",
	name: "Glue",
	activateOn: {
		ecosystem: "any",
		form: "any",
	},
	triggers: {
		async onInitial(opts: types.foxLintArgs) {
			await util.mustRemoveFile("glue.toml");
			await util.mustRemoveDirectory(".glue");

			return [];
		},
	},
};
