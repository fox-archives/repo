import { fs } from "../deps.ts";

import * as util from "../util/util.ts";
import * as types from "../types.ts";
import { Notices } from "../util/Notices.ts";

const LINTER_ID = "bake";

export const module: types.FoxModule = {
	id: LINTER_ID,
	name: "Bake",
	activateOn: {
		ecosystem: "any",
		form: "any",
	},
	triggers: {
		async onInitial(opts: types.foxLintArgs) {
			const myNotices = new Notices(LINTER_ID);

			const file = "./Bakefile.sh";

			const [hasFile, text] = await util.maybeReadFile(file);
			if (!hasFile) {
				myNotices.add("bakefile-required", {
					description: "A Bakefile.sh must be present",
				});
			}

			for (const line of text.split("\n")) {
				if (line.includes("task.fmt()")) {
					util.logInfo("Use task.format() instead of task.fmt()");
				}
			}
		},
	},
};
