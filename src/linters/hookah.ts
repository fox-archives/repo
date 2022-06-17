import { fs } from "../deps.ts";

import * as types from "../types.ts";

export default {
	id: "hookah",
	name: "Hookah",
	activateOn: {
		ecosystem: "any",
		form: "any",
	},
	async onInitial(opts: types.FoxModuleOptions, notices: types.Notice[]) {
		if (!(await fs.exists(".hookah"))) {
			notices.push({
				name: "no-hookah",
				description: "Hookah must be installed",
			});
		}
	},
};
