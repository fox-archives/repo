import { fs, asserts } from "../deps.ts";

import * as util from "../util/util.ts";
import * as types from "../types.ts";
import { Notices } from "../util/Notices.ts";

const LINTER_ID = "editorconfig";

export const module: types.FoxModule = {
	id: "editorconfig",
	name: "EditorConfig",
	activateOn: {
		ecosystem: "any",
		form: "any",
	},
	triggers: {
		async onInitial(opts: types.foxLintArgs) {
			const myNotices = new Notices(LINTER_ID);

			// File must exist
			{
				const file = ".editorconfig";
				if (!(await util.pathExists(file))) {
					myNotices.add(
						"file-required",
						{
							description: `The file ${file} must exist.`,
						},
						async () => {
							await fs.ensureFile(file);
						}
					);
				}
			}
		},
	},
};
