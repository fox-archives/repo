import { fs } from "../deps.ts";

import * as util from "../util/util.ts";
import * as types from "../types.ts";

export default {
	id: "license",
	name: "License",
	activateOn: {
		ecosystem: "ALL",
		form: "ALL",
	},
	triggers: {
		async onInitial(opts: types.FoxModuleOptions, notices: types.Notice[]) {
			// TODO: ensure it is one of the licenses approved by me for meeeee~
			if (await fs.exists("LICENSE.md")) return;

			// TODO: logging
			try {
				await Deno.rename("license.md", "LICENSE.md");
			} catch (unknownError: unknown) {
				const err = util.assertInstanceOfError(unknownError);

				if (!(err instanceof Deno.errors.NotFound)) {
					throw err;
				}
			}
		},
	},
};
