import { fs } from "../deps.ts";

import * as types from "../types.ts";

export { module };
const module: types.FoxModule = {
	id: "hookah",
	name: "Hookah",
	activateOn: {
		ecosystem: "any",
		form: "any",
	},
	triggers: {
		async onInitial(opts: types.foxLintArgs) {
			const notices: types.NoticeReturn[] = [];

			if (!(await fs.exists(".hookah"))) {
				notices.push({
					name: "no-hookah",
					description: "Hookah must be installed",
				});
				return notices;
			}
		},
	},
};
