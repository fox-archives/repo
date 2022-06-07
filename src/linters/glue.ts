import { fs } from "../deps.ts";

import * as util from "../util/util.ts";
import * as types from "../types.ts";

export default {
	id: "glue",
	name: "Glue",
	activateOn: {
		ecosystem: "ALL",
		form: "ALL",
	},
	triggers: {
		async onInitial(opts: types.ModuleOptions) {
			// TODO
			// await Deno.remove("glue.toml");
			// await Deno.remove(".glue");
		},
	},
};
