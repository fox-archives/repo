import { fs } from "../deps.ts";

import * as util from "../util/util.ts";
import * as types from "../types.ts";
import { Notices } from "../util/Notices.ts";

const LINTER_ID = "hookah";

export const module: types.FoxModule = {
	id: LINTER_ID,
	name: "Hookah",
	activateOn: {
		ecosystem: "any",
		form: "any",
	},
	triggers: {
		async onInitial(opts: types.foxLintArgs) {
			const myNotices = new Notices(LINTER_ID);

			if (!(await util.pathExists(".hookah"))) {
				myNotices.add("no-hookah", {
					description: "Hookah must be installed",
				});
			}
		},
	},
};
