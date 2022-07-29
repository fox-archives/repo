import { fs, asserts } from "../deps.ts";

import * as types from "../types.ts";

const LINTER_ID = "deno";

export const module: types.FoxModule = {
	id: LINTER_ID,
	name: "Deno",
	activateOn: {
		ecosystem: "deno",
		form: "any",
	},
	match: new Map([
		[
			"deno.json",
			async (opts: types.foxLintArgs, entry: fs.WalkEntry) => {
				const denoJson = JSON.parse(await Deno.readTextFile(entry.path));
				const expected = {
					fmt: {
						options: {
							indentWidth: 3,
							useTabs: true,
						},
					},
				};
				asserts.assertEquals(expected, denoJson);
			},
		],
	]),
};
