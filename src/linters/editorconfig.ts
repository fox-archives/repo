import { fs, asserts } from "../deps.ts";

import * as util from "../util/util.ts";
import * as types from "../types.ts";

export default {
	id: "editorconfig",
	name: "EditorConfig",
	activateOn: {
		ecosystem: "ALL",
		form: "ALL",
	},
	triggers: {
		async onInitial(opts: types.ModuleOptions) {
			const problems: types.LintRule[] = [];

			if (opts.fix) {
				await fs.ensureFile(".editorconfig");
			}

			const content = await Deno.readTextFile(".editorconfig");
			if (content.trim().length == 0) {
				throw new Error(".editorconfig file cannot be empty"); // FIXME
			}
		},
	},
};
