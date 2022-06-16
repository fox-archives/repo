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
		async onInitial(opts: types.FoxModuleOptions) {
			try {
				await Deno.remove("glue.toml");
			} catch (unknownError: unknown) {
				const err = util.assertInstanceOfError(unknownError);
				if (!(err instanceof Deno.errors.NotFound)) {
					throw err;
				}
			}

			try {
				await Deno.remove(".glue", { recursive: true });
			} catch (unknownError: unknown) {
				const err = util.assertInstanceOfError(unknownError);
				if (!(err instanceof Deno.errors.NotFound)) {
					throw err;
				}
			}
		},
	},
};
