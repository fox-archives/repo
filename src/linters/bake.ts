import { fs } from "../deps.ts";

import * as util from "../util/util.ts";
import * as types from "../types.ts";

export { module };
const module: types.FoxModule = {
	id: "bake",
	name: "Bake",
	activateOn: {
		ecosystem: "any",
		form: "any",
	},
	triggers: {
		async onInitial(opts: types.foxLintArgs) {
			const notices: types.Notice[] = [];
			const file = "./Bakefile.sh";

			const [hasFile, text] = await util.maybeReadFile(file);
			if (!hasFile) {
				notices.push({
					name: "bakefile-required",
					description: "A Bakefile.sh must be present",
				});
				return notices;
			}

			for (const line of text.split("\n")) {
				if (line.includes("task.fmt()")) {
					util.logInfo("Use task.format() instead of task.fmt()");
				}
			}
		},
	},
};
