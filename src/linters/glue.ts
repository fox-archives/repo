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
		async onInitial(opts: types.foxLintArgs, notices: types.Notice[]) {
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
